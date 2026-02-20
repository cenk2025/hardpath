import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import NavSidebar from '../../components/NavSidebar'
import { Activity, Plus, CheckCircle } from 'lucide-react'

const PATIENTS = [
    { id: 'p1', name: 'Matti Virtanen' },
    { id: 'p2', name: 'Ayşe Yılmaz' },
    { id: 'p3', name: 'John Smith' },
    { id: 'p4', name: 'Helena Korhonen' },
    { id: 'p5', name: 'Mehmet Çelik' },
]

const DEMO_PROGRAMS = [
    { id: 1, name: 'Phase 1 — Initial Recovery', duration: 4, intensity: 'low', assignedTo: 'Matti Virtanen, John Smith' },
    { id: 2, name: 'Phase 2 — Progressive Exercise', duration: 6, intensity: 'moderate', assignedTo: 'Ayşe Yılmaz, Mehmet Çelik' },
    { id: 3, name: 'Phase 3 — Maintenance', duration: 8, intensity: 'moderate', assignedTo: 'Helena Korhonen' },
]

export default function ProgramManager() {
    const { t } = useTranslation()
    const [programs, setPrograms] = useState(DEMO_PROGRAMS)
    const [showForm, setShowForm] = useState(false)
    const [saved, setSaved] = useState(false)
    const [form, setForm] = useState({ name: '', duration: 4, intensity: 'moderate', assignedTo: '' })

    function set(f) { return e => setForm(v => ({ ...v, [f]: e.target.value })) }

    function saveProgram() {
        if (!form.name) return
        setPrograms(ps => [...ps, { id: Date.now(), ...form }])
        setShowForm(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    return (
        <div className="app-layout">
            <NavSidebar alertCount={1} />
            <div className="app-main with-sidebar">
                <div className="topbar">
                    <h1 className="topbar-title">{t('doctor.programs_title')}</h1>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
                        <Plus size={16} />{t('doctor.create_program')}
                    </button>
                </div>

                <div className="page-content slide-up">
                    {saved && (
                        <div className="alert-banner success" style={{ marginBottom: 20 }}>
                            <CheckCircle size={16} />Program saved and assigned successfully.
                        </div>
                    )}

                    {showForm && (
                        <div className="card" style={{ marginBottom: 24, border: '1.5px solid var(--teal-500)' }}>
                            <div className="card-title" style={{ marginBottom: 20 }}>{t('doctor.create_program')}</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">{t('doctor.program_name')}</label>
                                    <input className="form-input" value={form.name} onChange={set('name')} placeholder="e.g. Phase 4 — Advanced Recovery" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('doctor.program_duration')}</label>
                                    <input className="form-input" type="number" min={1} max={52} value={form.duration} onChange={set('duration')} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('doctor.program_intensity')}</label>
                                    <select className="form-select" value={form.intensity} onChange={set('intensity')}>
                                        <option value="low">{t('doctor.intensity_low')}</option>
                                        <option value="moderate">{t('doctor.intensity_moderate')}</option>
                                        <option value="high">{t('doctor.intensity_high')}</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">{t('doctor.assign_to')}</label>
                                    <select className="form-select" value={form.assignedTo} onChange={set('assignedTo')}>
                                        <option value="">Select patient...</option>
                                        {PATIENTS.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                                <button className="btn btn-primary" onClick={saveProgram}>{t('doctor.save_program')}</button>
                                <button className="btn btn-secondary" onClick={() => setShowForm(false)}>{t('common.cancel')}</button>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {programs.map(program => {
                            const intensityBadge = program.intensity === 'low' ? 'badge-green'
                                : program.intensity === 'high' ? 'badge-red' : 'badge-amber'
                            return (
                                <div key={program.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                    <div style={{
                                        width: 48, height: 48, borderRadius: 10, flexShrink: 0,
                                        background: 'rgba(8,145,178,0.08)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Activity size={22} color="var(--teal-500)" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{program.name}</div>
                                        <div style={{ display: 'flex', gap: 14, fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                                            <span>⏱ {program.duration} weeks</span>
                                            <span>👤 {program.assignedTo || 'Unassigned'}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                        <span className={`badge ${intensityBadge}`}>{program.intensity}</span>
                                        <button className="btn btn-secondary btn-sm">{t('common.edit')}</button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="disclaimer-bar" style={{ marginTop: 32 }}>{t('common.disclaimer')}</div>
                </div>
            </div>
        </div>
    )
}
