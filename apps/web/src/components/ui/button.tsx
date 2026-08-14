import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'inline-flex min-h-11 items-center justify-center rounded-lg bg-indigo-400 px-4 font-semibold text-zinc-950 transition hover:bg-indigo-300 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
