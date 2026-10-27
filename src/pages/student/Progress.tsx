import { TopicInsights } from '../../components/ui/TopicInsights'
import { useDemo } from '../../context/LearningContext'
import { Link, useOutletContext } from 'react-router-dom'
import { Target, Activity, Layers } from 'lucide-react'
import { PageHeading, EmptyState, Stat } from '../../components/ui/Primitives'
import { LearningPath } from '../../components/ui/LearningPath'
import { useMissionProgress } from '../../hooks/useMissionProgress'
import { missions } from '../../services/missions'
export default function Progress() {
  const {attempts:allAttempts}=useDemo()
  const { attempts, progress, completed, accuracy } = useMissionProgress()
  const { base } = useOutletContext<{ base: string }>()
  return <><PageHeading kicker="DIÁRIO DE BORDO" title="Seu progresso" description="Veja sua evolução por nível e aprenda com cada tentativa." /><div className="stats-grid"><Stat label="Recuperação da estação" value={`${progress}%`} detail="Setores concluídos na jornada" icon={<Activity size={20}/>} /><Stat label="Precisão nas tentativas" value={`${accuracy}%`} detail="Respostas das missões de geometria" icon={<Target size={20}/>} /><Stat label="Tentativas realizadas" value={attempts.length} detail={`${completed.size} setores recuperados`} icon={<Layers size={20}/>} /></div><TopicInsights attempts={allAttempts}/><h2 className="study-section-title">Exploração em geometria espacial</h2><LearningPath base={base} completed={completed} /><section className="panel"><div className="panel-heading"><h2>Histórico de tentativas</h2><span className="badge">{attempts.length} registros</span></div>{!attempts.length ? <EmptyState title="Sua jornada está começando"><Link to={`${base}/map`}>Explore o primeiro setor para registrar seu progresso.</Link></EmptyState> : <div className="table-scroll"><table><thead><tr><th>Missão</th><th>Data</th><th>Acertos</th><th>Resultado</th><th>Relatório</th></tr></thead><tbody>{attempts.toReversed().map((attempt, index) => <tr key={`${attempt.date}-${index}`}><td><strong>{missions.find(m => m.id === attempt.missionId)?.title || 'Missão'}</strong></td><td>{new Date(attempt.date).toLocaleDateString('pt-BR')}</td><td>{attempt.correct}/{attempt.total}</td><td><span className={`badge ${attempt.correct / attempt.total >= .6 ? 'success-badge' : 'warning'}`}>{attempt.correct / attempt.total >= .6 ? 'Concluído' : 'Praticar novamente'}</span></td><td><Link className="text-link" to={`${base}/result/${attempt.missionId}`}>Último resultado</Link></td></tr>)}</tbody></table></div>}</section></>
}
