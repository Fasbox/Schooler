import { Button } from '../../components/ui/button';
import { supabase } from '../../lib/supabase';
import { PeriodsPanel } from '../periods/periods-panel';

export function SettingsPage() { return <main className="mx-auto max-w-4xl px-4 py-8"><header className="mb-8"><p className="text-sm font-semibold text-indigo-400">SCHOOLER</p><h1 className="mt-1 text-3xl font-bold">Configuración</h1></header><PeriodsPanel /><section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5"><h2 className="text-lg font-semibold">Sesión</h2><Button className="mt-4 bg-zinc-800 text-zinc-100 hover:bg-zinc-700" onClick={() => void supabase.auth.signOut()}>Cerrar sesión</Button></section></main>; }
