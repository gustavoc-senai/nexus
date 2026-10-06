import type { Question } from '../types/database'

export function parseNumericAnswer(input: string): number | null {
  const normalized = input.trim().replace(',', '.')
  if (!/^[+-]?\d+(?:\.\d+)?$/.test(normalized)) return null
  const value = Number(normalized)
  return Number.isFinite(value) ? value : null
}

export function isNumericAnswerCorrect(input: string, expected: number): boolean {
  const value = parseNumericAnswer(input)
  return value !== null && Math.abs(value - expected) <= 1e-9
}

export function answerLabel(question: Question) {
  return question.numericAnswer !== undefined
    ? `${question.numericAnswer.toLocaleString('pt-BR')} ${question.unit ?? ''}`.trim()
    : question.options[question.answer]
}
