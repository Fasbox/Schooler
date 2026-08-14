import { zodResolver } from '@hookform/resolvers/zod';
import type { AcademicPeriod, Subject } from '@schooler/shared';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const schema = z.object({ academic_period_id: z.string().min(1), name: z.string().trim().min(1, 'El nombre es obligatorio.').max(120), professor: z.string().max(120), professor_email: z.union([z.literal(''), z.email('Correo inválido.')]) });
export type SubjectFormValues = z.infer<typeof schema>;

export function SubjectForm({ periods, subject, busy, onSubmit, onCancel }: { periods: AcademicPeriod[]; subject?: Subject; busy: boolean; onSubmit: (values: SubjectFormValues) => void; onCancel?: () => void }) {
  const current = periods.find((period) => period.status === 'current') ?? periods[0];
  const { register, handleSubmit, formState: { errors } } = useForm<SubjectFormValues>({ resolver: zodResolver(schema), defaultValues: { academic_period_id: subject?.academic_period_id ?? current?.id ?? '', name: subject?.name ?? '', professor: subject?.professor ?? '', professor_email: subject?.professor_email ?? '' } });
  return <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}><label className="block text-sm font-medium">Periodo<select disabled={Boolean(subject)} className="mt-2 min-h-11 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3" {...register('academic_period_id')}>{periods.map((period) => <option key={period.id} value={period.id}>{period.year}-{period.semester}</option>)}</select></label><label className="block text-sm font-medium">Nombre<Input className="mt-2" {...register('name')} /></label>{errors.name && <p className="text-sm text-rose-400">{errors.name.message}</p>}<label className="block text-sm font-medium">Profesor (opcional)<Input className="mt-2" {...register('professor')} /></label><label className="block text-sm font-medium">Correo del profesor (opcional)<Input className="mt-2" type="email" {...register('professor_email')} /></label>{errors.professor_email && <p className="text-sm text-rose-400">{errors.professor_email.message}</p>}<div className="flex gap-2"><Button disabled={busy}>{busy ? 'Guardando…' : subject ? 'Guardar cambios' : 'Crear materia'}</Button>{onCancel && <Button type="button" className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700" onClick={onCancel}>Cancelar</Button>}</div></form>;
}
