import { calculateGradeSummary, simulateGrade, type Activity, type RequiredGrade } from '@schooler/shared';
import { useMemo, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const typeLabels = { TASK: 'Tarea', EXAM: 'Parcial', QUIZ: 'Quiz', PROJECT: 'Proyecto', STUDY: 'Estudio' } as const;
const format = (value: number | null) => value == null ? '—' : value.toFixed(2).replace(/\.00$/, '.0');

function ObjectiveMessage({ result, objective }: { result: RequiredGrade; objective: 3 | 4 }) {
  if (result.status === 'secured') return <p className="text-sm font-medium text-emerald-300">Tu {objective.toFixed(1)} ya está asegurado.</p>;
  if (result.status === 'impossible') return <p className="text-sm font-medium text-rose-300">Aunque obtengas 5.0 en todo lo restante, ya no es posible terminar con {objective.toFixed(1)}.</p>;
  return <p className="text-sm text-zinc-300">Necesitas <strong>{format(result.value)}</strong> de promedio en lo restante para terminar con {objective.toFixed(1)}.</p>;
}

function Metric({ label, value, suffix = '' }: { label: string; value: string | number; suffix?: string }) {
  return <div className="rounded-xl bg-zinc-950 p-4"><dt className="text-xs text-zinc-500">{label}</dt><dd className="mt-1 text-xl font-bold">{value}{suffix}</dd></div>;
}

function GradeEditor({ activity, busy, onSave }: { activity: Activity; busy: boolean; onSave: (grade: number | null) => void }) {
  const [grade, setGrade] = useState(activity.grade?.toString() ?? '');
  return <div className="flex min-w-32 items-center gap-2"><Input aria-label={`Nota de ${activity.title}`} className="min-h-9 w-20 px-2" type="number" min="0" max="5" step="0.01" value={grade} onChange={(event) => setGrade(event.target.value)} /><Button className="min-h-9 px-3 text-xs" disabled={busy || (grade !== '' && (Number(grade) < 0 || Number(grade) > 5))} onClick={() => onSave(grade === '' ? null : Number(grade))}>Guardar</Button></div>;
}

export function AcademicStatus({ activities, savingId, onSaveGrade }: { activities: Activity[]; savingId?: string; onSaveGrade: (id: string, grade: number | null) => void }) {
  const evaluable = activities.filter((activity) => activity.type !== 'STUDY');
  const summary = calculateGradeSummary(evaluable);
  return <><section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"><div className="mb-5"><h2 className="text-lg font-semibold">Estado académico</h2><p className="mt-1 text-sm text-zinc-400">{summary.evaluatedAverage == null ? 'Todavía no hay actividades calificadas.' : `Llevas ${format(summary.evaluatedAverage)} sobre el ${summary.evaluatedWeight}% evaluado.`}</p></div><dl className="grid grid-cols-2 gap-3 lg:grid-cols-5"><Metric label="Promedio evaluado" value={format(summary.evaluatedAverage)} /><Metric label="Acumulado" value={format(summary.weightedAccumulated)} /><Metric label="Planeado" value={summary.plannedWeight} suffix="%" /><Metric label="Evaluado" value={summary.evaluatedWeight} suffix="%" /><Metric label="Restante" value={summary.remainingWeight} suffix="%" /></dl><div className="mt-5 space-y-2 rounded-xl border border-zinc-800 bg-zinc-950 p-4"><ObjectiveMessage result={summary.passing} objective={3} /><ObjectiveMessage result={summary.target} objective={4} /></div></section><section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"><div className="mb-4"><h2 className="text-lg font-semibold">Evaluaciones</h2><p className="text-sm text-zinc-400">Completar una actividad y recibir una nota son acciones independientes.</p></div>{evaluable.length === 0 ? <p className="py-8 text-center text-sm text-zinc-500">No hay evaluaciones registradas.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="text-xs uppercase text-zinc-500"><tr><th className="pb-3">Actividad</th><th className="pb-3">Tipo</th><th className="pb-3">Porcentaje</th><th className="pb-3">Estado</th><th className="pb-3">Nota</th></tr></thead><tbody className="divide-y divide-zinc-800">{evaluable.map((activity) => <tr key={activity.id}><td className="py-3 font-medium">{activity.title}</td><td className="py-3 text-zinc-400">{typeLabels[activity.type]}</td><td className="py-3">{activity.percentage == null ? 'Sin peso' : `${activity.percentage}%`}</td><td className="py-3 text-zinc-400">{activity.status === 'COMPLETED' ? 'Completada' : activity.status === 'IN_PROGRESS' ? 'En progreso' : activity.status === 'CANCELLED' ? 'Cancelada' : 'Pendiente'}</td><td className="py-3">{activity.percentage == null ? <span className="text-xs text-zinc-500">Asigna porcentaje primero</span> : <GradeEditor key={`${activity.id}-${activity.grade}`} activity={activity} busy={savingId === activity.id} onSave={(grade) => onSaveGrade(activity.id, grade)} />}</td></tr>)}</tbody></table></div>}</section><GradeSimulator activities={evaluable} maxPercentage={summary.remainingWeight} /></>;
}

function GradeSimulator({ activities, maxPercentage }: { activities: Activity[]; maxPercentage: number }) {
  const [grade, setGrade] = useState('4.0'); const [percentage, setPercentage] = useState(maxPercentage >= 20 ? '20' : maxPercentage.toString());
  const numericGrade = Number(grade); const numericPercentage = Number(percentage);
  const valid = numericGrade >= 0 && numericGrade <= 5 && numericPercentage > 0 && numericPercentage <= maxPercentage;
  const result = useMemo(() => valid ? simulateGrade(activities, numericGrade, numericPercentage) : null, [activities, numericGrade, numericPercentage, valid]);
  return <section className="rounded-2xl border border-indigo-400/30 bg-indigo-400/10 p-5"><h2 className="text-lg font-semibold">Simulador</h2><p className="mt-1 text-sm text-zinc-400">¿Qué pasa si obtienes cierta nota en una evaluación futura? Este escenario no se guarda.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Nota hipotética<Input className="mt-2" type="number" min="0" max="5" step="0.1" value={grade} onChange={(event) => setGrade(event.target.value)} /></label><label className="text-sm font-medium">Porcentaje hipotético<Input className="mt-2" type="number" min="0.01" max={maxPercentage} step="0.01" value={percentage} onChange={(event) => setPercentage(event.target.value)} /></label></div>{maxPercentage === 0 ? <p className="mt-4 text-sm text-amber-300">Ya está evaluado el 100 % de la materia.</p> : !valid ? <p className="mt-4 text-sm text-rose-300">Usa una nota entre 0 y 5 y un porcentaje máximo de {maxPercentage}%.</p> : result && <div className="mt-5"><dl className="grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric label="Nuevo acumulado" value={format(result.weightedAccumulated)} /><Metric label="Promedio evaluado" value={format(result.evaluatedAverage)} /><Metric label="Evaluado" value={result.evaluatedWeight} suffix="%" /><Metric label="Restante" value={result.remainingWeight} suffix="%" /></dl><div className="mt-4 space-y-2"><ObjectiveMessage result={result.passing} objective={3} /><ObjectiveMessage result={result.target} objective={4} /></div></div>}</section>;
}
