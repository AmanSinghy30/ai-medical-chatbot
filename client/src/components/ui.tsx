import React from 'react';
import { cn } from '../utils/cn';

export function SectionShell({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn('mx-auto max-w-7xl px-5 sm:px-6 lg:px-8', className)}>
      {children}
    </section>
  );
}

export function Eyebrow({ children, tone = 'brand' }: { children: React.ReactNode; tone?: 'brand' | 'violet' | 'blue' }) {
  const tones = {
    brand: 'text-brand-700 bg-brand-50 border-brand-200',
    violet: 'text-violet-700 bg-violet-50 border-violet-200',
    blue: 'text-blue-700 bg-blue-50 border-blue-200',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider',
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  desc,
  align = 'center',
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  desc?: React.ReactNode;
  align?: 'center' | 'left';
}) {
  return (
    <div className={cn('max-w-3xl space-y-4', align === 'center' ? 'mx-auto text-center' : 'text-left')}>
      {eyebrow}
      <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
      {desc && <p className="text-md leading-relaxed text-slate-600 sm:text-lg">{desc}</p>}
    </div>
  );
}

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type BtnSize = 'sm' | 'md' | 'lg';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...rest
}: {
  children: React.ReactNode;
  variant?: BtnVariant;
  size?: BtnSize;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants: Record<BtnVariant, string> = {
    primary:
      'bg-brand-600 text-white font-medium shadow-sm hover:bg-brand-700 border border-transparent',
    secondary:
      'bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 shadow-sm',
    ghost: 'text-slate-600 font-medium hover:text-slate-900 hover:bg-slate-100 border border-transparent',
    danger: 'bg-rose-600 text-white font-medium hover:bg-rose-700 shadow-sm border border-transparent',
  };
  const sizes: Record<BtnSize, string> = {
    sm: 'px-3.5 py-2 text-sm rounded-md',
    md: 'px-4 py-2.5 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-xl',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all duration-fast active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Card({
  children,
  className,
  interactive = false,
}: {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white shadow-sm',
        interactive && 'transition-all duration-fast hover:border-slate-300 hover:shadow-md cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'brand' | 'ok' | 'warn' | 'danger' | 'blue' | 'violet';
}) {
  const tones = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
    ok: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warn: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
  };
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium', tones[tone])}>
      {children}
    </span>
  );
}

export function IconChip({
  children,
  tone = 'brand',
}: {
  children: React.ReactNode;
  tone?: 'brand' | 'blue' | 'violet' | 'amber' | 'rose' | 'emerald';
}) {
  const tones = {
    brand: 'text-brand-600 bg-brand-50 border-brand-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    violet: 'text-violet-600 bg-violet-50 border-violet-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  };
  return (
    <div className={cn('inline-flex h-10 w-10 items-center justify-center rounded-lg border', tones[tone])}>
      {children}
    </div>
  );
}

export function Logo({ size = 'md', showSubmark = true }: { size?: 'sm' | 'md'; showSubmark?: boolean }) {
  const dim = size === 'sm' ? 'h-6 w-6 rounded-md' : 'h-8 w-8 rounded-lg';
  const icon = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'grid place-items-center bg-brand-600 text-white shadow-sm',
          dim
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" className={icon}>
          <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </span>
      <span className={cn('font-bold tracking-tight text-slate-900', size === 'sm' ? 'text-base' : 'text-lg')}>
        Medisage
      </span>
      {showSubmark && (
        <span className="hidden rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-brand-700 sm:inline-flex">
          Portal
        </span>
      )}
    </div>
  );
}
