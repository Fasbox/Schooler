import { BellRing, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { enableWebPush, pushConfigured, pushSupported } from './push-client';

export function PushPermissionPrompt() {
  const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  useEffect(() => {
    if (!pushSupported() || !pushConfigured() || window.Notification.permission !== 'default') return;
    if (sessionStorage.getItem('schooler-push-prompt-dismissed') !== 'true') setOpen(true);
  }, []);
  const close = () => { sessionStorage.setItem('schooler-push-prompt-dismissed', 'true'); setOpen(false); };
  const enable = async () => { setBusy(true); setMessage(''); try { await enableWebPush(); setOpen(false); } catch (error) { setMessage(error instanceof Error ? error.message : 'No fue posible activar las notificaciones.'); } finally { setBusy(false); } };
  if (!open) return null;
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="push-prompt-title" className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-indigo-400/15 text-indigo-300"><BellRing /></span><button aria-label="Ahora no" className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800" onClick={close}><X /></button></div><h2 id="push-prompt-title" className="mt-5 text-xl font-bold">¿Quieres recibir recordatorios?</h2><p className="mt-2 text-sm leading-6 text-zinc-400">Schooler puede avisarte sobre tareas, parciales y actividades importantes aunque esta pestaña no esté abierta. Puedes desactivarlo después desde Avisos.</p>{message && <p role="alert" className="mt-3 text-sm text-rose-300">{message}</p>}<div className="mt-6 flex gap-2"><Button disabled={busy} onClick={() => void enable()}>{busy ? 'Activando…' : 'Permitir notificaciones'}</Button><Button className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700" onClick={close}>Ahora no</Button></div></section></div>;
}
