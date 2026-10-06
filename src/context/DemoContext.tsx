import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Attempt } from '../types/database'
import { useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
const DemoContext = createContext<{ attempts: Attempt[]; record: (attempt: Attempt) => void }>({ attempts: [], record: () => {} })
export function DemoProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  // Version the curriculum so previous arithmetic attempts cannot unlock geometry missions.
  const storageKey = pathname.startsWith('/demo') ? 'nexus-spatial-v1-demo' : `nexus-spatial-v1-${user?.id ?? 'guest'}`
  return <ProgressProvider key={storageKey} storageKey={storageKey}>{children}</ProgressProvider>
}
function ProgressProvider({ children, storageKey }: { children: ReactNode; storageKey: string }) {
  const [attempts, setAttempts] = useState<Attempt[]>(() => {
    try { const data: unknown = JSON.parse(localStorage.getItem(storageKey) || '[]'); return Array.isArray(data) ? data.filter((item): item is Attempt => typeof item?.missionId === 'string' && Number.isInteger(item.correct) && Number.isInteger(item.total) && item.total > 0 && item.correct >= 0 && item.correct <= item.total && typeof item.date === 'string') : [] } catch { return [] }
  })
  function record(attempt: Attempt) { setAttempts(previous => { const next = [...previous, attempt]; try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch { /* Keep session progress when storage is unavailable. */ } return next }) }
  return <DemoContext.Provider value={{ attempts, record }}>{children}</DemoContext.Provider>
}
export function useDemo() { return useContext(DemoContext) }
