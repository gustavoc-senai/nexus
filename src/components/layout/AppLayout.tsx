import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Map, Rocket, ChartNoAxesCombined, Users, GraduationCap, LogOut, ArrowUpRight, Menu, X, CircleHelp } from 'lucide-react'
import { useState } from 'react'
import { Brand } from '../ui/Primitives'
import { missions } from '../../services/missions'
import { useAuth } from '../../context/AuthContext'

export function AppLayout({ demo = false }: { demo?: boolean }) {
  const { profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const teacher = !demo && (profile?.role === 'teacher' || profile?.role === 'admin')
  const base = demo ? '/demo' : teacher ? '/teacher' : '/student'
  const links = teacher ? [{ path: '', label: 'Visão geral', icon: LayoutDashboard }, { path: '/students', label: 'Alunos', icon: Users }, { path: '/missions', label: 'Missões', icon: Rocket }, { path: '/challenges', label: 'Desafios', icon: GraduationCap }, { path: '/statistics', label: 'Estatísticas', icon: ChartNoAxesCombined }] : [{ path: '', label: 'Visão geral', icon: LayoutDashboard }, { path: '/map', label: 'Mapa da estação', icon: Map }, { path: '/missions', label: 'Minhas missões', icon: Rocket }, { path: '/progress', label: 'Meu progresso', icon: ChartNoAxesCombined }]
  async function exit() { try { if (!demo) await signOut(); navigate('/login') } catch { setError('Não foi possível sair. Tente novamente.') } }
  return <div className="app-shell"><a className="skip-link" href="#main">Pular para o conteúdo</a><aside className={`sidebar ${open ? 'is-open' : ''}`}><Link to={base} aria-label="Nexus início"><Brand /></Link><button className="mobile-close icon-button" onClick={() => setOpen(false)} aria-label="Fechar menu"><X /></button><div className="workspace-label">CENTRO DE CONTROLE<span>01</span></div><nav aria-label="Navegação principal">{links.map(({ path, label, icon: Icon }) => <NavLink end to={base + path} key={path} onClick={() => setOpen(false)}><Icon size={19} />{label}{path === '/missions' && <span className="nav-count">{String(missions.length).padStart(2, '0')}</span>}</NavLink>)}</nav><div className="sidebar-bottom"><div className="help-card"><CircleHelp size={21} /><strong>Uma missão, muitas descobertas.</strong><p>Aprenda no seu ritmo. Cada passo conta.</p><Link to="/login">Central de acesso <ArrowUpRight size={15} /></Link></div><div className="system-status"><span className="status-dot" /> SISTEMAS ONLINE <span>v.1.0</span></div></div></aside>{open && <button className="menu-overlay" aria-label="Fechar navegação" onClick={() => setOpen(false)} />}<div className="workspace"><header className="topbar"><div className="breadcrumb"><button className="menu-toggle icon-button" onClick={() => setOpen(true)} aria-label="Abrir menu"><Menu /></button><span>Estação Nexus</span><span>/</span><strong>{teacher ? 'Área do professor' : 'Área do explorador'}</strong></div><div className="topbar-right">{demo && <span className="demo-badge">Demonstração</span>}<span className="avatar">{demo ? teacher ? 'PR' : 'EX' : (profile?.full_name || 'N').slice(0, 2).toUpperCase()}</span><div className="profile-name"><strong>{demo ? teacher ? 'Professor' : 'Explorador' : profile?.full_name || 'Tripulante'}</strong><small>{teacher ? 'Comando da estação' : 'Tripulação Nexus'}</small></div><button className="icon-button" onClick={exit} aria-label="Sair"><LogOut size={18} /></button></div></header><main id="main" className="main-content">{error && <p role="alert" className="notice error">{error}</p>}{demo && <div className="demo-strip"><span>Ambiente de demonstração · dados ilustrativos e progresso local</span></div>}{!demo && <p className="notice training-notice">Catálogo pedagógico de demonstração. As tentativas são salvas apenas neste navegador; turmas e resultados ainda não estão conectados ao banco.</p>}<Outlet context={{ base, teacher, demo }} /></main><footer className="app-footer"><span>ESTAÇÃO NEXUS / Conhecimento que leva você além.</span><span>Explore. Aprenda. Evolua.</span></footer></div></div>
}




