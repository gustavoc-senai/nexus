import { supabase } from '../lib/supabase'
export interface Message {id:string;class_id:string;student_id:string;author_id:string;author_name:string;body:string;created_at:string}
export interface VideoLesson {id:string;class_id:string;title:string;description:string;url:string;created_at:string}
export function validateVideoUrl(value:string): string | null { try {const url=new URL(value.trim());return url.protocol==='https:' && !url.username && !url.password ? url.href : null} catch {return null} }
export async function getMessages(classId:string,studentId:string): Promise<Message[]> {
 const {data,error}=await supabase.from('nexus_messages').select('*').eq('class_id',classId).eq('student_id',studentId).order('created_at',{ascending:false}).order('id',{ascending:false}).limit(100)
 if(error) throw error;return (data??[]).reverse()
}
export async function sendMessage(classId:string,studentId:string,body:string,requestId:string) {
 const {error}=await supabase.from('nexus_messages').insert({class_id:classId,student_id:studentId,body:body.trim(),request_id:requestId})
 if(error?.code==='23505') {const {data,error:lookup}=await supabase.from('nexus_messages').select('class_id,student_id,body').eq('request_id',requestId).single();if(!lookup&&data?.class_id===classId&&data.student_id===studentId&&data.body===body.trim())return}
 if(error) throw error
}
export async function listVideos(classId:string):Promise<VideoLesson[]> {const {data,error}=await supabase.from('nexus_video_lessons').select('*').eq('class_id',classId).order('created_at',{ascending:false});if(error)throw error;return data??[]}
export async function publishVideo(classId:string,title:string,description:string,value:string) {const url=validateVideoUrl(value);if(!url)throw Error('Informe um link HTTPS válido.');const {error}=await supabase.from('nexus_video_lessons').insert({class_id:classId,title:title.trim(),description:description.trim(),url});if(error)throw error}
export async function removeVideo(id:string) {const {error}=await supabase.from('nexus_video_lessons').delete().eq('id',id);if(error)throw error}