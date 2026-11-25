import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Not authenticated' }, 401)

  const admin = createClient(supabaseUrl, serviceKey)

  const token = authHeader.replace('Bearer ', '')
  const { data: userData, error: userError } = await admin.auth.getUser(token)
  if (userError || !userData.user) {
    return json({ error: 'Not authenticated' }, 401)
  }

  const { data: callerProfile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single()

  if (callerProfile?.role !== 'superadmin') {
    return json({ error: 'Only super admins can delete accounts' }, 403)
  }

  let payload: { user_id?: string }
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'Invalid request body' }, 400)
  }

  const targetId = payload.user_id ?? ''
  if (!targetId) return json({ error: 'Missing user_id' }, 400)

  if (targetId === userData.user.id) {
    return json({ error: 'You cannot delete your own account' }, 400)
  }

  const { data: target } = await admin
    .from('profiles')
    .select('role')
    .eq('id', targetId)
    .maybeSingle()

  if (!target) return json({ error: 'Account not found' }, 404)
  if (target.role !== 'admin') {
    return json({ error: 'Only admin accounts can be deleted' }, 400)
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(targetId)
  if (deleteError) return json({ error: deleteError.message }, 400)

  return json({ deleted: targetId })
})