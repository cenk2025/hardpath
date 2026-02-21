import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import NavSidebar from '../../components/NavSidebar'
import {
    ArrowLeft, Activity, MessageCircle, AlertCircle,
    Heart, ClipboardList, RefreshCw, User, Calendar
} from 'lucide-react'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts'

export default function PatientDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [patient, setPatient] = useState(null)
    const [metrics, setMetrics] = useState([])
    const [symptoms, setSymptoms] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) fetchAll()
    }, [id])

    async function fetchAll() {
        setLoading(true)
        try {
            // Patient profile
            const { data: prof } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single()
            setPatient(prof)

            // Last 14 days of daily metrics
            const { data: met } = await supabase
                .from('daily_metrics')
                .select('*')
                .eq('patient_id', id)
                .order('recorded_at', { ascending: true })
                .limit(14)
            setMetrics(met || [])

            // Last 5 symptom reports
            const { data: sym } = await supabase
                .from('symptom_reports')
                .select('*')
                .eq('patient_id', id)
                .order('timestamp', { ascending: false })
                .limit(5)
            setSymptoms(sym || [])
        } catch (err) {
            console.error('PatientDetail load error:', err)
        } finally {
            setLoading(false)
        }
    }

    // Prepare chart data
    const hrData = metrics.map(m => ({
        date: new Date(m.recorded_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        hr: m.resting_hr,
        readiness: m.readiness_score,
    }))

    const fatigueData = metrics.map(m => ({
        date: new Date(m.recorded_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        fatigue: m.fatigue_level,
    }))

    const latest = metrics[metrics.length - 1]

    if (loading) {
        return (
            <div className="app-layout">
                <NavSidebar />
                <div className="app-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner" />
                </div>
            </div>
        )
    }

    if (!patient) {
        return (
            <div className="app-layout">
                <NavSidebar />
                <div className="app-main">
                    <div className="page-content" style={{ textAlign: 'center', paddingTop: 80 }}>
                        <AlertCircle size={40} style={{ marginBottom: 12, color: 'var(--red-500)' }} />
                        <h2>Patient not found</h2>
                        <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/doctor')}>
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    function getInitials(name) {
        return (name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    }

    function getRiskColor(score) {
        if (!score) return 'var(--slate-400)'
        if (score < 40) return 'var(--red-500)'
        if (score < 65) return 'var(--amber-500)'
        return 'var(--green-500)'
    }

    function severityBadge(sev) {
        if (sev === 'severe') return <span className="badge badge-red">Severe</span>
        if (sev === 'moderate') return <span className="badge badge-amber">Moderate</span>
        return <span className="badge badge-teal">Mild</span>
    }

    return (
        <div className="app-layout">
            <NavSidebar />
            <div className="app-main">
                <div className="topbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/doctor')}>
                            <ArrowLeft size={16} /> Patients
                        </button>
                        <div style={{ width: 1, height: 20, background: 'var(--slate-200)' }} />
                        <h1 className="topbar-title">{patient.full_name || 'Patient'}</h1>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn btn-secondary btn-sm" onClick={fetchAll}>
                            <RefreshCw size={14} /> Refresh
                        </button>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => navigate(`/doctor/messages?patient=${id}`)}
                        >
                            <MessageCircle size={15} /> Send Message
                        </button>
                    </div>
                </div>

                <div className="page-content slide-up">
                    {/* Patient header card */}
                    <div className="card" style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                            <div className="user-avatar" style={{ width: 64, height: 64, fontSize: '1.4rem', flexShrink: 0 }}>
                                {getInitials(patient.full_name)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h2 style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--navy-900)', marginBottom: 4 }}>
                                    {patient.full_name || 'Unknown'}
                                </h2>
                                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <User size={13} /> Patient
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Calendar size={13} /> Joined {new Date(patient.created_at).toLocaleDateString('en', { year: 'numeric', month: 'short' })}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        🌐 {patient.language?.toUpperCase() || 'EN'}
                                    </span>
                                    <span className={`badge ${patient.onboarding_completed ? 'badge-green' : 'badge-amber'}`}>
                                        {patient.onboarding_completed ? 'Onboarded' : 'Onboarding pending'}
                                    </span>
                                </div>
                            </div>

                            {/* Quick stats */}
                            {latest && (
                                <div style={{ display: 'flex', gap: 24 }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: getRiskColor(latest.readiness_score) }}>
                                            {latest.readiness_score ?? '—'}
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', fontWeight: 600 }}>READINESS</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                                            {latest.resting_hr ?? '—'}
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', fontWeight: 600 }}>REST HR BPM</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                                            {latest.fatigue_level ?? '—'}
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', fontWeight: 600 }}>FATIGUE /10</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {metrics.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--slate-400)' }}>
                            <ClipboardList size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
                            <p style={{ fontWeight: 600 }}>No check-in data yet</p>
                            <p style={{ fontSize: '0.85rem' }}>This patient hasn't completed a daily check-in. You can send them a reminder.</p>
                            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate(`/doctor/messages?patient=${id}`)}>
                                <MessageCircle size={15} /> Send Reminder
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                            {/* HR trend */}
                            <div className="card">
                                <div className="card-title" style={{ marginBottom: 16 }}>
                                    <Heart size={14} style={{ display: 'inline', marginRight: 6, color: 'var(--teal-500)' }} />
                                    Heart Rate Trend
                                </div>
                                <div style={{ height: 200 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={hrData} margin={{ top: 0, right: 5, bottom: 0, left: -20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-200)" />
                                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--slate-400)' }} />
                                            <YAxis tick={{ fontSize: 10, fill: 'var(--slate-400)' }} />
                                            <Tooltip contentStyle={{ borderRadius: 8, fontSize: '0.8rem' }} formatter={v => [`${v} bpm`, 'Resting HR']} />
                                            <Line type="monotone" dataKey="hr" stroke="var(--red-500)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Readiness trend */}
                            <div className="card">
                                <div className="card-title" style={{ marginBottom: 16 }}>
                                    <Activity size={14} style={{ display: 'inline', marginRight: 6, color: 'var(--teal-500)' }} />
                                    Readiness Score Trend
                                </div>
                                <div style={{ height: 200 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={hrData} margin={{ top: 0, right: 5, bottom: 0, left: -20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-200)" />
                                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--slate-400)' }} />
                                            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--slate-400)' }} />
                                            <Tooltip contentStyle={{ borderRadius: 8, fontSize: '0.8rem' }} formatter={v => [v, 'Readiness']} />
                                            <Line type="monotone" dataKey="readiness" stroke="var(--teal-500)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Fatigue chart */}
                            <div className="card">
                                <div className="card-title" style={{ marginBottom: 16 }}>
                                    <ClipboardList size={14} style={{ display: 'inline', marginRight: 6, color: 'var(--teal-500)' }} />
                                    Fatigue Level (1–10)
                                </div>
                                <div style={{ height: 180 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={fatigueData} margin={{ top: 0, right: 5, bottom: 0, left: -20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-200)" />
                                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--slate-400)' }} />
                                            <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: 'var(--slate-400)' }} />
                                            <Tooltip contentStyle={{ borderRadius: 8, fontSize: '0.8rem' }} formatter={v => [v, 'Fatigue']} />
                                            <Bar dataKey="fatigue" fill="var(--purple-500)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Symptom reports */}
                            <div className="card">
                                <div className="card-title" style={{ marginBottom: 16 }}>
                                    <AlertCircle size={14} style={{ display: 'inline', marginRight: 6, color: 'var(--red-500)' }} />
                                    Recent Symptom Reports
                                </div>
                                {symptoms.length === 0 ? (
                                    <p style={{ color: 'var(--slate-400)', fontSize: '0.85rem' }}>No symptom reports yet. ✅</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {symptoms.map(s => (
                                            <div key={s.id} style={{
                                                padding: '12px 14px', borderRadius: 8,
                                                background: 'var(--off-white)', border: '1px solid var(--slate-200)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                    {severityBadge(s.severity)}
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                                                        {new Date(s.timestamp).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--navy-900)', fontWeight: 600, marginBottom: 2 }}>
                                                    {(s.symptoms || []).join(', ')}
                                                </div>
                                                {s.notes && <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>{s.notes}</div>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="disclaimer-bar" style={{ marginTop: 32 }}>{t('common.disclaimer')}</div>
                </div>
            </div>
        </div>
    )
}
