import { CalendarClock, ClipboardList, LayoutGrid } from 'lucide-react'
import DashboardHeader from '../../components/DashboardHeader'
import { useAuth } from '../../context/useAuth'

const cards = [
  {
    title: 'Courts',
    text: 'Add, edit, and activate courts.',
    icon: LayoutGrid,
    tone: 'bg-gold-400/20 text-gold-600',
  },
  {
    title: 'Schedules',
    text: 'Set court hours and time slots.',
    icon: CalendarClock,
    tone: 'bg-orange-500/15 text-orange-600',
  },
  {
    title: 'Bookings',
    text: 'Review and manage reservations.',
    icon: ClipboardList,
    tone: 'bg-navy-900/10 text-navy-800',
  },
]

export default function AdminDashboard() {
  const { profile } = useAuth()

  return (
    <div className="min-h-screen bg-cream-100">
      <DashboardHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="animate-fade-up">
          <h1 className="text-3xl font-extrabold text-navy-900">
            Hello, <span className="text-brand-gradient">{profile?.username}</span>
          </h1>
          <p className="mt-1 text-slate-500">
            Manage your courts and schedules.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {cards.map(({ title, text, icon: Icon, tone }) => (
            <div
              key={title}
              className="animate-fade-up rounded-2xl border border-cream-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${tone}`}
              >
                <Icon className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-lg font-bold text-navy-900">{title}</h2>
              <p className="mt-1 text-sm text-slate-500">{text}</p>
              <span className="mt-3 inline-block rounded-full bg-cream-200 px-3 py-1 text-xs font-semibold text-orange-600">
                Coming soon
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}