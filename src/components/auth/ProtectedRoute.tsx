import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { canAccessPortal, portalForRole } from '../../lib/portalAccess'
export function ProtectedRoute({ allowedRoles }: { allowedRoles?: Array<'student' | 'teacher' | 'admin'> }) {
  const { user, profile, loading, refreshProfile, signOut } = useAuth()
  const location = useLocation()
  if (loading) return <div className="screen-loader" role="status"><div className="loader-orbit" /><p>Inicializando estação…</p></div>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!profile || !profile.is_active) return <div className="screen-loader"><h2>{profile ? 'Acesso desativado' : 'Perfil indisponível'}</h2><p>{profile ? 'Entre em contato com o responsável pela plataforma.' : 'Não foi possível carregar seu perfil. Tente novamente.'}</p><button className="button secondary" onClick={() => void refreshProfile()}>Tentar novamente</button><button className="button secondary" onClick={() => void signOut().catch(() => {})}>Voltar ao acesso</button></div>
  if (!canAccessPortal(profile.role, allowedRoles)) return <Navigate to={portalForRole(profile.role)} replace />
  return <Outlet />
}
