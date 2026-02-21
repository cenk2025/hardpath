import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import NavSidebar from '../../components/NavSidebar'
import {
    Watch, CheckCircle, RefreshCw, AlertCircle, Unlink,
    Wifi, Zap, Heart, Activity
} from 'lucide-react'

// Supported providers via Terra API
const PROVIDERS = [
    { id: 'APPLE', name: 'Apple Health', icon: '🍎', color: '#000', desc: 'HR, HRV, Sleep, Steps, SpO2' },
    { id: 'GARMIN', name: 'Garmin Connect', icon: '🏃', color: '#007cc3', desc: 'HR, HRV, Sleep, Stress, VO2max' },
    { id: 'FITBIT', name: 'Fitbit / Google', icon: '💚', color: '#00b0b9', desc: 'HR, Sleep, Steps, SpO2' },
    { id: 'SAMSUNG', name: 'Samsung Health', icon: '📱', color: '#1428a0', desc: 'HR, Sleep, Blood Pressure' },
    { id: 'POLAR', name: 'Polar Flow', icon: '❤️', color: '#d22630', desc: 'HR, HRV, Training Load' },
    { id: 'WITHINGS', name: 'Withings', icon: '⚖️', color: '#009b77', desc: 'Blood Pressure, Weight, Sleep' },
    { id: 'OURA', name: 'Oura Ring', icon: '💍', color: '#c9a227', desc: 'HRV, Sleep, Readiness, Temp' },
    { id: 'WHOOP', name: 'Whoop', icon: '🔋', color: '#00ff87', desc: 'HRV, Recovery, Strain' },
]

function timeAgo(iso) {
    if (!iso) return 'Never'
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 2) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}

export default function ConnectWearable() {
    const { user } = useAuth()
    const [connections, setConnections] = useState([])
    const [loading, setLoading] = useState(true)
    const [connecting, setConnecting] = useState(null) // provider being connected
    const [error, setError] = useState(null)

    useEffect(() => { if (user) fetchConnections() }, [user])

    async function fetchConnections() {
        setLoading(true)
        const { data, error: err } = await supabase
            .from('wearable_connections')
            .select('*')
            .eq('patient_id', user.id)
        if (!err) setConnections(data || [])
        setLoading(false)
    }

    function getConnection(providerId) {
        return connections.find(c => c.provider === providerId)
    }

    async function initiateConnect(provider) {
        setConnecting(provider.id)
        setError(null)
        try {
            // Call Supabase Edge Function to get Terra auth URL
            const { data, error: err } = await supabase.functions.invoke('terra-connect', {
                body: { provider: provider.id, patient_id: user.id },
            })
            if (err || !data?.auth_url) {
                setError(`Could not initiate connection for ${provider.name}. Make sure Terra API keys are configured.`)
                setConnecting(null)
                return
            }
            // Open Terra auth in new tab
            window.open(data.auth_url, '_blank', 'width=600,height=700,noopener')
            // Poll for connection (Terra will post back to webhook)
            pollForConnection(provider.id)
        } catch (e) {
            setError(e.message)
            setConnecting(null)
        }
    }

    function pollForConnection(providerId, attempts = 0) {
        if (attempts > 20) { setConnecting(null); return } // 60s timeout
        setTimeout(async () => {
            const { data } = await supabase
                .from('wearable_connections')
                .select('*')
                .eq('patient_id', user.id)
                .eq('provider', providerId)
                .single()
            if (data?.status === 'connected') {
                setConnections(prev => {
                    const existing = prev.find(c => c.provider === providerId)
                    if (existing) return prev.map(c => c.provider === providerId ? data : c)
                    return [...prev, data]
                })
                setConnecting(null)
            } else {
                pollForConnection(providerId, attempts + 1)
            }
        }, 3000)
    }

    async function disconnect(providerId) {
        const { error: err } = await supabase
            .from('wearable_connections')
            .delete()
            .eq('patient_id', user.id)
            .eq('provider', providerId)
        if (!err) setConnections(prev => prev.filter(c => c.provider !== providerId))
    }

    const connectedCount = connections.filter(c => c.status === 'connected').length

    return (
        <div className="app-layout">
            <NavSidebar />
            <div className="app-main">
                <div className="topbar">
                    <h1 className="topbar-title">
                        <Watch size={18} style={{ display: 'inline', marginRight: 8, color: 'var(--teal-500)' }} />
                        Connect Wearable
                    </h1>
                    <button className="btn btn-ghost btn-sm" onClick={fetchConnections}>
                        <RefreshCw size={14} />
                    </button>
                </div>

                <div className="page-content slide-up">
                    {/* Status banner */}
                    {connectedCount > 0 ? (
                        <div className="alert-banner success" style={{ marginBottom: 24 }}>
                            <CheckCircle size={16} />
                            <div>
                                <strong>{connectedCount} device{connectedCount > 1 ? 's' : ''} connected</strong>
                                <p style={{ fontSize: '0.82rem', marginTop: 2 }}>
                                    Your health data syncs automatically. Your doctor can see your metrics in real-time.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="ai-insight" style={{ marginBottom: 24 }}>
                            <div className="ai-insight-icon"><Wifi size={18} /></div>
                            <div className="ai-insight-text">
                                <strong>Connect your smartwatch or health app</strong>
                                <p>Your HR, HRV, sleep and blood pressure data will sync automatically — no manual entry needed. Your doctor will be notified in real-time.</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="alert-banner danger" style={{ marginBottom: 20 }}>
                            <AlertCircle size={14} /> {error}
                        </div>
                    )}

                    {/* How it works */}
                    <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, rgba(8,145,178,0.04), rgba(34,211,238,0.03))' }}>
                        <div className="card-title" style={{ marginBottom: 16 }}>
                            <Zap size={14} style={{ display: 'inline', marginRight: 6, color: 'var(--teal-500)' }} />
                            How it works
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                            {[
                                { icon: '1️⃣', title: 'Connect once', desc: 'Tap Connect and authorise HeartPath to read your wearable data.' },
                                { icon: '2️⃣', title: 'Auto-sync daily', desc: 'HR, HRV, sleep and BP sync automatically overnight.' },
                                { icon: '3️⃣', title: 'Doctor sees it live', desc: 'Your care team gets real-time access — no manual check-in needed.' },
                            ].map(s => (
                                <div key={s.title} style={{ textAlign: 'center', padding: '12px 8px' }}>
                                    <div style={{ fontSize: '1.6rem', marginBottom: 8 }}>{s.icon}</div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--navy-900)', marginBottom: 4 }}>{s.title}</div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', lineHeight: 1.5 }}>{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Provider grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                        {PROVIDERS.map(provider => {
                            const conn = getConnection(provider.id)
                            const isConnected = conn?.status === 'connected'
                            const isConnecting = connecting === provider.id

                            return (
                                <div key={provider.id} className="card" style={{
                                    border: isConnected ? '1.5px solid var(--teal-500)' : '1.5px solid var(--slate-200)',
                                    position: 'relative',
                                    transition: 'all 0.2s',
                                }}>
                                    {isConnected && (
                                        <div style={{
                                            position: 'absolute', top: 12, right: 12,
                                            width: 10, height: 10, borderRadius: '50%',
                                            background: 'var(--green-500)',
                                            boxShadow: '0 0 0 3px rgba(16,185,129,0.2)',
                                        }} title="Connected" />
                                    )}

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                                        <div style={{
                                            width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                                            background: isConnected ? 'rgba(8,145,178,0.1)' : 'var(--off-white)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.5rem', border: '1px solid var(--slate-200)',
                                        }}>
                                            {provider.icon}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy-900)' }}>
                                                {provider.name}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: 2 }}>
                                                {provider.desc}
                                            </div>
                                        </div>
                                    </div>

                                    {isConnected ? (
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: '0.8rem', color: 'var(--green-500)', fontWeight: 700 }}>
                                                <CheckCircle size={13} /> Connected
                                                {conn.last_sync_at && (
                                                    <span style={{ color: 'var(--slate-400)', fontWeight: 400, marginLeft: 4 }}>
                                                        · Last sync: {timeAgo(conn.last_sync_at)}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => disconnect(provider.id)}
                                                style={{ color: 'var(--red-500)', fontSize: '0.8rem', padding: '4px 10px' }}
                                            >
                                                <Unlink size={13} /> Disconnect
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            className="btn btn-primary btn-sm"
                                            style={{ width: '100%' }}
                                            onClick={() => initiateConnect(provider)}
                                            disabled={isConnecting}
                                        >
                                            {isConnecting ? (
                                                <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Connecting…</>
                                            ) : (
                                                <><Wifi size={13} /> Connect</>
                                            )}
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Data fields synced */}
                    <div className="card" style={{ marginTop: 24 }}>
                        <div className="card-title" style={{ marginBottom: 16 }}>
                            <Activity size={14} style={{ display: 'inline', marginRight: 6, color: 'var(--teal-500)' }} />
                            What gets synced automatically
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                            {[
                                { field: 'Resting Heart Rate', table: 'daily_metrics → resting_hr', icon: '❤️' },
                                { field: 'HRV', table: 'daily_metrics → hrv_ms', icon: '📈' },
                                { field: 'Sleep Hours', table: 'daily_metrics → sleep_hours', icon: '😴' },
                                { field: 'Blood Pressure', table: 'blood_pressure_logs', icon: '🩸' },
                                { field: 'SpO2', table: 'daily_metrics (coming soon)', icon: '💨' },
                                { field: 'Readiness Score', table: 'daily_metrics → readiness_score', icon: '⚡' },
                            ].map(item => (
                                <div key={item.field} style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '10px 14px', background: 'var(--off-white)',
                                    borderRadius: 8, border: '1px solid var(--slate-200)',
                                }}>
                                    <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--navy-900)' }}>{item.field}</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', marginTop: 2, fontFamily: 'monospace' }}>{item.table}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: 16, padding: 16, background: 'rgba(245,158,11,0.05)', borderRadius: 10, border: '1px solid rgba(245,158,11,0.2)' }}>
                        <p style={{ fontSize: '0.82rem', color: 'var(--slate-600)', lineHeight: 1.6 }}>
                            <strong>⚙️ Setup required:</strong> Wearable sync requires Terra API keys to be configured in environment variables (<code>TERRA_API_KEY</code>, <code>TERRA_DEV_ID</code>). Contact your HeartPath administrator to enable automatic sync. Manual check-in continues to work independently.
                        </p>
                    </div>

                    <div className="disclaimer-bar" style={{ marginTop: 24 }}>⚕ Your health data is encrypted and only shared with your assigned care team.</div>
                </div>
            </div>
        </div>
    )
}
