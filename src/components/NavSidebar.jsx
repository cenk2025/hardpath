import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import {
    Heart, Home, Activity, ClipboardList, Pill, MessageCircle,
    BookOpen, Users, Bell, LayoutDashboard, LogOut, Stethoscope, Menu, X
} from 'lucide-react'
import LanguageSelector from './LanguageSelector'

export default function NavSidebar({ alertCount = 0 }) {
    const { t } = useTranslation()
    const { profile, signOut, isDoctor } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [open, setOpen] = useState(false)

    // Close drawer on route change
    useEffect(() => { setOpen(false) }, [location.pathname])

    // Lock body scroll when drawer open on mobile
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [open])

    async function handleLogout() {
        await signOut()
        navigate('/')
    }

    const patientLinks = [
        { to: '/patient', icon: Home, label: t('nav.home'), end: true },
        { to: '/patient/program', icon: Activity, label: t('nav.program') },
        { to: '/patient/checkin', icon: ClipboardList, label: t('nav.checkin') },
        { to: '/patient/symptoms', icon: Heart, label: t('nav.symptoms') },
        { to: '/patient/medications', icon: Pill, label: t('nav.medications') },
        { to: '/patient/messages', icon: MessageCircle, label: t('nav.messages') },
        { to: '/patient/education', icon: BookOpen, label: t('nav.education') },
    ]

    const doctorLinks = [
        { to: '/doctor', icon: LayoutDashboard, label: t('nav.patients'), end: true },
        { to: '/doctor/alerts', icon: Bell, label: t('nav.alerts'), badge: alertCount },
        { to: '/doctor/programs', icon: Activity, label: t('nav.programs') },
        { to: '/doctor/messages', icon: MessageCircle, label: t('nav.messages') },
    ]

    const links = isDoctor ? doctorLinks : patientLinks

    const sidebarContent = (
        <>
            <div className="sidebar-logo">
                <div className="logo-mark">
                    <div className="logo-icon">
                        <Heart size={18} fill="white" />
                    </div>
                    <div>
                        <div className="logo-text">HeartPath</div>
                        <div className="logo-sub">{isDoctor ? 'Clinician' : 'Rehabilitation'}</div>
                    </div>
                </div>
                {/* Mobile close button */}
                <button
                    className="sidebar-close-btn"
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="sidebar-nav">
                {links.map(({ to, icon: Icon, label, badge, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                    >
                        <Icon size={18} />
                        {label}
                        {badge > 0 && <span className="nav-badge">{badge}</span>}
                    </NavLink>
                ))}
            </div>

            <div className="sidebar-footer">
                <div style={{ marginBottom: 12, padding: '0 2px' }}>
                    <LanguageSelector dark />
                </div>
                <Link
                    to="/profile"
                    style={{ textDecoration: 'none', display: 'block' }}
                    title="View / Edit Profile"
                >
                    <div className="sidebar-user" style={{ cursor: 'pointer', borderRadius: 8, transition: 'var(--transition)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                        <div className="user-avatar">
                            {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="user-info">
                            <div className="user-name">{profile?.full_name || 'User'}</div>
                            <div className="user-role">{profile?.role || 'patient'}</div>
                        </div>
                    </div>
                </Link>
                <button className="nav-link" onClick={handleLogout} style={{ marginTop: 4 }}>
                    <LogOut size={18} />
                    {t('nav.logout')}
                </button>
            </div>
        </>
    )

    return (
        <>
            {/* Mobile topbar with hamburger */}
            <div className="mobile-topbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg,#0891b2,#22d3ee)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Heart size={14} fill="white" color="white" />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--navy-900)' }}>HeartPath</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {alertCount > 0 && (
                        <div style={{ width: 20, height: 20, background: 'var(--red-500)', borderRadius: '50%', color: 'white', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {alertCount}
                        </div>
                    )}
                    <button className="hamburger-btn" onClick={() => setOpen(true)} aria-label="Open menu">
                        <Menu size={22} />
                    </button>
                </div>
            </div>

            {/* Desktop sidebar */}
            <nav className="sidebar desktop-sidebar">
                {sidebarContent}
            </nav>

            {/* Mobile overlay */}
            {open && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Mobile drawer */}
            <nav className={`sidebar mobile-drawer${open ? ' open' : ''}`}>
                {sidebarContent}
            </nav>
        </>
    )
}
