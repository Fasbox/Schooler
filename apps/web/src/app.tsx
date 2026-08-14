import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { DashboardPage } from './features/dashboard/dashboard-page';
import { ForgotPasswordPage } from './features/auth/forgot-password-page';
import { LoginPage } from './features/auth/login-page';
import { ResetPasswordPage } from './features/auth/reset-password-page';
import { useAuth } from './features/auth/auth-provider';
import { AppLayout } from './components/app-layout';
import { SubjectsPage } from './features/subjects/subjects-page';
import { SubjectDetailPage } from './features/subjects/subject-detail-page';
import { SettingsPage } from './features/settings/settings-page';
import { ActivitiesPage } from './features/activities/activities-page';
import { CalendarPage } from './features/calendar/calendar-page';
import { NotificationsPage } from './features/notifications/notifications-page';

function PrivateRoute() {
  const { session, loading } = useAuth();
  if (loading) return <main className="grid min-h-screen place-items-center text-zinc-400">Cargando…</main>;
  return session ? <Outlet /> : <Navigate to="/login" replace />;
}

export function App() {
  return <Routes><Route path="/login" element={<LoginPage />} /><Route path="/forgot-password" element={<ForgotPasswordPage />} /><Route path="/reset-password" element={<ResetPasswordPage />} /><Route element={<PrivateRoute />}><Route element={<AppLayout />}><Route index element={<DashboardPage />} /><Route path="subjects" element={<SubjectsPage />} /><Route path="subjects/:id" element={<SubjectDetailPage />} /><Route path="activities" element={<ActivitiesPage />} /><Route path="calendar" element={<CalendarPage />} /><Route path="notifications" element={<NotificationsPage />} /><Route path="settings" element={<SettingsPage />} /></Route></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes>;
}
