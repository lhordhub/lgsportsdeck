import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Settings } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import BrandLogo from './BrandLogo'

const roleLabels = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  player: 'Player',
} as const

export default function DashboardHeader() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const displayName = profile?.full_name ?? profile?.username ?? ''
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <header className="bg-court sticky top-0 z-20 border-b border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <BrandLogo />

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden items-center gap-3 sm:flex">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient font-display font-bold text-navy-900">
              {initial}
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">{displayName}</p>
              <p className="text-xs text-gold-300">
                {profile ? roleLabels[profile.role] : ''}
              </p>
            </div>
          </div>

          <Link
            to="/settings"
            className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="bg-brand-gradient flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-navy-900 transition hover:brightness-105"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  )
}