import { Bell, BookOpen, CalendarDays, ClipboardList, GraduationCap, Home, Settings } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '../lib/utils';
import { QuickActivity } from '../features/activities/quick-activity';
import { useNotifications } from '../features/notifications/notifications-page';
import { PushPermissionPrompt } from '../features/notifications/push-permission-prompt';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

const navigation = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/subjects', label: 'Materias', icon: BookOpen },
  { to: '/calendar', label: 'Calendario', icon: CalendarDays },
  { to: '/activities', label: 'Tareas', icon: ClipboardList },
  { to: '/notifications', label: 'Avisos', icon: Bell },
  { to: '/settings', label: 'Configuración', icon: Settings },
];

function NavItem({ item, unread = 0 }: { item: (typeof navigation)[number]; unread?: number }) {
  const Icon = item.icon;
  return <NavLink to={item.to} end={item.end} className={({ isActive }) => cn('relative flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 md:flex-row md:gap-3 md:px-3 md:py-3 md:text-sm', isActive && 'bg-indigo-400/15 text-indigo-300')}><span className="relative"><Icon size={20} />{item.to === '/notifications' && unread > 0 && <span className="absolute -right-2 -top-2 grid min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">{unread > 9 ? '9+' : unread}</span>}</span><span className="max-w-full truncate">{item.label}</span></NavLink>;
}

export function AppLayout() {
  const notifications = useNotifications(); const unread = notifications.data?.unread ?? 0; const queryClient = useQueryClient();
  useEffect(() => { void api('/notifications/process', { method: 'POST' }).then(() => queryClient.invalidateQueries({ queryKey: ['notifications'] })).catch(() => undefined); }, [queryClient]);
  return <div className="min-h-screen bg-zinc-950"><aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-zinc-800 bg-zinc-950 p-5 md:block"><div className="mb-8 flex items-center gap-3 px-2"><span className="grid size-10 place-items-center rounded-xl bg-indigo-400 text-zinc-950"><GraduationCap /></span><span className="text-lg font-bold">Schooler</span></div><nav className="space-y-1">{navigation.map((item) => <NavItem key={item.to} item={item} unread={unread} />)}</nav></aside><div className="pb-24 md:ml-64 md:pb-0"><Outlet /></div><QuickActivity /><PushPermissionPrompt /><nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-6 border-t border-zinc-800 bg-zinc-950/95 px-1 py-1 backdrop-blur md:hidden">{navigation.map((item) => <NavItem key={item.to} item={item} unread={unread} />)}</nav></div>;
}
