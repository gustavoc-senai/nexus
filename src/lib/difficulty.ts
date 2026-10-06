import type { Difficulty } from '../types/database'
export const difficultyLabels: Record<Difficulty, string> = { easy: 'Fácil', intermediate: 'Intermediário', hard: 'Difícil' }
export const difficultyDescriptions: Record<Difficulty, string> = {
  easy: 'Aplicação direta de fórmulas e cálculo de medidas.',
  intermediate: 'Mais etapas, áreas de superfícies e medidas desconhecidas.',
  hard: 'Sólidos compostos, semelhança e problemas de várias etapas.',
}
