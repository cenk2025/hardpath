import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { Heart, Mail, Lock, User, Eye, EyeOff, AlertCircle, Stethoscope } from 'lucide-react'
import LanguageSelector from '../components/LanguageSelector'

export default function Register() {
    const { t } = useTranslation()
    const { signUp } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'patient' })
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    function set(field) {
        return e => setForm(f => ({ ...f, [field]: e.target.value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.')
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
                        Your health data is encrypted and stored in EU-based servers. You control what is shared and with whom. You can delete your data at any time.
                    </p>
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

                        <button className="btn btn-primary w-full" type="submit" disabled={loading}>
                            {loading ? (
                                <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />{t('auth.registering')}</>
                            ) : t('auth.sign_up')}
                        </button>
                    </form>

                    <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textAlign: 'center', marginTop: 20, lineHeight: 1.5 }}>
                        By registering, you agree to our Terms of Service and Privacy Policy (GDPR compliant).
                    </p>
                </div>
            </div>
        </div>
    )
}
