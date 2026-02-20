import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import NavSidebar from '../../components/NavSidebar'
import { Heart, Activity, Zap, AlertTriangle, CheckCircle, Phone } from 'lucide-react'

const SYMPTOM_TYPES = [
    { key: 'chest_pain', icon: Heart, color: '#ef4444' },
    { key: 'dizziness', icon: Activity, color: '#f59e0b' },
    { key: 'dyspnea', icon: Zap, color: '#8b5cf6' },
    { key: 'palpitations', icon: Zap, color: '#0891b2' },
]

const SEVERITY = ['mild', 'moderate', 'severe']

export default function SymptomReport() {
    const { t } = useTranslation()
    const { user } = useAuth()
    const [selected, setSelected] = useState([])
    const [severity, setSeverity] = useState('moderate')
    const [notes, setNotes] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)

    const isUrgent = selected.includes('chest_pain') || severity === 'severe'

    function toggleSymptom(key) {
        setSelected(s => s.includes(key) ? s.filter(x => x !== key) : [...s, key])
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (selected.length === 0) return
        setLoading(true)
        try {
            await supabase.from('symptom_reports').insert({
                patient_id: user.id,
                symptoms: selected,
                severity,
                notes,
                timestamp: new Date().toISOString(),
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
                    <div className="topbar"><h1 className="topbar-title">{t('patient.symptom_title')}</h1></div>
                    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                        <div style={{ textAlign: 'center', maxWidth: 400 }} className="slide-up">
                            <div style={{ width: 80, height: 80, background: 'var(--green-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <CheckCircle size={36} color="var(--green-500)" />
                            </div>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 12 }}>{t('patient.report_sent')}</h2>
                            <p style={{ color: 'var(--slate-500)', lineHeight: 1.6 }}>Your care team has been notified and will review your report shortly.</p>
                            <button className="btn btn-primary mt-6" onClick={() => { setSubmitted(false); setSelected([]); setNotes('') }}>
                                New Report
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
                    <h1 className="topbar-title">{t('patient.symptom_title')}</h1>
                </div>

                <div className="page-content slide-up">
                    <div style={{ maxWidth: 640, margin: '0 auto' }}>
                        {/* Emergency banner */}
                        <div className="alert-banner danger" style={{ marginBottom: 28 }}>
                            <Phone size={18} style={{ flexShrink: 0 }} />
                            <span>{t('patient.emergency_msg')}</span>
                        </div>

                        <p style={{ color: 'var(--slate-500)', marginBottom: 28 }}>{t('patient.symptom_subtitle')}</p>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            {/* Symptoms selection */}
                            <div className="card">
                                <p className="card-title" style={{ marginBottom: 16 }}>Select your symptoms</p>
                                <div className="symptom-grid">
                                    {SYMPTOM_TYPES.map(({ key, icon: Icon }) => (
                                        <button
                                            key={key}
                                            type="button"
                                            className={`symptom-option${selected.includes(key) ? ' selected' : ''}`}
                                            onClick={() => toggleSymptom(key)}
                                        >
                                            <Icon size={16} />
                                            {t(`patient.symptom_${key}`)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Severity */}
                            <div className="card">
                                <p className="card-title" style={{ marginBottom: 16 }}>{t('patient.severity')}</p>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {SEVERITY.map(s => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setSeverity(s)}
                                            style={{
                                                flex: 1, padding: '12px', border: '2px solid', borderRadius: 10,
                                                cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                                                fontFamily: 'var(--font-base)',
                                                background: severity === s
                                                    ? (s === 'mild' ? 'var(--green-100)' : s === 'moderate' ? 'var(--amber-100)' : 'var(--red-100)')
                                                    : 'var(--white)',
                                                borderColor: severity === s
                                                    ? (s === 'mild' ? 'var(--green-500)' : s === 'moderate' ? 'var(--amber-500)' : 'var(--red-500)')
                                                    : 'var(--slate-200)',
                                                color: severity === s
                                                    ? (s === 'mild' ? '#059669' : s === 'moderate' ? '#b45309' : '#991b1b')
                                                    : 'var(--slate-500)',
                                            }}
                                        >
                                            {t(`patient.severity_${s}`)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Urgent warning */}
                            {isUrgent && (
                                <div className="alert-banner danger">
                                    <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                                    You have indicated a serious symptom. If you are in severe pain or distress, please call emergency services immediately: <strong>112</strong>
                                </div>
                            )}

                            {/* Notes */}
                            <div className="card">
                                <div className="form-group">
                                    <label className="form-label">{t('patient.symptom_notes')}</label>
                                    <textarea
                                        className="form-textarea"
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        placeholder="Describe your symptoms in more detail..."
                                        rows={4}
                                    />
                                </div>
                            </div>

                            <button
                                className={`btn btn-lg w-full ${isUrgent ? 'btn-danger' : 'btn-primary'}`}
                                type="submit"
                                disabled={selected.length === 0 || loading}
                            >
                                {loading
                                    ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2.5, borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} /> Sending...</>
                                    : t('patient.submit_report')}
                            </button>
                        </form>
                    </div>
                    <div className="disclaimer-bar" style={{ marginTop: 32 }}>{t('common.disclaimer')}</div>
                </div>
            </div>
        </div>
    )
}
