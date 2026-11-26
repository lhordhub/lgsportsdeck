import { CalendarCheck, Clock, MapPin } from 'lucide-react'
import DashboardHeader from '../../components/DashboardHeader'
import { useAuth } from '../../context/useAuth'

const cards = [
  {
    title: 'Courts',
    text: 'Browse all available courts.',
    icon: MapPin,
    tone: 'bg-gold-400/20 text-gold-600',
  },
  {
    title: 'Availability',
    text: 'See open time slots at a glance.',
    icon: Clock,
    tone: 'bg-orange-500/15 text-orange-600',
  },
  {
    title: 'My games',
    text: 'Track your upcoming games.',
    icon: CalendarCheck,
    tone: 'bg-navy-900/10 text-navy-800',
  },
]

export default function PlayerHome() {
  const { profile } = useAuth()

  return (
    <div className="min-h-screen bg-cream-100">
      <DashboardHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <section className="bg-court animate-fade-up relative overflow-hidden rounded-3xl p-8 sm:p-10">
          <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 animate-float rounded-full bg-brand-gradient opacity-90 shadow-glow" />
          <div className="pointer-events-none absolute bottom-6 right-32 h-10 w-10 animate-bounce-ball rounded-full bg-gold-400/80" />
          <div className="relative z-10 max-w-lg">
            <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to play,{' '}
              <span className="text-brand-gradient">{profile?.username}</span>?
            </h1>
            <p className="mt-2 text-slate-300">
              Find a court and get your next game on the calendar.
            </p>
          </div>
        </section>

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