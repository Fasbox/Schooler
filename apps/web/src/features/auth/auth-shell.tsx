import type { ReactNode } from 'react';

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-2xl shadow-black/30">
        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold tracking-widest text-indigo-400">SCHOOLER</p>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
        </div>
        {children}
      </section>
    </main>
  );
}
