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
    brand: 'text-brand-300 bg-brand-500/10 border-brand-500/20',
    violet: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
    blue: 'text-accent-400 bg-accent-500/10 border-accent-500/20',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]',
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
      <h2 className="text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">{title}</h2>
      {desc && <p className="text-md leading-relaxed text-ink-soft sm:text-lg">{desc}</p>}
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
      'bg-gradient-to-r from-brand-400 to-accent-500 text-slate-950 font-semibold shadow-lg shadow-brand-500/20 hover:brightness-110',
    secondary:
      'border border-line-strong bg-white/[0.04] text-ink hover:bg-white/[0.08] hover:border-brand-400/40',
    ghost: 'text-ink-soft hover:text-ink hover:bg-white/[0.05]',
    danger: 'bg-danger text-white hover:brightness-110 shadow-lg shadow-danger/20',
  };
  const sizes: Record<BtnSize, string> = {
    sm: 'px-3.5 py-2 text-xs rounded-md',
    md: 'px-5 py-2.5 text-sm rounded-lg',
    lg: 'px-6 py-3.5 text-md rounded-xl',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-fast active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
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
        'surface-shadow rounded-xl border border-line bg-raised/60 backdrop-blur-sm',
        interactive && 'transition-all duration-fast hover:border-brand-400/40 hover:bg-raised',
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
    neutral: 'bg-white/[0.06] text-ink-soft border-line',
    brand: 'bg-brand-500/12 text-brand-300 border-brand-500/25',
    ok: 'bg-emerald-500/12 text-emerald-300 border-emerald-500/25',
    warn: 'bg-amber-500/12 text-amber-300 border-amber-500/25',
    danger: 'bg-rose-500/12 text-rose-300 border-rose-500/25',
    blue: 'bg-accent-500/12 text-accent-400 border-accent-500/25',
    violet: 'bg-violet-400/12 text-violet-300 border-violet-400/25',
  };
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold', tones[tone])}>
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
    brand: 'text-brand-300 bg-brand-500/10 border-brand-500/20',
    blue: 'text-accent-400 bg-accent-500/10 border-accent-500/20',
    violet: 'text-violet-300 bg-violet-400/10 border-violet-400/20',
    amber: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
    rose: 'text-rose-300 bg-rose-500/10 border-rose-500/20',
    emerald: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  };
  return (
    <div className={cn('inline-flex h-11 w-11 items-center justify-center rounded-xl border', tones[tone])}>
      {children}
    </div>
  );
}

export function Logo({ size = 'md', showSubmark = true }: { size?: 'sm' | 'md'; showSubmark?: boolean }) {
  const dim = size === 'sm' ? 'h-7 w-7' : 'h-9 w-9';
  const icon = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-gradient-to-br from-brand-400 to-accent-500 text-slate-950 shadow-[0_0_24px_-6px_rgba(20,184,166,0.6)]',
          dim
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" className={icon}>
          <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      </span>
      <span className={cn('font-semibold tracking-tight text-ink', size === 'sm' ? 'text-md' : 'text-lg')}>
        Medi<span className="text-brand-300">sage</span>
      </span>
      {showSubmark && (
        <span className="hidden rounded-full border border-brand-500/20 bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-300 sm:inline-flex">
          AI-MEDIC
        </span>
      )}
    </div>
  );
}
