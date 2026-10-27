import { Component, type ReactNode } from 'react'
export class PageErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return <section className="panel management-form" role="alert"><h1>Não foi possível abrir esta página.</h1><p>Confira a conexão e recarregue para tentar novamente. Seus rascunhos salvos serão preservados.</p><button type="button" className="button primary" onClick={() => window.location.reload()}>Recarregar página</button></section>
    return this.props.children
  }
}
