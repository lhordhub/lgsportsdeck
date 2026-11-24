import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase.ts'

function App() {
  const [status, setStatus] = useState('Checking connection...')

  useEffect(() => {
    supabase.auth.getSession().then(({ error }) => {
      setStatus(error ? `Error: ${error.message}` : 'Connected to Supabase')
    })
  }, [])

  return (
    <div className="min-h-screen bg-emerald-600 flex items-center justify-center">
      <h1 className="text-4xl font-bold text-white">{status}</h1>
    </div>
  )
}

export default App