import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import NavSidebar from '../../components/NavSidebar'
import { Pill, Plus, Trash2, Bell, BellOff, Clock, RefreshCw, AlertCircle } from 'lucide-react'

export default function Medications() {
    const { t } = useTranslation()
    const { user } = useAuth()
    const [meds, setMeds] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [newMed, setNewMed] = useState({ name: '', dose: '', time_of_day: '08:00', reminder: true })

    useEffect(() => { if (user) fetchMeds() }, [user])

    async function fetchMeds() {
        setLoading(true)
        const { data, error: err } = await supabase
            .from('medications')
            .select('*')
            .eq('patient_id', user.id)
            .order('created_at', { ascending: true })
        if (!err) setMeds(data || [])
        else setError(err.message)
        setLoading(false)
    }

    async function addMed() {
        if (!newMed.name.trim()) return
        setSaving(true)
        setError(null)
        const { data, error: err } = await supabase
            .from('medications')
            .insert({ patient_id: user.id, ...newMed })
            .select()
            .single()
        if (err) setError(err.message)
        else {
            setMeds(ms => [...ms, data])
            setNewMed({ name: '', dose: '', time_of_day: '08:00', reminder: true })
            setShowForm(false)
        }
        setSaving(false)
    }

    async function toggleReminder(med) {
        const { error: err } = await supabase
            .from('medications')
            .update({ reminder: !med.reminder })
            .eq('id', med.id)
        if (!err) setMeds(ms => ms.map(m => m.id === med.id ? { ...m, reminder: !m.reminder } : m))
    }

    async function deleteMed(id) {
        const { error: err } = await supabase.from('medications').delete().eq('id', id)
        if (!err) setMeds(ms => ms.filter(m => m.id !== id))
        else setError(err.message)
    }

    return (
        <div className="app-layout">
            <NavSidebar />
            <div className="app-main">
                <div className="topbar">
                    <h1 className="topbar-title">{t('patient.meds_title')}</h1>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={fetchMeds}>
                            <RefreshCw size={14} />
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
                            <Plus size={16} /> {t('patient.add_medication')}
                        </button>
                    </div>
                </div>

                <div className="page-content slide-up">
                    {error && (
                        <div className="alert-banner danger" style={{ marginBottom: 16 }}>
                            <AlertCircle size={14} /> {error}
                        </div>
                    )}

                    {/* Add form */}
                    {showForm && (
                        <div className="card" style={{ marginBottom: 24, border: '1.5px solid var(--teal-500)' }}>
                            <p className="card-title" style={{ marginBottom: 16 }}>Add New Medication</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, alignItems: 'end' }}>
                                <div className="form-group">
                                    <label className="form-label">{t('patient.med_name')}</label>
                                    <input className="form-input" value={newMed.name} onChange={e => setNewMed(n => ({ ...n, name: e.target.value }))} placeholder="e.g. Bisoprolol" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('patient.med_dose')}</label>
                                    <input className="form-input" value={newMed.dose} onChange={e => setNewMed(n => ({ ...n, dose: e.target.value }))} placeholder="e.g. 5mg" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('patient.med_time')}</label>
                                    <input className="form-input" type="time" value={newMed.time_of_day} onChange={e => setNewMed(n => ({ ...n, time_of_day: e.target.value }))} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                                <button className="btn btn-primary" onClick={addMed} disabled={saving || !newMed.name.trim()}>
                                    {saving ? 'Saving…' : <><Plus size={16} /> Add</>}
                                </button>
                                <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div style={{ textAlign: 'center', padding: 40 }}>
                            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--slate-400)' }} />
                        </div>
                    )}

                    {!loading && meds.length === 0 && !showForm && (
                        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--slate-400)' }}>
                            <Pill size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                            <p style={{ fontWeight: 600, marginBottom: 4 }}>No medications added yet</p>
                            <p style={{ fontSize: '0.85rem', marginBottom: 16 }}>Add your prescribed medications to track doses and get reminders.</p>
                            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
                                <Plus size={14} /> Add First Medication
                            </button>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {meds.map(med => (
                            <div key={med.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{
                                    width: 48, height: 48, background: 'rgba(8,145,178,0.08)',
                                    borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    <Pill size={22} color="var(--teal-500)" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--navy-900)' }}>{med.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', display: 'flex', gap: 12, marginTop: 4 }}>
                                        {med.dose && <span>💊 {med.dose}</span>}
                                        {med.time_of_day && <span><Clock size={12} style={{ display: 'inline', marginRight: 3 }} />{med.time_of_day?.slice(0, 5)}</span>}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {med.reminder ? <Bell size={15} color="var(--teal-500)" /> : <BellOff size={15} color="var(--slate-400)" />}
                                        <label className="toggle">
                                            <input type="checkbox" checked={med.reminder} onChange={() => toggleReminder(med)} />
                                            <span className="toggle-slider" />
                                        </label>
                                    </div>
                                    <button className="btn btn-ghost btn-sm" onClick={() => deleteMed(med.id)} style={{ color: 'var(--red-500)' }}>
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="ai-insight" style={{ marginTop: 24 }}>
                        <div className="ai-insight-icon">💧</div>
                        <div className="ai-insight-text">
                            <strong>Hydration Reminder</strong>
                            <p>Remember to drink at least 1.5–2L of water daily. Proper hydration supports heart function and medication absorption.</p>
                        </div>
                    </div>

                    <div className="disclaimer-bar" style={{ marginTop: 32 }}>{t('common.disclaimer')}</div>
                </div>
            </div>
        </div>
    )
}
