import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { supabase } from '../../lib/supabase';
import { AuthShell } from './auth-shell';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8) { setMessage('La contraseña debe tener al menos 8 caracteres.'); return; }
    const { error } = await supabase.auth.updateUser({ password });
    setMessage(error ? 'El enlace no es válido o ya venció.' : 'Contraseña actualizada. Ya puedes volver a la aplicación.');
  }
  return <AuthShell title="Nueva contraseña" subtitle="Elige una contraseña de al menos 8 caracteres."><form className="space-y-4" onSubmit={submit}><label className="block text-sm font-medium">Nueva contraseña<Input className="mt-2" required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>{message && <p role="status" className="text-sm text-zinc-300">{message}</p>}<Button className="w-full">Actualizar contraseña</Button></form></AuthShell>;
}
