import React, { useState, useEffect } from 'react';
import {
  LogIn, LogOut, MessageSquare, LayoutDashboard,
  Sparkles, ShieldCheck, FileText, Pill, Users, Menu, X, ArrowRight, Moon, Sun, Calendar,
} from 'lucide-react';
import { User as UserType } from '../types';
import { cn } from '../utils/cn';
import { Logo } from './ui';

interface NavbarProps {
  currentUser: UserType | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  activeTab: string;
  onChangeTab: (tab: string) => void;
  onOpenChat: () => void;
  chatOpen: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  activeTab,
  onChangeTab,
  onOpenChat,
  chatOpen,
  theme,
  onToggleTheme,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { id: 'landing', label: 'Overview', icon: FileText },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'symptom_checker', label: 'Symptom Checker', icon: ShieldCheck },
    { id: 'doctors', label: 'Doctor Match', icon: Users },
    { id: 'medicines', label: 'Medicines', icon: Pill },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'tips', label: 'Health Tips', icon: Sparkles },
  ];

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 border-b transition-all duration-fast',
          scrolled ? 'border-line bg-base/80 backdrop-blur-xl' : 'border-transparent bg-transparent'
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8" aria-label="Primary">
          <button onClick={() => onChangeTab('landing')} className="shrink-0">
            <Logo />
          </button>

          <ul className="hidden items-center gap-0.5 rounded-full border border-line bg-white/[0.03] p-1 lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onChangeTab(item.id)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-fast',
                      active ? 'bg-brand-500/15 text-brand-200' : 'text-ink-soft hover:bg-white/[0.05] hover:text-ink'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="hidden items-center gap-2.5 lg:flex">
            <button
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-white/[0.04] text-ink-soft transition-colors hover:bg-white/[0.08] hover:text-ink"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              onClick={onOpenChat}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all duration-fast',
                chatOpen
                  ? 'border-line-strong bg-white/[0.06] text-ink'
                  : 'border-brand-500/30 bg-brand-500/10 text-brand-200 hover:bg-brand-500/20'
              )}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{chatOpen ? 'Close AI' : 'AI Assistant'}</span>
            </button>

            <span className="h-6 w-px bg-line" />

            {currentUser ? (
              <div className="flex items-center gap-2.5 rounded-lg border border-line bg-white/[0.03] py-1.5 pl-2.5 pr-2">
                <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-brand-400 to-accent-500 text-[11px] font-bold text-slate-950">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left leading-tight">
                  <p className="text-xs font-semibold text-ink">{currentUser.name.split(' ')[0]}</p>
                  <p className="text-[10px] font-medium capitalize text-brand-300">{currentUser.role}</p>
                </div>
                <button onClick={onLogout} title="Logout" className="p-1 text-ink-muted transition-colors hover:text-rose-400">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-400 to-accent-500 px-4 py-2 text-xs font-semibold text-slate-950 transition-transform duration-fast hover:scale-[1.03]"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-white/[0.04] text-ink"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button onClick={onOpenChat} className="grid h-10 w-10 place-items-center rounded-lg border border-brand-500/30 bg-brand-500/10 text-brand-200">
              <MessageSquare className="h-5 w-5" />
            </button>
            <button onClick={() => setMobileMenu((v) => !v)} className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-white/[0.03] text-ink">
              {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </header>

      {mobileMenu && (
        <div className="fixed inset-0 z-30 bg-base/60 pt-16 backdrop-blur-sm lg:hidden animate-fadeUp" onClick={() => setMobileMenu(false)}>
          <div className="border-b border-line bg-surface p-4" onClick={(e) => e.stopPropagation()}>
            {currentUser && (
              <div className="mb-3 flex items-center justify-between rounded-xl border border-line bg-raised p-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand-400 to-accent-500 text-sm font-bold text-slate-950">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{currentUser.name}</p>
                    <p className="text-xs capitalize text-brand-300">{currentUser.role} account</p>
                  </div>
                </div>
                <button onClick={() => { onLogout(); setMobileMenu(false); }} className="flex items-center gap-1 rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300">
                  <LogOut className="h-3.5 w-3.5" /> Logout
                </button>
              </div>
            )}

            <div className="grid gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onChangeTab(item.id);
                      setMobileMenu(false);
                    }}
                    className={cn(
                      'flex items-center gap-3 rounded-xl p-3 text-sm font-semibold transition-colors',
                      active ? 'bg-brand-500/12 text-brand-200' : 'text-ink-soft hover:bg-white/[0.05]'
                    )}
                  >
                    <Icon className="h-5 w-5" /> <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {!currentUser && (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenu(false);
                }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-400 to-accent-500 py-3 text-sm font-semibold text-slate-950"
              >
                <LogIn className="h-4 w-4" /> Sign In / Authentication
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
