import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import NavSidebar from '../../components/NavSidebar'
import { Bell, AlertTriangle, Heart, Activity, TrendingDown, CheckCircle } from 'lucide-react'

const ALERT_DATA = [
    { id: 1, type: 'alert_symptom', patient: 'John Smith', detail: 'Chest pain — moderate severity reported 2 hours ago.', time: '2h ago', level: 'high', resolved: false },
    { id: 2, type: 'alert_low_adherence', patient: 'John Smith', detail: 'Adherence at 45% — patient has missed 3 sessions this week.', time: '1d ago', level: 'high', resolved: false },
    { id: 3, type: 'alert_hr_abnormal', patient: 'Ayşe Yılmaz', detail: 'Resting HR recorded at 92 bpm — above target zone.', time: '6h ago', level: 'medium', resolved: false },
    { id: 4, type: 'alert_low_adherence', patient: 'Mehmet Çelik', detail: 'Adherence dropped to 63% this week.', time: '1d ago', level: 'medium', resolved: false },
    { id: 5, type: 'alert_overexertion', patient: 'Matti Virtanen', detail: 'Peak HR reached 108 bpm during Wednesday session — above recommended 105 bpm max.', time: '3d ago', level: 'medium', resolved: true },
]

const ALERT_ICONS = {
    alert_symptom: Heart,
    alert_low_adherence: TrendingDown,
    alert_hr_abnormal: Activity,
    alert_overexertion: AlertTriangle,
}

export default function Alerts() {
    const { t } = useTranslation()
    const [alerts, setAlerts] = useState(ALERT_DATA)
    const [filter, setFilter] = useState('all')

    function resolve(id) {
        setAlerts(as => as.map(a => a.id === id ? { ...a, resolved: true } : a))
    }

    const filtered = alerts.filter(a => {
        if (filter === 'active') return !a.resolved
        if (filter === 'resolved') return a.resolved
        return true
    })

    const activeCount = alerts.filter(a => !a.resolved).length

    function levelColor(level) {
        if (level === 'high') return { bg: 'var(--red-100)', border: 'var(--red-500)', badge: 'badge-red', color: 'var(--red-500)' }
        return { bg: 'var(--amber-100)', border: 'var(--amber-500)', badge: 'badge-amber', color: 'var(--amber-500)' }
    }

    return (
        <div className="app-layout">
            <NavSidebar alertCount={activeCount} />
            <div className="app-main with-sidebar">
                <div className="topbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Bell size={20} color="var(--teal-500)" />
                        <h1 className="topbar-title">{t('doctor.alerts_title')}</h1>
                    </div>
                    <span className="badge badge-red">{activeCount} active</span>
                </div>

                <div className="page-content slide-up">
                    {/* Filter tabs */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
                        {['all', 'active', 'resolved'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--slate-400)' }}>
                            <CheckCircle size={40} style={{ margin: '0 auto 16px', display: 'block' }} color="var(--green-500)" />
                            <p style={{ fontWeight: 600 }}>{t('doctor.no_alerts')}</p>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {filtered.map(alert => {
                            const Icon = ALERT_ICONS[alert.type] || Bell
                            const lc = levelColor(alert.level)
                            return (
                                <div key={alert.id} style={{
                                    background: alert.resolved ? 'var(--white)' : lc.bg,
                                    border: `1.5px solid ${alert.resolved ? 'var(--slate-200)' : lc.border + '60'}`,
                                    borderRadius: 12, padding: '18px 20px',
                                    display: 'flex', alignItems: 'flex-start', gap: 16,
                                    opacity: alert.resolved ? 0.6 : 1,
                                }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                                        background: alert.resolved ? 'var(--slate-100)' : lc.border + '20',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Icon size={18} color={alert.resolved ? 'var(--slate-400)' : lc.color} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <span className={`badge ${alert.resolved ? 'badge-slate' : lc.badge}`}>
                                                {alert.resolved ? 'Resolved' : alert.level}
                                            </span>
                                            <span style={{ fontSize: '0.82rem', color: 'var(--slate-400)' }}>{alert.time}</span>
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy-900)', marginBottom: 4 }}>
                                            {alert.patient} — {t(`doctor.${alert.type}`)}
                                        </div>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>{alert.detail}</p>
                                    </div>
                                    {!alert.resolved && (
                                        <button className="btn btn-secondary btn-sm" onClick={() => resolve(alert.id)} style={{ flexShrink: 0 }}>
                                            <CheckCircle size={14} /> {t('doctor.resolve')}
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    <div className="disclaimer-bar" style={{ marginTop: 32 }}>{t('common.disclaimer')}</div>
                </div>
            </div>
        </div>
    )
}
