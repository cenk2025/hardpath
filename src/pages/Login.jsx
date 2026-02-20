import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { Heart, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import LanguageSelector from '../components/LanguageSelector'

export default function Login() {
    const { t } = useTranslation()
    const { signIn } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            await signIn(email, password)
            // Auth state change will redirect via App.jsx
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
                <h1>Welcome back to your cardiac care</h1>
                <p style={{ marginTop: 16 }}>
                    Continue your personalized rehabilitation journey. Your care team is monitoring your progress.
                </p>

                <div style={{ marginTop: 48 }}>
                    {[
                        '🔒 GDPR-compliant & fully encrypted',
                        '💊 Personalized medication reminders',
                        '❤️ Real-time heart rate monitoring',
                        '👨‍⚕️ Secure doctor messaging',
                    ].map(item => (
                        <div key={item} style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', marginBottom: 12 }}>
                            {item}
                        </div>
                    ))}
                </div>
            </div>

            <div className="auth-right">
                <div className="auth-card fade-in">
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                        <LanguageSelector />
                    </div>
                    <h2>{t('auth.sign_in')}</h2>
                    <p className="auth-card-sub">{t('auth.have_account')} {' '}
                        <Link to="/register" style={{ color: 'var(--teal-500)', fontWeight: 600, textDecoration: 'none' }}>
                            {t('auth.register')}
                        </Link>
                    </p>

                    {error && (
                        <div className="alert-banner danger" style={{ marginBottom: 20 }}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">{t('auth.email')}</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                                <input
                                    className="form-input"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
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
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
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

                        <div style={{ textAlign: 'right', marginTop: -8 }}>
                            <span style={{ fontSize: '0.82rem', color: 'var(--teal-500)', cursor: 'pointer', fontWeight: 500 }}>
                                {t('auth.forgot')}
                            </span>
                        </div>

                        <button className="btn btn-primary w-full" type="submit" disabled={loading}>
                            {loading ? (
                                <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />{t('auth.logging_in')}</>
                            ) : t('auth.sign_in')}
                        </button>
                    </form>

                    <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textAlign: 'center', marginTop: 20, lineHeight: 1.5 }}>
                        {t('common.disclaimer')}
                    </p>
                </div>
            </div>
        </div>
    )
}
