import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import NavSidebar from '../../components/NavSidebar'
import {
    Bell, AlertTriangle, Heart, Activity, TrendingDown,
    CheckCircle, RefreshCw, MessageCircle, Gauge
} from 'lucide-react'

// Generate alert objects from raw Supabase data
function buildAlerts(symptomReports, highHRMetrics, lowReadinessMetrics, highBPLogs) {
    const alerts = []

    // Symptom-based alerts
    symptomReports.forEach(s => {
        const level = s.severity === 'severe' ? 'high' : 'medium'
        alerts.push({
            id: `sym-${s.id}`,
            type: 'symptom',
            patient_id: s.patient_id,
            patient: s.profiles?.full_name || 'Unknown Patient',
            detail: `${s.severity?.toUpperCase()} symptoms reported: ${(s.symptoms || []).join(', ')}${s.notes ? ` — "${s.notes}"` : ''}`,
            time: s.timestamp,
            level,
            resolved: false,
            icon: Heart,
        })
    })

    // High HR alerts (resting_hr > 100)
    highHRMetrics.forEach(m => {
        alerts.push({
            id: `hr-${m.id}`,
            type: 'high_hr',
            patient_id: m.patient_id,
            patient: m.profiles?.full_name || 'Unknown Patient',
            detail: `Resting HR recorded at ${m.resting_hr} bpm — above the safe threshold of 100 bpm.`,
            time: m.recorded_at,
            level: m.resting_hr >= 110 ? 'high' : 'medium',
            resolved: false,
            icon: Activity,
        })
    })

    // Low readiness alerts (score < 40)
    lowReadinessMetrics.forEach(m => {
        alerts.push({
            id: `rdy-${m.id}`,
            type: 'low_readiness',
            patient_id: m.patient_id,
            patient: m.profiles?.full_name || 'Unknown Patient',
            detail: `Readiness score critically low at ${m.readiness_score}/100. Patient may need rest or medical review.`,
            time: m.recorded_at,
            level: 'high',
            resolved: false,
            icon: TrendingDown,
        })
    })

    // High blood pressure alerts (systolic >= 140)
    highBPLogs.forEach(bp => {
        alerts.push({
            id: `bp-${bp.id}`,
            type: 'high_bp',
            patient_id: bp.patient_id,
            patient: bp.profiles?.full_name || 'Unknown Patient',
            detail: `${bp.period === 'morning' ? '🌅 Morning' : '🌙 Evening'} blood pressure recorded at ${bp.systolic}/${bp.diastolic} mmHg — systolic above 140 mmHg threshold.${bp.notes ? ` Note: ${bp.notes}` : ''}`,
            time: bp.recorded_at,
            level: bp.systolic >= 160 ? 'high' : 'medium',
            resolved: false,
            icon: Gauge,
        })
    })

    // Sort newest first
    alerts.sort((a, b) => new Date(b.time) - new Date(a.time))
    return alerts
}

function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}

export default function Alerts() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [alerts, setAlerts] = useState([])
    const [resolved, setResolved] = useState(new Set()) // local resolved IDs
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('active')

    useEffect(() => {
        fetchAlerts()
        // Realtime: re-fetch when new symptom reports, metrics, or BP logs arrive
        const channel = supabase
            .channel('alerts-realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'symptom_reports' }, () => fetchAlerts())
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'daily_metrics' }, () => fetchAlerts())
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'blood_pressure_logs' }, () => fetchAlerts())
            .subscribe()
        return () => supabase.removeChannel(channel)
    }, [])

    async function fetchAlerts() {
        setLoading(true)
        try {
            const since = new Date()
            since.setDate(since.getDate() - 7)

            // Severe/moderate symptoms in last 7 days
            const { data: symptoms } = await supabase
                .from('symptom_reports')
                .select('*, profiles(full_name)')
                .in('severity', ['severe', 'moderate'])
                .gte('timestamp', since.toISOString())
                .order('timestamp', { ascending: false })
                .limit(20)

            // High resting HR in last 7 days
            const { data: highHR } = await supabase
                .from('daily_metrics')
                .select('*, profiles(full_name)')
                .gt('resting_hr', 100)
                .gte('recorded_at', since.toISOString())
                .order('recorded_at', { ascending: false })
                .limit(20)

            // Low readiness score in last 7 days
            const { data: lowReadiness } = await supabase
                .from('daily_metrics')
                .select('*, profiles(full_name)')
                .lt('readiness_score', 40)
                .gte('recorded_at', since.toISOString())
                .order('recorded_at', { ascending: false })
                .limit(20)

            // High blood pressure (systolic >= 140) in last 7 days
            const { data: highBP } = await supabase
                .from('blood_pressure_logs')
                .select('*, profiles(full_name)')
                .gte('systolic', 140)
                .gte('recorded_at', since.toISOString())
                .order('recorded_at', { ascending: false })
                .limit(20)

            setAlerts(buildAlerts(symptoms || [], highHR || [], lowReadiness || [], highBP || []))
        } catch (err) {
            console.error('Alerts fetch error:', err)
        } finally {
            setLoading(false)
        }
    }

    function resolveAlert(id) {
        setResolved(prev => new Set([...prev, id]))
    }

    const enriched = alerts.map(a => ({ ...a, resolved: resolved.has(a.id) }))
    const filtered = enriched.filter(a => {
        if (filter === 'active') return !a.resolved
        if (filter === 'resolved') return a.resolved
        return true
    })
    const activeCount = enriched.filter(a => !a.resolved).length

    function levelColor(level) {
        if (level === 'high') return { bg: 'rgba(239,68,68,0.06)', border: 'var(--red-500)', badge: 'badge-red', color: 'var(--red-500)' }
        return { bg: 'rgba(245,158,11,0.06)', border: 'var(--amber-500)', badge: 'badge-amber', color: 'var(--amber-500)' }
    }

    return (
        <div className="app-layout">
            <NavSidebar alertCount={activeCount} />
            <div className="app-main">
                <div className="topbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Bell size={20} color="var(--teal-500)" />
                        <h1 className="topbar-title">{t('doctor.alerts_title')}</h1>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {activeCount > 0 && <span className="badge badge-red">{activeCount} active</span>}
                        <button className="btn btn-ghost btn-sm" onClick={fetchAlerts} title="Refresh">
                            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                        </button>
                    </div>
                </div>

                <div className="page-content slide-up">
                    {/* Filter tabs */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
                        {['active', 'all', 'resolved'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>

                    {loading && (
                        <div style={{ textAlign: 'center', padding: 48 }}>
                            <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--slate-400)' }} />
                            <p style={{ marginTop: 12, color: 'var(--slate-400)', fontSize: '0.85rem' }}>Loading patient alerts…</p>
                        </div>
                    )}

                    {!loading && filtered.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--slate-400)' }}>
                            <CheckCircle size={44} style={{ margin: '0 auto 16px', display: 'block' }} color="var(--green-500)" />
                            <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--navy-900)', marginBottom: 8 }}>
                                {filter === 'active' ? 'No active alerts' : 'No alerts found'}
                            </p>
                            <p style={{ fontSize: '0.85rem' }}>
                                {filter === 'active'
                                    ? 'All patients are within safe parameters this week.'
                                    : 'Alerts appear when patients report symptoms or have abnormal HR/readiness.'}
                            </p>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {filtered.map(alert => {
                            const Icon = alert.icon || Bell
                            const lc = levelColor(alert.level)
                            return (
                                <div key={alert.id} style={{
                                    background: alert.resolved ? 'var(--white)' : lc.bg,
                                    border: `1.5px solid ${alert.resolved ? 'var(--slate-200)' : lc.border + '50'}`,
                                    borderRadius: 12, padding: '18px 20px',
                                    display: 'flex', alignItems: 'flex-start', gap: 16,
                                    opacity: alert.resolved ? 0.55 : 1,
                                    transition: 'opacity 0.3s',
                                }}>
                                    {/* Icon */}
                                    <div style={{
                                        width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                                        background: alert.resolved ? 'var(--slate-100)' : lc.border + '18',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Icon size={18} color={alert.resolved ? 'var(--slate-400)' : lc.color} />
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                            <span className={`badge ${alert.resolved ? 'badge-slate' : lc.badge}`}>
                                                {alert.resolved ? 'Resolved' : alert.level}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>{timeAgo(alert.time)}</span>
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy-900)', marginBottom: 4 }}>
                                            {alert.patient}
                                            <span style={{ fontWeight: 500, color: 'var(--slate-500)', marginLeft: 6 }}>
                                                — {alert.type === 'symptom' ? 'Symptom Report' : alert.type === 'high_hr' ? 'High Heart Rate' : alert.type === 'high_bp' ? 'High Blood Pressure' : 'Low Readiness'}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>{alert.detail}</p>
                                    </div>

                                    {/* Actions */}
                                    {!alert.resolved && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => navigate(`/doctor/patients/${alert.patient_id}`)}
                                            >
                                                <Activity size={13} /> View
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => navigate(`/doctor/messages?patient=${alert.patient_id}`)}
                                            >
                                                <MessageCircle size={13} /> Message
                                            </button>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => resolveAlert(alert.id)}
                                            >
                                                <CheckCircle size={13} /> {t('doctor.resolve')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* How alerts work */}
                    {!loading && alerts.length === 0 && (
                        <div className="ai-insight" style={{ marginTop: 24 }}>
                            <div className="ai-insight-icon">💡</div>
                            <div className="ai-insight-text">
                                <strong>How alerts work</strong>
                                <p>Alerts are automatically generated when a patient submits a symptom report (moderate/severe), records resting HR above 100 bpm, or has a readiness score below 40/100. All data is from the last 7 days.</p>
                            </div>
                        </div>
                    )}

                    <div className="disclaimer-bar" style={{ marginTop: 32 }}>{t('common.disclaimer')}</div>
                </div>
            </div>
        </div>
    )
}
