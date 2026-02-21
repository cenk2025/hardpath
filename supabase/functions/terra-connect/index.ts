// supabase/functions/terra-connect/index.ts
// Generates a Terra OAuth URL for the patient to authorize their wearable
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TERRA_API_KEY = Deno.env.get('TERRA_API_KEY')!
const TERRA_DEV_ID = Deno.env.get('TERRA_DEV_ID')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const { provider, patient_id } = await req.json()

        if (!provider || !patient_id) {
            return new Response(JSON.stringify({ error: 'provider and patient_id required' }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        if (!TERRA_API_KEY || !TERRA_DEV_ID) {
            return new Response(JSON.stringify({ error: 'Terra API keys not configured' }), {
                status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Generate Terra auth URL for the patient
        // Terra API: POST /auth/generateAuthToken
        const terraResp = await fetch('https://api.tryterra.co/v2/auth/generateAuthToken', {
            method: 'POST',
            headers: {
                'x-api-key': TERRA_API_KEY,
                'dev-id': TERRA_DEV_ID,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ providers: provider, reference_id: patient_id }),
        })

        const terraData = await terraResp.json()

        if (!terraData.session_id) {
            console.error('Terra error:', terraData)
            return new Response(JSON.stringify({ error: 'Terra did not return session_id' }), {
                status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Terra widget URL
        const auth_url = `https://widget.tryterra.co/session/${terraData.session_id}`

        // Pre-create a pending connection record
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        await supabase.from('wearable_connections').upsert({
            patient_id,
            provider,
            status: 'pending',
            terra_session_id: terraData.session_id,
            connected_at: null,
            last_sync_at: null,
        }, { onConflict: 'patient_id,provider' })

        return new Response(JSON.stringify({ auth_url, session_id: terraData.session_id }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (err) {
        console.error('terra-connect error:', err)
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
