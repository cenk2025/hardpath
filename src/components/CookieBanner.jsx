import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Shield, X, Check, Settings } from 'lucide-react'

const COOKIE_KEY = 'heartpath_cookie_consent'

export default function CookieBanner() {
    const [visible, setVisible] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const [prefs, setPrefs] = useState({
        necessary: true,    // always on
        analytics: false,
        functional: true,
    })

    useEffect(() => {
        const saved = localStorage.getItem(COOKIE_KEY)
        if (!saved) setVisible(true)
    }, [])

    function acceptAll() {
        save({ necessary: true, analytics: true, functional: true })
    }

    function acceptSelected() {
        save(prefs)
    }

    function rejectAll() {
        save({ necessary: true, analytics: false, functional: false })
    }

    function save(choices) {
        localStorage.setItem(COOKIE_KEY, JSON.stringify({ ...choices, timestamp: new Date().toISOString() }))
        setVisible(false)
    }

    if (!visible) return null

    return (
        <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
            background: 'var(--navy-900)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.4)',
            padding: '24px 40px',
            animation: 'fadeSlideUp 0.4s ease',
        }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                {!showDetails ? (
                    /* Simple banner */
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1 }}>
                            <Shield size={20} color="var(--teal-400)" style={{ flexShrink: 0, marginTop: 2 }} />
                            <div>
                                <p style={{ color: 'white', fontWeight: 700, marginBottom: 6, fontSize: '0.95rem' }}>
                                    We use cookies to support your care experience
                                </p>
                                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.83rem', lineHeight: 1.6, maxWidth: 700 }}>
                                    HeartPath uses cookies to provide essential platform functions and, with your consent, to improve user experience.
                                    We do <strong style={{ color: 'rgba(255,255,255,0.8)' }}>not</strong> sell your data. Your health data is processed under{' '}
                                    <strong style={{ color: 'var(--teal-400)' }}>GDPR (EU) 2016/679</strong>, Finnish Data Protection Act, and is compliant with
                                    WHO digital health guidelines. See our{' '}
                                    <Link to="/privacy" style={{ color: 'var(--teal-400)', fontWeight: 600 }}>Privacy Policy</Link>
                                    {' '}and{' '}
                                    <Link to="/terms" style={{ color: 'var(--teal-400)', fontWeight: 600 }}>Terms of Service</Link>.
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
                            <button
                                onClick={() => setShowDetails(true)}
                                style={{
                                    background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)',
                                    borderRadius: 8, padding: '9px 16px', cursor: 'pointer', fontFamily: 'var(--font-base)',
                                    fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6
                                }}
                            >
                                <Settings size={14} /> Customise
                            </button>
                            <button
                                onClick={rejectAll}
                                style={{
                                    background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)',
                                    borderRadius: 8, padding: '9px 16px', cursor: 'pointer', fontFamily: 'var(--font-base)', fontSize: '0.85rem'
                                }}
                            >
                                Reject Non-Essential
                            </button>
                            <button
                                onClick={acceptAll}
                                style={{
                                    background: 'linear-gradient(135deg, var(--teal-500), #0670a0)',
                                    border: 'none', color: 'white', borderRadius: 8, padding: '10px 20px',
                                    cursor: 'pointer', fontFamily: 'var(--font-base)', fontWeight: 700,
                                    fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6,
                                    boxShadow: '0 4px 14px rgba(8,145,178,0.3)'
                                }}
                            >
                                <Check size={15} /> Accept All
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Detailed preferences */
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ color: 'white', fontWeight: 800, fontSize: '1rem' }}>Cookie Preferences</h3>
                            <button onClick={() => setShowDetails(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
                                <X size={18} />
                            </button>
                        </div>

                        {[
                            {
                                key: 'necessary',
                                label: 'Strictly Necessary',
                                desc: 'Required for the platform to function — authentication, session management, security. Cannot be disabled.',
                                locked: true
                            },
                            {
                                key: 'functional',
                                label: 'Functional',
                                desc: 'Remembers your language preference and UI settings between sessions.'
                            },
                            {
                                key: 'analytics',
                                label: 'Analytics',
                                desc: 'Anonymous usage data to improve the platform experience. No health data included. Processed under GDPR.'
                            },
                        ].map(({ key, label, desc, locked }) => (
                            <div key={key} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                                gap: 16, padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)'
                            }}>
                                <div>
                                    <div style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>
                                        {label} {locked && <span style={{ color: 'var(--teal-400)', fontSize: '0.72rem', fontWeight: 500 }}>— Always active</span>}
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', lineHeight: 1.5, maxWidth: 600 }}>{desc}</div>
                                </div>
                                <label className="toggle" style={{ opacity: locked ? 0.5 : 1, cursor: locked ? 'not-allowed' : 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={prefs[key]}
                                        disabled={locked}
                                        onChange={() => !locked && setPrefs(p => ({ ...p, [key]: !p[key] }))}
                                    />
                                    <span className="toggle-slider" />
                                </label>
                            </div>
                        ))}

                        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                            <button onClick={rejectAll} style={{
                                background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)',
                                borderRadius: 8, padding: '9px 16px', cursor: 'pointer', fontFamily: 'var(--font-base)', fontSize: '0.85rem'
                            }}>Reject Non-Essential</button>
                            <button onClick={acceptSelected} style={{
                                background: 'linear-gradient(135deg, var(--teal-500), #0670a0)',
                                border: 'none', color: 'white', borderRadius: 8, padding: '10px 20px',
                                cursor: 'pointer', fontFamily: 'var(--font-base)', fontWeight: 700, fontSize: '0.9rem'
                            }}>Save Preferences</button>
                            <button onClick={acceptAll} style={{
                                background: 'white', border: 'none', color: 'var(--navy-900)', borderRadius: 8,
                                padding: '10px 20px', cursor: 'pointer', fontFamily: 'var(--font-base)', fontWeight: 700, fontSize: '0.9rem'
                            }}>Accept All</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
