import { supabase } from '../lib/supabase'
import type { Difficulty, Solid } from '../types/database'
export interface Classroom { id: string; teacher_id: string; name: string; join_code: string; archived: boolean }
export interface Member { class_id: string; student_id: string; name: string; class_name: string }
export interface ClassPreview { id: string; name: string; teacher_name: string; already_member: boolean }
export async function findClassByCode(code: string): Promise<ClassPreview> { const { data, error } = await supabase.rpc('nexus_find_class', { p_code: code.trim().toUpperCase() }).abortSignal(AbortSignal.timeout(15000)); if (error) throw error; return data }
export interface TeacherQuestion { id: string; teacher_id: string; class_id: string | null; title: string; prompt: string; numeric_answer: number; unit: string; explanation: string; difficulty: Difficulty; shape: Solid['shape'] }
export type AssignedQuestion = Omit<TeacherQuestion, 'teacher_id' | 'numeric_answer' | 'explanation'>
export async function listClasses(): Promise<Classroom[]> { const { data, error } = await supabase.from('nexus_classes').select('*').order('created_at'); if (error) throw error; return data ?? [] }
export async function createClass(name: string, teacherId: string) { const { error } = await supabase.from('nexus_classes').insert({ name, teacher_id: teacherId }); if (error) throw error }
export async function updateClass(id: string, patch: { name?: string; archived?: boolean }) { const { error } = await supabase.from('nexus_classes').update(patch).eq('id', id).select('id').single(); if (error) throw error }
export async function joinClass(code: string) { const { error } = await supabase.rpc('nexus_join_class', { p_code: code.trim().toUpperCase() }); if (error) throw error }
export async function listMembers(): Promise<Member[]> { const { data, error } = await supabase.rpc('nexus_roster'); if (error) throw error; return data ?? [] }
export async function removeMember(classId: string, studentId: string) { const { error } = await supabase.from('nexus_memberships').delete().eq('class_id', classId).eq('student_id', studentId); if (error) throw error }
export async function listTeacherQuestions(): Promise<TeacherQuestion[]> { const { data, error } = await supabase.from('nexus_challenges').select('*').order('created_at'); if (error) throw error; return data ?? [] }
export async function saveTeacherQuestion(question: Omit<TeacherQuestion, 'id'> & { id?: string }) { const result = question.id ? await supabase.from('nexus_challenges').update(question).eq('id', question.id).select('id').single() : await supabase.from('nexus_challenges').insert(question); if (result.error) throw result.error }
export async function assignedQuestions(): Promise<AssignedQuestion[]> { const { data, error } = await supabase.rpc('nexus_assigned_challenges'); if (error) throw error; return data ?? [] }
export async function answerAssignedQuestion(id: string, answer: number, requestId: string): Promise<{ correct: boolean; explanation: string }> { const { data, error } = await supabase.rpc('nexus_answer_challenge', { p_id: id, p_answer: answer, p_request_id: requestId }); if (error) throw error; return data }
