/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
export type UserRole = 'student' | 'teacher' | 'admin'
export interface Profile { id: string; full_name: string | null; email: string | null; phone: string | null; role: UserRole; avatar_url: string | null; is_active: boolean }
interface AuthContextData { user: User | null; session: Session | null; profile: Profile | null; loading: boolean; signIn: (email: string, password: string) => Promise<{ error: Error | null }>; signUp: (email: string, password: string, fullName: string, phone?: string, role?: 'student' | 'teacher') => Promise<{ error: Error | null }>; signOut: () => Promise<void>; refreshProfile: () => Promise<void> }
const AuthContext = createContext<AuthContextData | undefined>(undefined)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profileState, setProfileState] = useState<{ profile: Profile | null; userId: string; revision: number } | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [revision, setRevision] = useState(0)
  const user = session?.user ?? null
  const profile = user && profileState?.userId === user.id && profileState.revision === revision ? profileState.profile : null
  useEffect(() => {
    let active = true
    let changed = false
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active) return
      changed = true
      setSession(next)
      setInitializing(false)
    })
    void supabase.auth.getSession().then(({ data }) => { if (active && !changed) { setSession(data.session); setInitializing(false) } }).catch(() => { if (active) setInitializing(false) })
    return () => { active = false; subscription.unsubscribe() }
  }, [])
  useEffect(() => {
    let active = true
    if (!user?.id) return
    const userId = user.id
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15000)
    void Promise.resolve(supabase.from('profiles').select('id, full_name, email, phone, role, avatar_url, is_active').eq('id', user.id).abortSignal(controller.signal).maybeSingle()).then(({ data, error }) => {
      if (active) setProfileState({ profile: !error && data && ['student', 'teacher', 'admin'].includes(data.role) ? data as Profile : null, userId, revision })
    }).catch(() => { if (active) setProfileState({ profile: null, userId, revision }) }).finally(() => { clearTimeout(timer) })
    return () => { active = false; clearTimeout(timer); controller.abort() }
  }, [user?.id, revision])
  async function signIn(email: string, password: string) { const { error } = await supabase.auth.signInWithPassword({ email, password }); return { error: error ? new Error(error.message) : null } }
  async function signUp(email: string, password: string, fullName: string, phone?: string, role: 'student' | 'teacher' = 'student') { const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, phone: phone ?? null, signup_role: role === 'teacher' ? 'teacher' : 'student' } } }); return { error: error ? new Error(error.message) : null } }
  async function signOut() { const { error } = await supabase.auth.signOut(); if (error) throw error; setSession(null); setProfileState(null) }
  async function refreshProfile() { setRevision(v => v + 1) }
  const loading = initializing || Boolean(user && (profileState?.userId !== user.id || profileState?.revision !== revision))
  return <AuthContext.Provider value={{ user, session, profile, loading, signIn, signUp, signOut, refreshProfile }}>{children}</AuthContext.Provider>
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('useAuth deve ser utilizado dentro de um AuthProvider.'); return context }


