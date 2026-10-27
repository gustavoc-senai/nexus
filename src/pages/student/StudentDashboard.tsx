import { AdaptiveStart } from '../shared/LearningHub'
import { useLearningSettings } from '../../hooks/useLearningSettings'
import { WorkspaceShortcuts } from '../../components/ui/WorkspaceShortcuts'
import { MissionCover } from '../../components/ui/MissionCover'
import { Link, useOutletContext } from 'react-router-dom'
import { ArrowRight, Target, Layers, Activity, Rocket, ChevronRight, Map, BookOpen } from 'lucide-react'
import { PageHeading, Stat, MissionIcon } from '../../components/ui/Primitives'
import { useMissionProgress } from '../../hooks/useMissionProgress'
import { missions } from '../../services/missions'
import { DifficultyBadge } from '../../components/ui/DifficultyBadge'
import { LearningPath } from '../../components/ui/LearningPath'
import { recommendMission, validDraft } from '../../lib/learning'
import { useDemo } from '../../context/LearningContext'
import { RecentActivity } from '../../components/ui/RecentActivity'

export default function StudentDashboard() {
  const {settings}=useLearningSettings()
  const { base } = useOutletContext<{ base: string }>()
  const { progress, completed, correct, accuracy, attempts } = useMissionProgress()
  const recommendation = recommendMission(missions, attempts, completed)
  const next = recommendation.mission
  const { drafts } = useDemo()
  const interrupted = missions.find(m => validDraft(drafts[m.id], m.questions.length))
  return <>
    <PageHeading kicker="SEU CENTRO DE COMANDO" title="Pronto para ir além?" description="Seu próximo passo, sua trilha e suas conquistas em um só lugar." action={<Link className="button secondary" to={`${base}/map`}><Map size={16} />Explorar estação</Link>} />
    <AdaptiveStart /><WorkspaceShortcuts base={base} /><details className="geometry-dashboard" open={settings.stage==='advancing'}><summary>Exploração da estação · Geometria espacial</summary>
    <section className="operation-hero photographic-hero"><img className="dashboard-space-image" src="/images/nexus-orbit.jpg" alt="" width={1536} height={1024} fetchPriority="high" /><div className="hero-copy"><span className="eyebrow"><span className="status-dot" /> OPERAÇÃO NEXUS · GEOMETRIA ESPACIAL</span><h2>Conhecimento que<br />abre novos horizontes.</h2><p>Explore os sólidos, desenvolva seus cálculos e recupere cada setor da estação. Uma descoberta de cada vez.</p><Link className="button primary" to={`${base}/sector/${next.id}`}>{completed.size === missions.length ? 'Explorar novamente' : 'Continuar minha jornada'}<ArrowRight size={17} /></Link><span className="hero-footnote">{missions.length} setores · {missions.reduce((sum, mission) => sum + mission.questions.length, 0)} desafios · 3 níveis de aprendizagem</span></div><div className="hero-image-credit"><span>ESTAÇÃO NEXUS</span><small>EXPLORE. APRENDA. EVOLUA.</small></div></section>
    <div className="stats-grid"><Stat label="Estação restaurada" value={`${progress}%`} detail="Progresso dos setores concluídos" icon={<Activity size={19} />} /><Stat label="Respostas corretas" value={String(correct).padStart(2, '0')} detail={`${accuracy}% de precisão nas tentativas`} icon={<Target size={19} />} /><Stat label="Setores recuperados" value={`${String(completed.size).padStart(2, '0')} / ${String(missions.length).padStart(2, '0')}`} detail="Cada setor abre uma nova descoberta" icon={<Layers size={19} />} /></div>
    {interrupted && <section className="panel resume-card"><div><span className="eyebrow">MISSÃO EM ANDAMENTO</span><h2>{interrupted.title}</h2><p>Continue do desafio {(drafts[interrupted.id].step ?? 0) + 1}. Suas respostas e seu rascunho estão preservados.</p></div><Link className="button primary" to={`${base}/challenge/${interrupted.id}`}>Retomar missão <ArrowRight size={16} /></Link></section>}
    <LearningPath base={base} completed={completed} />
    <div className="dashboard-lower-grid"><section className="panel recommended-mission"><div className="panel-heading"><div><span className="eyebrow">SEU PRÓXIMO PASSO</span><h2>{recommendation.review ? 'Revisão recomendada pelos seus resultados' : completed.size === missions.length ? 'Continue praticando' : 'Missão recomendada'}</h2></div><Rocket size={19} /></div><MissionCover mission={next} /><div className="recommendation-body"><span className="mission-icon"><MissionIcon type={next.icon} size={30} /></span><div><DifficultyBadge level={next.difficulty} /><h3>{next.title}</h3><p>{next.description}</p><div className="mission-meta"><span>{next.questions.length} desafios</span><span>{next.questions.filter(q => q.numericAnswer !== undefined).length} cálculos com resposta numérica</span></div><Link className="button primary" to={`${base}/sector/${next.id}`}>Conhecer a missão <ChevronRight size={16} /></Link></div></div></section><RecentActivity attempts={attempts} base={base} /></div>
    <section className="learning-resources"><Link to={`${base}/explorer`}><img className="resource-image" src="/images/geometry-prism-hexagonal.svg" alt="" width={1200} height={600} loading="lazy" /><Layers size={23} /><div><h3>Laboratório de sólidos em 3D</h3><p>Gire, observe superfícies e descubra planificações.</p></div><ArrowRight size={18} /></Link><Link to={`${base}/map`}><img className="resource-image" src="/images/geometry-pyramid.svg" alt="" width={1200} height={600} loading="lazy" /><Map size={23} /><div><h3>Uma estação para explorar</h3><p>Veja a sequência dos setores e os próximos desbloqueios.</p></div><ArrowRight size={18} /></Link><Link to={`${base}/guide`}><img className="resource-image" src="/images/geometry-sphere.svg" alt="" width={1200} height={600} loading="lazy" /><BookOpen size={23} /><div><h3>Aprenda com mais clareza</h3><p>Consulte fórmulas, dicas de cálculo e o guia da jornada.</p></div><ArrowRight size={18} /></Link></section>
    </details>
  </>
}
