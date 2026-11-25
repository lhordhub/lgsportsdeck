import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'

export type Role = 'player' | 'admin' | 'superadmin'

export interface Profile {
  id: string
  username: string
  full_name: string | null
  role: Role
}

export interface AuthState {
  session: Session | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthState | undefined>(undefined)