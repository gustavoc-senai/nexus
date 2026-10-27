import { Link } from 'react-router-dom'
import { ArrowUpRight, CheckCircle, Layers } from 'lucide-react'
import { missions } from '../../services/missions'
import { difficultyDescriptions, difficultyLabels } from '../../lib/difficulty'
import type { Difficulty } from '../../types/database'
import { DifficultyBadge } from './DifficultyBadge'
import { Progress } from './Primitives'
export function LearningPath({ base, completed }: { base: string; completed: Set<string> }) {
  return <section className="learning-path"><div className="section-heading"><div><span className="eyebrow">UM CAMINHO PARA EVOLUIR</span><h2>Sua trilha de aprendizagem</h2></div><Link className="text-link" to={`${base}/missions`}>Ver todas as missões <ArrowUpRight size={16} /></Link></div><div className="learning-path-grid">{(['easy', 'intermediate', 'hard'] as Difficulty[]).map((level, index) => { const catalog = missions.filter(m => m.difficulty === level); const done = catalog.filter(m => completed.has(m.id)).length; return <article className={`panel learning-stage stage-${level}`} key={level}><div className="stage-top"><span className="stage-number">0{index + 1}</span>{done === catalog.length ? <CheckCircle size={20} /> : <Layers size={20} />}</div><DifficultyBadge level={level} /><h3>{['Construa sua base', 'Conecte os conceitos', 'Resolva grandes projetos'][index]}</h3><p>{difficultyDescriptions[level]}</p><div className="progress-label"><span>{done} de {catalog.length} setores concluídos</span><strong>{Math.round(done / catalog.length * 100)}%</strong></div><Progress value={Math.round(done / catalog.length * 100)} /><Link className="text-link" to={`${base}/missions?level=${level}`}>Explorar nível {difficultyLabels[level].toLocaleLowerCase('pt-BR')} <ArrowUpRight size={15} /></Link></article> })}</div></section>
}
