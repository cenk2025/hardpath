import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import NavSidebar from '../components/NavSidebar'
import LanguageSelector from '../components/LanguageSelector'
import {
    User, Mail, Shield, Save, Trash2, AlertCircle,
    CheckCircle, ArrowLeft, Lock, Eye, EyeOff
} from 'lucide-react'

export default function ProfilePage() {
    const { t } = useTranslation()
    const { user, profile, setProfile, signOut } = useAuth()
    const navigate = useNavigate()

    const [form, setForm] = useState({
        full_name: profile?.full_name || '',
        language: profile?.language || 'en',
    })
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState(null)

    // Password change
    const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
    const [showPw, setShowPw] = useState(false)
    const [pwSaving, setPwSaving] = useState(false)
    const [pwMsg, setPwMsg] = useState(null)

    // Delete
    const [showDelete, setShowDelete] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState('')
    const [deleting, setDeleting] = useState(false)

    const backPath = profile?.role === 'doctor' ? '/doctor' : '/patient'

    async function saveProfile() {
        if (!form.full_name.trim()) { setError('Name cannot be empty.'); return }
        setSaving(true); setError(null); setSaved(false)
        const { error: err } = await supabase
            .from('profiles')
            .update({ full_name: form.full_name.trim(), language: form.language })
            .eq('id', user.id)
        if (err) { setError(err.message) }
        else {
            if (setProfile) setProfile(p => ({ ...p, full_name: form.full_name.trim(), language: form.language }))
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        }
        setSaving(false)
    }

    async function changePassword() {
        if (!pwForm.newPw || pwForm.newPw.length < 6) { setPwMsg({ type: 'error', text: 'Password must be at least 6 characters.' }); return }
        if (pwForm.newPw !== pwForm.confirm) { setPwMsg({ type: 'error', text: 'Passwords do not match.' }); return }
        setPwSaving(true); setPwMsg(null)
        const { error: err } = await supabase.auth.updateUser({ password: pwForm.newPw })
        if (err) setPwMsg({ type: 'error', text: err.message })
        else {
            setPwMsg({ type: 'success', text: 'Password updated successfully.' })
            setPwForm({ current: '', newPw: '', confirm: '' })
        }
        setPwSaving(false)
    }

    async function deleteAccount() {
        if (deleteConfirm !== 'DELETE') return
        setDeleting(true)
        // Delete profile row (cascade or manual)
        await supabase.from('profiles').delete().eq('id', user.id)
        await supabase.from('daily_metrics').delete().eq('patient_id', user.id)
        await supabase.from('symptom_reports').delete().eq('patient_id', user.id)
        await supabase.from('messages').delete().or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        await signOut()
        navigate('/')
    }

    function getInitials(name) {
        return (name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    }

    return (
        <div className="app-layout">
            <NavSidebar />
            <div className="app-main">
                <div className="topbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(backPath)}>
                            <ArrowLeft size={16} /> Back
                        </button>
                        <div style={{ width: 1, height: 20, background: 'var(--slate-200)' }} />
                        <h1 className="topbar-title">My Profile</h1>
                    </div>
                </div>

                <div className="page-content slide-up" style={{ maxWidth: 680 }}>

                    {/* Profile header */}
                    <div className="card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div className="user-avatar" style={{ width: 72, height: 72, fontSize: '1.6rem', flexShrink: 0 }}>
                            {getInitials(profile?.full_name)}
                        </div>
                        <div>
                            <h2 style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--navy-900)' }}>
                                {profile?.full_name || 'User'}
                            </h2>
                            <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
                                <span className={`badge ${profile?.role === 'doctor' ? 'badge-teal' : 'badge-green'}`}>
                                    {profile?.role === 'doctor' ? '👨‍⚕️ Clinician' : '❤️ Patient'}
                                </span>
                                <span style={{ fontSize: '0.82rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Mail size={13} /> {user?.email}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Edit personal info */}
                    <div className="card" style={{ marginBottom: 20 }}>
                        <div className="card-title" style={{ marginBottom: 20 }}>
                            <User size={15} style={{ display: 'inline', marginRight: 6, color: 'var(--teal-500)' }} />
                            Personal Information
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    className="form-input"
                                    value={form.full_name}
                                    onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                                    placeholder="Your full name"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    className="form-input"
                                    value={user?.email || ''}
                                    disabled
                                    style={{ background: 'var(--slate-100)', color: 'var(--slate-500)' }}
                                />
                                <p style={{ fontSize: '0.78rem', color: 'var(--slate-400)' }}>Email cannot be changed here. Contact info@voon.fi.</p>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <input
                                    className="form-input"
                                    value={profile?.role === 'doctor' ? 'Clinician / Doctor' : 'Patient'}
                                    disabled
                                    style={{ background: 'var(--slate-100)', color: 'var(--slate-500)' }}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Language</label>
                                <select
                                    className="form-select"
                                    value={form.language}
                                    onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                                >
                                    <option value="en">English</option>
                                    <option value="fi">Suomi (Finnish)</option>
                                    <option value="tr">Türkçe (Turkish)</option>
                                </select>
                            </div>
                        </div>

                        {error && (
                            <div className="alert-banner danger" style={{ marginTop: 16 }}>
                                <AlertCircle size={15} /> {error}
                            </div>
                        )}
                        {saved && (
                            <div className="alert-banner success" style={{ marginTop: 16 }}>
                                <CheckCircle size={15} /> Profile saved successfully!
                            </div>
                        )}

                        <button
                            className="btn btn-primary"
                            style={{ marginTop: 20 }}
                            onClick={saveProfile}
                            disabled={saving}
                        >
                            {saving ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving…</> : <><Save size={15} /> Save Changes</>}
                        </button>
                    </div>

                    {/* Change password */}
                    <div className="card" style={{ marginBottom: 20 }}>
                        <div className="card-title" style={{ marginBottom: 20 }}>
                            <Lock size={15} style={{ display: 'inline', marginRight: 6, color: 'var(--teal-500)' }} />
                            Change Password
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        className="form-input"
                                        type={showPw ? 'text' : 'password'}
                                        value={pwForm.newPw}
                                        onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))}
                                        placeholder="Min. 6 characters"
                                        style={{ paddingRight: 40 }}
                                    />
                                    <button type="button" onClick={() => setShowPw(p => !p)}
                                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}>
                                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirm New Password</label>
                                <input
                                    className="form-input"
                                    type="password"
                                    value={pwForm.confirm}
                                    onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                                    placeholder="Repeat new password"
                                />
                            </div>
                        </div>

                        {pwMsg && (
                            <div className={`alert-banner ${pwMsg.type === 'error' ? 'danger' : 'success'}`} style={{ marginTop: 14 }}>
                                {pwMsg.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle size={14} />} {pwMsg.text}
                            </div>
                        )}

                        <button
                            className="btn btn-secondary"
                            style={{ marginTop: 16 }}
                            onClick={changePassword}
                            disabled={pwSaving}
                        >
                            {pwSaving ? 'Updating…' : <><Lock size={14} /> Update Password</>}
                        </button>
                    </div>

                    {/* Danger zone - delete account */}
                    <div className="card" style={{ border: '1.5px solid var(--red-500)', marginBottom: 40 }}>
                        <div className="card-title" style={{ color: 'var(--red-500)', marginBottom: 12 }}>
                            <Trash2 size={15} style={{ display: 'inline', marginRight: 6 }} />
                            Danger Zone
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginBottom: 16, lineHeight: 1.6 }}>
                            Permanently delete your account and all associated data (health metrics, messages, symptom reports).
                            <strong> This action cannot be undone.</strong>
                        </p>

                        {!showDelete ? (
                            <button className="btn btn-danger btn-sm" onClick={() => setShowDelete(true)}>
                                <Trash2 size={14} /> Delete My Account
                            </button>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--red-500)' }}>
                                    Type <strong>DELETE</strong> to confirm:
                                </p>
                                <input
                                    className="form-input"
                                    value={deleteConfirm}
                                    onChange={e => setDeleteConfirm(e.target.value)}
                                    placeholder="Type DELETE"
                                    style={{ borderColor: 'var(--red-500)' }}
                                />
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button className="btn btn-secondary btn-sm" onClick={() => { setShowDelete(false); setDeleteConfirm('') }}>
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={deleteAccount}
                                        disabled={deleteConfirm !== 'DELETE' || deleting}
                                    >
                                        {deleting ? 'Deleting…' : <><Trash2 size={14} /> Permanently Delete</>}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="disclaimer-bar">{t('common.disclaimer')}</div>
                </div>
            </div>
        </div>
    )
}
