import { supabase } from '../lib/supabase'
export interface Task {id:string;class_id:string;title:string;activities:string;due_at:string;mission_ids?:string[];created_at?:string}
export interface Completion {task_id:string;student_id:string;completed_at:string}
export async function listTasks(classId:string):Promise<Task[]> {const {data,error}=await supabase.from('nexus_tasks').select('*').eq('class_id',classId).order('due_at');if(error)throw error;return data??[]}
export async function listCompletions():Promise<Completion[]> {const {data,error}=await supabase.from('nexus_task_completions').select('*');if(error)throw error;return data??[]}
export async function saveTask(classId:string,title:string,activities:string,due:string,id?:string,missionIds:string[]=[]) {const patch={title:title.trim(),activities:activities.trim(),due_at:due,mission_ids:missionIds};const result=id?await supabase.from('nexus_tasks').update(patch).eq('id',id).select('id').single():await supabase.from('nexus_tasks').insert({class_id:classId,...patch});if(result.error)throw result.error}
export async function completeTask(id:string) {const {error}=await supabase.from('nexus_task_completions').insert({task_id:id});if(error&&error.code!=='23505')throw error}
export function deadlineIso(local:string) {return new Date(local+'-03:00').toISOString()}
export function localDeadline(iso:string) {return new Date(new Date(iso).getTime()-3*3600000).toISOString().slice(0,16)}