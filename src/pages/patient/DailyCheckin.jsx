import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import NavSidebar from '../../components/NavSidebar'
import { Heart, Activity, Moon, Zap, CheckCircle, AlertTriangle } from 'lucide-react'
import { calcReadinessScore } from '../../lib/aiRisk'

const SYMPTOMS = [
    { key: 'chest_pain', label: 'patient.symptom_chest_pain', icon: Heart, color: '#ef4444' },
    { key: 'dizziness', label: 'patient.symptom_dizziness', icon: Activity, color: '#f59e0b' },
    { key: 'dyspnea', label: 'patient.symptom_dyspnea', icon: Zap, color: '#8b5cf6' },
    { key: 'palpitations', label: 'patient.symptom_palpitations', icon: Zap, color: '#0891b2' },
]

export default function DailyCheckin() {
    const { t } = useTranslation()
    const { user } = useAuth()
    const [fatigue, setFatigue] = useState(7)
    const [restHr, setRestHr] = useState('')
    const [selectedSymptoms, setSelectedSymptoms] = useState([])
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)

    const readiness = calcReadinessScore({ fatigue, hr: Number(restHr) || 70, sleep: 7.5, hrv: 42 })

    function toggleSymptom(key) {
        setSelectedSymptoms(s => s.includes(key) ? s.filter(x => x !== key) : [...s, key])
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        try {
            await supabase.from('daily_metrics').insert({
                patient_id: user.id,
                fatigue_level: fatigue,
                resting_hr: Number(restHr) || null,
                symptoms: selectedSymptoms,
                readiness_score: readiness.score,
                recorded_at: new Date().toISOString(),
            })
        } catch (err) {
            console.error(err)
        }
        setSubmitted(true)
        setLoading(false)
    }

    if (submitted) {
        return (
            <div className="app-layout">
                <NavSidebar />
                <div className="app-main with-sidebar">
                    <div className="topbar"><h1 className="topbar-title">{t('patient.checkin_title')}</h1></div>
                    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                        <div style={{ textAlign: 'center', maxWidth: 400 }}>
                            <div style={{
                                width: 80, height: 80, background: 'var(--green-100)', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
                            }}>
                                <CheckCircle size={36} color="var(--green-500)" />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12 }}>{t('patient.checkin_saved')}</h2>
                            <p style={{ color: 'var(--slate-500)', marginBottom: 24 }}>
                                Readiness score: <strong style={{ color: 'var(--teal-500)' }}>{readiness.score}/100</strong>
                            </p>
                            <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', lineHeight: 1.6 }}>{readiness.suggestion}</p>
                            <button className="btn btn-primary mt-6" onClick={() => setSubmitted(false)}>
                                Check in again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="app-layout">
            <NavSidebar />
            <div className="app-main with-sidebar">
                <div className="topbar">
                    <h1 className="topbar-title">{t('patient.checkin_title')}</h1>
                    <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>{new Date().toLocaleDateString()}</span>
                </div>

                <div className="page-content slide-up">
                    <div style={{ maxWidth: 640, margin: '0 auto' }}>
                        <p style={{ color: 'var(--slate-500)', marginBottom: 32 }}>{t('patient.checkin_subtitle')}</p>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                            {/* Energy level */}
                            <div className="card">
                                <label className="form-label" style={{ fontSize: '1rem', marginBottom: 16, display: 'block' }}>
                                    {t('patient.fatigue_level')}
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)', minWidth: 70 }}>{t('patient.fatigue_low')}</span>
                                    <input
                                        type="range"
                                        min={1} max={10}
                                        value={fatigue}
                                        onChange={e => setFatigue(Number(e.target.value))}
                                        className="slider-input"
                                        style={{ flex: 1 }}
                                    />
                                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)', minWidth: 70, textAlign: 'right' }}>{t('patient.fatigue_high')}</span>
                                </div>
                                <div style={{ textAlign: 'center', marginTop: 10 }}>
                                    <span style={{
                                        fontSize: '2rem', fontWeight: 800,
                                        color: fatigue >= 7 ? 'var(--green-500)' : fatigue >= 4 ? 'var(--amber-500)' : 'var(--red-500)'
                                    }}>{fatigue}</span>
                                    <span style={{ fontSize: '1rem', color: 'var(--slate-400)' }}>/10</span>
                                </div>
                            </div>

                            {/* Resting HR */}
                            <div className="card">
                                <div className="form-group">
                                    <label className="form-label">{t('patient.resting_hr')}</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <Heart size={20} color="var(--red-500)" />
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={restHr}
                                            onChange={e => setRestHr(e.target.value)}
                                            placeholder="e.g. 68"
                                            min={40} max={180}
                                            style={{ maxWidth: 160 }}
                                        />
                                        <span style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>{t('patient.bpm')}</span>
                                    </div>
                                    {restHr && Number(restHr) > 100 && (
                                        <div className="alert-banner warning" style={{ marginTop: 12 }}>
                                            <AlertTriangle size={16} />
                                            Heart rate is elevated. Please rest and contact your doctor if this persists.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Symptoms */}
                            <div className="card">
                                <p className="form-label" style={{ marginBottom: 14 }}>{t('patient.symptoms_today')}</p>
                                <div className="symptom-grid">
                                    {SYMPTOMS.map(({ key, label, icon: Icon }) => (
                                        <button
                                            key={key}
                                            type="button"
                                            className={`symptom-option${selectedSymptoms.includes(key) ? ' selected' : ''}`}
                                            onClick={() => toggleSymptom(key)}
                                        >
                                            <Icon size={16} />
                                            {t(label)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Readiness preview */}
                            <div className="ai-insight">
                                <div className="ai-insight-icon">🧠</div>
                                <div className="ai-insight-text">
                                    <strong>{t('patient.ai_tip')}</strong>
                                    <p>Based on your inputs, readiness score: <strong>{readiness.score}/100</strong> — {readiness.suggestion}</p>
                                </div>
                            </div>

                            <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
                                {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2.5 }} /> Saving...</> : t('patient.submit_checkin')}
                            </button>
                        </form>
                    </div>
                    <div className="disclaimer-bar" style={{ marginTop: 32 }}>{t('common.disclaimer')}</div>
                </div>
            </div>
        </div>
    )
}
