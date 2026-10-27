import { supabase } from '../lib/supabase'
import type { Attempt, MissionDraft } from '../types/database'

export async function loadProgress() {
  const [attempts, drafts] = await Promise.all([
    supabase.from('nexus_attempts').select('id, mission_id, correct, total, created_at, mistakes, hints_used, hints_by_question').order('created_at').abortSignal(AbortSignal.timeout(15000)),
    supabase.from('nexus_drafts').select('mission_id, draft').abortSignal(AbortSignal.timeout(15000)),
  ])
  if (attempts.error) throw attempts.error
  if (drafts.error) throw drafts.error
  return {
    attempts: (attempts.data ?? []).map(row => ({ id: row.id, missionId: row.mission_id, correct: row.correct, total: row.total, date: row.created_at, mistakes: row.mistakes, hintsUsed: row.hints_used, hintsByQuestion: row.hints_by_question })) as Attempt[],
    drafts: Object.fromEntries((drafts.data ?? []).map(row => [row.mission_id, row.draft])) as Record<string, MissionDraft>,
  }
}
export async function submitAttempt(missionId: string, responses: (number | null)[], requestId: string, hints?: number[] | null): Promise<Attempt> {
  const { data, error } = await supabase.rpc(missionId.startsWith('basic-') ? 'nexus_submit_basic_attempt' : hints ? 'nexus_submit_tracked_attempt' : 'nexus_submit_attempt', { p_mission_id: missionId, p_answers: responses, p_request_id: requestId, ...(missionId.startsWith('basic-') ? {p_hints:hints??responses.map(()=>0)} : hints ? {p_hints:hints} : {}) }).abortSignal(AbortSignal.timeout(15000))
  if (error) throw error
  return { id: data.id, missionId: data.mission_id, correct: data.correct, total: data.total, date: data.created_at, mistakes: data.mistakes, hintsUsed: data.hints_used, hintsByQuestion: data.hints_by_question }
}
export async function saveDraft(userId: string, missionId: string, draft: MissionDraft | null) {
  const result = draft
    ? await supabase.from('nexus_drafts').upsert({ student_id: userId, mission_id: missionId, draft }, { onConflict: 'student_id,mission_id' }).abortSignal(AbortSignal.timeout(15000))
    : await supabase.from('nexus_drafts').delete().eq('student_id', userId).eq('mission_id', missionId).abortSignal(AbortSignal.timeout(15000))
  if (result.error) throw result.error
}
