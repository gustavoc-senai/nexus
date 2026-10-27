import { Link } from 'react-router-dom'
import { Clock3, ArrowUpRight } from 'lucide-react'
import { missions } from '../../services/missions'
import type { Attempt } from '../../types/database'
export function RecentActivity({ attempts, base }: { attempts: Attempt[]; base: string }) {
  return <section className="panel recent-activity"><div className="panel-heading"><h2>Últimas explorações</h2><Clock3 size={18} /></div>{attempts.length ? <div className="recent-activity-list">{attempts.slice(-3).toReversed().map((attempt, index) => <div key={`${attempt.date}-${index}`}><span className={`activity-marker ${attempt.correct / attempt.total >= 0.6 ? 'passed' : ''}`} /><div><strong>{missions.find(m => m.id === attempt.missionId)?.title || 'Missão'}</strong><small>{new Date(attempt.date).toLocaleDateString('pt-BR')} · {attempt.correct}/{attempt.total} acertos</small></div><span className="badge">{Math.round(attempt.correct / attempt.total * 100)}%</span></div>)}</div> : <div className="activity-empty"><Clock3 size={24} /><p>Sua primeira descoberta vai aparecer aqui.</p><small>Conclua uma missão para iniciar seu diário de bordo.</small></div>}<Link className="text-link activity-link" to={`${base}/progress`}>Acompanhar meu progresso <ArrowUpRight size={15} /></Link></section>
}
