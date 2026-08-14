import type { AcademicPeriod } from '@schooler/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { ErrorMessage } from '../../components/feedback';

export function usePeriods() {
  return useQuery({ queryKey: ['periods'], queryFn: () => api<{ periods: AcademicPeriod[] }>('/academic-periods') });
}

export function PeriodsPanel() {
  const queryClient = useQueryClient();
  const periods = usePeriods();
  const [year, setYear] = useState(new Date().getFullYear());
  const [semester, setSemester] = useState<1 | 2>(1);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['periods'] });
  const action = useMutation({ mutationFn: ({ id, action }: { id: string; action: 'current' | 'archive' }) => api(`/academic-periods/${id}/${action}`, { method: 'PATCH' }), onSuccess: refresh });
  const create = useMutation({ mutationFn: () => api('/academic-periods', { method: 'POST', body: JSON.stringify({ year, semester, status: 'future' }) }), onSuccess: refresh });
  const error = action.error ?? create.error;
  return <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"><div className="mb-4"><h2 className="text-lg font-semibold">Periodos académicos</h2><p className="text-sm text-zinc-400">Selecciona el semestre actual o consulta el historial.</p></div>{error && <ErrorMessage>{error.message}</ErrorMessage>}<div className="space-y-2">{periods.data?.periods.map((period) => <div key={period.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-zinc-950 p-3"><div><p className="font-semibold">{period.year}-{period.semester}</p><p className="text-xs capitalize text-zinc-500">{period.status === 'current' ? 'Actual' : period.status === 'archived' ? 'Archivado' : 'Futuro'}</p></div><div className="flex gap-2">{period.status !== 'current' && <Button className="min-h-9 px-3 text-xs" onClick={() => action.mutate({ id: period.id, action: 'current' })}>Hacer actual</Button>}{period.status === 'current' && <Button className="min-h-9 bg-zinc-800 px-3 text-xs text-zinc-200 hover:bg-zinc-700" onClick={() => action.mutate({ id: period.id, action: 'archive' })}>Archivar</Button>}</div></div>)}</div><form className="mt-5 grid grid-cols-[1fr_1fr_auto] gap-2" onSubmit={(event) => { event.preventDefault(); create.mutate(); }}><input aria-label="Año" className="min-w-0 rounded-lg border border-zinc-700 bg-zinc-950 px-3" type="number" min="2000" max="2200" value={year} onChange={(event) => setYear(Number(event.target.value))} /><select aria-label="Semestre" className="rounded-lg border border-zinc-700 bg-zinc-950 px-3" value={semester} onChange={(event) => setSemester(Number(event.target.value) as 1 | 2)}><option value="1">Sem. 1</option><option value="2">Sem. 2</option></select><Button disabled={create.isPending}>Crear</Button></form></section>;
}
