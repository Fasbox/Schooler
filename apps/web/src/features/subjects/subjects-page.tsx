import type { Subject } from '@schooler/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Archive, Plus, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { EmptyState, ErrorMessage, PageLoading } from '../../components/feedback';
import { api } from '../../lib/api';
import { usePeriods } from '../periods/periods-panel';
import { SubjectForm, type SubjectFormValues } from './subject-form';

export function SubjectsPage() {
  const queryClient = useQueryClient();
  const periods = usePeriods();
  const current = periods.data?.periods.find((period) => period.status === 'current');
  const [showForm, setShowForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const subjects = useQuery({ queryKey: ['subjects', current?.id, showArchived], enabled: Boolean(current), queryFn: () => api<{ subjects: Subject[] }>(`/subjects?periodId=${current!.id}&includeArchived=${showArchived}`) });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['subjects'] });
  const create = useMutation({ mutationFn: (values: SubjectFormValues) => api('/subjects', { method: 'POST', body: JSON.stringify(values) }), onSuccess: () => { setShowForm(false); void refresh(); } });
  const status = useMutation({ mutationFn: ({ id, action }: { id: string; action: 'archive' | 'restore' }) => api(`/subjects/${id}/${action}`, { method: 'PATCH' }), onSuccess: refresh });
  if (periods.isPending) return <PageLoading />;
  return <main className="mx-auto max-w-6xl px-4 py-8"><header className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-indigo-400">{current ? `${current.year}-${current.semester}` : 'Sin periodo actual'}</p><h1 className="mt-1 text-3xl font-bold">Materias</h1><p className="mt-2 text-zinc-400">Información básica y sesiones semanales.</p></div><Button disabled={!current} onClick={() => setShowForm((value) => !value)}><Plus size={18} /> Nueva materia</Button></header>{!current && <EmptyState title="No hay periodo actual" text="Selecciona un periodo actual desde Configuración." />}{showForm && periods.data && <section className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5"><h2 className="mb-4 text-lg font-semibold">Nueva materia</h2>{create.error && <ErrorMessage>{create.error.message}</ErrorMessage>}<SubjectForm periods={periods.data.periods} busy={create.isPending} onSubmit={(values) => create.mutate(values)} onCancel={() => setShowForm(false)} /></section>} {current && <div className="mb-4 flex items-center justify-between"><p className="text-sm text-zinc-500">{subjects.data?.subjects.length ?? 0} materias</p><button className="text-sm text-indigo-300 hover:underline" onClick={() => setShowArchived((value) => !value)}>{showArchived ? 'Ocultar archivadas' : 'Mostrar archivadas'}</button></div>}{subjects.isPending && current ? <PageLoading /> : subjects.error ? <ErrorMessage>{subjects.error.message}</ErrorMessage> : subjects.data?.subjects.length === 0 ? <EmptyState title="No hay materias todavía" text="Crea tu primera materia para comenzar." /> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{subjects.data?.subjects.map((subject) => <article key={subject.id} className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"><div className="h-1.5" style={{ backgroundColor: subject.color }} /><div className="p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">{subject.name}</h2><p className="mt-1 text-sm text-zinc-400">{subject.professor || 'Profesor pendiente'}</p></div><span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-400">{subject.subject_schedules?.length ?? 0} sesiones</span></div><div className="mt-5 flex items-center justify-between"><Link className="font-medium text-indigo-300 hover:underline" to={`/subjects/${subject.id}`}>Ver detalle</Link><button aria-label={subject.status === 'archived' ? 'Restaurar materia' : 'Archivar materia'} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800" onClick={() => status.mutate({ id: subject.id, action: subject.status === 'archived' ? 'restore' : 'archive' })}>{subject.status === 'archived' ? <RotateCcw size={18} /> : <Archive size={18} />}</button></div></div></article>)}</div>}</main>;
}
