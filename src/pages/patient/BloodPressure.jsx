import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import NavSidebar from '../../components/NavSidebar'
import { Activity, Plus, Trash2, RefreshCw, AlertCircle, CheckCircle, Sun, Moon } from 'lucide-react'

// Generates last 7 days as {date label, isoDate}
function getLast7Days() {
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        return {
            label: d.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }),
            iso: d.toISOString().slice(0, 10),
        }
    })
}

export default function BloodPressure() {
    const { t } = useTranslation()
    const { user } = useAuth()
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [saved, setSaved] = useState(false)

    // Quick-add form
    const [form, setForm] = useState({
        systolic: '',
        diastolic: '',
        period: 'morning',
        notes: '',
    })
    const [saving, setSaving] = useState(false)

    const days = getLast7Days()

    useEffect(() => { if (user) fetchLogs() }, [user])

    async function fetchLogs() {
        setLoading(true)
        const since = new Date()
        since.setDate(since.getDate() - 6)
        since.setHours(0, 0, 0, 0)
        const { data, error: err } = await supabase
            .from('blood_pressure_logs')
            .select('*')
            .eq('patient_id', user.id)
            .gte('recorded_at', since.toISOString())
            .order('recorded_at', { ascending: true })
        if (err) setError(err.message)
        else setLogs(data || [])
        setLoading(false)
    }

    async function addLog() {
        if (!form.systolic || !form.diastolic) return
        setSaving(true); setError(null); setSaved(false)
        const { data, error: err } = await supabase
            .from('blood_pressure_logs')
            .insert({
                patient_id: user.id,
                systolic: Number(form.systolic),
                diastolic: Number(form.diastolic),
                period: form.period,
                notes: form.notes || null,
                recorded_at: new Date().toISOString(),
            })
            .select().single()
        if (err) setError(err.message)
        else {
            setLogs(l => [...l, data])
            setForm({ systolic: '', diastolic: '', period: 'morning', notes: '' })
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        }
        setSaving(false)
    }

    async function deleteLog(id) {
        await supabase.from('blood_pressure_logs').delete().eq('id', id)
        setLogs(l => l.filter(x => x.id !== id))
    }

    // Group logs by date
    function logsForDate(iso) {
        return logs.filter(l => l.recorded_at.slice(0, 10) === iso)
    }

    function bpColor(sys) {
        if (!sys) return 'var(--slate-300)'
        if (sys >= 140) return 'var(--red-500)'
        if (sys >= 130) return 'var(--amber-500)'
        return 'var(--green-500)'
    }

    function bpLabel(sys) {
        if (!sys) return ''
        if (sys >= 140) return 'High'
        if (sys >= 130) return 'Elevated'
        return 'Normal'
    }

    return (
        <div className="app-layout">
            <NavSidebar />
            <div className="app-main">
                <div className="topbar">
                    <h1 className="topbar-title">
                        <Activity size={18} style={{ display: 'inline', marginRight: 8, color: 'var(--teal-500)' }} />
                        Blood Pressure Log
                    </h1>
                    <button className="btn btn-ghost btn-sm" onClick={fetchLogs}>
                        <RefreshCw size={14} />
                    </button>
                </div>

                <div className="page-content slide-up">
                    {/* Quick add */}
                    <div className="card" style={{ marginBottom: 24, border: '1.5px solid var(--teal-500)' }}>
                        <div className="card-title" style={{ marginBottom: 16 }}>Add Reading</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14, alignItems: 'end' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Systolic (mmHg)</label>
                                <input
                                    className="form-input"
                                    type="number" min={60} max={250}
                                    value={form.systolic}
                                    onChange={e => setForm(f => ({ ...f, systolic: e.target.value }))}
                                    placeholder="e.g. 120"
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Diastolic (mmHg)</label>
                                <input
                                    className="form-input"
                                    type="number" min={40} max={150}
                                    value={form.diastolic}
                                    onChange={e => setForm(f => ({ ...f, diastolic: e.target.value }))}
                                    placeholder="e.g. 80"
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Time of Day</label>
                                <select className="form-select" value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))}>
                                    <option value="morning">🌅 Morning</option>
                                    <option value="evening">🌙 Evening</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Notes (optional)</label>
                                <input
                                    className="form-input"
                                    value={form.notes}
                                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                    placeholder="After exercise..."
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="alert-banner danger" style={{ marginTop: 14 }}>
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}
                        {saved && (
                            <div className="alert-banner success" style={{ marginTop: 14 }}>
                                <CheckCircle size={14} /> Reading saved!
                            </div>
                        )}

                        <button
                            className="btn btn-primary"
                            style={{ marginTop: 16 }}
                            onClick={addLog}
                            disabled={saving || !form.systolic || !form.diastolic}
                        >
                            {saving ? 'Saving…' : <><Plus size={15} /> Log Reading</>}
                        </button>
                    </div>

                    {/* Weekly table */}
                    <div className="card">
                        <div className="card-title" style={{ marginBottom: 20 }}>
                            Weekly Overview — Last 7 Days
                        </div>

                        {loading && (
                            <div style={{ textAlign: 'center', padding: 32 }}>
                                <RefreshCw size={22} style={{ animation: 'spin 1s linear infinite', color: 'var(--slate-400)' }} />
                            </div>
                        )}

                        {!loading && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {days.map(day => {
                                    const dayLogs = logsForDate(day.iso)
                                    const morning = dayLogs.find(l => l.period === 'morning')
                                    const evening = dayLogs.find(l => l.period === 'evening')
                                    const isToday = day.iso === new Date().toISOString().slice(0, 10)

                                    return (
                                        <div key={day.iso} style={{
                                            border: `1.5px solid ${isToday ? 'var(--teal-500)' : 'var(--slate-200)'}`,
                                            borderRadius: 10,
                                            overflow: 'hidden',
                                        }}>
                                            {/* Day header */}
                                            <div style={{
                                                padding: '10px 16px',
                                                background: isToday ? 'rgba(8,145,178,0.06)' : 'var(--off-white)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                borderBottom: '1px solid var(--slate-200)'
                                            }}>
                                                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isToday ? 'var(--teal-600)' : 'var(--navy-900)' }}>
                                                    {day.label} {isToday && <span className="badge badge-teal" style={{ marginLeft: 6, fontSize: '0.68rem' }}>Today</span>}
                                                </span>
                                                <span style={{ fontSize: '0.78rem', color: 'var(--slate-400)' }}>
                                                    {dayLogs.length === 0 ? 'No readings' : `${dayLogs.length} reading${dayLogs.length > 1 ? 's' : ''}`}
                                                </span>
                                            </div>

                                            {/* Morning + Evening rows */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                                                {[{ key: 'morning', log: morning, icon: <Sun size={14} color="var(--amber-500)" />, label: 'Morning' },
                                                { key: 'evening', log: evening, icon: <Moon size={14} color="var(--purple-500)" />, label: 'Evening' }
                                                ].map(({ key, log, icon, label }) => (
                                                    <div key={key} style={{
                                                        padding: '12px 16px',
                                                        borderRight: key === 'morning' ? '1px solid var(--slate-200)' : 'none',
                                                        display: 'flex', alignItems: 'center', gap: 10
                                                    }}>
                                                        {icon}
                                                        {log ? (
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: bpColor(log.systolic) }}>
                                                                        {log.systolic}/{log.diastolic}
                                                                    </span>
                                                                    <span style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>mmHg</span>
                                                                    <span style={{
                                                                        fontSize: '0.7rem', fontWeight: 700,
                                                                        color: bpColor(log.systolic),
                                                                        background: log.systolic >= 140 ? 'rgba(239,68,68,0.1)' : log.systolic >= 130 ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                                                                        padding: '2px 6px', borderRadius: 4
                                                                    }}>{bpLabel(log.systolic)}</span>
                                                                </div>
                                                                {log.notes && <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: 2 }}>{log.notes}</div>}
                                                            </div>
                                                        ) : (
                                                            <span style={{ fontSize: '0.82rem', color: 'var(--slate-300)' }}>{label}: —</span>
                                                        )}
                                                        {log && (
                                                            <button
                                                                className="btn btn-ghost btn-sm"
                                                                style={{ color: 'var(--red-400)', padding: '2px 6px', flexShrink: 0 }}
                                                                onClick={() => deleteLog(log.id)}
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Reference */}
                    <div className="ai-insight" style={{ marginTop: 24 }}>
                        <div className="ai-insight-icon">💡</div>
                        <div className="ai-insight-text">
                            <strong>Blood Pressure Guidelines</strong>
                            <p>
                                <span style={{ color: 'var(--green-500)', fontWeight: 700 }}>Normal:</span> below 130/80 ·{' '}
                                <span style={{ color: 'var(--amber-500)', fontWeight: 700 }}>Elevated:</span> 130–139/80–89 ·{' '}
                                <span style={{ color: 'var(--red-500)', fontWeight: 700 }}>High:</span> 140+/90+
                            </p>
                        </div>
                    </div>

                    <div className="disclaimer-bar" style={{ marginTop: 24 }}>⚕ HeartPath is not a diagnostic tool. Always consult your healthcare provider for medical decisions.</div>
                </div>
            </div>
        </div>
    )
}
