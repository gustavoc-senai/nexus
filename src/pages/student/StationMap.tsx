import { Link, useOutletContext } from 'react-router-dom'
import { ArrowUpRight, Lock, Check, Crosshair } from 'lucide-react'
import { missions } from '../../services/missions'
import { useMissionProgress } from '../../hooks/useMissionProgress'
import { MissionIcon, PageHeading } from '../../components/ui/Primitives'
import { DifficultyBadge } from '../../components/ui/DifficultyBadge'
import { difficultyLabels } from '../../lib/difficulty'
import type { Difficulty } from '../../types/database'

export function StationDiagram() {
  const { base } = useOutletContext<{ base: string }>()
  const { completed, isUnlocked } = useMissionProgress()
  const levels: Difficulty[] = ['easy', 'intermediate', 'hard']
  return <div className="station-map expanded-map"><div className="station-command"><Crosshair size={23} /><div><strong>ESTAÇÃO NEXUS</strong><span>{completed.size} de {missions.length} setores restaurados</span></div><span className="eyebrow">GEOMETRIA ESPACIAL</span></div><div className="station-levels">{levels.map(level => <section className="station-level" key={level} aria-label={`Setores de nível ${difficultyLabels[level]}`}><div className="station-level-heading"><DifficultyBadge level={level} /><span>{missions.filter(m => m.difficulty === level).length} setores</span></div><div className="station-sectors">{missions.filter(m => m.difficulty === level).map(mission => { const index = missions.indexOf(mission); const done = completed.has(mission.id); const unlocked = isUnlocked(index); return <Link key={mission.id} to={`${base}/sector/${mission.id}`} className={`map-node ${done ? 'complete' : unlocked ? 'available' : 'locked'}`}><div className="node-label">SETOR {String(index + 1).padStart(2, '0')}{done ? <Check size={13} /> : unlocked ? <ArrowUpRight size={13} /> : <Lock size={13} />}</div><div className="node-main"><MissionIcon type={mission.icon} /><strong>{mission.title}</strong></div><p className="node-subject">{mission.subject}</p><small>{done ? 'Sistemas restaurados' : unlocked ? `${mission.questions.length} desafios disponíveis` : `Conclua o setor ${String(index).padStart(2, '0')}`}</small></Link> })}</div></section>)}</div><div className="station-map-footer"><span>TRILHA PRINCIPAL + EXPEDIÇÃO DE PRÁTICA</span><span>{missions.reduce((total, m) => total + m.questions.length, 0)} DESAFIOS</span></div></div>
}

export default function StationMap() {
  return <><PageHeading kicker="NAVEGAÇÃO" title="Mapa da estação" description="Comece pelas bases, avance nos cálculos e alcance os projetos de engenharia." /><section className="panel"><div className="panel-heading"><h2>{missions.length} setores. Novas possibilidades.</h2><span className="badge">OPERAÇÃO NEXUS</span></div><StationDiagram /><div className="map-legend"><span><i className="legend-dot cyan" />Disponível</span><span><i className="legend-dot green" />Concluído</span><span><i className="legend-dot gray" />Bloqueado</span></div></section></>
}

