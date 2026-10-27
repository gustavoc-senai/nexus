import { useEffect, useState } from 'react'
export function useRemote<T>(fetcher: () => Promise<T>, refreshMs = 0) {
  const [data, setData] = useState<T | null>(null), [loading, setLoading] = useState(true), [error, setError] = useState(''), [revision, setRevision] = useState(0)
  useEffect(() => {
    let active = true
    let inFlight = false
    function load() {
      if (inFlight) return
      inFlight = true
      void fetcher().then(result => { if (active) { setData(result); setError('') } })
      .catch(() => { if (active) setError('Não foi possível carregar os dados. Verifique sua conexão e a configuração do Supabase.') })
      .finally(() => { inFlight = false; if (active) setLoading(false) })
    }
    load()
    const refreshVisible = () => { if (!document.hidden) load() }
    const timer = refreshMs > 0 ? setInterval(refreshVisible, refreshMs) : undefined
    if (refreshMs > 0) { window.addEventListener('focus', refreshVisible); document.addEventListener('visibilitychange', refreshVisible) }
    return () => { active = false; clearInterval(timer); window.removeEventListener('focus', refreshVisible); document.removeEventListener('visibilitychange', refreshVisible) }
  }, [fetcher, revision, refreshMs])
  return { data, loading, error, refresh: () => { setLoading(true); setRevision(v => v + 1) } }
}
