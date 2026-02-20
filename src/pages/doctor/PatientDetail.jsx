import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import NavSidebar from '../../components/NavSidebar'
import { ArrowLeft, Heart, Activity, Moon, TrendingUp, AlertTriangle } from 'lucide-react'
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const PATIENT_DATA = {
    p1: { name: 'Matti Virtanen', age: 58, condition: 'Post-MI', adherence: 85, program: 'Phase 1 — Initial Recovery', risk: 'low', hr: 64, hrv: 52, sleep: 7.2 },
    p2: { name: 'Ayşe Yılmaz', age: 62, condition: 'Post-CABG', adherence: 72, program: 'Phase 2 — Progressive Exercise', risk: 'medium', hr: 78, hrv: 38, sleep: 6.5 },
    p3: { name: 'John Smith', age: 55, condition: 'Heart Failure', adherence: 45, program: 'Phase 1 — Initial Recovery', risk: 'high', hr: 92, hrv: 22, sleep: 5.5 },
    p4: { name: 'Helena Korhonen', age: 70, condition: 'Post-Stent', adherence: 91, program: 'Phase 3 — Maintenance', risk: 'low', hr: 60, hrv: 58, sleep: 7.8 },
    p5: { name: 'Mehmet Çelik', age: 65, condition: 'Arrhythmia', adherence: 63, program: 'Phase 2 — Progressive Exercise', risk: 'medium', hr: 81, hrv: 32, sleep: 6.8 },
}

const hrTrend = [
    { day: 'Mon', hr: 72, safe_max: 105 }, { day: 'Tue', hr: 68, safe_max: 105 },
    { day: 'Wed', hr: 89, safe_max: 105 }, { day: 'Thu', hr: 76, safe_max: 105 },
    { day: 'Fri', hr: 70, safe_max: 105 }, { day: 'Sat', hr: 65, safe_max: 105 }, { day: 'Sun', hr: 68, safe_max: 105 },
]

const adherenceTrend = [
    { week: 'W1', completed: 4, total: 5 }, { week: 'W2', completed: 5, total: 5 },
    { week: 'W3', completed: 3, total: 5 }, { week: 'W4', completed: 5, total: 5 },
]

const symptomHistory = [
    { date: '2026-02-18', type: 'Mild fatigue', severity: 'mild' },
    { date: '2026-02-16', type: 'Shortness of breath', severity: 'moderate' },
    { date: '2026-02-12', type: 'Dizziness', severity: 'mild' },
]

export default function PatientDetail() {
    const { t } = useTranslation()
    const { id } = useParams()
    const navigate = useNavigate()
    const patient = PATIENT_DATA[id] || PATIENT_DATA.p1

    const riskColor = patient.risk === 'high' ? 'var(--red-500)' : patient.risk === 'medium' ? 'var(--amber-500)' : 'var(--green-500)'

    return (
        <div className="app-layout">
            <NavSidebar alertCount={1} />
            <div className="app-main with-sidebar">
                <div className="topbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/doctor')}>
                            <ArrowLeft size={16} /> Back
                        </button>
                        <h1 className="topbar-title">{patient.name}</h1>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <span className="badge" style={{ background: riskColor + '15', color: riskColor }}>
                            {patient.risk.toUpperCase()} RISK
                        </span>
                    </div>
                </div>

                <div className="page-content slide-up">
                    {/* Top info card */}
                    <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, var(--navy-800), var(--navy-700))', color: 'white', border: 'none' }}>
                        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--teal-400)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Patient</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{patient.name}</div>
                                <div style={{ color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>Age {patient.age} · {patient.condition}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--teal-400)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Program</div>
                                <div style={{ fontWeight: 600 }}>{patient.program}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--teal-400)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Adherence</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: patient.adherence < 60 ? '#fca5a5' : '#6ee7b7' }}>{patient.adherence}%</div>
                            </div>
                            {[
                                { label: 'Resting HR', value: `${patient.hr} bpm`, icon: Heart },
                                { label: 'HRV', value: `${patient.hrv} ms`, icon: Activity },
                                { label: 'Sleep', value: `${patient.sleep} hrs`, icon: Moon },
                            ].map(({ label, value, icon: Icon }) => (
                                <div key={label}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--teal-400)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Icon size={14} /> {value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid-2" style={{ marginBottom: 24 }}>
                        {/* HR Trend */}
                        <div className="card">
                            <div className="card-title" style={{ marginBottom: 16 }}>
                                <TrendingUp size={14} style={{ display: 'inline', marginRight: 6, color: 'var(--teal-500)' }} />
                                Heart Rate Trend (7 days)
                            </div>
                            <div style={{ height: 200 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={hrTrend} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-200)" />
                                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--slate-400)' }} />
                                        <YAxis domain={[55, 115]} tick={{ fontSize: 11, fill: 'var(--slate-400)' }} />
                                        <Tooltip contentStyle={{ borderRadius: 8, fontSize: '0.8rem' }} />
                                        <Line type="monotone" dataKey="hr" stroke="var(--teal-500)" strokeWidth={2} dot={{ r: 3 }} name="HR (bpm)" />
                                        <Line type="monotone" dataKey="safe_max" stroke="var(--red-500)" strokeWidth={1} strokeDasharray="5 3" dot={false} name="Safe Max" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Adherence */}
                        <div className="card">
                            <div className="card-title" style={{ marginBottom: 16 }}>
                                <Activity size={14} style={{ display: 'inline', marginRight: 6, color: 'var(--teal-500)' }} />
                                Weekly Adherence
                            </div>
                            <div style={{ height: 200 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={adherenceTrend} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-200)" />
                                        <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--slate-400)' }} />
                                        <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: 'var(--slate-400)' }} />
                                        <Tooltip contentStyle={{ borderRadius: 8, fontSize: '0.8rem' }} />
                                        <Bar dataKey="completed" fill="var(--teal-500)" radius={[4, 4, 0, 0]} name="Sessions done" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Symptom history */}
                    <div className="card">
                        <div className="card-title" style={{ marginBottom: 16 }}>
                            <AlertTriangle size={14} style={{ display: 'inline', marginRight: 6, color: 'var(--amber-500)' }} />
                            Recent Symptom Reports
                        </div>
                        {symptomHistory.map((s, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: 16,
                                padding: '12px 0', borderBottom: i < symptomHistory.length - 1 ? '1px solid var(--slate-200)' : 'none'
                            }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)', minWidth: 90 }}>{s.date}</span>
                                <span style={{ flex: 1, fontWeight: 600, fontSize: '0.9rem' }}>{s.type}</span>
                                <span className={`badge ${s.severity === 'mild' ? 'badge-green' : s.severity === 'moderate' ? 'badge-amber' : 'badge-red'}`}>
                                    {s.severity}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="disclaimer-bar" style={{ marginTop: 32 }}>{t('common.disclaimer')}</div>
                </div>
            </div>
        </div>
    )
}
