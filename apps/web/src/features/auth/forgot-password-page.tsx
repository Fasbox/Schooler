import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { supabase } from '../../lib/supabase';
import { AuthShell } from './auth-shell';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    setMessage(error ? 'No se pudo enviar el enlace.' : 'Si la cuenta existe, recibirás un enlace de recuperación.');
  }
  return <AuthShell title="Recuperar contraseña" subtitle="Te enviaremos un enlace seguro."><form className="space-y-4" onSubmit={submit}><label className="block text-sm font-medium">Correo<Input className="mt-2" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>{message && <p role="status" className="text-sm text-zinc-300">{message}</p>}<Button className="w-full">Enviar enlace</Button><Link className="block text-center text-sm text-indigo-300" to="/login">Volver</Link></form></AuthShell>;
}
