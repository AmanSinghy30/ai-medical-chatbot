import React, { useState } from 'react';
import { ShieldAlert, ArrowRight, User, Mail, Lock, UserCheck, KeyRound, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';
import { Logo, Button } from './ui';

const GoogleIcon = () => (
  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Incorrect E-mail, username or password');
    } finally {
      setLoading(false);
    }
  };

  const demoPatient = async () => {
    setLoading(true);
    try {
      await login('alex@medisage.ai', 'password123');
      navigate('/dashboard');
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
      navigate('/dashboard');
    } catch {
      setError('Demo doctor not available. Please register first.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full rounded-lg border border-line bg-base/60 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none transition-colors';

  return (
    <div className="min-h-screen w-full flex text-ink bg-base">
      
      {/* Left Pane - Branding & Visuals */}
      <div className="hidden lg:flex w-1/2 bg-slate-50 border-r border-line flex-col relative p-8 xl:p-12">
        {/* Branding */}
        <div className="z-10 cursor-pointer" onClick={() => navigate('/')}>
          <Logo size="md" />
        </div>

        {/* Abstract / Graphic */}
        <div className="flex-1 flex flex-col items-start justify-center relative max-w-lg mx-auto w-full z-10 space-y-4">
           <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700">
             <ShieldAlert className="w-4 h-4" /> Secure Portal
           </div>
           <h1 className="text-3xl xl:text-5xl font-bold text-ink leading-tight tracking-tight">
             Intelligent healthcare <br/>
             <span className="text-brand-700">at your fingertips.</span>
           </h1>
           <p className="text-base xl:text-lg text-ink-soft leading-relaxed max-w-md">
             Join the Medisage network to instantly triage symptoms, book consultations, and securely manage your medical records.
           </p>
        </div>

        {/* Footer Text */}
        <div className="text-xs font-medium text-ink-muted z-10">
          Protected by 256-bit encryption. We never sell your health records.
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-brand-50 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-accent-500/10 rounded-full blur-[100px] pointer-events-none" />
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-8 xl:p-16 relative overflow-y-auto bg-surface">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/[0.05] text-ink-soft transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        {/* Logo (Mobile only) */}
        <div className="absolute top-6 left-6 lg:hidden z-50">
          <Logo size="sm" />
        </div>

        <div className="w-full max-w-md m-auto pt-16 lg:pt-0">
          
          <div className="flex items-center justify-between border border-brand-500/20 bg-brand-500/[0.06] rounded-xl px-4 py-2.5 mb-8">
            <span className="flex items-center gap-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-brand-700">
              <KeyRound className="h-3.5 w-3.5" /> Quick Demo
            </span>
            <div className="flex gap-2">
              <button onClick={demoPatient} className="rounded-md border border-line bg-white/[0.04] px-3 py-1 text-xs font-semibold text-ink hover:bg-white/[0.08] transition-colors">Patient</button>
              <button onClick={demoDoctor} className="rounded-md bg-brand-50 hover:bg-brand-100 border border-brand-200 px-3 py-1 text-xs font-semibold text-slate-950 shadow shadow-brand-500/20 hover:brightness-110 transition-all">Doctor</button>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xs text-brand-700 font-semibold uppercase tracking-widest mb-2">Welcome to Medisage</h2>
            <div className="flex gap-6 items-baseline">
              <button 
                type="button"
                className={cn("text-2xl sm:text-3xl font-bold transition-all border-b-2 pb-1", !isSignUp ? "text-ink border-brand-400" : "text-ink-soft opacity-60 border-transparent hover:opacity-100")}
                onClick={() => setIsSignUp(false)}
              >
                Log in
              </button>
              <button 
                type="button"
                className={cn("text-2xl sm:text-3xl font-bold transition-all border-b-2 pb-1", isSignUp ? "text-ink border-brand-400" : "text-ink-soft opacity-60 border-transparent hover:opacity-100")}
                onClick={() => setIsSignUp(true)}
              >
                Sign up
              </button>
            </div>
            
            <div className="h-6 mt-2">
              {error && (
                <div className="flex items-center gap-2 text-xs text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg">
                   <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> {error}
                </div>
              )}
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-1">
                  {[
                    ['patient', User, 'Patient'], 
                    ['doctor', UserCheck, 'Doctor']
                  ].map(([val, Icon, label]) => {
                    const I = Icon as React.ComponentType<{ className?: string }>;
                    return (
                      <button 
                        key={val as string} 
                        type="button" 
                        onClick={() => setRole(val as any)}
                        className={cn(
                          'flex items-center justify-center gap-2 rounded-xl border py-2 text-xs font-semibold transition-all',
                          role === val 
                            ? 'border-brand-400/50 bg-brand-50 text-brand-700' 
                            : 'border-line bg-white/[0.02] text-ink-soft hover:bg-white/[0.05]'
                        )}
                      >
                        <I className="h-3.5 w-3.5" /> {label as string}
                      </button>
                    );
                  })}
                </div>

                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-ink-muted" />
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Full name" 
                    className={inputCls} 
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-ink-muted" />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Email address" 
                className={inputCls} 
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-ink-muted" />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Password" 
                className={inputCls} 
              />
            </div>

            <div className="flex items-center justify-between pt-1 pb-2">
              <label className="flex items-center gap-2 text-xs text-ink-soft cursor-pointer group">
                <div className="relative flex items-center justify-center w-3.5 h-3.5 border border-line rounded bg-base group-hover:border-brand-400/50 transition-colors">
                  <input type="checkbox" className="peer absolute opacity-0 w-full h-full cursor-pointer" />
                  <svg className="w-2.5 h-2.5 text-brand-400 opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Keep me logged in
              </label>

              {!isSignUp && (
                <a href="#" className="text-xs text-brand-400 font-medium hover:text-brand-700 transition-colors">
                  Forgot password?
                </a>
              )}
            </div>

            <Button type="submit" size="md" className="w-full py-2.5 text-sm" disabled={loading}>
              {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Log In Securely'}
              {!loading && <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-70" />}
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-line"></div>
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="bg-surface px-3 text-ink-muted uppercase tracking-wider font-semibold">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button type="button" className="flex items-center justify-center gap-2 py-2 border border-line rounded-lg text-xs font-semibold text-ink-soft hover:bg-white/[0.04] hover:text-ink transition-all">
                <GoogleIcon /> Google
              </button>
              <button type="button" className="flex items-center justify-center gap-2 py-2 border border-line rounded-lg text-xs font-semibold text-ink-soft hover:bg-white/[0.04] hover:text-ink transition-all">
                <svg className="w-3.5 h-3.5 text-ink" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.302 24 12c0-6.627-5.373-12-12-12z" />
                </svg> GitHub
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};
