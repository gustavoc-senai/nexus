import { supabase } from '../lib/supabase'
import { missions } from './missions'
import { listMembers } from './classroom'
export interface StudentRecord { id: string; name: string; initials: string; className: string; progress: number; accuracy: number; attempts: number; hints: number | null }
export interface PerformanceAttempt { id: string; student_id: string; mission_id: string; correct: number; total: number; created_at: string; mistakes: number[]; hints_used?: number | null; hints_by_question?: number[] | null }
export interface CustomAttempt { id: string; student_id: string; challenge_id: string; correct: boolean; created_at: string }
export async function listCustomPerformance(): Promise<CustomAttempt[]> { const { data, error } = await supabase.from('nexus_custom_attempts').select('*').order('created_at'); if (error) throw error; return data ?? [] }
export async function listPerformance(): Promise<PerformanceAttempt[]> { const { data, error } = await supabase.from('nexus_attempts').select('*').neq('mission_id','basic-diagnostic').order('created_at'); if (error) throw error; return data ?? [] }
export async function listStudents(): Promise<StudentRecord[]> {
  const [members, attempts] = await Promise.all([listMembers(), listPerformance()])
  const students = new Map<string, StudentRecord>()
  for (const member of members) {
    const results = attempts.filter(a => a.student_id === member.student_id)
    const completed = new Set(results.filter(a => missions.some(m=>m.id===a.mission_id) && a.correct / a.total >= 0.6).map(a => a.mission_id))
    const total = results.reduce((sum, a) => sum + a.total, 0), correct = results.reduce((sum, a) => sum + a.correct, 0)
    const existing = students.get(member.student_id)
    students.set(member.student_id, { id: member.student_id, name: member.name, initials: member.name.trim().split(/\s+/).slice(0, 2).map(n => n[0]).join(''), className: existing ? existing.className + ', ' + member.class_name : member.class_name, attempts: results.length, hints: results.some(a=>a.hints_used!=null) ? results.reduce((sum,a)=>sum+(a.hints_used??0),0) : null, progress: Math.round(completed.size / missions.length * 100), accuracy: total ? Math.round(correct / total * 100) : 0 })
  }
  return [...students.values()]
}
