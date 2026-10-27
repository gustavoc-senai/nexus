import { Link, NavLink } from 'react-router-dom'
import { ArrowUpRight, BookOpen, X } from 'lucide-react'
import { Brand } from '../ui/Primitives'
import { navigationGroups, type PortalNavigation } from './navigation'
import { missions } from '../../services/missions'
export function Sidebar({ base, teacher, links, open, close }: { base: string; teacher: boolean; links: PortalNavigation; open: boolean; close: () => void }) {
  return <aside id="portal-sidebar" className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Menu do portal">
    <Link to={base} onClick={close} aria-label="Nexus início"><Brand /></Link>
    <button className="mobile-close icon-button" onClick={close} aria-label="Fechar menu"><X /></button>
    <div className="sidebar-portal"><span className="status-dot" />{teacher ? 'PORTAL DO PROFESSOR' : 'PORTAL DO ALUNO'}</div>
    <nav aria-label="Navegação principal">{navigationGroups(teacher).map(group => <div className="nav-section" key={group.label}><div className="nav-section-label">{group.label}</div>{group.paths.map(path => links.find(link => link.path === path)).filter(link => link !== undefined).map(({ path, label, icon: Icon }) => <NavLink end={!path} to={base + path} key={path} onClick={close}><Icon size={18} /><span>{label}</span>{path === '/missions' && <span className="nav-count">{missions.length}</span>}</NavLink>)}</div>)}</nav>
    <div className="sidebar-bottom"><div className="help-card"><BookOpen size={21} /><strong>{teacher ? 'Ensine com mais clareza.' : 'Aprenda com um plano.'}</strong><p>{teacher ? 'Consulte os níveis, objetivos e resoluções do catálogo.' : 'Conheça as fórmulas e organize suas próximas descobertas.'}</p><Link to={`${base}/guide`} onClick={close}>Abrir guia <ArrowUpRight size={15} /></Link></div><div className="system-status"><span className="status-dot" /> APRENDIZAGEM MATEMÁTICA <span>NXS</span></div></div>
  </aside>
}
