import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function AuthCallback() {
  const { session, profile, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return

    if (!session || !profile) {
      navigate('/login', { replace: true })
      return
    }

    if (profile.role === 'superadmin') navigate('/superadmin', { replace: true })
    else if (profile.role === 'admin') navigate('/admin', { replace: true })
    else navigate('/player', { replace: true })
  }, [session, profile, loading, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-emerald-600">
      <p className="text-lg font-semibold text-white">Signing you in...</p>
    </div>
  )
}