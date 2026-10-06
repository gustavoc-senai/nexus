import { useOutletContext } from 'react-router-dom'
import { Users, Target, Rocket } from 'lucide-react'
import { PageHeading, Stat } from '../../components/ui/Primitives'
import Students from './Students'
import { missions } from '../../services/missions'
export default function TeacherDashboard() { const { demo } = useOutletContext<{ demo: boolean }>(); return <><PageHeading kicker="COMANDO EDUCACIONAL" title="Cada jornada importa." description="Uma visão clara da aprendizagem para orientar suas próximas decisões." /><div className="teacher-banner"><Rocket size={36} /><div><span className="eyebrow">OPERAÇÃO NEXUS</span><h2>Conhecimento que conecta a sua turma.</h2><p>Acompanhe o progresso, reconheça conquistas e descubra onde apoiar.</p></div></div><div className="stats-grid"><Stat label="Alunos na tripulação" value={demo ? '04' : '—'} detail={demo ? '2 turmas de demonstração' : 'Aguardando integração'} icon={<Users size={20} />} /><Stat label="Precisão média" value={demo ? '84%' : '—'} detail="Respostas aos desafios" icon={<Target size={20} />} /><Stat label="Missões do catálogo" value={String(missions.length).padStart(2, '0')} detail={`${missions.reduce((sum, m) => sum + m.questions.length, 0)} desafios · 3 níveis`} icon={<Rocket size={20} />} /></div><Students compact /></> }

