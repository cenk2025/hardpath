import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import {
    Users, Stethoscope, Shield, LogOut, RefreshCw,
    AlertCircle, Search, ChevronRight, UserCheck, UserX,
    Heart, Activity
} from 'lucide-react'

function getInitials(name) {
    return (name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function formatDate(d) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function AdminDashboard() {
    const { profile, signOut } = useAuth()
    const navigate = useNavigate()
    const [tab, setTab] = useState('doctors') // 'doctors' | 'patients'
    const [doctors, setDoctors] = useState([])
    const [patients, setPatients] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [search, setSearch] = useState('')
    const [actionLoading, setActionLoading] = useState(null) // userId being mutated

    useEffect(() => { fetchAll() }, [])

    async function fetchAll() {
        setLoading(true)
        setError(null)
        try {
            const { data, error: err } = await supabase
                .from('profiles')
                .select('id, full_name, role, language, created_at, onboarding_completed, is_admin')
                .order('created_at', { ascending: false })
            if (err) throw err
            setDoctors((data || []).filter(p => p.role === 'doctor'))
            setPatients((data || []).filter(p => p.role === 'patient'))
        } catch (e) {
            console.error(e)
            setError('Could not load users. Check Supabase connection.')
        } finally {
            setLoading(false)
        }
    }

    async function changeRole(userId, newRole) {
        setActionLoading(userId)
        try {
            const { error: err } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId)
            if (err) throw err
            await fetchAll()
        } catch (e) {
            console.error(e)
            alert('Failed to update role: ' + e.message)
        } finally {
            setActionLoading(null)
        }
    }

    const filteredDoctors = doctors.filter(d =>
        (d.full_name || '').toLowerCase().includes(search.toLowerCase())
    )
    const filteredPatients = patients.filter(p =>
        (p.full_name || '').toLowerCase().includes(search.toLowerCase())
    )

    const list = tab === 'doctors' ? filteredDoctors : filteredPatients

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--off-white)',
            fontFamily: 'var(--font-sans)',
        }}>
            {/* Top nav */}
            <div style={{
                background: 'var(--navy-900)',
                padding: '0 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: 60,
                boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 32, height: 32,
                        background: 'linear-gradient(135deg,#0891b2,#22d3ee)',
                        borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Heart size={15} fill="white" color="white" />
                    </div>
                    <span style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>HeartPath</span>
                    <span style={{
                        marginLeft: 8, background: 'rgba(8,145,178,0.25)', color: 'var(--teal-400)',
                        fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px',
                        borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.08em'
                    }}>Admin</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem' }}>
                        {profile?.full_name}
                    </span>
                    <button
                        onClick={async () => { await signOut(); navigate('/login') }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: 8, padding: '6px 12px', color: 'rgba(255,255,255,0.7)',
                            cursor: 'pointer', fontSize: '0.82rem', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                    >
                        <LogOut size={14} /> Logout
                    </button>
                </div>
            </div>

            {/* Main */}
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px' }}>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
                    {[
                        { icon: <Stethoscope size={20} />, color: 'teal', value: doctors.length, label: 'Doctors' },
                        { icon: <Users size={20} />, color: 'green', value: patients.length, label: 'Patients' },
                        { icon: <Activity size={20} />, color: 'amber', value: doctors.length + patients.length, label: 'Total Users' },
                    ].map(s => (
                        <div key={s.label} className="stat-card" style={{ background: 'white' }}>
                            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                            <div>
                                <div className="stat-value">{loading ? '—' : s.value}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {/* Tabs + Search */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '20px 24px', borderBottom: '1px solid var(--slate-200)',
                    }}>
                        <div style={{ display: 'flex', gap: 4, background: 'var(--off-white)', borderRadius: 10, padding: 4 }}>
                            {[
                                { key: 'doctors', icon: <Stethoscope size={14} />, label: `Doctors (${doctors.length})` },
                                { key: 'patients', icon: <Users size={14} />, label: `Patients (${patients.length})` },
                            ].map(t => (
                                <button
                                    key={t.key}
                                    onClick={() => { setTab(t.key); setSearch('') }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                        fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
                                        background: tab === t.key ? 'white' : 'transparent',
                                        color: tab === t.key ? 'var(--navy-900)' : 'var(--slate-400)',
                                        boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                                    }}
                                >{t.icon}{t.label}</button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                                <input
                                    className="form-input"
                                    style={{ paddingLeft: 32, height: 36, fontSize: '0.85rem', minWidth: 200, borderRadius: 99 }}
                                    placeholder="Search by name…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <button className="btn btn-ghost btn-sm" onClick={fetchAll} title="Refresh">
                                <RefreshCw size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="alert-banner danger" style={{ margin: 20 }}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    {/* Table header */}
                    {!loading && list.length > 0 && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: tab === 'doctors' ? '1fr 120px 140px 140px' : '1fr 120px 140px 140px',
                            padding: '10px 24px',
                            background: 'var(--off-white)',
                            fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-400)',
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}>
                            <span>Name</span>
                            <span>Language</span>
                            <span>Joined</span>
                            <span>Action</span>
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--slate-400)' }}>
                            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
                            <p>Loading users…</p>
                        </div>
                    )}

                    {/* Empty */}
                    {!loading && list.length === 0 && !error && (
                        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--slate-400)' }}>
                            <Users size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
                            <p style={{ fontWeight: 600 }}>No {tab} found</p>
                        </div>
                    )}

                    {/* Rows */}
                    {list.map(u => (
                        <div
                            key={u.id}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 120px 140px 140px',
                                alignItems: 'center',
                                padding: '14px 24px',
                                borderBottom: '1px solid var(--slate-200)',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--off-white)'}
                            onMouseLeave={e => e.currentTarget.style.background = ''}
                        >
                            {/* Name */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div className="user-avatar" style={{ width: 38, height: 38, fontSize: '0.82rem', flexShrink: 0 }}>
                                    {getInitials(u.full_name)}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {u.full_name || 'Unknown'}
                                        {u.is_admin && (
                                            <span style={{
                                                background: 'rgba(8,145,178,0.1)', color: 'var(--teal-600)',
                                                fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px',
                                                borderRadius: 99, textTransform: 'uppercase',
                                            }}>
                                                <Shield size={9} style={{ display: 'inline', marginRight: 3 }} />Admin
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                                        {u.onboarding_completed ? 'Active' : 'Onboarding'}
                                    </div>
                                </div>
                            </div>

                            {/* Language */}
                            <div style={{ fontSize: '0.82rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                                {u.language || '—'}
                            </div>

                            {/* Joined */}
                            <div style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                                {formatDate(u.created_at)}
                            </div>

                            {/* Action */}
                            <div>
                                {u.is_admin ? (
                                    <span style={{ fontSize: '0.78rem', color: 'var(--slate-400)', fontStyle: 'italic' }}>System Admin</span>
                                ) : tab === 'doctors' ? (
                                    <button
                                        onClick={() => changeRole(u.id, 'patient')}
                                        disabled={actionLoading === u.id}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 5,
                                            padding: '6px 12px', borderRadius: 8, border: '1px solid var(--red-300)',
                                            background: 'rgba(239,68,68,0.05)', color: 'var(--red-500)',
                                            cursor: actionLoading === u.id ? 'not-allowed' : 'pointer',
                                            fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.2s',
                                            opacity: actionLoading === u.id ? 0.6 : 1,
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
                                    >
                                        {actionLoading === u.id
                                            ? <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} />
                                            : <UserX size={12} />
                                        }
                                        Revoke Doctor
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => changeRole(u.id, 'doctor')}
                                        disabled={actionLoading === u.id}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 5,
                                            padding: '6px 12px', borderRadius: 8, border: '1px solid var(--teal-300)',
                                            background: 'rgba(8,145,178,0.05)', color: 'var(--teal-600)',
                                            cursor: actionLoading === u.id ? 'not-allowed' : 'pointer',
                                            fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.2s',
                                            opacity: actionLoading === u.id ? 0.6 : 1,
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(8,145,178,0.12)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(8,145,178,0.05)'}
                                    >
                                        {actionLoading === u.id
                                            ? <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} />
                                            : <UserCheck size={12} />
                                        }
                                        Make Doctor
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: 24 }}>
                    HeartPath Admin Panel · Role changes take effect on next login
                </p>
            </div>
        </div>
    )
}
