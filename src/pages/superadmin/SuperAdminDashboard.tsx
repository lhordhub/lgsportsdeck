import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

export default function SuperAdminDashboard() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-bold text-white">
            LG Sports Deck · Super Admin
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300">
              {profile?.full_name ?? profile?.username}
            </span>
            <button
              onClick={handleSignOut}
              className="rounded-lg bg-slate-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-600"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <p className="mt-2 text-slate-600">
          Admin account management will appear here.
        </p>
      </main>
    </div>
  )
}