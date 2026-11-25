import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-emerald-700 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-bold text-white">
            LG Sports Deck · Admin
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-emerald-100">
              {profile?.full_name ?? profile?.username}
            </span>
            <Link to="/settings" className="text-sm text-emerald-100 hover:text-white">
              Settings
            </Link>
            <button
              onClick={handleSignOut}
              className="rounded-lg bg-emerald-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-900"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <p className="mt-2 text-slate-600">
          Court scheduling and management will appear here.
        </p>
      </main>
    </div>
  )
}