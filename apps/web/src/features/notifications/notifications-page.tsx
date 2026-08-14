import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, BellRing, CheckCheck, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { EmptyState, ErrorMessage, PageLoading } from '../../components/feedback';
import { api } from '../../lib/api';
import { disableWebPush, enableWebPush } from './push-client';

interface InternalNotification { id: string; title: string; message: string; type: string; delivered_at: string; read_at: string | null; activity_id: string | null; subject_id: string | null; subject?: { name: string; color: string } | null; }
interface NotificationResponse { notifications: InternalNotification[]; unread: number; }

export function useNotifications() {
  return useQuery({ queryKey: ['notifications'], queryFn: () => api<NotificationResponse>('/notifications'), refetchInterval: 60_000 });
}

export function NotificationsPage() {
  const queryClient = useQueryClient(); const notifications = useNotifications(); const [pushMessage, setPushMessage] = useState('');
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['notifications'] });
  const read = useMutation({ mutationFn: (id: string) => api(`/notifications/${id}/read`, { method: 'PATCH' }), onSuccess: refresh });
  const readAll = useMutation({ mutationFn: () => api('/notifications/read-all', { method: 'PATCH' }), onSuccess: refresh });
  const enablePush = async () => {
    setPushMessage('');
    try { await enableWebPush(); setPushMessage('Web Push quedó activado en este dispositivo.'); } catch (error) { setPushMessage(error instanceof Error ? error.message : 'No fue posible activar Web Push.'); }
  };
  const disablePush = async () => {
    await disableWebPush(); setPushMessage('Web Push quedó desactivado en este dispositivo.');
  };
  if (notifications.isPending) return <PageLoading />;
  return <main className="mx-auto max-w-4xl px-4 py-8"><header className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-indigo-400">RECORDATORIOS</p><h1 className="mt-1 text-3xl font-bold">Notificaciones</h1><p className="mt-2 text-zinc-400">{notifications.data?.unread ?? 0} sin leer.</p></div>{Boolean(notifications.data?.unread) && <Button className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700" onClick={() => readAll.mutate()}><CheckCheck size={18} /> Marcar todas</Button>}</header>{notifications.error && <ErrorMessage>{notifications.error.message}</ErrorMessage>}<section className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5"><div className="flex items-start gap-3"><BellRing className="mt-1 shrink-0 text-indigo-300" /><div><h2 className="font-semibold">Avisos incluso con Schooler cerrado</h2><p className="mt-1 text-sm text-zinc-400">Si activas Web Push, este dispositivo recibirá recordatorios de entregas y resúmenes diarios. El navegador pedirá permiso únicamente después de pulsar el botón.</p><div className="mt-4 flex flex-wrap gap-2"><Button onClick={() => void enablePush()}>Activar Web Push</Button><Button className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700" onClick={() => void disablePush()}>Desactivar</Button></div>{pushMessage && <p role="status" className="mt-3 text-sm text-zinc-300">{pushMessage}</p>}</div></div></section>{notifications.data?.notifications.length === 0 ? <EmptyState title="No hay notificaciones todavía" text="Los recordatorios aparecerán cuando sean procesados." /> : <div className="space-y-3">{notifications.data?.notifications.map((item) => <article key={item.id} className={item.read_at ? 'rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4' : 'rounded-2xl border border-indigo-400/30 bg-indigo-400/10 p-4'}><div className="flex gap-3"><span className="mt-1 grid size-9 shrink-0 place-items-center rounded-full bg-zinc-800"><Bell size={17} style={{ color: item.subject?.color }} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold">{item.title}</h2><time className="text-xs text-zinc-500">{new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota' }).format(new Date(item.delivered_at))}</time></div><p className="mt-1 text-sm text-zinc-300">{item.message}</p><div className="mt-3 flex gap-4">{!item.read_at && <button className="text-xs font-medium text-indigo-300" onClick={() => read.mutate(item.id)}>Marcar como leída</button>}{item.activity_id && <Link className="inline-flex items-center gap-1 text-xs font-medium text-indigo-300" to="/activities" onClick={() => !item.read_at && read.mutate(item.id)}>Ver actividad <ExternalLink size={12} /></Link>}</div></div></div></article>)}</div>}</main>;
}
