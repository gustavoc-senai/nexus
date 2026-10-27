import { AccessibilityControls } from '../ui/AccessibilityControls'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Suspense, useEffect, useRef, useState } from 'react'
import { Info, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { portalNavigation } from './navigation'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useDemo } from '../../context/LearningContext'

export function AppLayout({ demo = false }: { demo?: boolean }) {
  const { profile, signOut } = useAuth()
  const learning = useDemo()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const main = useRef<HTMLElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const teacher = !demo && (profile?.role === 'teacher' || profile?.role === 'admin')
  const base = demo ? '/demo' : teacher ? '/teacher' : '/student'
  const links = portalNavigation(teacher)
  const relative = location.pathname.slice(base.length)
  const title = links.find(link => link.path === relative)?.label ?? (relative.startsWith('/practice/') ? 'Prática de matemática' : relative.startsWith('/basic/') ? 'Atividade de matemática' : relative.startsWith('/sector/') ? 'Detalhes da missão' : relative.startsWith('/challenge/') ? 'Desafio em andamento' : relative.startsWith('/result/') ? 'Resultado da missão' : relative.startsWith('/students/') ? 'Desempenho do aluno' : 'Estação Nexus')
  const quickPaths = teacher ? ['', '/classes', '/tasks', '/chat'] : ['', '/learn', '/tasks', '/chat']
  const mobileLinks = quickPaths.map(path => links.find(link => link.path === path)!)
  useEffect(() => { window.scrollTo({ top: 0 }); main.current?.focus({ preventScroll: true }) }, [location.pathname])
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const sidebar = document.getElementById('portal-sidebar')
    const previousFocus = document.activeElement as HTMLElement | null
    const controls = () => [...(sidebar?.querySelectorAll<HTMLElement>('a, button:not(:disabled)') ?? [])].filter(element => element.getClientRects().length > 0)
    controls()[0]?.focus()
    function keydown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
      if (event.key === 'Tab') {
        const items = controls(); const first = items[0]; const last = items[items.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', keydown)
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', keydown); previousFocus?.focus() }
  }, [open])
  async function exit() { if (busy) return; setBusy(true); setError(''); try { if (!demo) await signOut(); navigate('/login') } catch { setError('Não foi possível sair. Tente novamente.') } finally { setBusy(false) } }
  return <div className="app-shell professional-shell"><a className="skip-link" href="#main">Pular para o conteúdo</a><Sidebar base={base} teacher={teacher} links={links} open={open} close={() => setOpen(false)} />{open && <button className="menu-overlay" aria-label="Fechar navegação" onClick={() => setOpen(false)} />}<div className="workspace"><Topbar base={base} title={title} teacher={teacher} name={demo ? 'Explorador' : profile?.full_name || 'Tripulante'} demo={demo} open={open} toggle={() => setOpen(true)} exit={() => void exit()} busy={busy} /><main ref={main} tabIndex={-1} id="main" className="main-content">{error && <p role="alert" className="notice error">{error}</p>}<AccessibilityControls /><div className="environment-note"><Info size={14} /><span>{demo ? 'Demonstração de aprendizagem · seu progresso fica neste navegador.' : teacher ? 'Portal do professor · gestão de turmas e aprendizagem matemática.' : learning.loading ? 'Conectando seu progresso…' : learning.online ? 'Progresso conectado à sua conta.' : 'Progresso ainda não conectado · rascunhos preservados neste navegador.'}</span></div>{!teacher && !demo && learning.error && <div className="notice error" role="alert"><span>{learning.error}</span><button className="button secondary" type="button" disabled={learning.loading} onClick={learning.retry}>Tentar novamente</button></div>}<Suspense fallback={<p className="notice" role="status">Carregando a seção…</p>}><Outlet context={{ base, teacher, demo }} /></Suspense></main><footer className="app-footer"><span>ESTAÇÃO NEXUS · Matemática em movimento.</span><span>Explore. Aprenda. Evolua.</span></footer></div><nav className="mobile-bottom-nav" aria-label="Navegação rápida">{mobileLinks.map(({ path, shortLabel, icon: Icon }) => <NavLink key={path} end={!path} to={base + path}><Icon size={19} /><span>{shortLabel}</span></NavLink>)}<button type="button" aria-label="Abrir todas as seções" aria-expanded={open} aria-controls="portal-sidebar" onClick={() => setOpen(true)}><Menu size={19}/><span>Mais</span></button></nav></div>
}
