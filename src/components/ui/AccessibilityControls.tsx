import { useEffect } from 'react'
import { Accessibility } from 'lucide-react'
import { useLearningSettings } from '../../hooks/useLearningSettings'
export function AccessibilityControls() {
  const {settings,update}=useLearningSettings()
  useEffect(()=>{document.documentElement.classList.toggle('large-text',Boolean(settings.largeText));document.documentElement.classList.toggle('reduce-motion',Boolean(settings.reduceMotion));return ()=>{document.documentElement.classList.remove('large-text','reduce-motion')}},[settings.largeText,settings.reduceMotion])
  return <details className="accessibility-controls"><summary><Accessibility size={18}/>Acessibilidade</summary><div><label><input type="checkbox" checked={Boolean(settings.largeText)} onChange={e=>update({largeText:e.target.checked})}/>Ampliar textos</label><label><input type="checkbox" checked={Boolean(settings.reduceMotion)} onChange={e=>update({reduceMotion:e.target.checked})}/>Reduzir animações</label><p>Preferências salvas neste navegador. A redução de movimento do dispositivo também é respeitada.</p></div></details>
}
