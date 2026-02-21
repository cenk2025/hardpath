import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import NavSidebar from '../../components/NavSidebar'
import {
    Users, Bell, Activity, TrendingUp, Search,
    MessageCircle, AlertCircle, RefreshCw, ChevronRight
} from 'lucide-react'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const weekTrend = [
    { day: 'Mon', avg: 78 }, { day: 'Tue', avg: 74 }, { day: 'Wed', avg: 80 },
    { day: 'Thu', avg: 72 }, { day: 'Fri', avg: 76 }, { day: 'Sat', avg: 68 }, { day: 'Sun', avg: 71 },
]

export default function DoctorDashboard() {
    const { t } = useTranslation()
    const { profile } = useAuth()
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [patients, setPatients] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [lastMetrics, setLastMetrics] = useState({}) // patientId → latest metric

    useEffect(() => {
        fetchPatients()
    }, [])

    async function fetchPatients() {
        setLoading(true)
        setError(null)
        try {
            // Fetch all users with role = 'patient'
            const { data: patientsData, error: pErr } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'patient')
                .order('created_at', { ascending: false })

            if (pErr) throw pErr
            setPatients(patientsData || [])

            // Fetch latest daily_metric for each patient
            if (patientsData?.length) {
                const ids = patientsData.map(p => p.id)
                const { data: metrics } = await supabase
                    .from('daily_metrics')
                    .select('*')
                    .in('patient_id', ids)
                    .order('recorded_at', { ascending: false })

                // Keep only most recent per patient
                const metricsMap = {}
                metrics?.forEach(m => {
                    if (!metricsMap[m.patient_id]) metricsMap[m.patient_id] = m
                })
                setLastMetrics(metricsMap)
            }
        } catch (err) {
            console.error('Failed to fetch patients:', err)
            setError('Could not load patients. Check your Supabase configuration.')
        } finally {
            setLoading(false)
        }
    }

    const filtered = patients.filter(p =>
        (p.full_name || '').toLowerCase().includes(search.toLowerCase())
    )

    // Simple risk calc from latest metric
    function getRisk(patientId) {
        const m = lastMetrics[patientId]
        if (!m) return 'unknown'
        const score = m.readiness_score ?? 50
        if (score < 40) return 'high'
        if (score < 65) return 'medium'
        return 'low'
    }

    function getLastActive(patientId) {
        const m = lastMetrics[patientId]
        if (!m) return 'No check-in yet'
        const diff = Date.now() - new Date(m.recorded_at).getTime()
        const h = Math.floor(diff / 3600000)
        if (h < 1) return 'Just now'
        if (h < 24) return `${h}h ago`
        return `${Math.floor(h / 24)}d ago`
    }

    function riskBadge(risk) {
        if (risk === 'high') return <span className="badge badge-red">High Risk</span>
        if (risk === 'medium') return <span className="badge badge-amber">Moderate</span>
        if (risk === 'low') return <span className="badge badge-green">On Track</span>
        return <span className="badge badge-slate">No Data</span>
    }

    const highRiskCount = patients.filter(p => getRisk(p.id) === 'high').length

    function getInitials(name) {
        return (name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    }

    return (
        <div className="app-layout">
            <NavSidebar alertCount={highRiskCount} />
            <div className="app-main">
                <div className="mobile-topbar-placeholder" />
                <div className="topbar">
                    <h1 className="topbar-title">
                        {t('doctor.dashboard_title')}, Dr. {profile?.full_name?.split(' ').pop() || 'Doctor'} 👨‍⚕️
                    </h1>
                    <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                        {new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>

                <div className="page-content slide-up">
                    {/* Stats */}
                    <div className="grid-4" style={{ marginBottom: 28 }}>
                        <div className="stat-card">
                            <div className="stat-icon teal"><Users size={20} /></div>
                            <div>
                                <div className="stat-value">{loading ? '—' : patients.length}</div>
                                <div className="stat-label">{t('doctor.total_patients')}</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon red"><Bell size={20} /></div>
                            <div>
                                <div className="stat-value" style={{ color: highRiskCount > 0 ? 'var(--red-500)' : undefined }}>
                                    {loading ? '—' : highRiskCount}
                                </div>
                                <div className="stat-label">{t('doctor.active_alerts')}</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon green"><TrendingUp size={20} /></div>
                            <div>
                                <div className="stat-value">
                                    {Object.keys(lastMetrics).length > 0
                                        ? `${Math.round(Object.values(lastMetrics).reduce((s, m) => s + (m.readiness_score || 50), 0) / Object.values(lastMetrics).length)}%`
                                        : '—'}
                                </div>
                                <div className="stat-label">Avg Readiness</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon amber"><Activity size={20} /></div>
                            <div>
                                <div className="stat-value">{Object.keys(lastMetrics).length}</div>
                                <div className="stat-label">Check-ins Today</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
                        {/* Patient list */}
                        <div className="card">
                            <div className="card-header" style={{ marginBottom: 16 }}>
                                <div className="card-title">
                                    <Users size={16} style={{ display: 'inline', marginRight: 8, color: 'var(--teal-500)' }} />
                                    My Patients
                                    {loading && <RefreshCw size={14} style={{ display: 'inline', marginLeft: 8, animation: 'spin 1s linear infinite', color: 'var(--slate-400)' }} />}
                                </div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <div style={{ position: 'relative' }}>
                                        <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                                        <input
                                            className="form-input"
                                            style={{ paddingLeft: 32, borderRadius: 'var(--radius-full)', fontSize: '0.85rem', height: 36, minWidth: 180 }}
                                            placeholder={t('common.search')}
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                        />
                                    </div>
                                    <button className="btn btn-ghost btn-sm" onClick={fetchPatients} title="Refresh">
                                        <RefreshCw size={14} />
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="alert-banner danger" style={{ marginBottom: 16 }}>
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            {!loading && patients.length === 0 && !error && (
                                <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--slate-400)' }}>
                                    <Users size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
                                    <p style={{ fontWeight: 600, marginBottom: 4 }}>No patients yet</p>
                                    <p style={{ fontSize: '0.85rem' }}>Patients will appear here once they register with the patient role.</p>
                                </div>
                            )}

                            {/* Table header */}
                            {filtered.length > 0 && (
                                <div style={{
                                    display: 'grid', gridTemplateColumns: '1fr 110px 80px 120px',
                                    padding: '8px 16px', background: 'var(--off-white)',
                                    borderRadius: 8, marginBottom: 4,
                                    fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-400)',
                                    textTransform: 'uppercase', letterSpacing: '0.06em'
                                }}>
                                    <span>Patient</span>
                                    <span>Readiness</span>
                                    <span>Status</span>
                                    <span>Last Active</span>
                                </div>
                            )}

                            {filtered.map(p => {
                                const risk = getRisk(p.id)
                                const metric = lastMetrics[p.id]
                                const score = metric?.readiness_score ?? null
                                return (
                                    <div
                                        key={p.id}
                                        onClick={() => navigate(`/doctor/patients/${p.id}`)}
                                        style={{
                                            display: 'grid', gridTemplateColumns: '1fr 110px 80px 120px',
                                            alignItems: 'center', gap: 16, padding: '13px 16px',
                                            borderBottom: '1px solid var(--slate-200)', cursor: 'pointer',
                                            transition: 'var(--transition)',
                                            borderRadius: 8,
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--off-white)'}
                                        onMouseLeave={e => e.currentTarget.style.background = ''}
                                    >
                                        {/* Name + avatar */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div className="user-avatar" style={{ width: 38, height: 38, fontSize: '0.85rem', flexShrink: 0 }}>
                                                {getInitials(p.full_name)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--navy-900)' }}>
                                                    {p.full_name || 'Unknown'}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                                                    {p.language?.toUpperCase()} · {p.onboarding_completed ? 'Active' : 'Onboarding'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Readiness score */}
                                        <div>
                                            {score !== null ? (
                                                <>
                                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: score < 40 ? 'var(--red-500)' : score < 65 ? 'var(--amber-500)' : 'var(--green-500)' }}>
                                                        {score}
                                                    </div>
                                                    <div style={{ height: 4, background: 'var(--slate-200)', borderRadius: 2, marginTop: 4, width: 80 }}>
                                                        <div style={{ height: '100%', borderRadius: 2, width: `${score}%`, background: score < 40 ? 'var(--red-500)' : score < 65 ? 'var(--amber-500)' : 'var(--green-500)' }} />
                                                    </div>
                                                </>
                                            ) : (
                                                <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>No data</span>
                                            )}
                                        </div>

                                        {/* Risk badge */}
                                        <div>{riskBadge(risk)}</div>

                                        {/* Last active + arrow */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>{getLastActive(p.id)}</span>
                                            <ChevronRight size={15} color="var(--slate-300)" />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Right panel */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* HR trend chart */}
                            <div className="card">
                                <div className="card-title" style={{ marginBottom: 14 }}>
                                    <Activity size={14} style={{ display: 'inline', marginRight: 6, color: 'var(--teal-500)' }} />
                                    Cohort Avg HR — This Week
                                </div>
                                <div style={{ height: 160 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={weekTrend} margin={{ top: 0, right: 5, bottom: 0, left: -25 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-200)" />
                                            <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--slate-400)' }} />
                                            <YAxis domain={[60, 90]} tick={{ fontSize: 10, fill: 'var(--slate-400)' }} />
                                            <Tooltip contentStyle={{ borderRadius: 8, fontSize: '0.8rem' }} formatter={v => [`${v} bpm`, 'Avg HR']} />
                                            <Line type="monotone" dataKey="avg" stroke="var(--teal-500)" strokeWidth={2} dot={{ r: 3 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* High risk patients */}
                            {patients.filter(p => getRisk(p.id) === 'high').slice(0, 3).map(p => (
                                <div key={p.id} style={{
                                    background: 'var(--white)', borderRadius: 10, padding: '14px 16px',
                                    border: '1.5px solid var(--red-500)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        <AlertCircle size={14} color="var(--red-500)" />
                                        <span className="badge badge-red">High Risk</span>
                                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.full_name}</span>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginBottom: 10 }}>
                                        Low readiness score detected — review recent check-in data.
                                    </p>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/doctor/patients/${p.id}`)}>
                                            View
                                        </button>
                                        <button className="btn btn-primary btn-sm" onClick={() => navigate(`/doctor/messages?patient=${p.id}`)}>
                                            <MessageCircle size={13} /> Message
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* No high-risk: show encouragement */}
                            {patients.length > 0 && patients.filter(p => getRisk(p.id) === 'high').length === 0 && !loading && (
                                <div style={{ background: 'var(--green-100)', borderRadius: 10, padding: '16px', border: '1.5px solid var(--green-500)', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>✅</div>
                                    <p style={{ fontWeight: 700, color: '#065f46', fontSize: '0.9rem' }}>All patients on track!</p>
                                    <p style={{ fontSize: '0.8rem', color: '#047857' }}>No high-risk flags at this time.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="disclaimer-bar" style={{ marginTop: 32 }}>{t('common.disclaimer')}</div>
                </div>
            </div>
        </div>
    )
}
