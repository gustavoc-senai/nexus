import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// A signed-in account always uses its own portal, including on demo URLs.
export function DemoRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="screen-loader" role="status"><div className="loader-orbit" /><p>Inicializando estação…</p></div>
  }

  if (user) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
