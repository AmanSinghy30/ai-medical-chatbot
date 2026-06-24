import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Doctor, Medicine } from './types';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthPage } from './components/AuthPage';
import { Sidebar } from './components/Sidebar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { SymptomCheckerTab } from './components/SymptomCheckerTab';
import { DoctorDirectoryTab } from './components/DoctorDirectoryTab';
import { MedicineDirectoryTab } from './components/MedicineDirectoryTab';
import { HealthTipsTab } from './components/HealthTipsTab';
import { DashboardView } from './components/DashboardView';
import { AppointmentBookingTab } from './components/AppointmentBookingTab';
import { MedicalReportsTab } from './components/MedicalReportsTab';
import { ChatbotWidget } from './components/ChatbotWidget';
import { Footer } from './components/Footer';
import { MessageSquare, ShieldCheck, HelpCircle, BrainCircuit } from 'lucide-react';
import { SectionShell, SectionHeading, Eyebrow, Button } from './components/ui';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] animate-fadeUp">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm max-w-lg">
          <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-700">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink">Authentication Required</h2>
          <p className="mb-8 text-sm text-ink-soft leading-relaxed">
            Please sign in to access this service. Authentication is required to ensure the security and privacy of your medical data.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" onClick={() => navigate('/login')} className="w-full sm:w-auto">
              Sign In to Continue
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/')} className="w-full sm:w-auto">
              Back to Overview
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};

function LandingPage({ setChatOpen, queryChat }: any) {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const handleFeatureClick = (action: () => void) => {
    if (!currentUser) {
      navigate('/login');
    } else {
      action();
    }
  };

  return (
    <div className="animate-fadeUp">
      <Hero
        onSearchSymptom={(query) => handleFeatureClick(() => queryChat(query))}
        onOpenChat={() => handleFeatureClick(() => setChatOpen(true))}
      />

      <SectionShell className="py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm">
          <div className="relative flex flex-col items-center justify-between gap-8 lg:flex-row">
            <div className="max-w-2xl space-y-3 text-center lg:text-left">
              <Eyebrow tone="blue">
                <BrainCircuit className="h-3.5 w-3.5" /> Medical AI Triage
              </Eyebrow>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Instant diagnostic clarity with verified clinical guidelines.
              </h2>
              <p className="text-md leading-relaxed text-slate-600 sm:text-lg">
                This integrated Medisage experience combines advanced AI triage flows and live healthcare modules
                to provide actionable roadmaps for both patients and clinicians.
              </p>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row lg:w-auto">
              <Button size="lg" onClick={() => handleFeatureClick(() => setChatOpen(true))}>
                <MessageSquare className="h-4 w-4" /> Open AI Chat
              </Button>
              <Button variant="secondary" size="lg" onClick={() => handleFeatureClick(() => navigate('/symptom_checker'))}>
                <ShieldCheck className="h-4 w-4 text-brand-600" /> Triage Form
              </Button>
            </div>
          </div>
        </div>
      </SectionShell>

      <Features
        onOpenChat={() => handleFeatureClick(() => setChatOpen(true))}
        onChangeTab={(t) => handleFeatureClick(() => navigate('/' + (t === 'landing' ? '' : t)))}
      />

      <SectionShell className="py-16">
        <SectionHeading
          eyebrow={<Eyebrow>Verified Experiences</Eyebrow>}
          title="Praised by clinicians and patients alike."
          desc="Designed to bridge the crucial window between symptom onset and specialist consultation."
        />
        <div className="mt-14 grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            {
              name: 'Marcus Vance, RN',
              role: 'Triage Nurse',
              quote:
                'The real-time escalation logic is precise — it accurately flags dangerous cardiac symptoms while reassuring users with mild viral issues.',
            },
            {
              name: 'Elena Rostova',
              role: 'Verified Patient',
              quote:
                'Being able to securely log my symptoms and immediately connect with relevant specialists has transformed how I manage my chronic care.',
            },
            {
              name: 'Dr. Arthur Pendelton',
              role: 'Chief of Neurology',
              quote:
                'The exported clinical summaries save our triage nurses 10 minutes of manual charting per patient. A fantastic operational accelerator.',
            },
          ].map((t, i) => (
            <figure
              key={i}
              className="flex flex-col justify-between gap-6 rounded-xl border border-slate-200 bg-white p-7 transition-all hover:border-slate-300 hover:shadow-md"
            >
              <blockquote className="text-md leading-relaxed text-slate-700">"{t.quote}"</blockquote>
              <figcaption className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-sm font-bold text-brand-700">
                  {t.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </SectionShell>

      <SectionShell className="py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm">
          <div className="mx-auto mb-12 max-w-2xl space-y-3 text-center">
            <HelpCircle className="mx-auto h-8 w-8 text-brand-600" />
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Frequently asked questions
            </h2>
            <p className="text-md text-slate-600">Everything about the Medisage platform.</p>
          </div>
          <div className="mx-auto max-w-3xl space-y-3">
            {[
              {
                q: 'Is my medical data secure?',
                a: 'Yes. All data is encrypted end-to-end and stored securely. We adhere to stringent HIPAA-ready privacy protocols.',
              },
              {
                q: 'How does the AI Assistant work?',
                a: 'Our AI cross-references your symptoms with verified clinical databases to suggest possible conditions and relevant specialists.',
              },
              {
                q: 'How are medicines and doctors matched?',
                a: 'We match clinical keywords from your symptom description against a vetted reference database, ensuring evidence-aware dosages and specialist recommendations.',
              },
            ].map((f, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-6 space-y-2">
                <h4 className="text-base font-bold text-slate-900">{f.q}</h4>
                <p className="text-md leading-relaxed text-slate-600">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell className="pb-20 pt-4">
        <div className="rounded-2xl border border-slate-200 bg-brand-50 p-10 text-center sm:p-16 shadow-sm">
          <div className="relative mx-auto max-w-2xl space-y-6">
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              Ready for smarter, instant medical triage?
            </h2>
            <p className="text-md text-slate-600 sm:text-lg">
              Use the intelligent assistant to assess symptoms or access your dashboard to book an appointment.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
              <Button size="lg" onClick={() => setChatOpen(true)}>
                Open AI Assistant
              </Button>
              <Button variant="secondary" size="lg" onClick={() => window.location.href = '/dashboard'}>
                Open Dashboard
              </Button>
            </div>
          </div>
        </div>
      </SectionShell>
    </div>
  );
}

function MainApp() {
  const { user: currentUser, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname.split('/')[1] || 'landing';

  const [chatOpen, setChatOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [, setSelectedMedicine] = useState<Medicine | null>(null);
  const [chatIdToResume, setChatIdToResume] = useState<string | null>(null);

  useEffect(() => {
    // Force light theme
    document.documentElement.classList.add('light');
    localStorage.setItem('medisage-theme', 'light');
  }, []);

  const queryChat = (q: string) => {
    setChatQuery(q + ' #' + Date.now());
    setChatOpen(true);
  };

  const pickDoctor = (doc: Doctor) => {
    setSelectedDoctor(doc);
    window.location.href = '/appointments';
  };

  const pickMedicine = (med: Medicine) => {
    setSelectedMedicine(med);
    window.location.href = '/medicines';
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/auth';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <div className="flex flex-col items-center gap-4 text-brand-700 animate-pulse">
          <div className="h-8 w-8 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold tracking-wider uppercase">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  if (isAuthPage) {
    return <AuthPage />;
  }

  if (currentUser && location.pathname === '/') {
    return <Navigate to="/dashboard" replace />;
  }

  const isPortalPage = location.pathname !== '/';



  if (isPortalPage) {
    return (
      <div className="flex min-h-screen bg-slate-50/30 text-ink antialiased selection:bg-brand-200 selection:text-brand-900">
        <Sidebar
          currentUser={currentUser}
          onLogout={logout}
          onOpenChat={() => setChatOpen((v) => !v)}
          onResumeChat={(chatId) => {
            setChatIdToResume(chatId);
            setChatOpen(true);
          }}
          chatOpen={chatOpen}
        >
          <Routes>
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardView
                  currentUser={currentUser}
                  onOpenAuth={() => navigate('/login')}
                  onChangeTab={(t) => navigate('/' + t)}
                  onOpenChat={() => {
                    setChatIdToResume('NEW_CHAT');
                    setChatOpen(true);
                  }}
                  onResumeChat={(chatId) => {
                    setChatIdToResume(chatId);
                    setChatOpen(true);
                  }}
                />
              </ProtectedRoute>
            } />
            <Route path="/symptom_checker" element={<ProtectedRoute><SymptomCheckerTab onSelectDoctor={pickDoctor} onSelectMedicine={pickMedicine} onOpenChatWithQuery={queryChat} /></ProtectedRoute>} />
            <Route path="/doctors/*" element={<ProtectedRoute><DoctorDirectoryTab onSelectDoctor={pickDoctor} selectedDoctor={selectedDoctor} onClearSelectedDoctor={() => setSelectedDoctor(null)} /></ProtectedRoute>} />
            <Route path="/doctormatch/*" element={<ProtectedRoute><DoctorDirectoryTab onSelectDoctor={pickDoctor} selectedDoctor={selectedDoctor} onClearSelectedDoctor={() => setSelectedDoctor(null)} /></ProtectedRoute>} />
            <Route path="/medicines" element={<ProtectedRoute><MedicineDirectoryTab onSelectMedicine={pickMedicine} /></ProtectedRoute>} />
            <Route path="/tips" element={<ProtectedRoute><HealthTipsTab /></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute><AppointmentBookingTab preSelectedDoctor={selectedDoctor} onBack={() => { setSelectedDoctor(null); navigate('/doctors'); }} /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><MedicalReportsTab /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Sidebar>

        <ChatbotWidget
          isOpen={chatOpen}
          onOpenToggle={(open?: boolean) => {
            const nextState = open !== undefined ? open : !chatOpen;
            setChatOpen(nextState);
            if (!nextState) {
              setChatIdToResume(null);
            }
          }}
          initialQuery={chatQuery}
          onSelectMedicine={pickMedicine}
          chatIdToResume={chatIdToResume}
          onClearResumeId={() => setChatIdToResume(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-base text-ink antialiased selection:bg-brand-200 selection:text-brand-900">
      <Navbar
        currentUser={currentUser}
        onOpenAuth={() => navigate('/login')}
        onLogout={logout}
        activeTab={activeTab}
        onChangeTab={() => {}}
        onOpenChat={() => setChatOpen((v) => !v)}
        chatOpen={chatOpen}
      />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage setChatOpen={setChatOpen} queryChat={queryChat} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <ChatbotWidget
        isOpen={chatOpen}
        onOpenToggle={(open?: boolean) => {
          const nextState = open !== undefined ? open : !chatOpen;
          setChatOpen(nextState);
          if (!nextState) {
            setChatIdToResume(null);
          }
        }}
        initialQuery={chatQuery}
        onSelectMedicine={pickMedicine}
        chatIdToResume={chatIdToResume}
        onClearResumeId={() => setChatIdToResume(null)}
      />

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}
