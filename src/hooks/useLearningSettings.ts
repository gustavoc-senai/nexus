import { useMemo, useSyncExternalStore } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Stage } from '../services/curriculum'
export interface LearningSettings { stage?: Stage; largeText?: boolean; reduceMotion?: boolean }
function subscribe(listener:()=>void) { window.addEventListener('nexus-settings',listener);window.addEventListener('storage',listener);return ()=>{window.removeEventListener('nexus-settings',listener);window.removeEventListener('storage',listener)} }
const volatile = new Map<string,string>()
export function useLearningSettings() {
  const {user}=useAuth(),{pathname}=useLocation(),key=`nexus-preferences-${pathname.startsWith('/demo')?'demo':user?.id??'guest'}`
  const raw=useSyncExternalStore(subscribe,()=>{try{return localStorage.getItem(key)??volatile.get(key)??'{}'}catch{return volatile.get(key)??'{}'}})
  const settings=useMemo<LearningSettings>(()=>{try{const p=JSON.parse(raw);return {stage:['foundations','developing','advancing'].includes(p.stage)?p.stage:undefined,largeText:p.largeText===true,reduceMotion:p.reduceMotion===true}}catch{return {}}},[raw])
  function update(patch:Partial<LearningSettings>) {const value=JSON.stringify({...settings,...patch});volatile.set(key,value);try{localStorage.setItem(key,value)}catch{/* Settings remain usable for this session. */}window.dispatchEvent(new Event('nexus-settings'))}
  return {settings,update}
}
