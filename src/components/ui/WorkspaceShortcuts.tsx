import { Link } from 'react-router-dom'
import { ArrowUpRight, ListTodo, MessageCircle, Video, School, ChartNoAxesCombined, Calculator } from 'lucide-react'

export function WorkspaceShortcuts({ base, teacher = false }: { base: string; teacher?: boolean }) {
  const items = teacher ? [
    { path: '/classes', icon: School, title: 'Organizar turmas', text: 'Gerencie suas turmas e os alunos vinculados.' },
    { path: '/tasks', icon: ListTodo, title: 'Planejar tarefas', text: 'Publique atividades e defina os prazos.' },
    { path: '/students', icon: ChartNoAxesCombined, title: 'Acompanhar resultados', text: 'Consulte tentativas, dicas e porcentagens de acerto.' },
    { path: '/chat', icon: MessageCircle, title: 'Responder dúvidas', text: 'Converse com os alunos das suas turmas.' },
  ] : [
    { path: '/learn', icon: Calculator, title: 'Praticar matemática', text: 'Escolha um assunto e avance na sua trilha.' },
    { path: '/tasks', icon: ListTodo, title: 'Consultar tarefas', text: 'Veja as atividades e os prazos da sua turma.' },
    { path: '/chat', icon: MessageCircle, title: 'Tirar uma dúvida', text: 'Envie sua pergunta ao professor.' },
    { path: '/videos', icon: Video, title: 'Assistir às videoaulas', text: 'Revise com os materiais da sua turma.' },
  ]
  return <section className="workspace-shortcuts" aria-label={teacher ? 'Atalhos de planejamento' : 'Atalhos de aprendizagem'}><div className="section-heading"><div><span className="eyebrow">ACESSO RÁPIDO</span><h2>{teacher ? 'Sua rotina de ensino' : 'O que vamos aprender hoje?'}</h2></div><span className="shortcut-caption">Tudo ao seu alcance</span></div><div className="shortcut-grid">{items.map(({ path, icon: Icon, title, text }) => <Link key={path} to={base + path}><span className="shortcut-icon"><Icon size={21}/></span><ArrowUpRight className="shortcut-arrow" size={17}/><h3>{title}</h3><p>{text}</p></Link>)}</div></section>
}
