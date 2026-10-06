import { Routes, Route, Navigate, Link, useOutletContext } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { portalForRole } from '../lib/portalAccess'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { DemoRoute } from '../components/auth/DemoRoute'
import { AppLayout } from '../components/layout/AppLayout'
import { EmptyState } from '../components/ui/Primitives'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import ForgotPassword from '../pages/auth/ForgotPassword'
import AuthForm from '../pages/auth/AuthForm'
import StudentDashboard from '../pages/student/StudentDashboard'
import StationMap from '../pages/student/StationMap'
import Sector from '../pages/student/Sector'
import Challenge from '../pages/student/Challenge'
import MissionResult from '../pages/student/MissionResult'
import StudentMissions from '../pages/student/Missions'
import Progress from '../pages/student/Progress'
import TeacherDashboard from '../pages/teacher/TeacherDashboard'
import Students from '../pages/teacher/Students'
import StudentPerformance from '../pages/teacher/StudentPerformance'
import TeacherMissions from '../pages/teacher/Missions'
import Challenges from '../pages/teacher/Challenges'
import Statistics from '../pages/teacher/Statistics'

function DashboardRedirect() {
  const { profile } = useAuth()
  return <Navigate to={profile ? portalForRole(profile.role) : '/login'} replace />
}

function StudentFallback() { const { base } = useOutletContext<{ base: string }>(); return <Navigate to={base} replace /> }

const studentRoutes = (
  <>
    <Route index element={<StudentDashboard />} />
    <Route path="missions" element={<StudentMissions />} />
    <Route path="map" element={<StationMap />} />
    <Route path="sector/:id" element={<Sector />} />
    <Route path="challenge/:id" element={<Challenge />} />
    <Route path="result/:id" element={<MissionResult />} />
    <Route path="progress" element={<Progress />} />
    <Route path="*" element={<StudentFallback />} />
  </>
)

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<AuthForm mode="reset" />} />
      <Route element={<DemoRoute />}>
        <Route path="/demo" element={<AppLayout demo />}>{studentRoutes}</Route>
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardRedirect />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/student" element={<AppLayout />}>{studentRoutes}</Route>
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['teacher', 'admin']} />}>
        <Route path="/teacher" element={<AppLayout />}>
          <Route index element={<TeacherDashboard />} />
          <Route path="missions" element={<TeacherMissions />} />
          <Route path="students" element={<Students />} />
          <Route path="students/:id" element={<StudentPerformance />} />
          <Route path="challenges" element={<Challenges />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="*" element={<Navigate to="/teacher" replace />} />
        </Route>
      </Route>
      <Route path="*" element={<EmptyState title="Rota não encontrada"><Link to="/">Voltar ao acesso</Link></EmptyState>} />
    </Routes>
  )
}

