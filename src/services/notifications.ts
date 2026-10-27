import { supabase } from '../lib/supabase'
export interface LearningNotice { id:string; title:string; description:string; path:string; date:string; urgent:boolean }
export async function listNotices(userId:string,teacher:boolean):Promise<LearningNotice[]> {
 const [tasks,messages,videos,completions]=await Promise.all([
   supabase.from('nexus_tasks').select('id,title,due_at,created_at').order('created_at',{ascending:false}).limit(100),
   supabase.from('nexus_messages').select('id,author_id,author_name,created_at').neq('author_id',userId).order('created_at',{ascending:false}).limit(100),
   teacher?Promise.resolve({data:[],error:null}):supabase.from('nexus_video_lessons').select('id,title,created_at').order('created_at',{ascending:false}).limit(100),
   teacher?Promise.resolve({data:[],error:null}):supabase.from('nexus_task_completions').select('task_id').eq('student_id',userId),
 ])
 for(const result of [tasks,messages,videos,completions])if(result.error)throw result.error
 const complete=new Set((completions.data??[]).map(c=>c.task_id)),now=Date.now()
 const notices:LearningNotice[]=[...(tasks.data??[]).filter(t=>teacher||!complete.has(t.id)).map(t=>{const due=new Date(t.due_at).getTime(),urgent=!teacher&&due-now<48*3600000;return {id:`task-${t.id}-${t.due_at}`,title:urgent?(due<now?'Tarefa com prazo encerrado':'Prazo se aproximando'):'Atividade da turma',description:`${t.title} · ${new Date(t.due_at).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',dateStyle:'short',timeStyle:'short'})} · Brasília`,path:'/tasks',date:t.created_at,urgent}}),...(messages.data??[]).map(m=>({id:`message-${m.id}`,title:'Nova mensagem',description:`${m.author_name||'Participante'} enviou uma mensagem.`,path:'/chat',date:m.created_at,urgent:false})),...(videos.data??[]).map(v=>({id:`video-${v.id}`,title:'Videoaula publicada',description:v.title,path:'/videos',date:v.created_at,urgent:false}))]
 if(!teacher){const {data,error}=await supabase.rpc('nexus_assigned_challenges');if(error)throw error;for(const q of data??[])notices.push({id:`challenge-${q.id}`,title:'Desafio publicado',description:q.title,path:'/classroom',date:q.created_at,urgent:false})}
 return notices.toSorted((a,b)=>Number(b.urgent)-Number(a.urgent)||b.date.localeCompare(a.date))
}
