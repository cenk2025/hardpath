import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import NavSidebar from '../../components/NavSidebar'
import {
    MessageCircle, Send, Search, Users, Shield, RefreshCw,
    ChevronLeft, AlertCircle
} from 'lucide-react'

export default function DoctorMessages() {
    const { t } = useTranslation()
    const { user } = useAuth()
    const [searchParams] = useSearchParams()
    const preselectedId = searchParams.get('patient')

    const [patients, setPatients] = useState([])
    const [selectedPatient, setSelectedPatient] = useState(null)
    const [messages, setMessages] = useState([])
    const [search, setSearch] = useState('')
    const [input, setInput] = useState('')
    const [sending, setSending] = useState(false)
    const [loading, setLoading] = useState(true)
    const [showList, setShowList] = useState(true)    // mobile: toggle list vs chat
    const messagesEndRef = useRef(null)

    // Fetch patient list
    useEffect(() => {
        fetchPatients()
    }, [])

    async function fetchPatients() {
        setLoading(true)
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'patient')
            .order('full_name')
        setPatients(data || [])
        setLoading(false)

        // Auto-select the patient from URL param
        if (preselectedId && data) {
            const found = data.find(p => p.id === preselectedId)
            if (found) {
                setSelectedPatient(found)
                setShowList(false)
            }
        }
    }

    // Fetch messages when a patient is selected
    useEffect(() => {
        if (!selectedPatient || !user) return
        fetchMessages()
        // Subscribe to realtime
        const channel = supabase
            .channel(`messages-doctor-${selectedPatient.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `sender_id=eq.${selectedPatient.id}`,
            }, payload => {
                setMessages(prev => [...prev, payload.new])
            })
            .subscribe()
        return () => supabase.removeChannel(channel)
    }, [selectedPatient?.id])

    async function fetchMessages() {
        if (!selectedPatient || !user) return
        const { data } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedPatient.id}),and(sender_id.eq.${selectedPatient.id},receiver_id.eq.${user.id})`)
            .order('created_at', { ascending: true })
        setMessages(data || [])
    }

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    async function sendMessage() {
        if (!input.trim() || !selectedPatient || !user) return
        setSending(true)
        const msg = {
            sender_id: user.id,
            receiver_id: selectedPatient.id,
            content: input.trim(),
        }
        const { data, error } = await supabase.from('messages').insert(msg).select().single()
        if (!error && data) {
            setMessages(prev => [...prev, data])
        }
        setInput('')
        setSending(false)
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    function selectPatient(p) {
        setSelectedPatient(p)
        setMessages([])
        setShowList(false)
    }

    function getInitials(name) {
        return (name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    }

    const filtered = patients.filter(p =>
        (p.full_name || '').toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="app-layout">
            <NavSidebar />
            <div className="app-main">
                <div className="topbar">
                    {/* Mobile: back to list */}
                    {!showList && (
                        <button className="btn btn-ghost btn-sm" style={{ display: 'none' }} id="back-to-list" onClick={() => setShowList(true)}>
                            <ChevronLeft size={16} /> Patients
                        </button>
                    )}
                    <h1 className="topbar-title">
                        <MessageCircle size={18} style={{ display: 'inline', marginRight: 8, color: 'var(--teal-500)' }} />
                        {selectedPatient ? `Chat — ${selectedPatient.full_name}` : t('nav.messages')}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--green-500)' }}>
                        <Shield size={13} /> {t('messages.secure')}
                    </div>
                </div>

                <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
                    {/* Patient list panel */}
                    <div style={{
                        width: 280, borderRight: '1px solid var(--slate-200)',
                        display: 'flex', flexDirection: 'column',
                        background: 'var(--white)',
                        flexShrink: 0,
                    }}>
                        <div style={{ padding: '16px 16px 12px' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                                <input
                                    className="form-input"
                                    style={{ paddingLeft: 32, fontSize: '0.85rem', height: 36, borderRadius: 'var(--radius-full)' }}
                                    placeholder="Search patients..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {loading && (
                                <div style={{ textAlign: 'center', padding: 24, color: 'var(--slate-400)' }}>
                                    <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                </div>
                            )}

                            {!loading && patients.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--slate-400)' }}>
                                    <Users size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
                                    <p style={{ fontSize: '0.85rem' }}>No patients yet</p>
                                </div>
                            )}

                            {filtered.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => selectPatient(p)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        padding: '12px 16px', cursor: 'pointer',
                                        background: selectedPatient?.id === p.id ? 'rgba(8,145,178,0.08)' : 'transparent',
                                        borderLeft: selectedPatient?.id === p.id ? '3px solid var(--teal-500)' : '3px solid transparent',
                                        transition: 'var(--transition)',
                                    }}
                                    onMouseEnter={e => { if (selectedPatient?.id !== p.id) e.currentTarget.style.background = 'var(--off-white)' }}
                                    onMouseLeave={e => { if (selectedPatient?.id !== p.id) e.currentTarget.style.background = 'transparent' }}
                                >
                                    <div className="user-avatar" style={{ width: 38, height: 38, fontSize: '0.85rem', flexShrink: 0 }}>
                                        {getInitials(p.full_name)}
                                    </div>
                                    <div style={{ overflow: 'hidden' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--navy-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {p.full_name || 'Unknown'}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                                            {p.onboarding_completed ? '✅ Active' : '⏳ Onboarding'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat panel */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--off-white)', overflow: 'hidden' }}>
                        {!selectedPatient ? (
                            /* Empty state */
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--slate-400)' }}>
                                <div style={{ width: 72, height: 72, background: 'rgba(8,145,178,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <MessageCircle size={32} color="var(--teal-400)" />
                                </div>
                                <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--navy-900)' }}>Select a patient</p>
                                <p style={{ fontSize: '0.85rem', maxWidth: 240, textAlign: 'center' }}>
                                    Choose a patient from the left panel to start a secure conversation.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Chat header */}
                                <div style={{ padding: '14px 20px', background: 'var(--white)', borderBottom: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div className="user-avatar" style={{ width: 36, height: 36, fontSize: '0.85rem' }}>
                                        {getInitials(selectedPatient.full_name)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy-900)' }}>{selectedPatient.full_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Patient · {selectedPatient.language?.toUpperCase() || 'EN'}</div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {messages.length === 0 && (
                                        <div style={{ textAlign: 'center', marginTop: 40, color: 'var(--slate-400)' }}>
                                            <MessageCircle size={24} style={{ marginBottom: 8, opacity: 0.4 }} />
                                            <p style={{ fontSize: '0.85rem' }}>No messages yet. Start the conversation below.</p>
                                        </div>
                                    )}
                                    {messages.map(msg => {
                                        const isMe = msg.sender_id === user?.id
                                        return (
                                            <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                                                <div className={`message-bubble ${isMe ? 'sent' : 'received'}`}>
                                                    <div>{msg.content}</div>
                                                    <div className="message-time">
                                                        {new Date(msg.created_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="message-input-row">
                                    <input
                                        className="form-input"
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={`Message ${selectedPatient.full_name}...`}
                                        disabled={sending}
                                    />
                                    <button
                                        className="btn btn-primary"
                                        onClick={sendMessage}
                                        disabled={!input.trim() || sending}
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
