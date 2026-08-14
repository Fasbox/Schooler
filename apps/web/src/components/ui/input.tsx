import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'min-h-11 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20',
        className,
      )}
      {...props}
    />
  );
}
