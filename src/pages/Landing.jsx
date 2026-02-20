import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Heart, Activity, Shield, MessageCircle, ChevronRight, Stethoscope, Mail } from 'lucide-react'
import LanguageSelector from '../components/LanguageSelector'

export default function Landing() {
    const { t } = useTranslation()
    const navigate = useNavigate()

    return (
        <div className="landing-page">
            {/* Nav */}
            <nav className="landing-nav">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #0891b2, #22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Heart size={16} fill="white" color="white" />
                    </div>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>HeartPath</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <LanguageSelector dark />
                    <Link to="/login" className="btn btn-ghost" style={{ color: 'rgba(255,255,255,0.7)' }}>{t('auth.login')}</Link>
                    <Link to="/register" className="btn btn-primary btn-sm">{t('auth.register')}</Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="landing-hero">
                <div className="hero-eyebrow">
                    <Heart size={12} fill="currentColor" />
                    Digital Cardiac Rehabilitation Platform
                </div>
                <h1 className="hero-title">
                    {t('landing.hero_title').split(' ').map((word, i) =>
                        i >= 2 ? <span key={i}> {word}</span> : <span key={i}>{i > 0 ? ' ' : ''}{word}</span>
                    )}
                </h1>
                <p className="hero-subtitle">{t('landing.hero_subtitle')}</p>

                <div className="hero-ctas">
                    <button onClick={() => navigate('/register')} className="btn btn-primary btn-lg" style={{ gap: 10 }}>
                        <Heart size={18} />{t('landing.cta_patient')}<ChevronRight size={16} />
                    </button>
                    <button onClick={() => navigate('/register')} className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', backdropFilter: 'blur(8px)' }}>
                        <Stethoscope size={18} />{t('landing.cta_doctor')}
                    </button>
                </div>

                <div style={{ marginTop: 60, display: 'flex', gap: 32, alignItems: 'center', opacity: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {['GDPR Compliant', 'EU Data Hosting', 'ESC Guidelines', 'End-to-End Encrypted'].map((badge, i, arr) => (
                        <span key={badge} style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{badge}</span>
                            {i < arr.length - 1 && <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.3)' }} />}
                        </span>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="features-section">
                <h2 className="section-title">Why HeartPath?</h2>
                <div className="features-grid">
                    <div className="feature-card"><div className="feature-icon"><Activity size={22} /></div><h3>{t('landing.feature1_title')}</h3><p>{t('landing.feature1_desc')}</p></div>
                    <div className="feature-card"><div className="feature-icon"><Heart size={22} /></div><h3>{t('landing.feature2_title')}</h3><p>{t('landing.feature2_desc')}</p></div>
                    <div className="feature-card"><div className="feature-icon"><Shield size={22} /></div><h3>{t('landing.feature3_title')}</h3><p>{t('landing.feature3_desc')}</p></div>
                    <div className="feature-card"><div className="feature-icon"><MessageCircle size={22} /></div><h3>{t('landing.feature4_title')}</h3><p>{t('landing.feature4_desc')}</p></div>
                </div>
            </section>

            {/* How it works */}
            <section style={{ background: 'var(--navy-900)', padding: '80px 64px' }}>
                <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: 12 }}>Your Recovery, Your Way</h2>
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', marginBottom: 48, lineHeight: 1.7 }}>
                        HeartPath connects you with your care team through a secure, personalized digital rehabilitation journey.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
                        {[
                            { step: '01', title: 'Get Started', desc: 'Register and complete your secure health consent onboarding in minutes.' },
                            { step: '02', title: 'Follow Your Program', desc: 'Your doctor assigns a personalized plan. Track daily check-ins, exercises, and symptoms.' },
                            { step: '03', title: 'Stay Connected', desc: 'Message your care team, receive alerts, and attend teleconsultations from home.' },
                        ].map(({ step, title, desc }) => (
                            <div key={step} style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 900, background: 'linear-gradient(135deg, #0891b2, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 12, lineHeight: 1 }}>{step}</div>
                                <h3 style={{ color: 'white', fontWeight: 700, marginBottom: 8 }}>{title}</h3>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.6 }}>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: 'var(--navy-800)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 64px' }}>
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#0891b2,#22d3ee)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Heart size={12} fill="white" color="white" />
                        </div>
                        <span style={{ color: 'white', fontWeight: 800, fontSize: '1rem' }}>HeartPath</span>
                        <span style={{ marginLeft: 8, padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', background: 'rgba(8,145,178,0.15)', color: 'var(--teal-400)', border: '1px solid rgba(8,145,178,0.2)' }}>
                            A VOON IQ Product
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                        <Link to="/privacy" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', textDecoration: 'none' }}>Privacy Policy</Link>
                        <Link to="/terms" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', textDecoration: 'none' }}>Terms of Service</Link>
                        <a href="mailto:info@voon.fi" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Mail size={13} /> info@voon.fi
                        </a>
                    </div>
                </div>
                {/* Bottom row */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem' }}>
                        © 2026 VOON IQ. HeartPath is a registered product. All rights reserved. Registered in Finland.
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem', maxWidth: 600, textAlign: 'right', lineHeight: 1.5 }}>
                        {t('landing.disclaimer')}
                    </p>
                </div>
            </footer>
        </div>
    )
}
