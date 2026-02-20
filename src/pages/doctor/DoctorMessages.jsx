import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import NavSidebar from '../../components/NavSidebar'
import { Send, Heart } from 'lucide-react'

const PATIENT_LIST = [
    { id: 'p1', name: 'Matti Virtanen', condition: 'Post-MI', unread: 0 },
    { id: 'p2', name: 'Ayşe Yılmaz', condition: 'Post-CABG', unread: 2 },
    { id: 'p3', name: 'John Smith', condition: 'Heart Failure', unread: 1 },
    { id: 'p4', name: 'Helena Korhonen', condition: 'Post-Stent', unread: 0 },
    { id: 'p5', name: 'Mehmet Çelik', condition: 'Arrhythmia', unread: 0 },
]

const CONVERSATIONS = {
    p1: [
        { sender: 'patient', text: 'My resting HR was 64 today!', created_at: new Date(Date.now() - 3600000 * 3).toISOString() },
        { sender: 'doctor', text: 'Excellent! That\'s a great improvement. Keep up the morning walks.', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
    ],
    p2: [
        { sender: 'patient', text: 'I felt slightly dizzy after today\'s walk.', created_at: new Date(Date.now() - 7200000).toISOString() },
        { sender: 'patient', text: 'Should I skip tomorrow\'s session?', created_at: new Date(Date.now() - 7100000).toISOString() },
    ],
    p3: [
        { sender: 'patient', text: 'I\'m finding it hard to stay motivated...', created_at: new Date(Date.now() - 86400000).toISOString() },
    ],
    p4: [], p5: [],
}

function formatTime(iso) {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function DoctorMessages() {
    const { t } = useTranslation()
    const { user } = useAuth()
    const [selected, setSelected] = useState('p2')
    const [convos, setConvos] = useState(CONVERSATIONS)
    const [input, setInput] = useState('')
    const listRef = useRef(null)

    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
    }, [selected, convos])

    function sendMessage(e) {
        e.preventDefault()
        if (!input.trim()) return
        const msg = { sender: 'doctor', text: input, created_at: new Date().toISOString() }
        setConvos(c => ({ ...c, [selected]: [...(c[selected] || []), msg] }))
        setInput('')
    }

    const msgs = convos[selected] || []
    const patient = PATIENT_LIST.find(p => p.id === selected)

    return (
        <div className="app-layout">
            <NavSidebar alertCount={1} />
            <div className="app-main with-sidebar">
                <div className="topbar">
                    <h1 className="topbar-title">{t('doctor.messages_title')}</h1>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
                    {/* Patient list */}
                    <div style={{ borderRight: '1px solid var(--slate-200)', overflowY: 'auto', background: 'var(--white)' }}>
                        {PATIENT_LIST.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setSelected(p.id)}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '14px 18px', background: selected === p.id ? 'rgba(8,145,178,0.06)' : 'none',
                                    border: 'none', borderBottom: '1px solid var(--slate-200)',
                                    cursor: 'pointer', textAlign: 'left',
                                    borderLeft: selected === p.id ? '3px solid var(--teal-500)' : '3px solid transparent',
                                }}
                            >
                                <div className="user-avatar" style={{ background: 'linear-gradient(135deg, var(--navy-700), var(--teal-500))', color: 'white' }}>
                                    {p.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--navy-900)' }}>{p.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{p.condition}</div>
                                </div>
                                {p.unread > 0 && (
                                    <div style={{
                                        background: 'var(--red-500)', color: 'white', borderRadius: '50%',
                                        width: 18, height: 18, fontSize: '0.7rem', fontWeight: 700,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                    }}>{p.unread}</div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Chat area */}
                    <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--off-white)' }}>
                        {/* Patient header */}
                        <div style={{
                            background: 'var(--white)', borderBottom: '1px solid var(--slate-200)',
                            padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12
                        }}>
                            <div className="user-avatar" style={{ background: 'linear-gradient(135deg, var(--navy-700), var(--teal-500))', color: 'white' }}>
                                {patient?.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{patient?.name}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--slate-400)' }}>{patient?.condition}</div>
                            </div>
                            <div style={{ marginLeft: 'auto' }}>
                                <span className="badge badge-green">
                                    <span style={{ width: 6, height: 6, background: 'var(--green-500)', borderRadius: '50%', display: 'inline-block' }} />
                                    Secure Channel
                                </span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div ref={listRef} className="messages-list" style={{ flex: 1, overflowY: 'auto' }}>
                            {msgs.length === 0 && (
                                <div style={{ textAlign: 'center', color: 'var(--slate-400)', marginTop: 40, fontSize: '0.875rem' }}>
                                    No messages yet. Start the conversation.
                                </div>
                            )}
                            {msgs.map((msg, i) => (
                                <div key={i} style={{ alignSelf: msg.sender === 'doctor' ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                                    {msg.sender === 'patient' && (
                                        <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)', marginBottom: 4 }}>{patient?.name}</div>
                                    )}
                                    <div className={`message-bubble ${msg.sender === 'doctor' ? 'sent' : 'received'}`}>
                                        {msg.text}
                                        <div className="message-time">{formatTime(msg.created_at)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <form className="message-input-row" onSubmit={sendMessage}>
                            <input
                                className="form-input"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder={`Message ${patient?.name}...`}
                                style={{ borderRadius: 'var(--radius-full)', paddingLeft: 20 }}
                            />
                            <button className="btn btn-primary" type="submit" disabled={!input.trim()} style={{ borderRadius: 'var(--radius-full)', padding: '10px 18px' }}>
                                <Send size={16} />{t('doctor.send_message')}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
