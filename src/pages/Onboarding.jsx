import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { Heart, Shield, CheckCircle, Activity, Moon, Zap, Lock } from 'lucide-react'
import LanguageSelector from '../components/LanguageSelector'

const STEPS = 3

export default function Onboarding() {
    const { t } = useTranslation()
    const { profile, updateProfile } = useAuth()
    const navigate = useNavigate()
    const [step, setStep] = useState(0)
    const [consent, setConsent] = useState({
        heart_rate: true,
        activity: true,
        sleep: true,
        ecg: false,
        sharing: true,
    })
    const [loading, setLoading] = useState(false)

    function toggleConsent(key) {
        setConsent(c => ({ ...c, [key]: !c[key] }))
    }

    async function handleFinish() {
        setLoading(true)
        try {
            await updateProfile({ onboarding_completed: true })
            navigate(profile?.role === 'doctor' ? '/doctor' : '/patient')
        } catch (e) {
            console.error(e)
            // Navigate anyway
            navigate(profile?.role === 'doctor' ? '/doctor' : '/patient')
        } finally {
            setLoading(false)
        }
    }

    const consentItems = [
        { key: 'heart_rate', label: t('onboarding.consent_heart_rate'), sub: 'Apple HealthKit / Health Connect', icon: Heart },
        { key: 'activity', label: t('onboarding.consent_activity'), sub: 'Steps, active minutes, distance', icon: Activity },
        { key: 'sleep', label: t('onboarding.consent_sleep'), sub: 'Sleep duration and quality', icon: Moon },
        { key: 'ecg', label: t('onboarding.consent_ecg'), sub: 'Requires compatible device', icon: Zap },
        { key: 'sharing', label: t('onboarding.consent_sharing'), sub: t('onboarding.gdpr_text').slice(0, 60) + '...', icon: Shield },
    ]

    return (
        <div className="onboarding-page">
            <div className="onboarding-card">
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, justifyContent: 'center' }}>
                    <div style={{
                        width: 40, height: 40, background: 'linear-gradient(135deg,#0891b2,#22d3ee)',
                        borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Heart size={18} fill="white" color="white" />
                    </div>
                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy-900)' }}>HeartPath</span>
                </div>

                {/* Step dots */}
                <div className="step-indicator">
                    {Array.from({ length: STEPS }).map((_, i) => (
                        <div key={i} className={`step-dot${i === step ? ' active' : i < step ? ' done' : ''}`} />
                    ))}
                </div>

                {/* Steps */}
                {step === 0 && (
                    <div className="onboarding-step">
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, textAlign: 'center', marginBottom: 8 }}>
                            {t('onboarding.step1_title')}
                        </h2>
                        <p style={{ textAlign: 'center', color: 'var(--slate-500)', marginBottom: 28 }}>
                            {t('onboarding.title')}
                        </p>
                        <div style={{ maxWidth: 300, margin: '0 auto 32px' }}>
                            <LanguageSelector />
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="onboarding-step">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <Lock size={18} color="var(--teal-500)" />
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{t('onboarding.step2_title')}</h2>
                        </div>
                        <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', marginBottom: 24, lineHeight: 1.6 }}>
                            {t('onboarding.step2_desc')}
                        </p>
                        <div>
                            {consentItems.map(({ key, label, sub, icon: Icon }) => (
                                <div key={key} className="consent-item">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: 8,
                                            background: 'rgba(8,145,178,0.08)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                        }}>
                                            <Icon size={16} color="var(--teal-500)" />
                                        </div>
                                        <div className="consent-label">
                                            <span>{label}</span>
                                            <small>{sub}</small>
                                        </div>
                                    </div>
                                    <label className="toggle">
                                        <input
                                            type="checkbox"
                                            checked={consent[key]}
                                            onChange={() => toggleConsent(key)}
                                        />
                                        <span className="toggle-slider" />
                                    </label>
                                </div>
                            ))}
                        </div>
                        <div className="alert-banner info" style={{ marginTop: 20 }}>
                            <Shield size={16} style={{ flexShrink: 0 }} />
                            {t('onboarding.gdpr_text')}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="onboarding-step" style={{ textAlign: 'center' }}>
                        <div style={{
                            width: 72, height: 72, background: 'var(--green-100)',
                            borderRadius: '50%', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', margin: '0 auto 24px'
                        }}>
                            <CheckCircle size={32} color="var(--green-500)" />
                        </div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 12 }}>
                            {t('onboarding.step3_title')}
                        </h2>
                        <p style={{ color: 'var(--slate-500)', lineHeight: 1.7, marginBottom: 32 }}>
                            {profile?.role === 'doctor'
                                ? t('onboarding.step3_doctor')
                                : t('onboarding.step3_patient')}
                        </p>
                        <div style={{
                            background: 'rgba(8,145,178,0.06)',
                            border: '1px solid rgba(8,145,178,0.15)',
                            borderRadius: 10, padding: '16px 20px',
                            display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', marginBottom: 24
                        }}>
                            <Heart size={20} color="var(--red-500)" fill="var(--red-500)" />
                            <p style={{ fontSize: '0.875rem', color: 'var(--navy-700)', lineHeight: 1.5 }}>
                                {t('common.disclaimer')}
                            </p>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div style={{ display: 'flex', gap: 10, marginTop: 32 }}>
                    {step > 0 && (
                        <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)} style={{ flex: 1 }}>
                            {t('onboarding.back')}
                        </button>
                    )}
                    {step < STEPS - 1 ? (
                        <button className="btn btn-primary" onClick={() => setStep(s => s + 1)} style={{ flex: 2 }}>
                            {step === 1 ? t('onboarding.accept_all') : t('onboarding.next')}
                        </button>
                    ) : (
                        <button className="btn btn-primary" onClick={handleFinish} disabled={loading} style={{ flex: 2 }}>
                            {loading ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Loading...</> : t('onboarding.finish')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
