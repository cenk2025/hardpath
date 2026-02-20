import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import NavSidebar from '../../components/NavSidebar'
import { Send, Stethoscope } from 'lucide-react'

// Demo messages for UI demonstration
const DEMO_MSGS = [
    { id: 1, sender: 'doctor', text: 'Hello! How are you feeling today?', created_at: new Date(Date.now() - 3600000 * 24).toISOString() },
    { id: 2, sender: 'patient', text: 'I did my morning walk without any issues! Felt a bit tired at the end.', created_at: new Date(Date.now() - 3600000 * 23).toISOString() },
    { id: 3, sender: 'doctor', text: 'Great progress! That\'s completely normal. Make sure to rest after the walk and keep logging your heart rate.', created_at: new Date(Date.now() - 3600000 * 22).toISOString() },
    { id: 4, sender: 'patient', text: 'My resting HR was 68 bpm this morning.', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: 5, sender: 'doctor', text: 'That\'s a very healthy resting heart rate! Keep up the good work. Your program intensity will stay the same this week.', created_at: new Date(Date.now() - 3600000).toISOString() },
]

function formatTime(iso) {
    const d = new Date(iso)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function Messages() {
    const { t } = useTranslation()
    const { user } = useAuth()
    const [messages, setMessages] = useState(DEMO_MSGS)
    const [input, setInput] = useState('')
    const [sending, setSending] = useState(false)
    const listRef = useRef(null)

    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
    }, [messages])

    async function sendMessage(e) {
        e.preventDefault()
        if (!input.trim()) return
        setSending(true)

        const newMsg = {
            id: Date.now(),
            sender: 'patient',
            text: input,
            created_at: new Date().toISOString(),
        }
        setMessages(ms => [...ms, newMsg])
        setInput('')

        try {
            await supabase.from('messages').insert({
                sender_id: user?.id,
                content: input,
                created_at: new Date().toISOString(),
            })
        } catch (err) {
            console.error(err)
        }

        setSending(false)
    }

    return (
        <div className="app-layout">
            <NavSidebar />
            <div className="app-main with-sidebar">
                <div className="topbar">
                    <div>
                        <h1 className="topbar-title">{t('patient.msg_title')}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <div style={{ width: 8, height: 8, background: 'var(--green-500)', borderRadius: '50%' }} />
                            <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>{t('patient.msg_your_doctor')} — Online</span>
                        </div>
                    </div>
                </div>

                <div className="page-content" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
                    {/* Doctor info strip */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 28px',
                        background: 'var(--white)', borderBottom: '1px solid var(--slate-200)'
                    }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--navy-700), var(--teal-500))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                        }}>
                            <Stethoscope size={20} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>Dr. Sarah Mäkinen</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>Cardiac Rehabilitation Specialist</div>
                        </div>
                        <div style={{ marginLeft: 'auto' }}>
                            <span className="badge badge-green">
                                <span style={{ width: 6, height: 6, background: 'var(--green-500)', borderRadius: '50%', display: 'inline-block' }} />
                                Secure Channel
                            </span>
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        ref={listRef}
                        className="messages-list"
                        style={{ flex: 1, minHeight: 0, maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}
                    >
                        {messages.map(msg => (
                            <div key={msg.id} style={{ alignSelf: msg.sender === 'patient' ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                                {msg.sender === 'doctor' && (
                                    <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)', marginBottom: 4 }}>Dr. Mäkinen</div>
                                )}
                                <div className={`message-bubble ${msg.sender === 'patient' ? 'sent' : 'received'}`}>
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
                            placeholder={t('patient.msg_placeholder')}
                            style={{ borderRadius: 'var(--radius-full)', paddingLeft: 20 }}
                        />
                        <button className="btn btn-primary" type="submit" disabled={sending || !input.trim()} style={{ borderRadius: 'var(--radius-full)', padding: '10px 18px' }}>
                            <Send size={16} />
                            {t('patient.msg_send')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
