export function RemoteState({ loading, error, retry }: { loading: boolean; error: string; retry: () => void }) {
  if (loading) return <p className="notice" role="status">Carregando os dados…</p>
  if (error) return <div className="notice error" role="alert"><span>{error}</span><button type="button" className="button secondary" onClick={retry}>Tentar novamente</button></div>
  return null
}
