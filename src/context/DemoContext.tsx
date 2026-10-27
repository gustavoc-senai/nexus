import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Attempt, MissionDraft } from '../types/database'
import { useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { loadProgress, saveDraft, submitAttempt } from '../services/progress'

import { LearningContext } from './LearningContext'
export function DemoProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth()
  const { pathname } = useLocation()
  const demo = pathname.startsWith('/demo')
  const studentId = !demo && profile?.role === 'student' ? user?.id : undefined
  const storageKey = demo ? 'nexus-spatial-v1-demo' : 'nexus-spatial-v1-' + (user?.id ?? 'guest')
  return <ProgressProvider key={storageKey + (studentId ?? '')} storageKey={storageKey} studentId={studentId}>{children}</ProgressProvider>
}
function readStored<T>(key: string, fallback: T): T { try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback } catch { return fallback } }
function store(key: string, data: unknown) { try { localStorage.setItem(key, JSON.stringify(data)) } catch { /* Session state remains available when browser storage is disabled. */ } }
function ProgressProvider({ children, storageKey, studentId }: { children: ReactNode; storageKey: string; studentId?: string }) {
  const [attempts, setAttempts] = useState<Attempt[]>(() => {
    if (studentId) return []
    const data = readStored<unknown>(storageKey, [])
    return Array.isArray(data) ? data.filter((item): item is Attempt => typeof item?.missionId === 'string' && Number.isInteger(item.correct) && Number.isInteger(item.total) && item.total > 0 && item.correct >= 0 && item.correct <= item.total && typeof item.date === 'string') : []
  })
  const [drafts, setDrafts] = useState<Record<string, MissionDraft>>(() => { const value = readStored<unknown>(storageKey + '-drafts', {}); return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, MissionDraft> : {} })
  const [loading, setLoading] = useState(Boolean(studentId))
  const [error, setError] = useState('')
  const [online, setOnline] = useState(false)
  const [revision, setRevision] = useState(0)
  const queues = useRef(new Map<string, Promise<void>>())
  const pendingDrafts = useRef(new Map<string, MissionDraft>())
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())
  const enqueueDraft = useCallback((missionId: string, draft: MissionDraft | null) => {
    if (!studentId) return Promise.resolve()
    const previous = queues.current.get(missionId) ?? Promise.resolve()
    const queued = previous.catch(() => {}).then(() => saveDraft(studentId, missionId, draft)).catch(() => { setError('Seu rascunho está salvo neste navegador, mas a sincronização falhou. Tente conectar novamente.') })
    queues.current.set(missionId, queued)
    return queued
  }, [studentId])
  useEffect(() => {
    const activeTimers = timers.current, pending = pendingDrafts.current
    return () => {
      for (const timer of activeTimers.values()) clearTimeout(timer)
      for (const [missionId, draft] of pending) void enqueueDraft(missionId, draft)
    }
  }, [enqueueDraft])
  useEffect(() => {
    if (!studentId) return
    let active = true
    loadProgress().then(data => {
      if (!active) return
      setAttempts(data.attempts)
      setDrafts(local => {
        const merged = { ...data.drafts }
        for (const [id, draft] of Object.entries(local)) if (draft?.updatedAt && (!merged[id]?.updatedAt || draft.updatedAt > merged[id].updatedAt)) merged[id] = draft
        store(storageKey + '-drafts', merged)
        return merged
      })
      setOnline(true); setError('')
    }).catch(() => { if (active) { setOnline(false); setError('Não foi possível conectar seu progresso. Confira a conexão e a configuração do banco. Seus rascunhos continuam neste navegador.') } })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [studentId, storageKey, revision])
  const updateDraft = useCallback((missionId: string, draft: MissionDraft | null) => {
    setDrafts(previous => { const next = { ...previous }; if (draft) next[missionId] = draft; else delete next[missionId]; store(storageKey + '-drafts', next); return next })
    if (studentId) {
      clearTimeout(timers.current.get(missionId))
      if (draft) {
        pendingDrafts.current.set(missionId, draft)
        timers.current.set(missionId, setTimeout(() => {
          pendingDrafts.current.delete(missionId); timers.current.delete(missionId)
          void enqueueDraft(missionId, draft)
        }, 800))
      } else { pendingDrafts.current.delete(missionId); timers.current.delete(missionId); void enqueueDraft(missionId, null) }
    }
  }, [studentId, storageKey, enqueueDraft])
  async function record(attempt: Attempt, responses?: (number | null)[], requestId?: string) {
    if (studentId) {
      clearTimeout(timers.current.get(attempt.missionId)); timers.current.delete(attempt.missionId)
      const pending = pendingDrafts.current.get(attempt.missionId)
      pendingDrafts.current.delete(attempt.missionId)
      if (pending) await enqueueDraft(attempt.missionId, pending)
      else await queues.current.get(attempt.missionId)
    }
    const saved = studentId ? await submitAttempt(attempt.missionId, responses ?? [], requestId ?? crypto.randomUUID(), attempt.hintsByQuestion) : attempt
    setAttempts(previous => { const next = [...previous.filter(item => !saved.id || item.id !== saved.id), saved]; if (!studentId) store(storageKey, next); return next })
    updateDraft(attempt.missionId, null)
  }
  return <LearningContext.Provider value={{ attempts, drafts, record, updateDraft, loading, error, online, retry: () => { setLoading(true); setRevision(v => v + 1) } }}>{children}</LearningContext.Provider>
}
