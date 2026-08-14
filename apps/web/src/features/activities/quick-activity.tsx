import { findCurrentClass, type Subject, type WeeklyClass } from '@schooler/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { ErrorMessage } from '../../components/feedback';
import { api } from '../../lib/api';
import { ActivityForm, type ActivityPayload } from './activity-form';

export function QuickActivity() {
  const [open, setOpen] = useState(false); const queryClient = useQueryClient();
  useEffect(() => { const handler = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setOpen(true); } if (event.key === 'Escape') setOpen(false); }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler); }, []);
  const subjects = useQuery({ queryKey: ['subjects', 'quick'], enabled: open, queryFn: () => api<{ subjects: Subject[] }>('/subjects') });
  const calendar = useQuery({ queryKey: ['calendar'], enabled: open, queryFn: () => api<{ classes: WeeklyClass[] }>('/calendar') });
  const currentClass = calendar.data ? findCurrentClass(calendar.data.classes) : null;
  const create = useMutation({ mutationFn: (payload: ActivityPayload) => api('/activities', { method: 'POST', body: JSON.stringify(payload) }), onSuccess: async () => { setOpen(false); await Promise.all([queryClient.invalidateQueries({ queryKey: ['activities'] }), queryClient.invalidateQueries({ queryKey: ['dashboard'] }), queryClient.invalidateQueries({ queryKey: ['calendar'] })]); } });
  return <><Button className="fixed bottom-24 right-4 z-40 gap-2 rounded-full px-5 shadow-xl shadow-black/40 md:bottom-6 md:right-6" onClick={() => setOpen(true)}><Plus size={20} /><span>Nueva tarea</span><kbd className="hidden rounded bg-black/20 px-1.5 py-0.5 text-[10px] lg:inline">Ctrl K</kbd></Button>{open && <div className="fixed inset-0 z-[60] grid items-end bg-black/70 p-0 backdrop-blur-sm sm:place-items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><section role="dialog" aria-modal="true" aria-labelledby="quick-task-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl sm:rounded-2xl"><header className="mb-5 flex items-start justify-between"><div><h2 id="quick-task-title" className="text-xl font-bold">Nueva tarea rápida</h2><p className="mt-1 text-sm text-zinc-400">{currentClass ? `${currentClass.subject.name} fue seleccionada porque estás en clase.` : 'Selecciona la materia y registra el pendiente.'}</p></div><button aria-label="Cerrar" className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800" onClick={() => setOpen(false)}><X /></button></header>{create.error && <div className="mb-4"><ErrorMessage>{create.error.message}</ErrorMessage></div>}{subjects.isPending || calendar.isPending ? <p className="py-10 text-center text-zinc-400">Preparando formulario…</p> : subjects.data?.subjects.length ? <ActivityForm subjects={subjects.data.subjects} defaultSubjectId={currentClass?.subject_id} busy={create.isPending} onSubmit={(payload) => create.mutate(payload)} onCancel={() => setOpen(false)} /> : <p className="py-10 text-center text-zinc-400">Primero debes crear una materia.</p>}</section></div>}</>;
}
