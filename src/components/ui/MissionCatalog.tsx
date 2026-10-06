import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { Lock, ArrowRight, CheckCircle } from 'lucide-react'
import { missions } from '../../services/missions'
import { useMissionProgress } from '../../hooks/useMissionProgress'
import type { Difficulty } from '../../types/database'
import { PageHeading, MissionIcon } from './Primitives'
import { DifficultyBadge } from './DifficultyBadge'
import { difficultyLabels, difficultyDescriptions } from '../../lib/difficulty'

export function MissionCatalog({ teacher = false }: { teacher?: boolean }) {
  const { base } = useOutletContext<{ base: string }>()
  const { completed, isUnlocked } = useMissionProgress()
  const [filter, setFilter] = useState<Difficulty | 'all'>('all')
  const levels: Difficulty[] = ['easy', 'intermediate', 'hard']
  return <>
    <PageHeading kicker={teacher ? 'CONTEÚDO EDUCACIONAL' : 'OPERAÇÃO NEXUS'} title={teacher ? 'Catálogo de missões' : 'Suas missões'} description={`${missions.length} setores · ${missions.reduce((sum, m) => sum + m.questions.length, 0)} desafios de geometria espacial · 3 níveis de dificuldade.`} />
    <div className="difficulty-filters" role="group" aria-label="Filtrar missões por dificuldade"><button aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>Todos os níveis<span>{missions.length}</span></button>{levels.map(level => <button key={level} aria-pressed={filter === level} onClick={() => setFilter(level)}>{difficultyLabels[level]}<span>{missions.filter(m => m.difficulty === level).length}</span></button>)}</div>
    {levels.filter(level => filter === 'all' || filter === level).map(level => <section className="level-section" key={level} aria-label={`Missões de nível ${difficultyLabels[level]}`}><div className="level-section-heading"><DifficultyBadge level={level} /><p>{difficultyDescriptions[level]}</p></div><div className="mission-grid">{missions.filter(m => m.difficulty === level).map(m => { const index = missions.indexOf(m); return <article className="panel mission-card" key={m.id}><span className="mission-icon"><MissionIcon type={m.icon} /></span><span className="eyebrow">SETOR {String(index + 1).padStart(2, '0')} · {m.subject}</span><h2>{m.title}</h2><p>{m.description}</p><div className="mission-meta"><span>{m.questions.length} desafios</span><span>{m.questions.filter(q => q.numericAnswer !== undefined).length} respostas numéricas</span></div>{teacher ? <span className="badge">Conteúdo demonstrativo</span> : <span className={`badge ${completed.has(m.id) ? 'success-badge' : ''}`}>{completed.has(m.id) ? <><CheckCircle size={13} />Concluído</> : isUnlocked(index) ? 'Disponível' : <><Lock size={13} />Bloqueado</>}</span>}<Link className="text-link" to={teacher ? `${base}/challenges?mission=${m.id}` : `${base}/sector/${m.id}`}>{teacher ? 'Consultar desafios e respostas' : 'Detalhes da missão'}<ArrowRight size={16} /></Link></article> })}</div></section>)}
  </>
}

