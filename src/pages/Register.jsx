import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { Heart, Mail, Lock, User, Eye, EyeOff, AlertCircle, Stethoscope, Shield, CheckCircle, Info } from 'lucide-react'
import LanguageSelector from '../components/LanguageSelector'

export default function Register() {
    const { t } = useTranslation()
    const { signUp } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'patient' })
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [consentData, setConsentData] = useState(false)
    const [consentTerms, setConsentTerms] = useState(false)

    function set(field) {
        return e => setForm(f => ({ ...f, [field]: e.target.value }))
    }

    const isPatient = form.role === 'patient'
    const consentRequired = isPatient && (!consentData || !consentTerms)

    async function handleSubmit(e) {
        e.preventDefault()
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.')
            return
        }
        if (isPatient && (!consentData || !consentTerms)) {
            setError('Please read and accept both consent statements to continue.')
            return
        }
        setLoading(true)
        setError('')
        try {
            await signUp(form.email, form.password, form.fullName, form.role)
            navigate('/onboarding')
        } catch (err) {
            setError(err.message || t('common.error'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-left">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
                    <div style={{
                        width: 40, height: 40, background: 'linear-gradient(135deg,#0891b2,#22d3ee)',
                        borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Heart size={18} fill="white" color="white" />
                    </div>
                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white' }}>HeartPath</span>
                </div>
                <h1>Start your cardiac rehabilitation journey today</h1>
                <p style={{ marginTop: 16 }}>
                    Join thousands of patients recovering safely at home, supported by their clinical care team.
                </p>

                <div style={{ marginTop: 48, padding: '24px', background: 'rgba(8,145,178,0.08)', borderRadius: 12, border: '1px solid rgba(8,145,178,0.15)' }}>
                    <p style={{ color: 'var(--teal-400)', fontSize: '0.8rem', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Privacy First
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                        Your health data is encrypted and stored in EU-based servers. You control what is shared and with whom. You can delete your account and data at any time.
                    </p>
                </div>

                <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                        { icon: '🔒', text: 'End-to-end encrypted storage' },
                        { icon: '🇪🇺', text: 'GDPR & EU Medical Device Regulation compliant' },
                        { icon: '🏥', text: 'Data shared only with your assigned care team' },
                        { icon: '🗑️', text: 'Right to delete your data at any time' },
                    ].map(item => (
                        <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem' }}>
                            <span>{item.icon}</span>
                            <span>{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="auth-right">
                <div className="auth-card fade-in">
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                        <LanguageSelector />
                    </div>
                    <h2>{t('auth.sign_up')}</h2>
                    <p className="auth-card-sub">
                        {t('auth.have_account')}{' '}
                        <Link to="/login" style={{ color: 'var(--teal-500)', fontWeight: 600, textDecoration: 'none' }}>
                            {t('auth.login')}
                        </Link>
                    </p>

                    {error && (
                        <div className="alert-banner danger" style={{ marginBottom: 20 }}>
                            <AlertCircle size={16} />{error}
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">{t('auth.full_name')}</label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                                <input
                                    className="form-input"
                                    type="text"
                                    value={form.fullName}
                                    onChange={set('fullName')}
                                    placeholder="Your full name"
                                    required
                                    style={{ paddingLeft: 38 }}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('auth.email')}</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                                <input
                                    className="form-input"
                                    type="email"
                                    value={form.email}
                                    onChange={set('email')}
                                    placeholder="you@example.com"
                                    required
                                    style={{ paddingLeft: 38 }}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('auth.password')}</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                                <input
                                    className="form-input"
                                    type={showPw ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={set('password')}
                                    placeholder="Min. 6 characters"
                                    required
                                    style={{ paddingLeft: 38, paddingRight: 40 }}
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)'
                                }}>
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('auth.role')}</label>
                            <div className="role-selector">
                                <button type="button"
                                    className={`role-option${form.role === 'patient' ? ' selected' : ''}`}
                                    onClick={() => setForm(f => ({ ...f, role: 'patient' }))}>
                                    <Heart size={18} color={form.role === 'patient' ? 'var(--teal-500)' : 'var(--slate-400)'} />
                                    <span>{t('auth.role_patient')}</span>
                                </button>
                                <button type="button"
                                    className={`role-option${form.role === 'doctor' ? ' selected' : ''}`}
                                    onClick={() => setForm(f => ({ ...f, role: 'doctor' }))}>
                                    <Stethoscope size={18} color={form.role === 'doctor' ? 'var(--teal-500)' : 'var(--slate-400)'} />
                                    <span>{t('auth.role_doctor')}</span>
                                </button>
                            </div>
                        </div>

                        {/* ── Patient Health Data Consent Block ── */}
                        {isPatient && (
                            <div style={{
                                marginBottom: 8,
                                background: 'rgba(8,145,178,0.04)',
                                border: '1.5px solid rgba(8,145,178,0.2)',
                                borderRadius: 10,
                                overflow: 'hidden',
                            }}>
                                {/* Header */}
                                <div style={{
                                    padding: '12px 16px',
                                    background: 'rgba(8,145,178,0.08)',
                                    borderBottom: '1px solid rgba(8,145,178,0.15)',
                                    display: 'flex', alignItems: 'center', gap: 8,
                                }}>
                                    <Shield size={14} color="var(--teal-500)" />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--teal-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Health Data Consent Required
                                    </span>
                                </div>

                                {/* What will be shared */}
                                <div style={{ padding: '14px 16px 10px' }}>
                                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 10 }}>
                                        <Info size={13} style={{ color: 'var(--teal-500)', marginTop: 2, flexShrink: 0 }} />
                                        <p style={{ fontSize: '0.8rem', color: 'var(--slate-600)', lineHeight: 1.6 }}>
                                            By creating a patient account, <strong>your assigned doctor will have access</strong> to the following health data you enter in HeartPath:
                                        </p>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', marginBottom: 14, paddingLeft: 20 }}>
                                        {[
                                            'Heart rate & HRV readings',
                                            'Blood pressure logs',
                                            'Sleep duration & quality',
                                            'Fatigue & readiness scores',
                                            'Symptom reports',
                                            'Medication list',
                                            'Rehab program progress',
                                            'Wearable device data (if connected)',
                                        ].map(item => (
                                            <div key={item} style={{ fontSize: '0.76rem', color: 'var(--slate-600)', display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <CheckCircle size={10} color="var(--teal-500)" />
                                                {item}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Consent checkbox 1 — health data sharing */}
                                    <label style={{
                                        display: 'flex', alignItems: 'flex-start', gap: 10,
                                        padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                                        background: consentData ? 'rgba(16,185,129,0.06)' : 'rgba(0,0,0,0.02)',
                                        border: `1px solid ${consentData ? 'rgba(16,185,129,0.3)' : 'var(--slate-200)'}`,
                                        marginBottom: 8, transition: 'all 0.2s',
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={consentData}
                                            onChange={e => setConsentData(e.target.checked)}
                                            style={{ marginTop: 2, accentColor: 'var(--teal-500)', width: 15, height: 15, flexShrink: 0 }}
                                        />
                                        <span style={{ fontSize: '0.78rem', color: 'var(--slate-700)', lineHeight: 1.5 }}>
                                            <strong>I consent</strong> to HeartPath sharing my health data listed above with my assigned cardiac rehabilitation care team (doctors and clinical staff) for the purpose of monitoring and supporting my recovery.
                                        </span>
                                    </label>

                                    {/* Consent checkbox 2 — terms & GDPR */}
                                    <label style={{
                                        display: 'flex', alignItems: 'flex-start', gap: 10,
                                        padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                                        background: consentTerms ? 'rgba(16,185,129,0.06)' : 'rgba(0,0,0,0.02)',
                                        border: `1px solid ${consentTerms ? 'rgba(16,185,129,0.3)' : 'var(--slate-200)'}`,
                                        transition: 'all 0.2s',
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={consentTerms}
                                            onChange={e => setConsentTerms(e.target.checked)}
                                            style={{ marginTop: 2, accentColor: 'var(--teal-500)', width: 15, height: 15, flexShrink: 0 }}
                                        />
                                        <span style={{ fontSize: '0.78rem', color: 'var(--slate-700)', lineHeight: 1.5 }}>
                                            I have read and agree to the{' '}
                                            <Link to="/terms" style={{ color: 'var(--teal-600)', fontWeight: 600, textDecoration: 'none' }}>Terms of Service</Link>
                                            {' '}and{' '}
                                            <Link to="/privacy" style={{ color: 'var(--teal-600)', fontWeight: 600, textDecoration: 'none' }}>Privacy Policy</Link>
                                            . I understand my data is stored on EU-based servers and I may withdraw consent or request data deletion at any time by contacting my care provider.
                                        </span>
                                    </label>

                                    <p style={{ fontSize: '0.71rem', color: 'var(--slate-400)', marginTop: 10, paddingLeft: 4 }}>
                                        🇪🇺 Compliant with GDPR (EU 2016/679), EU Medical Device Regulation 2017/745, and applicable national health data protection laws.
                                    </p>
                                </div>
                            </div>
                        )}

                        <button
                            className="btn btn-primary w-full"
                            type="submit"
                            disabled={loading || (isPatient && consentRequired)}
                            style={{ opacity: consentRequired ? 0.5 : 1, cursor: consentRequired ? 'not-allowed' : 'pointer' }}
                        >
                            {loading ? (
                                <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />{t('auth.registering')}</>
                            ) : t('auth.sign_up')}
                        </button>
                    </form>

                    {!isPatient && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textAlign: 'center', marginTop: 20, lineHeight: 1.5 }}>
                            By registering, you agree to our <Link to="/terms" style={{ color: 'var(--teal-500)' }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: 'var(--teal-500)' }}>Privacy Policy</Link> (GDPR compliant).
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
