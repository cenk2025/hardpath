import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import NavSidebar from '../../components/NavSidebar'
import { Users, Bell, Activity, Calendar, TrendingUp, Search } from 'lucide-react'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const PATIENTS = [
    { id: 'p1', name: 'Matti Virtanen', age: 58, condition: 'Post-MI', adherence: 85, lastActive: '2h ago', risk: 'low', hr: 64, program: 'Phase 1' },
    { id: 'p2', name: 'Ayşe Yılmaz', age: 62, condition: 'Post-CABG', adherence: 72, lastActive: '1d ago', risk: 'medium', hr: 78, program: 'Phase 2' },
    { id: 'p3', name: 'John Smith', age: 55, condition: 'Heart Failure', adherence: 45, lastActive: '3d ago', risk: 'high', hr: 92, program: 'Phase 1' },
    { id: 'p4', name: 'Helena Korhonen', age: 70, condition: 'Post-Stent', adherence: 91, lastActive: '4h ago', risk: 'low', hr: 60, program: 'Phase 3' },
    { id: 'p5', name: 'Mehmet Çelik', age: 65, condition: 'Arrhythmia', adherence: 63, lastActive: '12h ago', risk: 'medium', hr: 81, program: 'Phase 2' },
]

const weekTrend = [
    { day: 'Mon', avg: 78 }, { day: 'Tue', avg: 74 }, { day: 'Wed', avg: 80 },
    { day: 'Thu', avg: 72 }, { day: 'Fri', avg: 76 }, { day: 'Sat', avg: 68 }, { day: 'Sun', avg: 71 },
]

export default function DoctorDashboard() {
    const { t } = useTranslation()
    const { profile } = useAuth()
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const alertCount = PATIENTS.filter(p => p.risk === 'high').length

    const filtered = PATIENTS.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    )

    const avgAdherence = Math.round(PATIENTS.reduce((s, p) => s + p.adherence, 0) / PATIENTS.length)

    function riskBadge(risk) {
        if (risk === 'high') return <span className="badge badge-red">{t('common.risk_high')}</span>
        if (risk === 'medium') return <span className="badge badge-amber">{t('common.risk_medium')}</span>
        return <span className="badge badge-green">{t('common.risk_low')}</span>
    }

    return (
        <div className="app-layout">
            <NavSidebar alertCount={alertCount} />
            <div className="app-main with-sidebar">
                <div className="topbar">
                    <h1 className="topbar-title">
                        {t('doctor.dashboard_title')}, Dr. {profile?.full_name?.split(' ').pop() || 'Doctor'} 👨‍⚕️
                    </h1>
                    <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                        {new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>

                <div className="page-content slide-up">
                    {/* Stats row */}
                    <div className="grid-4" style={{ marginBottom: 28 }}>
                        <div className="stat-card">
                            <div className="stat-icon teal"><Users size={20} /></div>
                            <div>
                                <div className="stat-value">{PATIENTS.length}</div>
                                <div className="stat-label">{t('doctor.total_patients')}</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon red"><Bell size={20} /></div>
                            <div>
                                <div className="stat-value" style={{ color: alertCount > 0 ? 'var(--red-500)' : undefined }}>{alertCount}</div>
                                <div className="stat-label">{t('doctor.active_alerts')}</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon green"><TrendingUp size={20} /></div>
                            <div>
                                <div className="stat-value">{avgAdherence}%</div>
                                <div className="stat-label">{t('doctor.avg_adherence')}</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon amber"><Calendar size={20} /></div>
                            <div>
                                <div className="stat-value">2</div>
                                <div className="stat-label">{t('doctor.consultations')}</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
                        {/* Patient list */}
                        <div className="card">
                            <div className="card-header" style={{ marginBottom: 16 }}>
                                <div className="card-title">
                                    <Users size={16} style={{ display: 'inline', marginRight: 8, color: 'var(--teal-500)' }} />
                                    Patients
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                                    <input
                                        className="form-input"
                                        style={{ paddingLeft: 32, borderRadius: 'var(--radius-full)', fontSize: '0.85rem', height: 36, minWidth: 200 }}
                                        placeholder={t('common.search')}
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Table header */}
                            <div style={{
                                display: 'grid', gridTemplateColumns: '1fr 100px 110px 90px 110px',
                                padding: '8px 16px', background: 'var(--off-white)',
                                borderRadius: 8, marginBottom: 4,
                                fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-400)',
                                textTransform: 'uppercase', letterSpacing: '0.06em'
                            }}>
                                <span>{t('doctor.patient_name')}</span>
                                <span>{t('doctor.adherence')}</span>
                                <span>{t('doctor.last_active')}</span>
                                <span>{t('doctor.risk_level')}</span>
                                <span></span>
                            </div>

                            {filtered.map(p => (
                                <div key={p.id} className="patient-row">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div className="user-avatar" style={{ width: 38, height: 38, fontSize: '0.85rem' }}>
                                            {p.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--navy-900)' }}>{p.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Age {p.age} · {p.condition}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: p.adherence < 60 ? 'var(--red-500)' : 'var(--navy-900)' }}>{p.adherence}%</div>
                                        <div style={{ height: 4, background: 'var(--slate-200)', borderRadius: 2, marginTop: 4, width: 80 }}>
                                            <div style={{ height: '100%', borderRadius: 2, width: `${p.adherence}%`, background: p.adherence < 60 ? 'var(--red-500)' : p.adherence < 80 ? 'var(--amber-500)' : 'var(--green-500)' }} />
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>{p.lastActive}</div>
                                    <div>{riskBadge(p.risk)}</div>
                                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/doctor/patients/${p.id}`)}>
                                        {t('doctor.view_patient')}
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Right sidebar: HR trend */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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

                            {/* Risk summary */}
                            {PATIENTS.filter(p => p.risk !== 'low').slice(0, 2).map(p => (
                                <div key={p.id} style={{
                                    background: 'var(--white)', borderRadius: 10, padding: '14px 16px',
                                    border: `1.5px solid ${p.risk === 'high' ? 'var(--red-500)' : 'var(--amber-500)'}`,
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        {riskBadge(p.risk)}
                                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.name}</span>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                                        {p.adherence < 60
                                            ? `Adherence at ${p.adherence}% — motivational support needed.`
                                            : `HR ${p.hr} bpm on last check — monitor closely.`}
                                    </p>
                                    <button className="btn btn-secondary btn-sm" style={{ marginTop: 10 }} onClick={() => navigate(`/doctor/patients/${p.id}`)}>
                                        View Patient
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="disclaimer-bar" style={{ marginTop: 32 }}>{t('common.disclaimer')}</div>
                </div>
            </div>
        </div>
    )
}
