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
  const admin = createClient(supabaseUrl, serviceKey)

  let payload: { username?: string; password?: string }
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'Invalid request body' }, 400)
  }

  const username = payload.username?.trim().toLowerCase() ?? ''
  const password = payload.password ?? ''

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return json(
      { error: 'Username must be 3-20 characters: letters, numbers, underscore' },
      400,
    )
  }
  if (password.length < 8) {
    return json({ error: 'Password must be at least 8 characters' }, 400)
  }

  const { data: existing } = await admin
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle()
  if (existing) return json({ error: 'Username is already taken' }, 409)

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email: `${username}@lgsportsdeck.com`,
      password,
      email_confirm: true,
    })
  if (createError || !created.user) {
    return json({ error: createError?.message ?? 'Failed to create user' }, 400)
  }

  const { error: profileError } = await admin.from('profiles').insert({
    id: created.user.id,
    username,
    full_name: null,
    role: 'player',
  })
  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id)
    return json({ error: profileError.message }, 400)
  }

  return json({ username }, 201)
})