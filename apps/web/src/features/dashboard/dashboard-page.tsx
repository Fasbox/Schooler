import type { Activity, WeeklyClass } from '@schooler/shared';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowRight, BookOpen, CalendarDays, Clock3, GraduationCap, Sun, Sunrise } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorMessage, PageLoading } from '../../components/feedback';
import { api } from '../../lib/api';

interface DashboardData {
  greeting: string;
  period: { id: string; year: number; semester: number } | null;
  headline: { classes_today: number; pending: number; upcoming_exams: number };
  urgent: Activity[];
  overdue: Activity[];
  today: { activities: Activity[]; classes: WeeklyClass[] };
  tomorrow: { activities: Activity[]; classes: WeeklyClass[]; emphasized: boolean };
  current_class: WeeklyClass | null;
  next_class: (WeeklyClass & { starts_at: string; minutes_until: number }) | null;
  week: { classes: number; tasks: number; quizzes: number; exams: number; projects: number; study: number };
  academic: { subjects: number; completed: number; pending: number };
}

const typeLabels = { TASK: 'Tarea', EXAM: 'Parcial', QUIZ: 'Quiz', PROJECT: 'Proyecto', STUDY: 'Estudio' } as const;
const dayNames = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const formatTime = (time: string) => time.slice(0, 5);
function relativeMinutes(minutes: number) {
  if (minutes < 60) return `en ${minutes} min`;
  const hours = Math.floor(minutes / 60); const rest = minutes % 60;
  if (hours < 24) return `en ${hours} h${rest ? ` ${rest} min` : ''}`;
  const days = Math.floor(hours / 24); return `en ${days} día${days === 1 ? '' : 's'}`;
}

function Section({ title, icon, children, accent = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; accent?: boolean }) {
  return <section className={accent ? 'rounded-2xl border border-indigo-400/40 bg-indigo-400/10 p-5' : 'rounded-2xl border border-zinc-800 bg-zinc-900 p-5'}><div className="mb-4 flex items-center gap-2"><span className={accent ? 'text-indigo-300' : 'text-zinc-400'}>{icon}</span><h2 className="text-lg font-semibold">{title}</h2></div>{children}</section>;
}

function ActivityRow({ activity }: { activity: Activity }) {
  return <div className="flex gap-3 rounded-xl bg-zinc-950 p-3"><span className="w-1 shrink-0 rounded-full" style={{ backgroundColor: activity.subject?.color }} /><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2"><span className="text-xs font-semibold uppercase text-zinc-500">{typeLabels[activity.type]}</span>{(activity.percentage ?? 0) >= 15 && <span className="text-xs font-semibold text-amber-300">{activity.percentage}% · alto impacto</span>}</div><p className="mt-1 truncate font-medium">{activity.title}</p><p className="mt-1 text-xs text-zinc-400">{activity.subject?.name}{activity.due_time ? ` · ${formatTime(activity.due_time)}` : ''}</p></div></div>;
}

function ClassRow({ item, current = false }: { item: WeeklyClass; current?: boolean }) {
  return <div className={current ? 'flex gap-3 rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-3' : 'flex gap-3 rounded-xl bg-zinc-950 p-3'}><span className="w-1 shrink-0 rounded-full" style={{ backgroundColor: item.subject.color }} /><div><div className="flex items-center gap-2">{current && <span className="rounded-full bg-emerald-400 px-2 py-0.5 text-[10px] font-black text-zinc-950">AHORA</span>}<p className="font-medium">{item.subject.name}</p></div><p className="mt-1 text-xs capitalize text-zinc-400">{formatTime(item.start_time)}–{formatTime(item.end_time)} · {item.modality}{item.classroom ? ` · Aula ${item.classroom}` : ''}</p></div></div>;
}

export function DashboardPage() {
  const dashboard = useQuery({ queryKey: ['dashboard'], queryFn: () => api<DashboardData>('/dashboard'), refetchInterval: 60_000, refetchOnWindowFocus: true });
  if (dashboard.isPending) return <PageLoading />;
  if (dashboard.error) return <main className="mx-auto max-w-6xl px-4 py-8"><ErrorMessage>{dashboard.error.message}</ErrorMessage></main>;
  const data = dashboard.data;
  if (!data.period) return <main className="mx-auto max-w-6xl px-4 py-8"><EmptyState title="No hay periodo actual" text="Selecciona un periodo desde Configuración para construir tu inicio." /></main>;
  return <main className="mx-auto max-w-6xl px-4 py-8"><header className="mb-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold text-indigo-400">PERIODO {data.period.year}-{data.period.semester}</p><h1 className="mt-1 text-3xl font-bold sm:text-4xl">{data.greeting}.</h1><p className="mt-3 text-zinc-400">Hoy tienes <strong className="text-zinc-200">{data.headline.classes_today} clases</strong>, <strong className="text-zinc-200">{data.headline.pending} pendientes</strong>{data.headline.upcoming_exams ? <> y <strong className="text-zinc-200">{data.headline.upcoming_exams} parciales próximos</strong></> : ''}.</p></div><Link className="inline-flex items-center gap-2 text-sm font-medium text-indigo-300 hover:underline" to="/activities">Ver todas las tareas <ArrowRight size={16} /></Link></div></header>{data.current_class && <div className="mb-5"><Section title="Estás en clase" icon={<Clock3 size={20} />}><ClassRow item={data.current_class} current /></Section></div>}<div className="grid gap-5 lg:grid-cols-2">{data.urgent.length > 0 && <Section title="Urgente" icon={<AlertTriangle size={20} />} accent><div className="space-y-2">{data.urgent.map((activity) => <ActivityRow key={activity.id} activity={activity} />)}</div></Section>}{data.overdue.length > 0 && <Section title="Pendientes vencidos" icon={<AlertTriangle size={20} />}><div className="space-y-2">{data.overdue.slice(0,5).map((activity) => <ActivityRow key={activity.id} activity={activity} />)}</div></Section>}<Section title="Hoy" icon={<Sun size={20} />}><div className="space-y-2">{data.today.activities.map((activity) => <ActivityRow key={activity.id} activity={activity} />)}{data.today.classes.map((item) => <ClassRow key={item.id} item={item} current={data.current_class?.id === item.id} />)}{data.today.activities.length === 0 && data.today.classes.length === 0 && <p className="py-5 text-center text-sm text-zinc-500">No tienes clases ni entregas hoy 🎉</p>}</div></Section><Section title={data.tomorrow.emphasized ? 'Mañana · prepárate' : 'Mañana'} icon={<Sunrise size={20} />} accent={data.tomorrow.emphasized}><div className="space-y-2">{data.tomorrow.activities.map((activity) => <ActivityRow key={activity.id} activity={activity} />)}{data.tomorrow.classes.map((item) => <ClassRow key={item.id} item={item} />)}{data.tomorrow.activities.length === 0 && data.tomorrow.classes.length === 0 && <p className="py-5 text-center text-sm text-zinc-500">Mañana está libre por ahora.</p>}</div></Section>{!data.current_class && <Section title="Próxima clase" icon={<BookOpen size={20} />}>{data.next_class ? <div><div className="flex items-start gap-3"><span className="mt-1 size-3 shrink-0 rounded-full" style={{ backgroundColor: data.next_class.subject.color }} /><div><p className="text-xl font-semibold">{data.next_class.subject.name}</p><p className="mt-1 font-medium text-indigo-300">{relativeMinutes(data.next_class.minutes_until)}</p><p className="mt-2 text-sm capitalize text-zinc-400">{dayNames[data.next_class.weekday]} · {formatTime(data.next_class.start_time)} · {data.next_class.modality}{data.next_class.classroom ? ` · Aula ${data.next_class.classroom}` : ''}</p></div></div></div> : <p className="text-sm text-zinc-500">No hay clases configuradas.</p>}</Section>}<Section title="Esta semana" icon={<CalendarDays size={20} />}><dl className="grid grid-cols-3 gap-3 text-center"><Stat value={data.week.classes} label="Clases" /><Stat value={data.week.tasks} label="Tareas" /><Stat value={data.week.exams} label="Parciales" /><Stat value={data.week.quizzes} label="Quices" /><Stat value={data.week.projects} label="Proyectos" /><Stat value={data.week.study} label="Estudio" /></dl></Section><Section title="Resumen académico" icon={<GraduationCap size={20} />}><dl className="grid grid-cols-3 gap-3 text-center"><Stat value={data.academic.subjects} label="Materias" /><Stat value={data.academic.completed} label="Completadas" /><Stat value={data.academic.pending} label="Pendientes" /></dl><p className="mt-4 text-xs text-zinc-500">Las notas y porcentajes se incorporarán en la siguiente fase.</p></Section></div></main>;
}

function Stat({ value, label }: { value: number; label: string }) { return <div className="rounded-xl bg-zinc-950 px-2 py-4"><dd className="text-2xl font-bold">{value}</dd><dt className="mt-1 text-xs text-zinc-500">{label}</dt></div>; }
