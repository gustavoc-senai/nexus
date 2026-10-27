import test, { after, before } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'
import { missions } from '../src/services/missions.ts'
const db = new PGlite()
const student = '11111111-1111-4111-8111-111111111111'
const otherStudent = '22222222-2222-4222-8222-222222222222'
const teacher = '33333333-3333-4333-8333-333333333333'
const otherTeacher = '44444444-4444-4444-8444-444444444444'
let classId, questionId
async function identity(id) {
  await db.exec('reset role')
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id ?? ''])
  await db.exec('set role authenticated')
}
const answers = missions[0].questions.map(q => q.numericAnswer ?? q.answer)
before(async () => {
  await db.exec(`create role anon; create role authenticated;
    create schema auth;
    create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema auth to authenticated,anon;
    grant execute on function auth.uid() to authenticated,anon;`)
  await db.exec(readFileSync(new URL('../supabase/schema.sql', import.meta.url), 'utf8'))
  await db.exec(readFileSync(new URL('../supabase/class-enrollment.sql', import.meta.url), 'utf8'))
  await db.exec(readFileSync(new URL('../supabase/mission-analytics.sql', import.meta.url), 'utf8'))
  await db.exec(readFileSync(new URL('../supabase/classroom-support.sql', import.meta.url), 'utf8'))
  await db.exec(readFileSync(new URL('../supabase/classroom-tasks.sql', import.meta.url), 'utf8'))
  await db.exec(readFileSync(new URL('../supabase/registration-roles.sql', import.meta.url), 'utf8'))
  await db.exec(readFileSync(new URL('../supabase/learning-paths.sql', import.meta.url), 'utf8'))
  await db.exec(readFileSync(new URL('../supabase/learning-paths.sql', import.meta.url), 'utf8'))
  // Emulate legacy permissive policies/grants; restrictive scope and triggers must still protect profiles.
  await db.exec('grant insert,update,delete on public.profiles to authenticated; create policy legacy_profile_access on public.profiles for all to authenticated using(true) with check(true);')
  await db.exec(readFileSync(new URL('../supabase/catalog.sql', import.meta.url), 'utf8'))
  for (const [id, name] of [[student,'Aluno A'],[otherStudent,'Aluno B'],[teacher,'Professor A'],[otherTeacher,'Professor B']]) await db.query('insert into auth.users(id,email,raw_user_meta_data) values($1,$2,$3::jsonb)',[id,id+'@example.invalid',JSON.stringify({ full_name:name, role:'admin' })])
  await db.query("update public.profiles set role='teacher' where id in ($1,$2)",[teacher,otherTeacher])
  await identity(teacher)
  classId = (await db.query("insert into public.nexus_classes(teacher_id,name) values($1,'9º ano A') returning id",[teacher])).rows[0].id
  questionId = (await db.query("insert into public.nexus_challenges(teacher_id,class_id,title,prompt,numeric_answer,unit,explanation,difficulty,shape) values($1,$2,'Volume do cubo','Calcule o volume de um cubo de aresta 3 m.',27,'m³','V = a³ = 3³ = 27 m³.','easy','cube') returning id",[teacher,classId])).rows[0].id
})
after(async () => { await db.close() })
test('signup permits teacher choice once and never accepts an admin role', async () => {
 await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub','',false)")
 const chosen='55555555-5555-4555-8555-555555555555',invalid='66666666-6666-4666-8666-666666666666'
 await db.query("insert into auth.users(id,email,raw_user_meta_data) values($1,'teacher@example.invalid',$2::jsonb)",[chosen,JSON.stringify({full_name:'Novo professor',signup_role:'teacher'})])
 await db.query("insert into auth.users(id,email,raw_user_meta_data) values($1,'invalid@example.invalid',$2::jsonb)",[invalid,JSON.stringify({signup_role:'admin',role:'admin'})])
 assert.equal((await db.query('select role from public.profiles where id=$1',[chosen])).rows[0].role,'teacher')
 assert.equal((await db.query('select role from public.profiles where id=$1',[invalid])).rows[0].role,'student')
 await db.query("update auth.users set raw_user_meta_data='{"+String.fromCharCode(34)+"signup_role"+String.fromCharCode(34)+":"+String.fromCharCode(34)+"teacher"+String.fromCharCode(34)+"}' where id=$1",[invalid])
 assert.equal((await db.query('select role from public.profiles where id=$1',[invalid])).rows[0].role,'student')
 await identity(invalid);await assert.rejects(db.query("update public.profiles set role='teacher' where id=$1",[invalid]))
})

test('sign-up metadata never assigns privileged roles', async () => {
  await identity(student)
  assert.equal((await db.query('select role from public.profiles where id=$1',[student])).rows[0].role,'student')
  await assert.rejects(db.query("update public.profiles set role='teacher' where id=$1",[student]))
  assert.equal((await db.query('select id from public.profiles')).rows.length,1)
})
test('students cannot create classes, read teacher answers or impersonate another account', async () => {
  await identity(student)
  await assert.rejects(db.query("insert into public.nexus_classes(teacher_id,name) values($1,'Minha turma')",[student]))
  assert.equal((await db.query('select * from public.nexus_challenges')).rows.length,0)
  await assert.rejects(db.query("insert into public.nexus_drafts(student_id,mission_id,draft) values($1,'energia','{}')",[otherStudent]))
  await assert.rejects(db.query('select public.nexus_roster()'))
})
test('class codes scope assignments and teachers see only their own roster', async () => {
  await identity(teacher)
  const code = (await db.query('select join_code from public.nexus_classes where id=$1',[classId])).rows[0].join_code
  assert.match(code,/^[A-F0-9]{12}$/)
  await assert.rejects(db.query('select public.nexus_find_class($1)',[code]))
  await identity(student)
  await assert.rejects(db.query("select public.nexus_find_class('UNKNOWN')"))
  const preview = (await db.query('select public.nexus_find_class($1) as result',[code.toLowerCase()])).rows[0].result
  assert.equal(preview.name,'9º ano A'); assert.equal(preview.teacher_name,'Professor A'); assert.equal(preview.already_member,false)
  assert.deepEqual(Object.keys(preview).sort(),['already_member','id','name','teacher_name'])
  await assert.rejects(db.query("select public.nexus_join_class('UNKNOWN')"))
  await db.query('select public.nexus_join_class($1)',[code])
  await db.query('select public.nexus_join_class($1)',[code])
  assert.equal((await db.query('select public.nexus_find_class($1) as result',[code])).rows[0].result.already_member,true)
  assert.equal((await db.query('select * from public.nexus_memberships')).rows.length,1)
  const assigned = (await db.query('select public.nexus_assigned_challenges() as result')).rows[0].result
  assert.equal(assigned.length,1); assert.equal(assigned[0].numeric_answer,undefined); assert.equal(assigned[0].explanation,undefined)
  await identity(otherStudent)
  assert.deepEqual((await db.query('select public.nexus_assigned_challenges() as result')).rows[0].result,[])
  await assert.rejects(db.query('select public.nexus_answer_challenge($1,27,$2)',[questionId,crypto.randomUUID()]))
  await identity(otherTeacher)
  assert.equal((await db.query('select * from public.nexus_classes')).rows.length,0)
  assert.deepEqual((await db.query('select public.nexus_roster() as result')).rows[0].result,[])
  assert.equal((await db.query('update public.nexus_classes set archived=true where id=$1 returning id',[classId])).rows.length,0)
  await identity(teacher)
  assert.equal((await db.query('select public.nexus_roster() as result')).rows[0].result[0].student_id,student)
  await assert.rejects(db.query('update public.nexus_challenges set teacher_id=$1 where id=$2',[otherTeacher,questionId]))
})
test('grading is server-owned, prerequisites enforced and retries idempotent', async () => {
  await identity(student)
  await assert.rejects(db.query('select public.nexus_submit_attempt($1,$2::jsonb,$3)',[missions[1].id,JSON.stringify(answers),crypto.randomUUID()]))
  await assert.rejects(db.query('select public.nexus_submit_attempt($1,$2::jsonb,$3)',['energia','[]',crypto.randomUUID()]))
  const key=crypto.randomUUID()
  const result=(await db.query('select public.nexus_submit_attempt($1,$2::jsonb,$3) as result',['energia',JSON.stringify(answers),key])).rows[0].result
  assert.equal(result.correct,6); assert.deepEqual(result.mistakes,[])
  const repeated=(await db.query('select public.nexus_submit_attempt($1,$2::jsonb,$3) as result',['energia',JSON.stringify(answers),key])).rows[0].result
  assert.equal(repeated.id,result.id)
  assert.equal((await db.query('select * from public.nexus_attempts')).rows.length,1)
  await assert.rejects(db.query('update public.nexus_attempts set correct=0'))
  const wrong=[...answers]; wrong[0]=99
  const failed=(await db.query('select public.nexus_submit_attempt($1,$2::jsonb,$3) as result',['energia',JSON.stringify(wrong),crypto.randomUUID()])).rows[0].result
  assert.equal(failed.correct,5); assert.deepEqual(failed.mistakes,[0])
  await identity(otherStudent)
  assert.equal((await db.query('select * from public.nexus_attempts')).rows.length,0)
  await identity(otherTeacher)
  assert.equal((await db.query('select * from public.nexus_attempts')).rows.length,0)
  await identity(teacher)
  assert.equal((await db.query('select * from public.nexus_attempts')).rows.length,2)
  await assert.rejects(db.query('select public.nexus_submit_attempt($1,$2::jsonb,$3)',['energia',JSON.stringify(answers),crypto.randomUUID()]))
})
test('drafts survive upsert but cannot be read by teachers or other students', async () => {
  await identity(student)
  await db.query("insert into public.nexus_drafts(student_id,mission_id,draft) values($1,'energia',$2::jsonb) on conflict(student_id,mission_id) do update set draft=excluded.draft",[student,JSON.stringify({step:2,notes:'3³'})])
  assert.equal((await db.query('select draft from public.nexus_drafts')).rows[0].draft.notes,'3³')
  await assert.rejects(db.query('update public.nexus_drafts set student_id=$1',[otherStudent]))
  await identity(teacher)
  assert.equal((await db.query('select * from public.nexus_drafts')).rows.length,0)
  await identity(otherStudent)
  assert.equal((await db.query('select * from public.nexus_drafts')).rows.length,0)
})
test('assigned exercise grades persist and archived classes revoke access', async () => {
  await identity(student)
  const key=crypto.randomUUID()
  assert.equal((await db.query('select public.nexus_answer_challenge($1,27,$2) as result',[questionId,key])).rows[0].result.correct,true)
  await db.query('select public.nexus_answer_challenge($1,27,$2)',[questionId,key])
  assert.equal((await db.query('select * from public.nexus_custom_attempts')).rows.length,1)
  await identity(teacher)
  await db.query('update public.nexus_classes set archived=true where id=$1',[classId])
  await identity(student)
  await assert.rejects(db.query("select public.nexus_find_class((select join_code from public.nexus_classes where id=$1))",[classId]))
  assert.deepEqual((await db.query('select public.nexus_assigned_challenges() as result')).rows[0].result,[])
  await assert.rejects(db.query('select public.nexus_answer_challenge($1,27,$2)',[questionId,crypto.randomUUID()]))
})
test('anonymous visitors cannot access remote educational data or RPCs', async () => {
  await db.exec('reset role; set role anon')
  await assert.rejects(db.query('select * from public.nexus_attempts'))
  await assert.rejects(db.query('select public.nexus_roster()'))
  await assert.rejects(db.query('select public.nexus_assigned_challenges()'))
})
test('public RPC wrappers cannot bypass permissions and all educational tables use RLS', async () => {
  await identity(student)
  await assert.rejects(db.query('select * from nexus_private.catalog'))
  const wrappers = await db.query("select prosecdef from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'nexus_%'")
  assert.equal(wrappers.rows.length,8); assert.ok(wrappers.rows.every(row => row.prosecdef === false))
  const tables=await db.query("select relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname like 'nexus_%' and c.relkind='r'")
  assert.equal(tables.rows.length,10); assert.ok(tables.rows.every(row => row.relrowsecurity))
})
test('mission hints persist atomically and retries preserve telemetry while teachers remain scoped', async () => {
  await identity(student)
  const request=crypto.randomUUID(), counts=[1,0,2,0,1,0]
  const parameters=['energia',JSON.stringify(answers),request,JSON.stringify(counts)]
  const first=(await db.query('select public.nexus_submit_tracked_attempt($1,$2::jsonb,$3,$4::jsonb) as result',parameters)).rows[0].result
  assert.equal(first.hints_used,4);assert.deepEqual(first.hints_by_question,counts);assert.equal(first.correct,6)
  const retried=(await db.query('select public.nexus_submit_tracked_attempt($1,$2::jsonb,$3,$4::jsonb) as result',['energia',JSON.stringify(answers),request,'[0,0,0,0,0,0]'])).rows[0].result
  assert.equal(retried.id,first.id);assert.equal(retried.hints_used,4)
  for(const invalid of ['[1]','[4,0,0,0,0,0]','[0.5,0,0,0,0,0]','[null,0,0,0,0,0]']) await assert.rejects(db.query('select public.nexus_submit_tracked_attempt($1,$2::jsonb,$3,$4::jsonb)',['energia',JSON.stringify(answers),crypto.randomUUID(),invalid]))
  assert.equal((await db.query('select id from public.nexus_attempts where request_id=$1',[request])).rows.length,1)
  await identity(teacher)
  assert.equal((await db.query('select hints_used from public.nexus_attempts where id=$1',[first.id])).rows[0].hints_used,4)
  await assert.rejects(db.query('select public.nexus_submit_tracked_attempt($1,$2::jsonb,$3,$4::jsonb)',parameters))
  await identity(otherTeacher)
  assert.equal((await db.query('select id from public.nexus_attempts where id=$1',[first.id])).rows.length,0)
  await db.exec('reset role; set role anon')
  await assert.rejects(db.query('select public.nexus_submit_tracked_attempt($1,$2::jsonb,$3,$4::jsonb)',parameters))
})

test('private class conversations and video lessons isolate students and teachers', async () => {
 await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub','',false)");await db.query('update public.nexus_classes set archived=false where id=$1',[classId])
 await db.query('insert into public.nexus_memberships(class_id,student_id) values($1,$2) on conflict do nothing',[classId,otherStudent]);await identity(student)
 const request=crypto.randomUUID()
 await db.query('insert into public.nexus_messages(class_id,student_id,body,request_id) values($1,$2,$3,$4)',[classId,student,'Como calculo a área lateral?',request])
 const message=(await db.query('select * from public.nexus_messages where request_id=$1',[request])).rows[0]
 assert.equal(message.author_id,student);assert.equal(message.author_name,'Aluno A')
 await assert.rejects(db.query('insert into public.nexus_messages(class_id,student_id,body,request_id) values($1,$2,$3,$4)',[classId,otherStudent,'Outra conversa',crypto.randomUUID()]))
 await assert.rejects(db.query("insert into public.nexus_messages(class_id,student_id,author_name,body,request_id) values($1,$2,'Professor A','Falso',$3)",[classId,student,crypto.randomUUID()]))
 await identity(teacher)
 assert.equal((await db.query('select id from public.nexus_messages')).rows.length,1)
 await db.query('insert into public.nexus_messages(class_id,student_id,body,request_id) values($1,$2,$3,$4)',[classId,student,'Use o perímetro da base multiplicado pela altura.',crypto.randomUUID()])
 const video=(await db.query("insert into public.nexus_video_lessons(class_id,title,url) values($1,'Áreas de prismas','https://example.com/aula') returning id",[classId])).rows[0].id
 await assert.rejects(db.query("insert into public.nexus_video_lessons(class_id,title,url) values($1,'Link inválido','javascript:alert(1)')",[classId]))
 await identity(otherTeacher)
 assert.equal((await db.query('select id from public.nexus_messages')).rows.length,0);assert.equal((await db.query('select id from public.nexus_video_lessons')).rows.length,0)
 await identity(otherStudent)
 assert.equal((await db.query('select id from public.nexus_messages')).rows.length,0);assert.equal((await db.query('select id from public.nexus_video_lessons')).rows.length,1)
 await identity(student)
 assert.equal((await db.query('select id from public.nexus_messages')).rows.length,2);assert.equal((await db.query('select id from public.nexus_video_lessons')).rows.length,1)
 await db.query('delete from public.nexus_video_lessons where id=$1',[video]);assert.equal((await db.query('select id from public.nexus_video_lessons where id=$1',[video])).rows.length,1)
 await assert.rejects(db.query("insert into public.nexus_video_lessons(class_id,title,url) values($1,'Não autorizado','https://example.com')",[classId]))
 await identity(teacher);await db.query('delete from public.nexus_video_lessons where id=$1',[video]);assert.equal((await db.query('select id from public.nexus_video_lessons')).rows.length,0)
 await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub','',false)");await db.query('update public.nexus_classes set archived=true where id=$1',[classId]);await identity(student)
 assert.equal((await db.query('select id from public.nexus_messages')).rows.length,0)
 await db.exec('reset role; set role anon');await assert.rejects(db.query('select * from public.nexus_messages'))
})

test('class tasks protect deadlines and student completion ownership', async () => {
 await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub','',false)");await db.query('update public.nexus_classes set archived=false where id=$1',[classId]);await identity(teacher)
 const task=(await db.query("insert into public.nexus_tasks(class_id,title,activities,due_at) values($1,'Praticar volumes','Resolver as missões de volume e rever as fórmulas.',now()+interval '1 day') returning id",[classId])).rows[0].id
 await assert.rejects(db.query("insert into public.nexus_tasks(class_id,title,activities,due_at) values($1,'Prazo inválido','Resolver todos os exercícios.',now()-interval '1 day')",[classId]))
 await identity(otherTeacher);assert.equal((await db.query('select id from public.nexus_tasks')).rows.length,0)
 await identity(student);assert.equal((await db.query('select id from public.nexus_tasks')).rows.length,1)
 await assert.rejects(db.query("insert into public.nexus_tasks(class_id,title,activities,due_at) values($1,'Não autorizado','Resolver todos os exercícios.',now()+interval '1 day')",[classId]))
 await db.query('insert into public.nexus_task_completions(task_id) values($1)',[task])
 const completion=(await db.query('select * from public.nexus_task_completions')).rows[0];assert.equal(completion.student_id,student);assert.ok(completion.completed_at)
 await assert.rejects(db.query('insert into public.nexus_task_completions(task_id,student_id) values($1,$2)',[task,otherStudent]))
 await assert.rejects(db.query("update public.nexus_task_completions set completed_at=now()-interval '1 day' where task_id=$1",[task]))
 await identity(otherStudent);assert.equal((await db.query('select * from public.nexus_task_completions')).rows.length,0)
 await identity(teacher);assert.equal((await db.query('select * from public.nexus_task_completions')).rows.length,1)
 await assert.rejects(db.query('insert into public.nexus_task_completions(task_id) values($1)',[task]))
 await db.query("update public.nexus_tasks set title='Revisar volumes',due_at=now()+interval '2 days' where id=$1",[task])
 await identity(student);assert.equal((await db.query('select title from public.nexus_tasks where id=$1',[task])).rows[0].title,'Revisar volumes')
 await db.exec('reset role; set role anon');await assert.rejects(db.query('select * from public.nexus_tasks'))
})

test('basic arithmetic grades independently of geometry and preserves role isolation', async()=>{
 const {basicMissions}=await import('../src/services/basicMath.ts')
 await identity(otherStudent)
 for(const op of ['addition','subtraction','multiplication','division']){
  const m=basicMissions.find(m=>m.operation===op&&m.level===1),answers=m.questions.map(q=>q.answer),hints=answers.map((_,i)=>i===0?1:0),request=crypto.randomUUID()
  const result=(await db.query('select public.nexus_submit_basic_attempt($1,$2::jsonb,$3,$4::jsonb) as result',[m.id,JSON.stringify(answers),request,JSON.stringify(hints)])).rows[0].result
  assert.equal(result.correct,8);assert.equal(result.total,8);assert.equal(result.hints_used,1);assert.equal(result.student_id,otherStudent)
  const retry=(await db.query('select public.nexus_submit_basic_attempt($1,$2::jsonb,$3,$4::jsonb) as result',[m.id,JSON.stringify(answers),request,JSON.stringify(hints)])).rows[0].result
  assert.equal(retry.id,result.id)
 }
 await assert.rejects(db.query("select public.nexus_submit_basic_attempt('energia','[]',$1,'[]')",[crypto.randomUUID()]))
 await assert.rejects(db.query("select public.nexus_submit_basic_attempt('basic-fake','[]',$1,'[]')",[crypto.randomUUID()]))
 await assert.rejects(db.query("select public.nexus_submit_basic_attempt('basic-addition-1','[2]',$1,'[0]')",[crypto.randomUUID()]))
 const m=basicMissions[0],wrong=m.questions.map(q=>q.answer);wrong[0]=999
 const score=(await db.query('select public.nexus_submit_basic_attempt($1,$2::jsonb,$3,$4::jsonb) as result',[m.id,JSON.stringify(wrong),crypto.randomUUID(),'[0,0,0,0,0,0,0,0]'])).rows[0].result
 assert.equal(score.correct,7);assert.deepEqual(score.mistakes,[0])
 await identity(student);assert.equal((await db.query('select id from public.nexus_attempts where id=$1',[score.id])).rows.length,0)
 await identity(teacher);assert.equal((await db.query('select id from public.nexus_attempts where id=$1',[score.id])).rows.length,1)
 await assert.rejects(db.query('select public.nexus_submit_basic_attempt($1,$2::jsonb,$3,$4::jsonb)',[m.id,JSON.stringify(wrong),crypto.randomUUID(),'[0,0,0,0,0,0,0,0]']))
 await db.exec('reset role; set role anon');await assert.rejects(db.query('select public.nexus_submit_basic_attempt($1,$2::jsonb,$3,$4::jsonb)',[m.id,JSON.stringify(wrong),crypto.randomUUID(),'[0,0,0,0,0,0,0,0]']))
})

test('expanded curriculum grades decimals and diagnosis, and task catalog links preserve ownership', async()=>{
 const {numericMissions}=await import('../src/services/curriculum.ts')
 await identity(otherStudent)
 for(const m of numericMissions){const answers=m.questions.map(q=>q.answer),hints=answers.map(()=>0);const result=(await db.query('select public.nexus_submit_basic_attempt($1,$2::jsonb,$3,$4::jsonb) as result',[m.id,JSON.stringify(answers),crypto.randomUUID(),JSON.stringify(hints)])).rows[0].result;assert.equal(result.correct,answers.length,m.id)}
 await identity(teacher)
 const task=(await db.query("insert into public.nexus_tasks(class_id,title,activities,due_at,mission_ids) values($1,'Frações da turma','Pratique as duas etapas de frações.',now()+interval '1 day',ARRAY['basic-fractions-1','basic-fractions-2']) returning id",[classId])).rows[0].id
 await assert.rejects(db.query("update public.nexus_tasks set mission_ids=ARRAY['fake-id'] where id=$1",[task]))
 await assert.rejects(db.query("update public.nexus_tasks set mission_ids=ARRAY['basic-diagnostic'] where id=$1",[task]))
 await assert.rejects(db.query("update public.nexus_tasks set mission_ids=ARRAY[NULL::text] where id=$1",[task]))
 await identity(otherTeacher);assert.equal((await db.query("update public.nexus_tasks set mission_ids='{}' where id=$1 returning id",[task])).rows.length,0)
 await identity(student);assert.equal((await db.query('select mission_ids from public.nexus_tasks where id=$1',[task])).rows[0].mission_ids.length,2)
 assert.equal((await db.query("update public.nexus_tasks set mission_ids='{}' where id=$1 returning id",[task])).rows.length,0)
 await identity('66666666-6666-4666-8666-666666666666');assert.equal((await db.query('select id from public.nexus_tasks where id=$1',[task])).rows.length,0)
})

test('inactive profiles lose educational access even with an existing session', async () => {
  await db.exec('reset role')
  await db.query("select set_config('request.jwt.claim.sub','',false)")
  await db.query('update public.profiles set is_active=false where id in ($1,$2)',[teacher,student])
  await identity(teacher)
  assert.equal((await db.query('select * from public.nexus_classes')).rows.length,0)
  await assert.rejects(db.query('select public.nexus_roster()'))
  await identity(student)
  await assert.rejects(db.query('select public.nexus_submit_attempt($1,$2::jsonb,$3)',['energia',JSON.stringify(answers),crypto.randomUUID()]))
  await assert.rejects(db.query("insert into public.nexus_drafts(student_id,mission_id,draft) values($1,'hangar','{}')",[student]))
})
