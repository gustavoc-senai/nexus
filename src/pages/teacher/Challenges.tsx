import { useSearchParams } from 'react-router-dom'
import { missions } from '../../services/missions'
import { PageHeading, EmptyState } from '../../components/ui/Primitives'
import { SolidDiagram } from '../../components/ui/SolidDiagram'
import { DifficultyBadge } from '../../components/ui/DifficultyBadge'
import { difficultyLabels } from '../../lib/difficulty'
import { answerLabel } from '../../lib/geometryAnswers'
import type { Difficulty } from '../../types/database'

export default function Challenges() {
  const [params, setParams] = useSearchParams()
  const level = params.get('level') || 'all'
  const selectedMission = params.get('mission') || 'all'
  const filtered = missions.filter(m => (level === 'all' || m.difficulty === level) && (selectedMission === 'all' || m.id === selectedMission))
  return <><PageHeading kicker="BANCO DE CONHECIMENTO" title="Desafios" description={`${missions.reduce((sum, m) => sum + m.questions.length, 0)} exercícios de geometria espacial com respostas e resolução comentada.`} /><div className="catalog-controls"><label>Nível<select value={level} onChange={e => setParams(e.target.value === 'all' ? {} : { level: e.target.value })}><option value="all">Todos os níveis</option>{(['easy', 'intermediate', 'hard'] as Difficulty[]).map(d => <option value={d} key={d}>{difficultyLabels[d]}</option>)}</select></label><label>Setor<select value={selectedMission} onChange={e => { const next = new URLSearchParams(params); if (e.target.value === 'all') next.delete('mission'); else next.set('mission', e.target.value); setParams(next) }}><option value="all">Todos os setores</option>{missions.filter(m => level === 'all' || m.difficulty === level).map(m => <option key={m.id} value={m.id}>{m.title}</option>)}</select></label></div><div className="question-catalog">{filtered.length ? filtered.map(m => <section className="panel progress-panel" key={m.id}><div className="catalog-section-heading"><h2>{m.title}</h2><DifficultyBadge level={m.difficulty} /></div><p>{m.subject} · {m.questions.length} desafios</p>{m.questions.map((q, i) => <details key={q.prompt}><summary>{i + 1}. {q.prompt}</summary><span className="badge">{q.numericAnswer !== undefined ? 'Resposta numérica' : 'Múltipla escolha'}</span><SolidDiagram solid={q.solid} /><p className="notice success">{q.explanation}</p><p>Resposta: <strong>{answerLabel(q)}</strong></p></details>)}</section>) : <EmptyState title="Nenhum desafio neste filtro">Selecione outro nível ou setor.</EmptyState>}</div></>
}

