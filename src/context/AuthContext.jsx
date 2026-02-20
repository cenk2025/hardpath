import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) fetchProfile(session.user.id)
            else setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) fetchProfile(session.user.id)
            else {
                setProfile(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    async function fetchProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            // Profile exists — use it
            if (data) {
                setProfile(data)
                return
            }

            // No profile row yet (e.g. created via Supabase Dashboard)
            // Auto-create a default patient profile so the user can log in
            if (error?.code === 'PGRST116') {
                const { data: created, error: insertErr } = await supabase
                    .from('profiles')
                    .insert({
                        id: userId,
                        full_name: 'User',
                        role: 'patient',
                        language: localStorage.getItem('heartpath_lang') || 'en',
                        onboarding_completed: false,
                    })
                    .select()
                    .single()

                if (insertErr) {
                    console.error('Profile auto-create error:', insertErr)
                    setProfile(null)
                } else {
                    setProfile(created)
                }
                return
            }

            console.error('Profile fetch error:', error)
            setProfile(null)
        } catch (err) {
            console.error('Profile error:', err)
            setProfile(null)
        } finally {
            setLoading(false)
        }
    }

    async function signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        return data
    }

    async function signUp(email, password, fullName, role) {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error

        // Create profile
        if (data.user) {
            const { error: profileError } = await supabase.from('profiles').insert({
                id: data.user.id,
                full_name: fullName,
                role: role,
                language: localStorage.getItem('heartpath_lang') || 'en',
                onboarding_completed: false,
            })
            if (profileError) console.error('Profile creation error:', profileError)
        }
        return data
    }

    async function signOut() {
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
    }

    async function updateProfile(updates) {
        if (!user) return
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single()
        if (error) throw error
        setProfile(data)
        return data
    }

    const value = {
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        isPatient: profile?.role === 'patient',
        isDoctor: profile?.role === 'doctor',
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
}
