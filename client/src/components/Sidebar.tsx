import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  Pill,
  HeartPulse,
  Calendar,
  FileText,
  LogOut,
  MessageSquare,
  Menu,
  ChevronLeft
} from 'lucide-react';
import { cn } from '../utils/cn';
import { getChats } from '../services/api';
import { ChatSession } from '../types';

interface SidebarProps {
  currentUser: any;
  onLogout: () => void;
  onOpenChat: () => void;
  onResumeChat?: (chatId: string) => void;
  chatOpen: boolean;
  children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  onLogout,
  onOpenChat,
  onResumeChat,
  chatOpen,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [recentChats, setRecentChats] = useState<ChatSession[]>([]);
  const [visibleChatsCount, setVisibleChatsCount] = useState(5);
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile sidebar on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    const fetchRecentChats = () => {
      if (currentUser) {
        getChats()
          .then(({ data }) => {
            const mapped: ChatSession[] = data.map((c: any) => ({
              id: c._id,
              title: c.title || 'Untitled Consultation',
              date: new Date(c.updatedAt).toLocaleDateString(),
              messagesCount: c.messages?.length || 0,
              summary: c.summary || 'No summary available.',
            }));
            setRecentChats(mapped);
          })
          .catch(() => setRecentChats([]));
      }
    };
    
    fetchRecentChats();

    const handleRefresh = () => fetchRecentChats();
    window.addEventListener('medisage_refresh_data', handleRefresh);
    return () => window.removeEventListener('medisage_refresh_data', handleRefresh);
  }, [currentUser, chatOpen]);
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Symptom Triage', path: '/symptom_checker', icon: Stethoscope },
    { name: 'Specialists', path: '/doctors', icon: Users },
    { name: 'Medicine', path: '/medicines', icon: Pill },
    { name: 'Appointments', path: '/appointments', icon: Calendar },
    { name: 'Lab Reports', path: '/reports', icon: FileText },
    { name: 'Health Tips', path: '/tips', icon: HeartPulse },
  ];

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50/30">
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface border-b border-line flex items-center justify-between px-4 z-30">
         <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
           <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white shadow-sm">
             <HeartPulse className="h-5 w-5" />
           </div>
           <span className="text-lg font-bold tracking-tight text-ink">Medisage</span>
         </div>
         <button onClick={() => setMobileOpen(true)} className="p-2 -mr-2 text-ink-soft hover:text-ink">
           <Menu className="h-6 w-6" />
         </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-base/80 z-40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-line bg-surface transition-all duration-300 md:translate-x-0",
          collapsed ? "md:w-20" : "md:w-64",
          "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-line">
          {!collapsed ? (
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white shadow-sm">
                <HeartPulse className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-ink">Medisage</span>
            </div>
          ) : (
            <div className="mx-auto grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white shadow-sm cursor-pointer" onClick={() => navigate('/dashboard')}>
              <HeartPulse className="h-5 w-5" />
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="hidden md:grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-slate-100 hover:text-ink transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-slate-100 hover:text-ink transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
        </div>

        {collapsed && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setCollapsed(false)}
              className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-slate-100 hover:text-ink transition-colors"
              title="Expand sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto thin-scroll py-6 px-3">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-ink-soft hover:bg-slate-100 hover:text-ink"
                  )
                }
                title={collapsed ? item.name : undefined}
              >
                <item.icon 
                  className={cn("shrink-0", collapsed ? "h-6 w-6 mx-auto" : "h-5 w-5")} 
                  strokeWidth={collapsed ? 1.5 : 2} 
                />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            ))}
          </nav>
          
          {recentChats.length > 0 && !collapsed && (
            <div className="mt-8">
              <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Recents
              </div>
              <div className="space-y-0.5">
                {recentChats.slice(0, visibleChatsCount).map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => onResumeChat && onResumeChat(chat.id)}
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:bg-slate-100 hover:text-ink transition-colors text-left"
                  >
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    <span className="truncate">{chat.title}</span>
                  </button>
                ))}
                {visibleChatsCount < recentChats.length && (
                  <button
                    onClick={() => setVisibleChatsCount(v => v + 5)}
                    className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 mt-1 text-xs font-semibold text-brand-600 hover:bg-brand-50 transition-colors"
                  >
                    Show More
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-line space-y-2">
          <button
            onClick={onOpenChat}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              chatOpen ? "bg-brand-50 text-brand-700" : "text-ink-soft hover:bg-slate-100 hover:text-ink",
              collapsed && "justify-center"
            )}
            title={collapsed ? "Open AI Assistant" : undefined}
          >
            <MessageSquare 
              className={cn("shrink-0", collapsed ? "h-6 w-6" : "h-5 w-5")} 
              strokeWidth={collapsed ? 1.5 : 2} 
            />
            {!collapsed && <span>AI Assistant</span>}
          </button>

          {!currentUser ? (
            <button
              onClick={() => navigate('/login')}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50",
                collapsed && "justify-center"
              )}
              title={collapsed ? "Sign In" : undefined}
            >
              <LogOut 
                className={cn("shrink-0 rotate-180", collapsed ? "h-6 w-6" : "h-5 w-5")} 
                strokeWidth={collapsed ? 1.5 : 2} 
              />
              {!collapsed && <span>Sign In</span>}
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50",
                collapsed && "justify-center"
              )}
              title={collapsed ? "Sign Out" : undefined}
            >
              <LogOut 
                className={cn("shrink-0", collapsed ? "h-6 w-6" : "h-5 w-5")} 
                strokeWidth={collapsed ? 1.5 : 2} 
              />
              {!collapsed && <span>Sign Out</span>}
            </button>
          )}

          {!collapsed && currentUser && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-line p-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-100 font-bold text-brand-700">
                {currentUser.name.charAt(0)}
              </div>
              <div className="overflow-hidden text-sm">
                <p className="truncate font-semibold text-ink">{currentUser.name}</p>
                <p className="truncate text-xs text-ink-muted capitalize">{currentUser.role || 'Patient'}</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        className={cn(
          "flex-1 transition-all duration-300 pt-16 md:pt-0",
          collapsed ? "md:ml-20" : "md:ml-64",
          "ml-0"
        )}
      >
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
