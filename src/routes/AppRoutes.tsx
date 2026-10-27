const LearningHub = lazy(() => import('../pages/shared/LearningHub'))
const Practice = lazy(() => import('../pages/shared/Practice'))
const Review = lazy(() => import('../pages/student/Review'))
const Notifications = lazy(() => import('../pages/shared/Notifications'))
const BasicMath = lazy(() => import('../pages/shared/BasicMath'))
const Landing = lazy(() => import('../pages/shared/Landing'))
const Tasks = lazy(() => import('../pages/shared/Tasks'))
const ClassroomSupport = lazy(() => import('../pages/shared/ClassroomSupport'))
import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, Link, useOutletContext } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { portalForRole } from '../lib/portalAccess'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { DemoRoute } from '../components/auth/DemoRoute'
import { AppLayout } from '../components/layout/AppLayout'
import { EmptyState } from '../components/ui/Primitives'
const Login = lazy(() => import('../pages/auth/Login'))
const Register = lazy(() => import('../pages/auth/Register'))
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'))
const AuthForm = lazy(() => import('../pages/auth/AuthForm'))
const StudentDashboard = lazy(() => import('../pages/student/StudentDashboard'))
const StationMap = lazy(() => import('../pages/student/StationMap'))
const Sector = lazy(() => import('../pages/student/Sector'))
const Challenge = lazy(() => import('../pages/student/Challenge'))
const MissionResult = lazy(() => import('../pages/student/MissionResult'))
const StudentMissions = lazy(() => import('../pages/student/Missions'))
const Progress = lazy(() => import('../pages/student/Progress'))
const TeacherDashboard = lazy(() => import('../pages/teacher/TeacherDashboard'))
const Students = lazy(() => import('../pages/teacher/Students'))
const StudentPerformance = lazy(() => import('../pages/teacher/StudentPerformance'))
const TeacherMissions = lazy(() => import('../pages/teacher/Missions'))
const Challenges = lazy(() => import('../pages/teacher/Challenges'))
const Statistics = lazy(() => import('../pages/teacher/Statistics'))
const Guide = lazy(() => import('../pages/shared/Guide'))

const Classes = lazy(() => import('../pages/teacher/Classes'))
const Classroom = lazy(() => import('../pages/student/Classroom'))
const Explorer = lazy(() => import('../pages/shared/Explorer'))

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
    <Route path="review" element={<Review />} /><Route path="progress" element={<Progress />} />
    <Route path="guide" element={<Guide />} />
    <Route path="learn" element={<LearningHub />} /><Route path="practice/:id" element={<Practice />} /><Route path="notifications" element={<Notifications />} /><Route path="basic" element={<BasicMath />} /><Route path="basic/:id" element={<BasicMath />} /><Route path="tasks" element={<Tasks />} /><Route path="chat" element={<ClassroomSupport />} /><Route path="videos" element={<ClassroomSupport />} /><Route path="explorer" element={<Explorer />} />
    <Route path="classroom" element={<Classroom />} />
    <Route path="*" element={<StudentFallback />} />
  </>
)

export function AppRoutes() {
  return (
    <Suspense fallback={<p className="route-loading" role="status">Carregando a estação…</p>}><Routes>
      <Route path="/" element={<Landing />} />
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
          <Route path="classes" element={<Classes />} />
          <Route path="students" element={<Students />} />
          <Route path="students/:id" element={<StudentPerformance />} />
          <Route path="challenges" element={<Challenges />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="learn" element={<LearningHub />} /><Route path="practice/:id" element={<Practice />} /><Route path="notifications" element={<Notifications />} /><Route path="basic" element={<BasicMath />} /><Route path="basic/:id" element={<BasicMath />} /><Route path="tasks" element={<Tasks />} /><Route path="chat" element={<ClassroomSupport />} /><Route path="videos" element={<ClassroomSupport />} />
          <Route path="explorer" element={<Explorer />} />
          <Route path="guide" element={<Guide />} />
          <Route path="*" element={<Navigate to="/teacher" replace />} />
        </Route>
      </Route>
      <Route path="*" element={<EmptyState title="Rota não encontrada"><Link to="/">Voltar ao acesso</Link></EmptyState>} />
    </Routes></Suspense>
  )
}

