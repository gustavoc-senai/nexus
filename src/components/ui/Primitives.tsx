import { Atom, ArrowUpRight, Zap, Compass, Radio, HeartPulse } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Mission } from '../../types/database'
export function Brand() { return <div className="brand"><div className="brand-symbol"><Atom size={27} strokeWidth={1.5} /></div><div><span>ESTAÇÃO</span><strong>NEXUS<span className="brand-period">.</span></strong></div></div> }
export function MissionIcon({ type, size = 24 }: { type: Mission['icon']; size?: number }) { const Icon = { energy: Zap, navigation: Compass, communication: Radio, life: HeartPulse }[type]; return <Icon size={size} strokeWidth={1.6} /> }
export function Progress({ value }: { value: number }) { return <div className="progress-track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso"><div style={{ width: `${value}%` }} /></div> }
export function Stat({ label, value, detail, icon }: { label: string; value: string | number; detail: string; icon: ReactNode }) { return <article className="stat"><div className="stat-top"><span>{label}</span>{icon}</div><strong>{value}</strong><small><ArrowUpRight size={14} />{detail}</small></article> }
export function PageHeading({ kicker, title, description, action }: { kicker: string; title: string; description: string; action?: ReactNode }) { return <div className="page-heading"><div><span className="eyebrow">{kicker}</span><h1>{title}</h1><p>{description}</p></div>{action}</div> }
export function EmptyState({ title, children }: { title: string; children: ReactNode }) { return <div className="empty-state"><Compass size={32} /><h2>{title}</h2><p>{children}</p></div> }
