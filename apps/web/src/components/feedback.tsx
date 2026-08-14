import type { ReactNode } from 'react';

export function PageLoading() { return <main className="grid min-h-[60vh] place-items-center text-zinc-400">Cargando…</main>; }
export function ErrorMessage({ children }: { children: ReactNode }) { return <p role="alert" className="rounded-xl border border-rose-900/60 bg-rose-950/30 p-3 text-sm text-rose-300">{children}</p>; }
export function EmptyState({ title, text }: { title: string; text: string }) { return <div className="rounded-2xl border border-dashed border-zinc-700 px-6 py-12 text-center"><p className="font-semibold">{title}</p><p className="mt-2 text-sm text-zinc-400">{text}</p></div>; }
