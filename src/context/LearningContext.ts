import { createContext, useContext } from 'react'
import type { Attempt, MissionDraft } from '../types/database'
interface LearningContextData {
  attempts: Attempt[]; drafts: Record<string, MissionDraft>; loading: boolean; error: string; online: boolean
  record: (attempt: Attempt, responses?: (number | null)[], requestId?: string) => Promise<void>
  updateDraft: (missionId: string, draft: MissionDraft | null) => void
  retry: () => void
}
export const LearningContext = createContext<LearningContextData | null>(null)
export function useDemo() { const value = useContext(LearningContext); if (!value) throw new Error('Learning provider is required'); return value }
