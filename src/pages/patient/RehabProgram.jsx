import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import NavSidebar from '../../components/NavSidebar'
import { Activity, Clock, Flame, CheckCircle, Heart, ChevronDown, ChevronUp } from 'lucide-react'

const PROGRAM = {
    name: 'Phase 1 — Initial Recovery',
    week: 1,
    days: [
        {
            day: 1, label: 'Monday', completed: true,
            exercises: [
                { name: 'Gentle Walking', duration: '10 min', intensity: 'Low', hrZone: '50–60%', borg: 9, completed: true },
                { name: 'Seated Breathing', duration: '5 min', intensity: 'Very Low', hrZone: '40–50%', borg: 6, completed: true },
            ]
        },
        {
            day: 2, label: 'Tuesday', completed: true,
            exercises: [
                { name: 'Rest / Recovery Walk', duration: '8 min', intensity: 'Low', hrZone: '50–60%', borg: 8, completed: true },
            ]
        },
        {
            day: 3, label: 'Wednesday', completed: false,
            exercises: [
                { name: 'Outdoor Walk', duration: '15 min', intensity: 'Moderate', hrZone: '60–70%', borg: 12, completed: false },
                { name: 'Chair Stretches', duration: '5 min', intensity: 'Very Low', hrZone: '40%', borg: 6, completed: false },
            ]
        },
        {
            day: 4, label: 'Thursday', completed: false,
            exercises: [
                { name: 'Rest Day', duration: '—', intensity: '—', hrZone: '—', borg: '—', completed: false },
            ]
        },
        {
            day: 5, label: 'Friday', completed: false,
            exercises: [
                { name: 'Flat Walk', duration: '18 min', intensity: 'Moderate', hrZone: '60–70%', borg: 13, completed: false },
            ]
        },
    ]
}

export default function RehabProgram() {
    const { t } = useTranslation()
    const [expanded, setExpanded] = useState(3) // Wednesday
    const [completedMap, setCompletedMap] = useState({})

    function toggleExpand(day) {
        setExpanded(e => e === day ? null : day)
    }

    function toggleExercise(dayIdx, exIdx) {
        const key = `${dayIdx}-${exIdx}`
        setCompletedMap(m => ({ ...m, [key]: !m[key] }))
    }

    return (
        <div className="app-layout">
            <NavSidebar />
            <div className="app-main with-sidebar">
                <div className="topbar">
                    <h1 className="topbar-title">{t('patient.program_title')}</h1>
                    <span className="badge badge-teal">
                        {t('patient.program_week')} {PROGRAM.week}
                    </span>
                </div>

                <div className="page-content slide-up">
                    {/* Program header card */}
                    <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, var(--navy-800), var(--navy-700))', color: 'white', border: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--teal-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                                    Assigned Program
                                </div>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 6 }}>{PROGRAM.name}</h2>
                                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem' }}>
                                    Week {PROGRAM.week} of 8 · 3 of 5 sessions completed this week
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--teal-400)' }}>60%</div>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Week progress</div>
                            </div>
                        </div>
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginTop: 20, overflow: 'hidden' }}>
                            <div style={{ width: '60%', height: '100%', background: 'linear-gradient(90deg, var(--teal-500), var(--teal-400))', borderRadius: 3 }} />
                        </div>
                    </div>

                    {/* HR Zone legend */}
                    <div className="card" style={{ marginBottom: 24, padding: '16px 20px' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                            Safe Heart Rate Zones
                        </p>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {[
                                { zone: 'Zone 1', range: '50–60%', color: '#10b981', label: 'Very Light' },
                                { zone: 'Zone 2', range: '60–70%', color: '#f59e0b', label: 'Light' },
                                { zone: 'Zone 3', range: '70–80%', color: '#ef4444', label: 'Moderate — Max during rehab' },
                            ].map(({ zone, range, color, label }) => (
                                <div key={zone} style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    background: 'var(--off-white)', borderRadius: 8, padding: '8px 12px',
                                    border: `1.5px solid ${color}22`
                                }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy-900)' }}>{zone}: {range}</span>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--slate-400)' }}>— {label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Days */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {PROGRAM.days.map(({ day, label, completed, exercises }) => (
                            <div key={day} style={{
                                background: 'var(--white)',
                                borderRadius: 12,
                                border: `1.5px solid ${completed ? 'var(--green-500)' : 'var(--slate-200)'}`,
                                overflow: 'hidden'
                            }}>
                                <button
                                    onClick={() => toggleExpand(day)}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: 16,
                                        padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
                                        textAlign: 'left'
                                    }}
                                >
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                        background: completed ? 'var(--green-100)' : 'var(--slate-100)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {completed
                                            ? <CheckCircle size={18} color="var(--green-500)" />
                                            : <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--slate-500)' }}>{day}</span>
                                        }
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy-900)' }}>
                                            {t('patient.program_day')} {day} — {label}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)', marginTop: 2 }}>
                                            {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
                                            {completed ? ' · ✅ Completed' : ''}
                                        </div>
                                    </div>
                                    {expanded === day ? <ChevronUp size={18} color="var(--slate-400)" /> : <ChevronDown size={18} color="var(--slate-400)" />}
                                </button>

                                {expanded === day && (
                                    <div style={{ borderTop: '1px solid var(--slate-200)', padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                            {exercises.map((ex, i) => {
                                                const key = `${day}-${i}`
                                                const isDone = completedMap[key] ?? ex.completed
                                                return (
                                                    <div key={i} className={`exercise-card${isDone ? ' completed' : ''}`}>
                                                        <div className="exercise-card-header">
                                                            <div>
                                                                <div className="exercise-title">{ex.name}</div>
                                                                <div className="exercise-meta">
                                                                    <span className="meta-pill"><Clock size={12} />{ex.duration}</span>
                                                                    <span className="meta-pill"><Flame size={12} />{ex.intensity}</span>
                                                                    <span className="meta-pill"><Heart size={12} />{ex.hrZone} max HR</span>
                                                                    <span className="meta-pill"><Activity size={12} />Borg {ex.borg}</span>
                                                                </div>
                                                            </div>
                                                            {ex.name !== 'Rest Day' && (
                                                                <button
                                                                    className={`btn btn-sm ${isDone ? 'btn-secondary' : 'btn-primary'}`}
                                                                    onClick={() => toggleExercise(day, i)}
                                                                >
                                                                    {isDone ? '✓ Done' : t('patient.mark_complete')}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="disclaimer-bar" style={{ marginTop: 32 }}>{t('common.disclaimer')}</div>
                </div>
            </div>
        </div>
    )
}
