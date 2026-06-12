import React, { useState } from 'react';
import { X, UserCheck, KeyRound, Mail, Lock, User, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';
import { Logo, Button } from './ui';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, register } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) return setError('Please provide valid email and password.');
    if (isSignUp && !name.trim()) return setError('Please provide your full name.');
    setLoading(true);
    try {
      if (isSignUp) {
        await register({ name, email, password, role });
      } else {
        await login(email, password);
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoPatient = async () => {
    setLoading(true);
    try {
      await login('alex@medisage.ai', 'password123');
      onSuccess?.();
      onClose();
    } catch {
      setError('Demo patient not available. Please register first.');
    } finally {
      setLoading(false);
    }
  };

  const demoDoctor = async () => {
    setLoading(true);
    try {
      await login('dr.lin@stanford.edu', 'password123');
      onSuccess?.();
      onClose();
    } catch {
      setError('Demo doctor not available. Please register first.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full rounded-lg border border-line bg-base/60 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-base/70 p-4 backdrop-blur-md animate-fadeUp">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-line bg-gradient-to-br from-raised to-surface p-5">
          <Logo />
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-ink-soft transition-colors hover:bg-white/10 hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-line bg-brand-500/[0.06] px-5 py-3">
          <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
            <KeyRound className="h-3.5 w-3.5" /> Quick Demo
          </span>
          <div className="flex gap-2">
            <button onClick={demoPatient} className="rounded-lg border border-line bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-ink hover:bg-white/[0.08]">👤 Patient</button>
            <button onClick={demoDoctor} className="rounded-lg bg-gradient-to-r from-brand-400 to-accent-500 px-2.5 py-1 text-xs font-semibold text-[#04201d]">🩺 Doctor</button>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4 p-5">
          <div className="flex justify-center gap-5 border-b border-line pb-3">
            {[['Sign In', false], ['Create Account', true]].map(([label, val]) => (
              <button key={label as string} type="button" onClick={() => setIsSignUp(val as boolean)}
                className={cn('border-b-2 pb-2 text-sm font-semibold transition-colors',
                  isSignUp === val ? 'border-brand-400 text-brand-200' : 'border-transparent text-ink-muted hover:text-ink-soft')}>
                {label as string}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-500/25 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300">
              <ShieldAlert className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          {isSignUp && (
            <div className="grid grid-cols-2 gap-2">
              {[['patient', User, 'Patient'], ['doctor', UserCheck, 'Doctor']].map(([val, Icon, label]) => {
                const I = Icon as React.ComponentType<{ className?: string }>;
                return (
                  <button key={val as string} type="button" onClick={() => setRole(val as any)}
                    className={cn('flex items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-semibold transition-colors',
                      role === val ? 'border-brand-400/50 bg-brand-500/10 text-brand-200' : 'border-line bg-white/[0.02] text-ink-soft hover:bg-white/[0.05]')}>
                    <I className="h-4 w-4" /> {label as string}
                  </button>
                );
              })}
            </div>
          )}

          {isSignUp && (
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-ink-muted" />
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={inputCls} />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-ink-muted" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className={inputCls} />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-ink-muted" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Please wait...' : isSignUp ? 'Register & Start Triage' : 'Sign In & Load Profile'}
          </Button>
        </form>

        <p className="border-t border-line bg-base/40 px-5 py-4 text-center text-[11px] text-ink-muted">
          Protected by 256-bit encryption. We never sell your health records.
        </p>
      </div>
    </div>
  );
};
