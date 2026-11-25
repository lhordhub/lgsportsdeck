import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { supabase } from '../../lib/supabase'
import type { Profile } from '../../context/auth-context'
import CreateAdminForm from '../../components/CreateAdminForm'

export default function SuperAdminDashboard() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState<Profile[]>([])
  const [loadingList, setLoadingList] = useState(true)

  const loadAccounts = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, full_name, role')
      .in('role', ['admin', 'superadmin'])
      .order('created_at', { ascending: true })
    setAccounts((data as Profile[]) ?? [])
    setLoadingList(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAccounts()
  }, [loadAccounts])

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

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-8 lg:grid-cols-2">
        <section>
          <CreateAdminForm onCreated={loadAccounts} />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800">
            Admin accounts
          </h2>
          {loadingList ? (
            <p className="mt-4 text-slate-600">Loading...</p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Username</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <tr key={account.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 text-slate-800">
                        {account.username}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {account.full_name ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {account.role}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}