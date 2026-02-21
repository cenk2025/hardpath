import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import NavSidebar from '../../components/NavSidebar'
import {
    Heart, Activity, Moon, Zap, CheckCircle, TrendingUp,
    ClipboardList, MessageCircle, RefreshCw, AlertCircle
} from 'lucide-react'
import { calcReadinessScore, generateAIInsight } from '../../lib/aiRisk'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

export default function PatientDashboard() {
    const { t } = useTranslation()
    const { user, profile } = useAuth()
    const navigate = useNavigate()
    const [latestMetric, setLatestMetric] = useState(null)
    const [hrTrend, setHrTrend] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [recentSymptom, setRecentSymptom] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => { if (user) fetchAll() }, [user])

    async function fetchAll() {
        setLoading(true)
        try {
            // Last 7 days of metrics for chart
            const { data: metrics } = await supabase
                .from('daily_metrics')
                .select('resting_hr, fatigue_level, sleep_hours, hrv_ms, readiness_score, recorded_at')
                .eq('patient_id', user.id)
                .order('recorded_at', { ascending: false })
                .limit(7)

            if (metrics?.length) {
                setLatestMetric(metrics[0])
                // Build HR trend from oldest → newest
                setHrTrend([...metrics].reverse().map(m => ({
                    day: new Date(m.recorded_at).toLocaleDateString('en', { weekday: 'short' }),
                    hr: m.resting_hr,
                })))
            }

            // Unread messages count
            const { count } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('receiver_id', user.id)

            setUnreadCount(count || 0)

            // Most recent symptom report
            const { data: syms } = await supabase
                .from('symptom_reports')
                .select('severity, symptoms, timestamp')
                .eq('patient_id', user.id)
                .order('timestamp', { ascending: false })
                .limit(1)
            if (syms?.length) setRecentSymptom(syms[0])
        } catch (err) {
            console.error('Dashboard load error:', err)
        } finally {
            setLoading(false)
        }
    }

    // Use real metrics if available, fall back to neutral defaults for AI calc
    const metricsForAI = {
        fatigue: latestMetric?.fatigue_level ?? 5,
        hr: latestMetric?.resting_hr ?? 70,
        sleep: latestMetric?.sleep_hours ?? 7,
        hrv: latestMetric?.hrv_ms ?? 40,
    }
    const readiness = latestMetric?.readiness_score
        ? { score: latestMetric.readiness_score, suggestion: calcReadinessScore(metricsForAI).suggestion }
        : calcReadinessScore(metricsForAI)
    const aiInsight = generateAIInsight(metricsForAI)

    const ringCircumference = 2 * Math.PI * 50
    const ringOffset = ringCircumference * (1 - readiness.score / 100)
    const ringColor = readiness.score >= 75 ? '#10b981' : readiness.score >= 50 ? '#f59e0b' : '#ef4444'
    const firstName = profile?.full_name?.split(' ')[0] || 'there'

    const hasData = !!latestMetric

    const stats = [
        {
            label: t('patient.heart_rate'), icon: Heart, color: 'red',
            value: latestMetric?.resting_hr ?? '—', unit: latestMetric ? t('patient.bpm') : ''
        },
        {
            label: t('patient.sleep'), icon: Moon, color: 'purple',
            value: latestMetric?.sleep_hours ?? '—', unit: latestMetric ? t('patient.hrs') : ''
        },
        {
            label: t('patient.hrv'), icon: Zap, color: 'amber',
            value: latestMetric?.hrv_ms ?? '—', unit: latestMetric ? t('patient.ms') : ''
        },
        {
            label: 'Fatigue', icon: Activity, color: 'teal',
            value: latestMetric?.fatigue_level ?? '—', unit: latestMetric ? '/ 10' : ''
        },
    ]

    return (
        <div className="app-layout">
            <NavSidebar alertCount={unreadCount} />
            <div className="app-main">
                <div className="topbar">
                    <h1 className="topbar-title">{t('patient.dashboard_title')}, {firstName} 👋</h1>
                    <div className="topbar-actions">
                        {loading && <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite', color: 'var(--slate-400)' }} />}
                        {!loading && hasData && (
                            <span className="badge badge-green"><CheckCircle size={10} /> Program Active</span>
                        )}
                        {!loading && !hasData && (
                            <span className="badge badge-amber">
                                <AlertCircle size={10} /> No check-in yet
                            </span>
                        )}
                    </div>
                </div>

                <div className="page-content slide-up">
                    {/* No data banner */}
                    {!loading && !hasData && (
                        <div className="alert-banner info" style={{ marginBottom: 24 }}>
                            <ClipboardList size={16} />
                            <div>
                                <strong>Start your first daily check-in!</strong>
                                <p style={{ marginTop: 2, fontSize: '0.85rem' }}>
                                    Your readiness, heart rate and sleep data will appear here after you complete a check-in.
                                </p>
                            </div>
                            <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto', flexShrink: 0 }} onClick={() => navigate('/patient/checkin')}>
                                Check In Now →
                            </button>
                        </div>
                    )}

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
                                        stroke={hasData ? ringColor : 'var(--slate-200)'} strokeWidth="10"
                                        strokeLinecap="round"
                                        strokeDasharray={ringCircumference}
                                        strokeDashoffset={hasData ? ringOffset : ringCircumference}
                                        style={{ transition: 'stroke-dashoffset 1s ease' }}
                                    />
                                </svg>
                                <div className="ring-label">
                                    <div className="ring-score" style={{ color: hasData ? ringColor : 'var(--slate-300)' }}>
                                        {hasData ? readiness.score : '—'}
                                    </div>
                                    <div className="ring-unit">/ 100</div>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
                                {hasData ? readiness.suggestion : 'Complete a check-in to see your score'}
                            </p>
                        </div>

                        {/* Stats */}
                        <div>
                            <div className="grid-2" style={{ marginBottom: 16 }}>
                                {stats.map(({ label, value, unit, icon: Icon, color }) => (
                                    <div key={label} className="stat-card">
                                        <div className={`stat-icon ${color}`}><Icon size={20} /></div>
                                        <div>
                                            <div className="stat-value">
                                                {value} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{unit}</span>
                                            </div>
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
                                    <p>{hasData ? aiInsight.tip : 'Complete your first check-in and get personalized AI health insights.'}</p>
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
                                    Heart Rate — Last 7 Days
                                </div>
                                <div className="card-subtitle">
                                    {hasData ? 'Resting heart rate from your check-ins' : 'No data yet — complete a check-in'}
                                </div>
                            </div>
                            {hasData && <span className="badge badge-green">Tracking</span>}
                        </div>
                        <div className="chart-container">
                            {hrTrend.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={hrTrend} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-200)" />
                                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--slate-400)' }} />
                                        <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: 'var(--slate-400)' }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: 8, border: '1px solid var(--slate-200)', fontSize: '0.85rem' }}
                                            formatter={(v) => [`${v} bpm`, 'Heart Rate']}
                                        />
                                        <Line type="monotone" dataKey="hr" stroke="var(--teal-500)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--teal-500)' }} connectNulls />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--slate-400)' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <Heart size={32} style={{ opacity: 0.2, marginBottom: 8 }} />
                                        <p style={{ fontSize: '0.85rem' }}>No heart rate data yet</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick actions + recent symptom */}
                    <div className="grid-2">
                        <div className="card">
                            <div className="card-title" style={{ marginBottom: 16 }}>Quick Actions</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <button className="btn btn-primary" onClick={() => navigate('/patient/checkin')}>
                                    <ClipboardList size={16} /> Daily Check-In
                                </button>
                                <button className="btn btn-secondary" onClick={() => navigate('/patient/symptoms')}>
                                    <AlertCircle size={16} /> Log Symptom
                                </button>
                                <button className="btn btn-secondary" onClick={() => navigate('/patient/messages')} style={{ position: 'relative' }}>
                                    <MessageCircle size={16} /> Messages
                                    {unreadCount > 0 && (
                                        <span style={{ marginLeft: 4, background: 'var(--red-500)', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-title" style={{ marginBottom: 16 }}>
                                <AlertCircle size={14} style={{ display: 'inline', marginRight: 6, color: 'var(--red-500)' }} />
                                Latest Symptom Report
                            </div>
                            {recentSymptom ? (
                                <div>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                                        <span className={`badge ${recentSymptom.severity === 'severe' ? 'badge-red' : recentSymptom.severity === 'moderate' ? 'badge-amber' : 'badge-teal'}`}>
                                            {recentSymptom.severity}
                                        </span>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--slate-400)' }}>
                                            {new Date(recentSymptom.timestamp).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--navy-900)', fontWeight: 600 }}>
                                        {(recentSymptom.symptoms || []).join(', ')}
                                    </p>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', color: 'var(--slate-400)', padding: '16px 0' }}>
                                    <CheckCircle size={24} style={{ marginBottom: 6, color: 'var(--green-500)' }} />
                                    <p style={{ fontSize: '0.85rem' }}>No symptoms reported</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="disclaimer-bar" style={{ marginTop: 24 }}>{t('common.disclaimer')}</div>
                </div>
            </div>
        </div>
    )
}
