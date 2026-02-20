import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import NavSidebar from '../../components/NavSidebar'
import { Heart, Activity, Moon, Zap, CheckCircle, AlertTriangle, TrendingUp, Brain } from 'lucide-react'
import { calcReadinessScore, generateAIInsight } from '../../lib/aiRisk'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

// Demo trend data
const hrTrend = [
    { day: 'Mon', hr: 72 }, { day: 'Tue', hr: 68 }, { day: 'Wed', hr: 75 },
    { day: 'Thu', hr: 70 }, { day: 'Fri', hr: 66 }, { day: 'Sat', hr: 69 }, { day: 'Sun', hr: 64 },
]

export default function PatientDashboard() {
    const { t } = useTranslation()
    const { profile } = useAuth()
    const [metrics] = useState({ fatigue: 7, hr: 68, sleep: 7.5, hrv: 42 })
    const readiness = calcReadinessScore(metrics)
    const aiInsight = generateAIInsight(metrics)

    const stats = [
        { label: t('patient.heart_rate'), value: '68', unit: t('patient.bpm'), icon: Heart, color: 'red' },
        { label: t('patient.steps'), value: '4,230', unit: 'today', icon: Activity, color: 'teal' },
        { label: t('patient.sleep'), value: '7.5', unit: t('patient.hrs'), icon: Moon, color: 'purple' },
        { label: t('patient.hrv'), value: '42', unit: t('patient.ms'), icon: Zap, color: 'amber' },
    ]

    const ringCircumference = 2 * Math.PI * 50
    const ringOffset = ringCircumference * (1 - readiness.score / 100)
    const ringColor = readiness.score >= 75 ? '#10b981' : readiness.score >= 50 ? '#f59e0b' : '#ef4444'

    const firstName = profile?.full_name?.split(' ')[0] || 'there'

    return (
        <div className="app-layout">
            <NavSidebar />
            <div className="app-main with-sidebar">
                <div className="topbar">
                    <h1 className="topbar-title">{t('patient.dashboard_title')}, {firstName} 👋</h1>
                    <div className="topbar-actions">
                        <span className="badge badge-green">
                            <CheckCircle size={10} />
                            Program Active
                        </span>
                    </div>
                </div>

                <div className="page-content slide-up">
                    {/* Top row: readiness + stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, marginBottom: 24 }}>
                        {/* Readiness ring */}
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
                                {t('patient.readiness_score')}
                            </p>
                            <div className="ring-container">
                                <svg className="ring-svg" width="120" height="120" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="var(--slate-200)" strokeWidth="10" />
                                    <circle
                                        cx="60" cy="60" r="50" fill="none"
                                        stroke={ringColor} strokeWidth="10"
                                        strokeLinecap="round"
                                        strokeDasharray={ringCircumference}
                                        strokeDashoffset={ringOffset}
                                        style={{ transition: 'stroke-dashoffset 1s ease' }}
                                    />
                                </svg>
                                <div className="ring-label">
                                    <div className="ring-score" style={{ color: ringColor }}>{readiness.score}</div>
                                    <div className="ring-unit">/ 100</div>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
                                {readiness.suggestion}
                            </p>
                        </div>

                        {/* Stats */}
                        <div>
                            <div className="grid-2" style={{ marginBottom: 16 }}>
                                {stats.map(({ label, value, unit, icon: Icon, color }) => (
                                    <div key={label} className="stat-card">
                                        <div className={`stat-icon ${color}`}><Icon size={20} /></div>
                                        <div>
                                            <div className="stat-value">{value} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{unit}</span></div>
                                            <div className="stat-label">{label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* AI Insight */}
                            <div className="ai-insight">
                                <div className="ai-insight-icon">🧠</div>
                                <div className="ai-insight-text">
                                    <strong>{t('patient.ai_tip')}</strong>
                                    <p>{aiInsight.tip}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* HR Trend Chart */}
                    <div className="card" style={{ marginBottom: 24 }}>
                        <div className="card-header">
                            <div>
                                <div className="card-title">
                                    <TrendingUp size={16} style={{ display: 'inline', marginRight: 8, color: 'var(--teal-500)' }} />
                                    Heart Rate — This Week
                                </div>
                                <div className="card-subtitle">Resting heart rate trend</div>
                            </div>
                            <span className="badge badge-green">Stable</span>
                        </div>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={hrTrend} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-200)" />
                                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--slate-400)' }} />
                                    <YAxis domain={[55, 85]} tick={{ fontSize: 11, fill: 'var(--slate-400)' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: 8, border: '1px solid var(--slate-200)', fontSize: '0.85rem' }}
                                        formatter={(v) => [`${v} bpm`, 'Heart Rate']}
                                    />
                                    <Line type="monotone" dataKey="hr" stroke="var(--teal-500)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--teal-500)' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Today's program summary */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">
                                <Activity size={16} style={{ display: 'inline', marginRight: 8, color: 'var(--teal-500)' }} />
                                {t('patient.todays_program')}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {[
                                { label: 'Warm-up Walk', detail: '10 min · Low intensity', done: true },
                                { label: 'Recovery Breathing', detail: '5 min · After walk', done: true },
                                { label: 'Evening Walk', detail: '15 min · Moderate', done: false },
                            ].map(({ label, detail, done }) => (
                                <div key={label} style={{
                                    flex: '1 1 200px',
                                    padding: '14px 16px',
                                    borderRadius: 10,
                                    border: `1.5px solid ${done ? 'var(--green-500)' : 'var(--slate-200)'}`,
                                    background: done ? 'var(--green-100)' : 'var(--white)',
                                    display: 'flex', alignItems: 'center', gap: 12
                                }}>
                                    {done
                                        ? <CheckCircle size={20} color="var(--green-500)" />
                                        : <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--slate-300)' }} />
                                    }
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: done ? '#065f46' : 'var(--navy-900)' }}>{label}</div>
                                        <div style={{ fontSize: '0.78rem', color: done ? '#047857' : 'var(--slate-400)' }}>{detail}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="disclaimer-bar">{t('common.disclaimer')}</div>
                </div>
            </div>
        </div>
    )
}
