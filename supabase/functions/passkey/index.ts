import { createClient } from 'npm:@supabase/supabase-js@2'
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from 'npm:@simplewebauthn/server@13'
import { isoBase64URL } from 'npm:@simplewebauthn/server@13/helpers'

const RP_NAME = 'LG Sports Deck'
const RP_ID = 'localhost'
const RP_ORIGIN = 'http://localhost:5173'
const CHALLENGE_TTL_MS = 5 * 60 * 1000

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

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  let payload: Record<string, any>
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'Invalid request body' }, 400)
  }

  const action = payload.action as string

  async function getCaller() {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return null
    const token = authHeader.replace('Bearer ', '')
    const { data, error } = await admin.auth.getUser(token)
    if (error || !data.user) return null
    return data.user
  }

  async function takeChallenge(id: string, type: 'register' | 'login') {
    const { data } = await admin
      .from('passkey_challenges')
      .select('id, challenge, user_id, type, created_at')
      .eq('id', id)
      .maybeSingle()
    if (!data) return null
    await admin.from('passkey_challenges').delete().eq('id', id)
    if (data.type !== type) return null
    if (Date.now() - new Date(data.created_at).getTime() > CHALLENGE_TTL_MS) {
      return null
    }
    return data
  }

  if (action === 'register-options') {
    const user = await getCaller()
    if (!user) return json({ error: 'Not authenticated' }, 401)

    const { data: existing } = await admin
      .from('passkeys')
      .select('id, transports')
      .eq('user_id', user.id)

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userName: user.email ?? user.id,
      userID: new TextEncoder().encode(user.id),
      attestationType: 'none',
      excludeCredentials: (existing ?? []).map((p) => ({
        id: p.id,
        transports: p.transports ?? undefined,
      })),
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'required',
      },
    })

    const { data: stored, error } = await admin
      .from('passkey_challenges')
      .insert({
        challenge: options.challenge,
        user_id: user.id,
        type: 'register',
      })
      .select('id')
      .single()
    if (error || !stored) return json({ error: 'Could not start' }, 500)

    return json({ options, challenge_id: stored.id })
  }

  if (action === 'register-verify') {
    const user = await getCaller()
    if (!user) return json({ error: 'Not authenticated' }, 401)

    const challenge = await takeChallenge(payload.challenge_id, 'register')
    if (!challenge || challenge.user_id !== user.id) {
      return json({ error: 'Challenge expired, try again' }, 400)
    }

    let verification
    try {
      verification = await verifyRegistrationResponse({
        response: payload.response,
        expectedChallenge: challenge.challenge,
        expectedOrigin: RP_ORIGIN,
        expectedRPID: RP_ID,
        requireUserVerification: true,
      })
    } catch (e) {
      return json({ error: (e as Error).message }, 400)
    }

    if (!verification.verified || !verification.registrationInfo) {
      return json({ error: 'Fingerprint could not be verified' }, 400)
    }

    const { credential } = verification.registrationInfo
    const { error } = await admin.from('passkeys').insert({
      id: credential.id,
      user_id: user.id,
      public_key: isoBase64URL.fromBuffer(credential.publicKey),
      counter: credential.counter,
      transports: credential.transports ?? null,
    })
    if (error) return json({ error: error.message }, 400)

    return json({ verified: true })
  }

  if (action === 'login-options') {
    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      userVerification: 'required',
    })

    const { data: stored, error } = await admin
      .from('passkey_challenges')
      .insert({ challenge: options.challenge, type: 'login' })
      .select('id')
      .single()
    if (error || !stored) return json({ error: 'Could not start' }, 500)

    return json({ options, challenge_id: stored.id })
  }

  if (action === 'login-verify') {
    const challenge = await takeChallenge(payload.challenge_id, 'login')
    if (!challenge) return json({ error: 'Challenge expired, try again' }, 400)

    const credentialId = payload.response?.id as string
    const { data: passkey } = await admin
      .from('passkeys')
      .select('id, user_id, public_key, counter, transports')
      .eq('id', credentialId)
      .maybeSingle()
    if (!passkey) return json({ error: 'Fingerprint not registered' }, 400)

    let verification
    try {
      verification = await verifyAuthenticationResponse({
        response: payload.response,
        expectedChallenge: challenge.challenge,
        expectedOrigin: RP_ORIGIN,
        expectedRPID: RP_ID,
        requireUserVerification: true,
        credential: {
          id: passkey.id,
          publicKey: isoBase64URL.toBuffer(passkey.public_key),
          counter: Number(passkey.counter),
          transports: passkey.transports ?? undefined,
        },
      })
    } catch (e) {
      return json({ error: (e as Error).message }, 400)
    }

    if (!verification.verified) {
      return json({ error: 'Fingerprint could not be verified' }, 400)
    }

    await admin
      .from('passkeys')
      .update({ counter: verification.authenticationInfo.newCounter })
      .eq('id', passkey.id)

    const { data: userData, error: userError } =
      await admin.auth.admin.getUserById(passkey.user_id)
    if (userError || !userData.user?.email) {
      return json({ error: 'Account not found' }, 400)
    }

    const { data: link, error: linkError } =
      await admin.auth.admin.generateLink({
        type: 'magiclink',
        email: userData.user.email,
      })
    if (linkError || !link.properties?.hashed_token) {
      return json({ error: 'Could not create session' }, 500)
    }

    return json({ token_hash: link.properties.hashed_token })
  }

  return json({ error: 'Unknown action' }, 400)
})