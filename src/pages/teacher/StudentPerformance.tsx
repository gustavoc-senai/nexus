import { TopicInsights } from '../../components/ui/TopicInsights'
import { practiceMissions, topics } from '../../services/curriculum'
import { useState } from 'react'
import { listTeacherQuestions } from '../../services/classroom'
import { useParams, useOutletContext, Link } from 'react-router-dom'
import { Target, Activity, Lightbulb, RotateCcw, RefreshCw } from 'lucide-react'
import { listStudents, listPerformance, listCustomPerformance } from '../../services/teacher'
import { missions as spatialMissions } from '../../services/missions'
import { basicMissions } from '../../services/basicMath'
const missions = [...practiceMissions.map(m=>({...m,subject:topics.find(t=>t.id===m.topic)!.name})),...spatialMissions,...basicMissions.map(m=>({...m,subject:'Matemática básica'}))]
import { useRemote } from '../../hooks/useRemote'
import { RemoteState } from '../../components/ui/RemoteState'
import { PageHeading, Stat, EmptyState, Progress } from '../../components/ui/Primitives'
const fetchPerformance = async () => {
  const [students,attempts,custom,questions] = await Promise.all([listStudents(),listPerformance(),listCustomPerformance(),listTeacherQuestions()])
  return {students,attempts,custom,questions}
}
export default function StudentPerformance() {
  const { id } = useParams(), { base } = useOutletContext<{base:string}>()
  const [selected,setSelected] = useState('all')
  const remote = useRemote(fetchPerformance,15000)
  if (remote.loading || remote.error) return <RemoteState loading={remote.loading} error={remote.error} retry={remote.refresh}/>
  const student = remote.data?.students.find(s=>s.id===id)
  if (!student) return <EmptyState title="Aluno não encontrado"><Link to={`${base}/students`}>Voltar para alunos</Link></EmptyState>
  const attempts = remote.data?.attempts.filter(a=>a.student_id===id)??[]
  const tracked = attempts.filter(a=>a.hints_used!=null)
  const hints = tracked.reduce((sum,a)=>sum+(a.hints_used??0),0)
  const history = attempts.filter(a=>selected==='all'||a.mission_id===selected).toReversed()
  return <><PageHeading kicker={student.className} title={student.name} description="Tentativas concluídas, uso de dicas e acertos em matemática básica e geometria espacial." action={<button className="button secondary" onClick={remote.refresh}><RefreshCw size={16}/>Atualizar resultados</button>}/>
    <div className="performance-stats"><Stat label="Progresso em geometria" value={`${student.progress}%`} detail="Setores de geometria com pelo menos 60% de acerto" icon={<Activity/>}/><Stat label="Porcentagem de acerto" value={attempts.length?`${student.accuracy}%`:'Sem tentativas'} detail="Acertos ÷ respostas em todas as tentativas" icon={<Target/>}/><Stat label="Tentativas concluídas" value={attempts.length} detail="Cada conclusão de uma missão conta uma tentativa" icon={<RotateCcw/>}/><Stat label="Dicas utilizadas" value={tracked.length?hints:'Não registrado'} detail={`${tracked.length} de ${attempts.length} tentativas com registro de dicas`} icon={<Lightbulb/>}/></div>
    <TopicInsights attempts={attempts.map(a=>({missionId:a.mission_id,correct:a.correct,total:a.total,date:a.created_at,mistakes:a.mistakes,hintsUsed:a.hints_used,hintsByQuestion:a.hints_by_question}))}/><section className="panel progress-panel"><h2>Desempenho por missão</h2><p>Compare a média de acertos, o melhor resultado e o apoio utilizado. Os dados são atualizados a cada 15 segundos enquanto esta página está visível.</p><div className="table-scroll"><table className="performance-table"><thead><tr><th>Missão</th><th>Tentativas</th><th>Acerto médio</th><th>Melhor resultado</th><th>Dicas registradas</th><th>Situação</th></tr></thead><tbody>{missions.map(m=>{
      const results=attempts.filter(a=>a.mission_id===m.id), total=results.reduce((sum,a)=>sum+a.total,0), correct=results.reduce((sum,a)=>sum+a.correct,0), accuracy=total?Math.round(correct/total*100):0
      const measured=results.filter(a=>a.hints_used!=null), best=results.length?Math.max(...results.map(a=>a.correct/a.total*100)):0
      return <tr key={m.id}><td><strong>{m.title}</strong><small className="performance-subject">{m.subject}</small></td><td>{results.length}</td><td>{total?<div className="table-progress"><Progress value={accuracy}/><span>{accuracy}%</span></div>:'—'}</td><td>{total?`${Math.round(best)}%`:'—'}</td><td>{measured.length?<>{measured.reduce((sum,a)=>sum+(a.hints_used??0),0)}<small className="performance-subject">{measured.length}/{results.length} tentativas registradas</small></>:'Não registrado'}</td><td><span className={`badge ${best>=60?'success-badge':''}`}>{!results.length?'Não iniciado':best>=60?'Concluída':'Em revisão'}</span></td></tr>
    })}</tbody></table></div></section>
    <section className="panel progress-panel"><div className="performance-history-heading"><div><h2>Histórico de tentativas</h2><p>Resultados individuais, do mais recente para o mais antigo.</p></div><label>Filtrar missão<select value={selected} onChange={e=>setSelected(e.target.value)}><option value="all">Todas as missões</option>{missions.map(m=><option key={m.id} value={m.id}>{m.title}</option>)}</select></label></div>{history.length?<div className="attempt-history">{history.map(a=>{const m=missions.find(m=>m.id===a.mission_id);return <article className="attempt-history-card" key={a.id}><div><strong>{m?.title??a.mission_id}</strong><time dateTime={a.created_at}>{new Date(a.created_at).toLocaleString('pt-BR')}</time></div><div className="attempt-history-metrics"><span><strong>{a.correct}/{a.total}</strong> acertos</span><span><strong>{Math.round(a.correct/a.total*100)}%</strong> de acerto</span><span><Lightbulb size={15}/>{a.hints_used==null?'Dicas não registradas':`${a.hints_used} dica${a.hints_used===1?'':'s'}`}</span></div>{a.hints_by_question&&<details><summary>Dicas e resultado por desafio</summary><ol className="question-telemetry">{a.hints_by_question.map((count,i)=><li key={i}><span>Desafio {i+1}</span><span>{a.mistakes.includes(i)?'Resposta incorreta':'Resposta correta'}</span><span>{count} dica{count===1?'':'s'}</span></li>)}</ol></details>}</article>})}</div>:<p className="notice">Nenhuma tentativa concluída nesta seleção.</p>}</section>
    <section className="panel progress-panel"><h2>Desafios da turma</h2><p>Acertos nos exercícios publicados pelo professor.</p>{remote.data?.questions.length?remote.data.questions.map(q=>{const results=remote.data?.custom.filter(a=>a.challenge_id===q.id&&a.student_id===id)??[], accuracy=results.length?Math.round(results.filter(a=>a.correct).length/results.length*100):0;return <div className="topic-row" key={q.id}><div><strong>{q.title}</strong><small>{results.length} tentativa{results.length===1?'':'s'}</small></div>{results.length?<><Progress value={accuracy}/><span>{accuracy}%</span></>:<span className="badge">Sem tentativas</span>}</div>}):<p>Você ainda não criou desafios para suas turmas.</p>}</section>
  </>
}