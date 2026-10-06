import { useDemo } from '../context/DemoContext'
import { missions } from '../services/missions'
export function useMissionProgress() {
  const { attempts } = useDemo()
  const completed = new Set(attempts.filter(a => a.correct / a.total >= 0.6).map(a => a.missionId))
  const correct = attempts.reduce((sum, a) => sum + a.correct, 0)
  const total = attempts.reduce((sum, a) => sum + a.total, 0)
  return { attempts, completed, correct, accuracy: total ? Math.round(correct / total * 100) : 0, progress: Math.round(completed.size / missions.length * 100), isUnlocked: (index: number) => index >= 0 && index < missions.length && (index === 0 || completed.has(missions[index - 1].id)) }
}
