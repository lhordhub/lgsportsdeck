import { useCallback, useEffect, useState } from 'react'
import { ShieldCheck, Trash2, UserCog, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Profile } from '../../context/auth-context'
import CreateAdminForm from '../../components/CreateAdminForm'
import DashboardHeader from '../../components/DashboardHeader'

export default function SuperAdminDashboard() {
  const [accounts, setAccounts] = useState<Profile[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [deleteError, setDeleteError] = useState<string | null>(null)

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

  async function handleDelete(account: Profile) {
    setDeleteError(null)
    if (
      !window.confirm(
        `Delete admin "${account.username}"? This cannot be undone.`,
      )
    ) {
      return
    }

    const { error } = await supabase.functions.invoke('delete-admin', {
      body: { user_id: account.id },
    })

    if (error) {
      let message = error.message
      const response = (error as { context?: Response }).context
      if (response) {
        try {
          const body = await response.json()
          if (body?.error) message = body.error
        } catch {
          message = error.message
        }
      }
      setDeleteError(message)
      return
    }

    await loadAccounts()
  }

  const adminCount = accounts.filter((a) => a.role === 'admin').length
  const superAdminCount = accounts.filter((a) => a.role === 'superadmin').length

  return (
    <div className="min-h-screen bg-cream-100">
      <DashboardHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="animate-fade-up">
          <h1 className="text-3xl font-extrabold text-navy-900">
            Super Admin <span className="text-brand-gradient">Dashboard</span>
          </h1>
          <p className="mt-1 text-slate-500">
            Manage who can run the courts.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="animate-fade-up rounded-2xl border border-cream-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400/20 text-gold-600">
                <Users className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm text-slate-500">Total accounts</p>
                <p className="font-display text-2xl font-bold text-navy-900">
                  {accounts.length}
                </p>
              </div>
            </div>
          </div>

          <div className="animate-fade-up rounded-2xl border border-cream-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/15 text-orange-600">
                <UserCog className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm text-slate-500">Admins</p>
                <p className="font-display text-2xl font-bold text-navy-900">
                  {adminCount}
                </p>
              </div>
            </div>
          </div>

          <div className="animate-fade-up rounded-2xl border border-cream-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900/10 text-navy-800">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm text-slate-500">Super admins</p>
                <p className="font-display text-2xl font-bold text-navy-900">
                  {superAdminCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section>
            <CreateAdminForm onCreated={loadAccounts} />
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900">Admin accounts</h2>
            {deleteError && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {deleteError}
              </p>
            )}
            {loadingList ? (
              <p className="mt-4 text-slate-500">Loading...</p>
            ) : (
              <div className="mt-4 overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-navy-900 text-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-medium">Username</th>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Role</th>
                        <th className="px-4 py-3 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((account) => (
                        <tr
                          key={account.id}
                          className="border-t border-cream-200 transition hover:bg-cream-50"
                        >
                          <td className="px-4 py-3 font-medium text-navy-900">
                            {account.username}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {account.full_name ?? '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={
                                account.role === 'superadmin'
                                  ? 'rounded-full bg-gold-400/25 px-3 py-1 text-xs font-semibold text-gold-600'
                                  : 'rounded-full bg-orange-500/15 px-3 py-1 text-xs font-semibold text-orange-600'
                              }
                            >
                              {account.role === 'superadmin'
                                ? 'Super admin'
                                : 'Admin'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {account.role === 'admin' && (
                              <button
                                type="button"
                                onClick={() => handleDelete(account)}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}