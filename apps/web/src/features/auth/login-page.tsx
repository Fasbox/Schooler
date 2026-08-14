import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { supabase } from '../../lib/supabase';
import { AuthShell } from './auth-shell';

const schema = z.object({ email: z.email('Escribe un correo válido.'), password: z.string().min(8, 'Mínimo 8 caracteres.') });
type Values = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });

  const submit = handleSubmit(async (values) => {
    setServerError('');
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) { setServerError('No fue posible iniciar sesión. Revisa tus credenciales.'); return; }
    navigate('/');
  });

  return (
    <AuthShell title="Bienvenido" subtitle="Accede con la cuenta creada manualmente en Supabase.">
      <form className="space-y-4" onSubmit={submit} noValidate>
        <label className="block text-sm font-medium">Correo<Input className="mt-2" type="email" autoComplete="email" {...register('email')} /></label>
        {errors.email && <p className="text-sm text-rose-400">{errors.email.message}</p>}
        <label className="block text-sm font-medium">Contraseña<Input className="mt-2" type="password" autoComplete="current-password" {...register('password')} /></label>
        {errors.password && <p className="text-sm text-rose-400">{errors.password.message}</p>}
        {serverError && <p role="alert" className="text-sm text-rose-400">{serverError}</p>}
        <Button className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}</Button>
        <Link className="block text-center text-sm text-indigo-300 hover:underline" to="/forgot-password">Olvidé mi contraseña</Link>
      </form>
    </AuthShell>
  );
}
