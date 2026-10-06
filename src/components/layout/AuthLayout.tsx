import type { ReactNode } from 'react'
import { ShieldCheck, ArrowUpRight, Orbit } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Brand } from '../ui/Primitives'
export function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return <main className="auth-page"><section className="auth-visual"><Link to="/demo"><Brand /></Link><div className="auth-grid" /><div className="auth-orbit orbit-one" /><div className="auth-orbit orbit-two" /><div className="auth-visual-content"><span className="eyebrow">CONHECIMENTO. EXPLORAÇÃO. FUTURO.</span><h1>Grandes descobertas<br />começam com<br /><span>novas perguntas.</span></h1><p>Uma estação de possibilidades. Transforme desafios de geometria espacial em missões e descubra até onde você pode chegar.</p><div className="auth-features"><span><Orbit size={18} />Aprendizagem em movimento</span><span><ShieldCheck size={18} />Ambiente educacional</span></div><Link className="text-link" to="/demo">Conheça a estação <ArrowUpRight size={17} /></Link></div><div className="auth-status"><span className="status-dot" />ESTAÇÃO NEXUS · SISTEMAS ONLINE</div></section><section className="auth-panel"><div className="auth-panel-inner"><div className="mobile-brand"><Brand /></div><div className="auth-heading"><span className="eyebrow">ACESSO À ESTAÇÃO</span><h2>{title}</h2><p>{subtitle}</p></div>{children}<div className="auth-security"><ShieldCheck size={15} />Seu próximo passo começa com conhecimento.</div></div></section></main>
}

