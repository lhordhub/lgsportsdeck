import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

export default function PlayerHome() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-emerald-600 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-bold text-white">LG Sports Deck</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-emerald-50">
              {profile?.full_name ?? profile?.username}
            </span>
            <button
              onClick={handleSignOut}
              className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <h2 className="text-2xl font-bold text-slate-800">Courts</h2>
        <p className="mt-2 text-slate-600">
          Court availability will appear here.
        </p>
      </main>
    </div>
  )
}