import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import NavSidebar from '../../components/NavSidebar'
import { BookOpen, ChevronDown, ChevronUp, Heart } from 'lucide-react'

export default function Education() {
    const { t } = useTranslation()
    const [expanded, setExpanded] = useState(null)

    const modules = [
        { key: 'module1', emoji: '❤️', color: '#ef4444' },
        { key: 'module2', emoji: '🚶', color: '#0891b2' },
        { key: 'module3', emoji: '⚠️', color: '#f59e0b' },
        { key: 'module4', emoji: '🥗', color: '#10b981' },
        { key: 'module5', emoji: '😴', color: '#8b5cf6' },
        { key: 'module6', emoji: '💊', color: '#06b6d4' },
    ]

    return (
        <div className="app-layout">
            <NavSidebar />
            <div className="app-main with-sidebar">
                <div className="topbar">
                    <h1 className="topbar-title">{t('patient.edu_title')}</h1>
                </div>

                <div className="page-content slide-up">
                    <p style={{ color: 'var(--slate-500)', marginBottom: 28 }}>{t('patient.edu_subtitle')}</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {modules.map(({ key, emoji, color }, i) => (
                            <div key={key} style={{
                                background: 'var(--white)',
                                borderRadius: 12,
                                border: `1.5px solid ${expanded === i ? color + '40' : 'var(--slate-200)'}`,
                                overflow: 'hidden',
                                transition: 'var(--transition)',
                            }}>
                                <button
                                    onClick={() => setExpanded(e => e === i ? null : i)}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: 16,
                                        padding: '18px 20px', background: 'none', border: 'none',
                                        cursor: 'pointer', textAlign: 'left'
                                    }}
                                >
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                                        background: color + '15',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.3rem'
                                    }}>
                                        {emoji}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--navy-900)' }}>
                                            {t(`education.${key}_title`)}
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--slate-400)', marginTop: 3 }}>
                                            Module {i + 1} · Cardiac Rehabilitation
                                        </div>
                                    </div>
                                    {expanded === i
                                        ? <ChevronUp size={18} color="var(--slate-400)" />
                                        : <ChevronDown size={18} color="var(--slate-400)" />}
                                </button>

                                {expanded === i && (
                                    <div style={{ borderTop: '1px solid var(--slate-200)', padding: '18px 20px 20px' }}>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', lineHeight: 1.75 }}>
                                            {t(`education.${key}_content`)}
                                        </p>
                                        <div style={{ marginTop: 16 }}>
                                            <span className="badge badge-teal">
                                                <Heart size={10} fill="currentColor" /> Cardiac Rehabilitation
                                            </span>
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
