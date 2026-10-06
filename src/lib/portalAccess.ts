import type { UserRole } from '../context/AuthContext'

export function portalForRole(role: UserRole) {
  return role === 'student' ? '/student' : '/teacher'
}

export function canAccessPortal(role: UserRole, allowedRoles?: readonly UserRole[]) {
  return !allowedRoles || allowedRoles.includes(role)
}
