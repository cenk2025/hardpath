import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import NavSidebar from '../../components/NavSidebar'
import { Pill, Plus, Trash2, Bell, BellOff, Clock } from 'lucide-react'

const DEMO_MEDS = [
    { id: 1, name: 'Bisoprolol', dose: '5mg', time: '08:00', reminder: true },
    { id: 2, name: 'Aspirin', dose: '100mg', time: '12:00', reminder: true },
    { id: 3, name: 'Atorvastatin', dose: '40mg', time: '20:00', reminder: false },
]

export default function Medications() {
    const { t } = useTranslation()
    const [meds, setMeds] = useState(DEMO_MEDS)
    const [showForm, setShowForm] = useState(false)
    const [newMed, setNewMed] = useState({ name: '', dose: '', time: '08:00', reminder: true })

    function toggleReminder(id) {
        setMeds(ms => ms.map(m => m.id === id ? { ...m, reminder: !m.reminder } : m))
    }

    function deleteMed(id) {
        setMeds(ms => ms.filter(m => m.id !== id))
    }

    function addMed() {
        if (!newMed.name || !newMed.dose) return
        setMeds(ms => [...ms, { ...newMed, id: Date.now() }])
        setNewMed({ name: '', dose: '', time: '08:00', reminder: true })
        setShowForm(false)
    }

    return (
        <div className="app-layout">
            <NavSidebar />
            <div className="app-main with-sidebar">
                <div className="topbar">
                    <h1 className="topbar-title">{t('patient.meds_title')}</h1>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
                        <Plus size={16} />{t('patient.add_medication')}
                    </button>
                </div>

                <div className="page-content slide-up">
                    {/* Add form */}
                    {showForm && (
                        <div className="card" style={{ marginBottom: 24, border: '1.5px solid var(--teal-500)' }}>
                            <p className="card-title" style={{ marginBottom: 16 }}>Add New Medication</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, alignItems: 'end' }}>
                                <div className="form-group">
                                    <label className="form-label">{t('patient.med_name')}</label>
                                    <input className="form-input" value={newMed.name} onChange={e => setNewMed(n => ({ ...n, name: e.target.value }))} placeholder="e.g. Metoprolol" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('patient.med_dose')}</label>
                                    <input className="form-input" value={newMed.dose} onChange={e => setNewMed(n => ({ ...n, dose: e.target.value }))} placeholder="e.g. 25mg" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('patient.med_time')}</label>
                                    <input className="form-input" type="time" value={newMed.time} onChange={e => setNewMed(n => ({ ...n, time: e.target.value }))} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                                <button className="btn btn-primary" onClick={addMed}><Plus size={16} /> Add</button>
                                <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </div>
                    )}

                    {/* Medication list */}
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
                                        <span>💊 {med.dose}</span>
                                        <span><Clock size={12} style={{ display: 'inline', marginRight: 3 }} />{med.time}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {med.reminder ? <Bell size={15} color="var(--teal-500)" /> : <BellOff size={15} color="var(--slate-400)" />}
                                        <label className="toggle">
                                            <input type="checkbox" checked={med.reminder} onChange={() => toggleReminder(med.id)} />
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

                    {/* Hydration reminder */}
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
