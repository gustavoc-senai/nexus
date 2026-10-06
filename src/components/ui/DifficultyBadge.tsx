import { SignalLow, SignalMedium, SignalHigh } from 'lucide-react'
import type { Difficulty } from '../../types/database'
import { difficultyLabels } from '../../lib/difficulty'
export function DifficultyBadge({ level }: { level: Difficulty }) {
  const Icon = { easy: SignalLow, intermediate: SignalMedium, hard: SignalHigh }[level]
  return <span className={`badge difficulty-${level}`}><Icon size={14} />{difficultyLabels[level]}</span>
}
