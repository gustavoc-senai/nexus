import { LayoutDashboard, Map, Rocket, ChartNoAxesCombined, Users, GraduationCap, BookOpen, Boxes, School, MessageCircle, Video, ListTodo, Calculator, Route, RotateCcw, Bell } from 'lucide-react'
export function portalNavigation(teacher: boolean) {
  return teacher ? [
    { path: '', label: 'Visão geral', shortLabel: 'Início', icon: LayoutDashboard },
    { path: '/classes', label: 'Turmas', shortLabel: 'Turmas', icon: School },
    { path: '/students', label: 'Alunos', shortLabel: 'Alunos', icon: Users },
    { path: '/missions', label: 'Missões', shortLabel: 'Missões', icon: Rocket },
    { path: '/challenges', label: 'Desafios', shortLabel: 'Desafios', icon: GraduationCap },
    { path: '/statistics', label: 'Estatísticas', shortLabel: 'Dados', icon: ChartNoAxesCombined },
    { path: '/learn', label: 'Trilhas de aprendizagem', shortLabel: 'Trilhas', icon: Route },
    { path: '/notifications', label: 'Avisos e novidades', shortLabel: 'Avisos', icon: Bell },
    { path: '/basic', label: 'Matemática básica', shortLabel: 'Números', icon: Calculator },
    { path: '/tasks', label: 'Tarefas da turma', shortLabel: 'Tarefas', icon: ListTodo },
    { path: '/chat', label: 'Dúvidas e mensagens', shortLabel: 'Chat', icon: MessageCircle },
    { path: '/videos', label: 'Videoaulas', shortLabel: 'Vídeos', icon: Video },
    { path: '/explorer', label: 'Laboratório 3D', shortLabel: '3D', icon: Boxes },
    { path: '/guide', label: 'Guia da plataforma', shortLabel: 'Guia', icon: BookOpen },
  ] : [
    { path: '', label: 'Visão geral', shortLabel: 'Início', icon: LayoutDashboard },
    { path: '/map', label: 'Mapa da estação', shortLabel: 'Mapa', icon: Map },
    { path: '/missions', label: 'Minhas missões', shortLabel: 'Missões', icon: Rocket },
    { path: '/review', label: 'Minha revisão', shortLabel: 'Revisão', icon: RotateCcw },
    { path: '/progress', label: 'Meu progresso', shortLabel: 'Progresso', icon: ChartNoAxesCombined },
    { path: '/guide', label: 'Guia de aprendizagem', shortLabel: 'Guia', icon: BookOpen },
    { path: '/classroom', label: 'Minha turma', shortLabel: 'Turma', icon: School },
    { path: '/learn', label: 'Trilhas de aprendizagem', shortLabel: 'Trilhas', icon: Route },
    { path: '/notifications', label: 'Avisos e novidades', shortLabel: 'Avisos', icon: Bell },
    { path: '/basic', label: 'Matemática básica', shortLabel: 'Números', icon: Calculator },
    { path: '/tasks', label: 'Tarefas da turma', shortLabel: 'Tarefas', icon: ListTodo },
    { path: '/chat', label: 'Dúvidas e mensagens', shortLabel: 'Chat', icon: MessageCircle },
    { path: '/videos', label: 'Videoaulas', shortLabel: 'Vídeos', icon: Video },
    { path: '/explorer', label: 'Laboratório 3D', shortLabel: '3D', icon: Boxes },
  ]
}
export type PortalNavigation = ReturnType<typeof portalNavigation>

export function navigationGroups(teacher: boolean) {
  return teacher ? [
    { label: 'Acompanhamento', paths: ['', '/classes', '/students', '/statistics'] },
    { label: 'Planejamento', paths: ['/tasks', '/challenges', '/learn', '/missions', '/basic'] },
    { label: 'Sala de aula', paths: ['/notifications', '/chat', '/videos', '/explorer', '/guide'] },
  ] : [
    { label: 'Aprendizagem', paths: ['', '/learn', '/basic', '/missions', '/map', '/review', '/progress'] },
    { label: 'Minha sala de aula', paths: ['/classroom', '/tasks', '/notifications', '/chat', '/videos'] },
    { label: 'Exploração e apoio', paths: ['/explorer', '/guide'] },
  ]
}
