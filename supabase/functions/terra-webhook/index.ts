// supabase/functions/terra-webhook/index.ts
// Receives real-time health data from Terra API and writes to Supabase tables
// Terra will POST here whenever new wearable data arrives

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TERRA_API_KEY = Deno.env.get('TERRA_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = { 'Access-Control-Allow-Origin': '*' }

function avg(arr: number[]): number | null {
    if (!arr?.length) return null
    return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    try {
        const body = await req.json()
        const { type, user, data } = body

        console.log('Terra webhook event:', type, user?.reference_id)

        // ── 1. User auth/deauth events ─────────────────────────────────────────
        if (type === 'auth') {
            const patient_id = user?.reference_id
            if (!patient_id || !user?.provider) return new Response('ok')

            await supabase.from('wearable_connections').upsert({
                patient_id,
                provider: user.provider,
                terra_user_id: user.user_id,
                status: 'connected',
                connected_at: new Date().toISOString(),
                last_sync_at: new Date().toISOString(),
            }, { onConflict: 'patient_id,provider' })

            console.log(`Patient ${patient_id} connected ${user.provider}`)
            return new Response('ok')
        }

        if (type === 'deauth') {
            const patient_id = user?.reference_id
            if (patient_id && user?.provider) {
                await supabase.from('wearable_connections')
                    .update({ status: 'disconnected' })
                    .eq('patient_id', patient_id)
                    .eq('provider', user.provider)
            }
            return new Response('ok')
        }

        // ── 2. Daily data events ───────────────────────────────────────────────
        const patient_id = user?.reference_id
        if (!patient_id) return new Response('ok')

        if (type === 'daily' || type === 'activity') {
            for (const day of (data || [])) {
                const date = day.metadata?.start_time?.slice(0, 10) || new Date().toISOString().slice(0, 10)

                // Extract HR samples (average)
                const hrSamples = day.heart_rate_data?.summary?.avg_hr_bpm
                    || avg(day.heart_rate_data?.detailed?.hr_samples?.map((s: any) => s.bpm) || [])

                // Extract HRV
                const hrv = day.heart_rate_data?.summary?.avg_hrv_rmssd
                    || day.hrv_data?.summary?.avg_rmssd

                // Extract sleep
                const sleepHours = day.sleep_durations_data?.asleep?.duration_asleep_state_seconds
                    ? Math.round(day.sleep_durations_data.asleep.duration_asleep_state_seconds / 360) / 10
                    : null

                // Only insert if we have at least one useful field
                if (!hrSamples && !hrv && !sleepHours) continue

                // Upsert into daily_metrics (one row per patient per day)
                const { error: metricsErr } = await supabase.from('daily_metrics').upsert({
                    patient_id,
                    recorded_at: `${date}T08:00:00Z`,
                    resting_hr: hrSamples || null,
                    hrv_ms: hrv ? Math.round(hrv) : null,
                    sleep_hours: sleepHours,
                    // Don't overwrite manually entered fields (fatigue, readiness) — only wearable fields
                }, { onConflict: 'patient_id,recorded_at', ignoreDuplicates: false })

                if (metricsErr) console.error('daily_metrics upsert error:', metricsErr)
            }
        }

        // ── 3. Glucose / Blood pressure events ────────────────────────────────
        if (type === 'body') {
            for (const day of (data || [])) {
                const bpReadings = day.blood_pressure_data?.blood_pressure_samples || []

                for (const reading of bpReadings) {
                    if (!reading.diastolic_bpm || !reading.systolic_bpm) continue

                    // Determine morning or evening based on timestamp
                    const hour = reading.timestamp ? new Date(reading.timestamp).getHours() : 8
                    const period = hour < 14 ? 'morning' : 'evening'

                    await supabase.from('blood_pressure_logs').insert({
                        patient_id,
                        systolic: Math.round(reading.systolic_bpm),
                        diastolic: Math.round(reading.diastolic_bpm),
                        period,
                        recorded_at: reading.timestamp || new Date().toISOString(),
                        notes: `Auto-synced from ${user.provider}`,
                    })
                }
            }
        }

        // ── 4. Update last_sync_at ─────────────────────────────────────────────
        if (patient_id && user?.provider) {
            await supabase.from('wearable_connections')
                .update({ last_sync_at: new Date().toISOString() })
                .eq('patient_id', patient_id)
                .eq('provider', user.provider)
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (err) {
        console.error('terra-webhook error:', err)
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
