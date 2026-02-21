import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import NavSidebar from '../../components/NavSidebar'
import { Send, Stethoscope, RefreshCw, MessageCircle, Shield, AlertCircle } from 'lucide-react'

export default function Messages() {
    const { t } = useTranslation()
    const { user } = useAuth()
    const [messages, setMessages] = useState([])
    const [doctor, setDoctor] = useState(null)  // first doctor in system
    const [input, setInput] = useState('')
    const [sending, setSending] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const listRef = useRef(null)

    useEffect(() => {
        if (user) init()
    }, [user])

    async function init() {
        setLoading(true)
        try {
            // Find the doctor(s) in the system
            const { data: doctors } = await supabase
                .from('profiles')
                .select('id, full_name, role')
                .eq('role', 'doctor')
                .limit(1)

            const doc = doctors?.[0] || null
            setDoctor(doc)

            if (doc) {
                await fetchMessages(doc.id)
                subscribeToMessages(doc.id)
            }
        } catch (err) {
            console.error('Messages init error:', err)
            setError('Could not load messages.')
        } finally {
            setLoading(false)
        }
    }

    async function fetchMessages(doctorId) {
        const id = doctorId || doctor?.id
        if (!id || !user) return
        const { data, error: err } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${user.id})`)
            .order('created_at', { ascending: true })
        if (!err) setMessages(data || [])
    }

    function subscribeToMessages(doctorId) {
        const channel = supabase
            .channel(`patient-msgs-${user.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${user.id}`,
            }, payload => {
                setMessages(prev => [...prev, payload.new])
            })
            .subscribe()
        return () => supabase.removeChannel(channel)
    }

    // Scroll to bottom
    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
    }, [messages])

    async function sendMessage(e) {
        e.preventDefault()
        if (!input.trim() || !doctor || !user) return
        setSending(true)
        setError(null)

        const payload = {
            sender_id: user.id,
            receiver_id: doctor.id,
            content: input.trim(),
        }

        const { data, error: err } = await supabase
            .from('messages')
            .insert(payload)
            .select()
            .single()

        if (err) {
            console.error('Send error:', err)
            setError('Message could not be sent: ' + err.message)
        } else if (data) {
            setMessages(prev => [...prev, data])
            setInput('')
        }
        setSending(false)
    }

    function formatTime(iso) {
        return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className="app-layout">
            <NavSidebar />
            <div className="app-main">
                <div className="topbar">
                    <div>
                        <h1 className="topbar-title">{t('patient.msg_title')}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <div style={{ width: 8, height: 8, background: 'var(--green-500)', borderRadius: '50%' }} />
                            <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                                {doctor ? `${doctor.full_name}` : 'Your Care Team'}
                            </span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--green-500)' }}>
                        <Shield size={13} /> Secure & Encrypted
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
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
                            <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                                {doctor ? doctor.full_name : 'No doctor assigned yet'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>Cardiac Rehabilitation Specialist</div>
                        </div>
                        <button
                            className="btn btn-ghost btn-sm"
                            style={{ marginLeft: 'auto' }}
                            onClick={() => doctor && fetchMessages(doctor.id)}
                            title="Refresh messages"
                        >
                            <RefreshCw size={14} />
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="alert-banner danger" style={{ margin: '12px 20px 0' }}>
                            <AlertCircle size={14} /> {error}
                        </div>
                    )}

                    {/* Messages */}
                    <div
                        ref={listRef}
                        style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--off-white)' }}
                    >
                        {loading && (
                            <div style={{ textAlign: 'center', padding: 40, color: 'var(--slate-400)' }}>
                                <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
                            </div>
                        )}

                        {!loading && !doctor && (
                            <div style={{ textAlign: 'center', marginTop: 60, color: 'var(--slate-400)' }}>
                                <Stethoscope size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
                                <p style={{ fontWeight: 600 }}>No doctor assigned yet</p>
                                <p style={{ fontSize: '0.85rem' }}>Your care team will appear here once a clinician is assigned to you.</p>
                            </div>
                        )}

                        {!loading && doctor && messages.length === 0 && (
                            <div style={{ textAlign: 'center', marginTop: 60, color: 'var(--slate-400)' }}>
                                <MessageCircle size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
                                <p style={{ fontWeight: 600 }}>No messages yet</p>
                                <p style={{ fontSize: '0.85rem' }}>Send a message to your care team below.</p>
                            </div>
                        )}

                        {messages.map(msg => {
                            const isMe = msg.sender_id === user?.id
                            return (
                                <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                                    {!isMe && (
                                        <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)', marginBottom: 4 }}>
                                            {doctor?.full_name || 'Doctor'}
                                        </div>
                                    )}
                                    <div className={`message-bubble ${isMe ? 'sent' : 'received'}`}>
                                        {msg.content}
                                        <div className="message-time">{formatTime(msg.created_at)}</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Input */}
                    <form className="message-input-row" onSubmit={sendMessage}>
                        <input
                            className="form-input"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder={doctor ? t('patient.msg_placeholder') : 'No doctor assigned yet...'}
                            disabled={!doctor || sending}
                            style={{ borderRadius: 'var(--radius-full)', paddingLeft: 20 }}
                        />
                        <button
                            className="btn btn-primary" type="submit"
                            disabled={sending || !input.trim() || !doctor}
                            style={{ borderRadius: 'var(--radius-full)', padding: '10px 18px' }}
                        >
                            <Send size={16} /> {t('patient.msg_send')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
