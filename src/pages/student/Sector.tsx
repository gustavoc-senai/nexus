import { Link, useParams, useOutletContext } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Lock, CheckCircle } from 'lucide-react'
import { missions } from '../../services/missions'
import { useMissionProgress } from '../../hooks/useMissionProgress'
import { PageHeading, MissionIcon, EmptyState } from '../../components/ui/Primitives'
import { MissionBriefing } from '../../components/ui/MissionBriefing'
import { DifficultyBadge } from '../../components/ui/DifficultyBadge'
import { MissionCover } from '../../components/ui/MissionCover'
export default function Sector() {
  const { id } = useParams(); const { base } = useOutletContext<{ base: string }>(); const index = missions.findIndex(m => m.id === id); const mission = missions[index]; const { completed, isUnlocked } = useMissionProgress()
  if (!mission) return <EmptyState title="Setor não encontrado"><Link to={`${base}/map`}>Voltar ao mapa</Link></EmptyState>
  return <><Link className="text-link back-link" to={`${base}/map`}><ArrowLeft size={16} />Voltar ao mapa</Link><PageHeading kicker={`SETOR ${String(index + 1).padStart(2, '0')}`} title={mission.title} description={mission.description} action={<DifficultyBadge level={mission.difficulty} />} /><section className="panel sector-detail illustrated-sector"><MissionCover mission={mission} banner /><span className="mission-icon"><MissionIcon type={mission.icon} size={36} /></span><h2>{mission.subject}</h2><p>Resolva {mission.questions.length} desafios contextualizados. Acerte pelo menos 60% para restaurar este setor e desbloquear o próximo.</p><MissionBriefing mission={mission} /><div className="mission-meta"><span>{mission.questions.length} desafios</span><span>{mission.questions.filter(q => q.numericAnswer !== undefined).length} respostas numéricas</span><span>Sem limite de tempo</span><span>Novas tentativas disponíveis</span></div>{completed.has(id!) && <p className="notice success"><CheckCircle size={18} />Setor restaurado. Você pode praticar novamente.</p>}{isUnlocked(index) ? <Link className="button primary" to={`${base}/challenge/${mission.id}`}>Iniciar desafios <ArrowRight size={17} /></Link> : <p className="notice"><Lock size={18} />Conclua o setor anterior para liberar esta missão.</p>}</section></>
}


