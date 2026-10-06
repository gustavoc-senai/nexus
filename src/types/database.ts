export interface Solid { shape: 'cube' | 'prism' | 'cylinder' | 'cone' | 'pyramid' | 'sphere'; label: string; dimensions?: string[]; variant?: 'cylinder-hemisphere' | 'cylinder-cone' | 'joined-cubes' | 'drilled-cube' | 'hollow-sphere' | 'hollow-prism' | 'open-cube' | 'space-diagonal' }
export type Difficulty = 'easy' | 'intermediate' | 'hard'
export interface Question { prompt: string; options: string[]; answer: number; explanation: string; solid: Solid; numericAnswer?: number; unit?: string }
export interface Mission { id: string; title: string; subject: string; difficulty: Difficulty; description: string; icon: 'energy' | 'navigation' | 'communication' | 'life'; objectives: string[]; formulas: string[]; questions: Question[] }
export interface Attempt { missionId: string; correct: number; total: number; date: string }
