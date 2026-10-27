import type { Attempt, Mission, MissionDraft } from '../types/database'

export function validDraft(value: unknown, questionCount: number): value is MissionDraft {
  if (!value || typeof value !== 'object') return false
  const d = value as MissionDraft
  return Number.isInteger(d.step) && d.step >= 0 && d.step < questionCount && (d.answer === null || Number.isInteger(d.answer) && d.answer >= 0 && d.answer < 4) && typeof d.numericInput === 'string' && typeof d.notes === 'string' && d.notes.length <= 4000 && typeof d.checked === 'boolean' && Number.isInteger(d.correct) && d.correct >= 0 && d.correct <= d.step + Number(d.checked) && Array.isArray(d.mistakes) && d.mistakes.every(i => Number.isInteger(i) && i >= 0 && i <= d.step) && Array.isArray(d.responses) && d.responses.length <= questionCount && d.responses.every(n => n === null || typeof n === 'number' && Number.isFinite(n)) && Number.isInteger(d.hints) && d.hints >= 0 && d.hints <= 3 && (d.hintsByQuestion === undefined || Array.isArray(d.hintsByQuestion) && d.hintsByQuestion.length <= questionCount && d.hintsByQuestion.every(n => Number.isInteger(n) && n >= 0 && n <= 3)) && typeof d.updatedAt === 'string'
}
export function recommendMission(missions: Mission[], attempts: Attempt[], completed: Set<string>) {
  const latest = new Map<string, Attempt>()
  for (const attempt of attempts) latest.set(attempt.missionId, attempt)
  const review = missions.filter((mission, i) => (i === 0 || completed.has(missions[i - 1].id)) && latest.has(mission.id) && latest.get(mission.id)!.correct / latest.get(mission.id)!.total < 0.8)
    .sort((a, b) => latest.get(a.id)!.correct / latest.get(a.id)!.total - latest.get(b.id)!.correct / latest.get(b.id)!.total)[0]
  return { mission: review ?? missions.find(m => !completed.has(m.id)) ?? missions[0], review: Boolean(review) }
}
