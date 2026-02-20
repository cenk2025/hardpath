import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import {
    Heart, Home, Activity, ClipboardList, Pill, MessageCircle,
    BookOpen, Users, Bell, LayoutDashboard, LogOut, Stethoscope
} from 'lucide-react'
import LanguageSelector from './LanguageSelector'

export default function NavSidebar({ alertCount = 0 }) {
    const { t } = useTranslation()
    const { profile, signOut, isDoctor } = useAuth()
    const navigate = useNavigate()

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

    return (
        <nav className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-mark">
                    <div className="logo-icon">
                        <Heart size={18} fill="white" />
                    </div>
                    <div>
                        <div className="logo-text">HeartPath</div>
                        <div className="logo-sub">
                            {isDoctor ? 'Clinician' : 'Rehabilitation'}
                        </div>
                    </div>
                </div>
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
                <div className="sidebar-user">
                    <div className="user-avatar">
                        {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="user-info">
                        <div className="user-name">{profile?.full_name || 'User'}</div>
                        <div className="user-role">{profile?.role || 'patient'}</div>
                    </div>
                </div>
                <button className="nav-link" onClick={handleLogout} style={{ marginTop: 4 }}>
                    <LogOut size={18} />
                    {t('nav.logout')}
                </button>
            </div>
        </nav>
    )
}
