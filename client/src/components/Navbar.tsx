import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LogIn, LogOut, MessageSquare, LayoutDashboard,
  Sparkles, ShieldCheck, FileText, Pill, Users, Menu, X, ArrowRight, Calendar,
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
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  activeTab,
  onOpenChat,
  chatOpen,
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
    { id: 'landing', path: '/', label: 'Overview', icon: FileText },
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'symptom_checker', path: '/symptom_checker', label: 'Symptom Checker', icon: ShieldCheck },
    { id: 'doctors', path: '/doctors', label: 'Doctor Match', icon: Users },
    { id: 'medicines', path: '/medicines', label: 'Medicines', icon: Pill },
    { id: 'appointments', path: '/appointments', label: 'Appointments', icon: Calendar },
    { id: 'reports', path: '/reports', label: 'Reports', icon: FileText },
    { id: 'tips', path: '/tips', label: 'Health Tips', icon: Sparkles },
  ];

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 transition-all duration-fast',
          scrolled ? 'bg-white border-b border-slate-200 shadow-sm' : 'bg-transparent border-b border-transparent'
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8" aria-label="Primary">
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>

          <ul className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50/50 p-1 lg:flex shadow-sm">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-fast',
                      active ? 'bg-white text-brand-600 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="hidden items-center gap-2.5 lg:flex">
            <button
              onClick={onOpenChat}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all duration-fast shadow-sm',
                chatOpen
                  ? 'border-slate-300 bg-slate-100 text-slate-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              )}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{chatOpen ? 'Close AI' : 'AI Assistant'}</span>
            </button>

            <span className="h-6 w-px bg-slate-200" />

            {currentUser ? (
              <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white py-1.5 pl-2.5 pr-2 shadow-sm">
                <div className="grid h-7 w-7 place-items-center rounded-md bg-brand-100 text-brand-700 text-[11px] font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left leading-tight">
                  <p className="text-xs font-semibold text-slate-900">{currentUser.name.split(' ')[0]}</p>
                  <p className="text-[10px] font-medium capitalize text-slate-500">{currentUser.role}</p>
                </div>
                <button onClick={onLogout} title="Logout" className="p-1 text-slate-400 transition-colors hover:text-rose-500">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="group inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition-all shadow-sm hover:bg-brand-700 hover:shadow-md"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button onClick={onOpenChat} className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm">
              <MessageSquare className="h-5 w-5" />
            </button>
            <button onClick={() => setMobileMenu((v) => !v)} className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm">
              {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </header>

      {mobileMenu && (
        <div className="fixed inset-0 z-30 bg-slate-900/20 pt-16 backdrop-blur-sm lg:hidden animate-fadeUp" onClick={() => setMobileMenu(false)}>
          <div className="border-b border-slate-200 bg-white p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            {currentUser && (
              <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-100 text-brand-700 text-sm font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-xs capitalize text-slate-500">{currentUser.role} account</p>
                  </div>
                </div>
                <button onClick={() => { onLogout(); setMobileMenu(false); }} className="flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors">
                  <LogOut className="h-3.5 w-3.5" /> Logout
                </button>
              </div>
            )}

            <div className="grid gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setMobileMenu(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl p-3 text-sm font-semibold transition-colors',
                      active ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    <Icon className="h-5 w-5" /> <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {!currentUser && (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenu(false);
                }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
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

