import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  History, Calendar, FileText, Download, Sparkles, Plus,
  Clock, CheckCircle2, AlertCircle, Stethoscope, ChevronRight, Video, X, Edit2, MoreVertical, Trash2
} from 'lucide-react';
import { User as UserType, ChatSession } from '../types';
import { MOCK_DOCTORS } from '../data/mockData';
import { getChats, getAppointments, updateProfile, getMyDoctorProfile, updateDoctorProfile, deleteChat } from '../services/api';
import { cn } from '../utils/cn';
import { SectionShell, Eyebrow, Button } from './ui';
import { useAuth } from '../context/AuthContext';

interface Props {
  currentUser: UserType | null;
  onOpenAuth: () => void;
  onChangeTab: (tab: string) => void;
  onOpenChat: () => void;
  onResumeChat?: (chatId: string) => void;
}

export const DashboardView: React.FC<Props> = ({ currentUser, onOpenAuth, onChangeTab, onOpenChat, onResumeChat }) => {
  const { refreshUser } = useAuth();
  
  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editAge, setEditAge] = useState(currentUser?.age || 0);
  const [editGender, setEditGender] = useState(currentUser?.gender || '');
  const [editAllergies, setEditAllergies] = useState(currentUser?.allergies?.join(', ') || '');
  const [editChronicConditions, setEditChronicConditions] = useState(currentUser?.chronicConditions?.join(', ') || '');
  const [editAppointmentEmail, setEditAppointmentEmail] = useState(currentUser?.appointmentEmail || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Doctor specific profile state
  const isDoctor = currentUser?.role === 'doctor';
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [doctorForm, setDoctorForm] = useState({
    specialty: '', experience: '', hospital: '', location: '', bio: '', image: '', consultationFee: 100
  });
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');

  // Allergies & Chronic Conditions adding state
  const [addingType, setAddingType] = useState<'allergies' | 'chronicConditions' | null>(null);
  const [newItemVal, setNewItemVal] = useState('');
  const [savingItem, setSavingItem] = useState(false);
  const [openChatMenuId, setOpenChatMenuId] = useState<string | null>(null);

  const handleDeleteChat = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this chat?')) return;
    try {
      await deleteChat(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      setOpenChatMenuId(null);
    } catch (error) {
      console.error('Failed to delete chat:', error);
      alert('Failed to delete chat');
    }
  };

  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name);
      setEditAge(currentUser.age || 0);
      setEditGender(currentUser.gender || '');
      setEditAllergies(currentUser.allergies?.join(', ') || '');
      setEditChronicConditions(currentUser.chronicConditions?.join(', ') || '');
      setEditAppointmentEmail(currentUser.appointmentEmail || '');
      
      if (currentUser.role === 'doctor') {
        getMyDoctorProfile().then(({ data }) => {
          setDoctorProfile(data);
          if (data) {
            setDoctorForm({
              specialty: data.specialty || '',
              experience: data.experience || '',
              hospital: data.hospital || '',
              location: data.location || '',
              bio: data.bio || '',
              image: data.image || '',
              consultationFee: data.consultationFee || 100
            });
          }
        }).catch(err => console.error(err));
      }
    }
  }, [currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSavingProfile(true);
    try {
      await updateProfile({
        name: editName,
        age: Number(editAge),
        gender: editGender,
        allergies: editAllergies.split(',').map(s => s.trim()).filter(Boolean),
        chronicConditions: editChronicConditions.split(',').map(s => s.trim()).filter(Boolean),
        appointmentEmail: editAppointmentEmail.trim()
      });
      if (isDoctor) {
        const fee = currency === 'INR' ? Math.round(doctorForm.consultationFee / 80) : doctorForm.consultationFee;
        const { data } = await updateDoctorProfile({ ...doctorForm, consultationFee: fee });
        setDoctorProfile(data);
      }
      await refreshUser();
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Failed to update profile', err);
      alert('Failed to update profile details.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddItem = async () => {
    if (!currentUser || !newItemVal.trim() || !addingType) return;
    setSavingItem(true);
    const val = newItemVal.trim();
    const currentList = addingType === 'allergies' 
      ? (currentUser.allergies || []) 
      : (currentUser.chronicConditions || []);
      
    if (currentList.includes(val)) {
      setAddingType(null);
      setNewItemVal('');
      setSavingItem(false);
      return;
    }
    
    const updatedList = [...currentList, val];
    
    try {
      await updateProfile({
        [addingType]: updatedList
      });
      await refreshUser();
    } catch (err) {
      console.error('Failed to update list', err);
      alert('Failed to add item.');
    } finally {
      setAddingType(null);
      setNewItemVal('');
      setSavingItem(false);
    }
  };

  const handleRemoveItem = async (type: 'allergies' | 'chronicConditions', val: string) => {
    if (!currentUser) return;
    const currentList = type === 'allergies' 
      ? (currentUser.allergies || []) 
      : (currentUser.chronicConditions || []);
      
    const updatedList = currentList.filter(item => item !== val);
    
    try {
      await updateProfile({
        [type]: updatedList
      });
      await refreshUser();
    } catch (err) {
      console.error('Failed to remove item', err);
      alert('Failed to remove item.');
    }
  };
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [timeFilter, setTimeFilter] = useState<'all_time' | 'past_24h' | 'past_week' | 'past_month' | 'past_year'>('all_time');
  const [chatPage, setChatPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [apptsLoading, setApptsLoading] = useState(false);
  const [selectedDetailAppt, setSelectedDetailAppt] = useState<any>(null);
  const [viewApptsAs, setViewApptsAs] = useState<'doctor' | 'patient'>('doctor');

  const fetchDashboardData = () => {
    if (!currentUser) return;
    setLoading(true);
    getChats()
      .then(({ data }) => {
        const mapped: ChatSession[] = data.map((c: any) => ({
          id: c._id,
          title: c.title || 'Untitled Consultation',
          date: new Date(c.updatedAt).toLocaleDateString(),
          timestamp: new Date(c.updatedAt).getTime(),
          messagesCount: c.messages?.length || 0,
          summary: c.summary || 'No summary available.',
        }));
        setSessions(mapped);
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));

    setApptsLoading(true);
    getAppointments({ upcoming: 'true', asPatient: isDoctor && viewApptsAs === 'patient' ? 'true' : undefined })
      .then(({ data }) => setAppointments(data || []))
      .catch(() => setAppointments([]))
      .finally(() => setApptsLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
    const handleRefresh = () => fetchDashboardData();
    window.addEventListener('medisage_refresh_data', handleRefresh);
    return () => window.removeEventListener('medisage_refresh_data', handleRefresh);
  }, [currentUser, viewApptsAs, isDoctor]);


  const mockAppts = [
    { id: 'a1', doctor: MOCK_DOCTORS[0], time: 'Today at 3:30 PM', type: 'Follow-up Triage' },
    { id: 'a2', doctor: MOCK_DOCTORS[2], time: 'Fri, Nov 02 · 10:00 AM', type: 'Skin Allergy Consult' },
  ];

  const displayAppts = appointments.length > 0 ? appointments : (!currentUser ? mockAppts : []);

  const exportSession = (s: ChatSession) => {
    const blob = new Blob([`# Medisage Encounter Report\n**ID:** ${s.id}\n**Title:** ${s.title}\n**Date:** ${s.date}\n**Interactions:** ${s.messagesCount}\n\n## Summary\n${s.summary}\n`], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `encounter-${s.id}.md`;
    a.click();
  };

  return (
    <SectionShell className="py-12 animate-fadeUp space-y-10">
      <div className="relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm p-8 sm:p-10 md:flex-row">
        
        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="relative z-10 flex w-full flex-col gap-4">
            <h3 className="text-lg font-semibold text-brand-700">Edit Profile Details</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Full Name</label>
                <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-base/60 px-3 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Age</label>
                <input type="number" required value={editAge} onChange={(e) => setEditAge(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-base/60 px-3 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Gender</label>
                <select value={editGender} onChange={(e) => setEditGender(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-base/60 px-3 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1 sm:col-span-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Appointment Notification Email</label>
                <input type="email" placeholder="Where to receive appointment emails..." value={editAppointmentEmail} onChange={(e) => setEditAppointmentEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-base/60 px-3 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none" />
              </div>
              {!isDoctor && (
                <>
                  <div className="space-y-1 sm:col-span-3">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Allergies (comma separated)</label>
                    <input type="text" placeholder="e.g. Peanuts, Dust" value={editAllergies} onChange={(e) => setEditAllergies(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-base/60 px-3 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none" />
                  </div>
                  <div className="space-y-1 sm:col-span-3">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Chronic Conditions (comma separated)</label>
                    <input type="text" placeholder="e.g. Asthma, Diabetes" value={editChronicConditions} onChange={(e) => setEditChronicConditions(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-base/60 px-3 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none" />
                  </div>
                </>
              )}
            </div>
            {isDoctor && (
              <>
                <h4 className="mt-4 text-sm font-semibold text-brand-700">Professional Medical Details</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Specialty</label>
                    <input type="text" placeholder="e.g. Cardiologist" value={doctorForm.specialty} onChange={(e) => setDoctorForm({...doctorForm, specialty: e.target.value})}
                      className="w-full rounded-xl border border-slate-200 bg-base/60 px-3 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Experience</label>
                    <input type="text" placeholder="e.g. 10 Years" value={doctorForm.experience} onChange={(e) => setDoctorForm({...doctorForm, experience: e.target.value})}
                      className="w-full rounded-xl border border-slate-200 bg-base/60 px-3 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Hospital</label>
                    <input type="text" placeholder="e.g. Apollo Hospital" value={doctorForm.hospital} onChange={(e) => setDoctorForm({...doctorForm, hospital: e.target.value})}
                      className="w-full rounded-xl border border-slate-200 bg-base/60 px-3 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Location</label>
                    <input type="text" placeholder="e.g. New York, NY" value={doctorForm.location} onChange={(e) => setDoctorForm({...doctorForm, location: e.target.value})}
                      className="w-full rounded-xl border border-slate-200 bg-base/60 px-3 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Profile Picture URL (Optional)</label>
                    <input type="text" placeholder="https://..." value={doctorForm.image} onChange={(e) => setDoctorForm({...doctorForm, image: e.target.value})}
                      className="w-full rounded-xl border border-slate-200 bg-base/60 px-3 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Consultation Fee</label>
                    <div className="flex gap-2">
                      <select className="w-24 rounded-xl border border-slate-200 bg-base/60 px-2 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none" value={currency} onChange={e => setCurrency(e.target.value as any)}>
                        <option value="USD">$ USD</option>
                        <option value="INR">₹ INR</option>
                      </select>
                      <input type="number" min="0" placeholder="Fee" value={doctorForm.consultationFee} onChange={(e) => setDoctorForm({...doctorForm, consultationFee: Number(e.target.value)})}
                        className="w-full flex-1 rounded-xl border border-slate-200 bg-base/60 px-3 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Professional Bio</label>
                  <textarea rows={2} placeholder="Describe your background and expertise..." value={doctorForm.bio} onChange={(e) => setDoctorForm({...doctorForm, bio: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-base/60 px-3 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none" />
                </div>
              </>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={savingProfile}>{savingProfile ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </form>
        ) : (
          <div className="relative flex w-full items-center gap-6 md:w-auto">
            {currentUser ? (
              doctorProfile?.image ? (
                <img src={doctorProfile.image} alt={currentUser.name} className="h-20 w-20 shrink-0 rounded-2xl object-cover border border-slate-200" />
              ) : (
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-brand-50 border border-brand-200 text-3xl font-bold text-brand-700">{currentUser.name.charAt(0)}</div>
              )
            ) : (
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-raised text-3xl">👤</div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Eyebrow tone="brand">{currentUser ? `Secure ${currentUser.role} portal` : 'Demo sandbox'}</Eyebrow>
                <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">Encrypted</span>
              </div>
              <div className="flex items-center gap-3">
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{currentUser ? `Welcome back, ${currentUser.name}` : 'Patient Dashboard'}</h2>
                {currentUser && (
                  <Button size="sm" onClick={() => setIsEditingProfile(true)} className="ml-3 !rounded-full px-4" title="Edit Profile">
                    <Edit2 className="h-3.5 w-3.5" /> Edit Profile
                  </Button>
                )}
              </div>
              <p className="mt-1 flex flex-wrap gap-3 text-xs text-ink-soft sm:text-sm">
                <span>{currentUser ? currentUser.email : 'Log in to load personalized encounters'}</span>
                {currentUser && (
                  <>
                    <span>· Age {currentUser.age || 'N/A'}</span>
                    <span>· {currentUser.gender || 'Specify gender'}</span>
                    {currentUser.appointmentEmail && (
                      <span className="flex items-center gap-1">· <strong className="text-ink">Notifications:</strong> {currentUser.appointmentEmail}</span>
                    )}
                  </>
                )}
              </p>
            </div>
          </div>
        )}
        {!isEditingProfile && (
          <div className="relative flex w-full flex-col gap-2 md:w-auto">
            {!currentUser ? (
              <Button size="lg" onClick={onOpenAuth} className="w-full md:w-auto">Sign In to Authenticate</Button>
            ) : (
              <>
                <Button size="lg" onClick={onOpenChat} className="w-full md:w-auto"><Sparkles className="h-4 w-4" /> New AI Consult</Button>
                <Button variant="secondary" size="sm" onClick={() => onChangeTab('reports')} className="w-full md:w-auto"><FileText className="h-4 w-4" /> View Reports</Button>
              </>
            )}
          </div>
        )}
      </div>

      {currentUser && (!currentUser.age || !currentUser.gender || !currentUser.appointmentEmail || (currentUser.allergies || []).length === 0) && (
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
              <AlertCircle className="h-5 w-5" />
            </span>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Complete your clinical profile</h4>
              <p className="text-xs text-slate-500 mt-0.5">Add your age, gender, notification email, or allergies to enable highly personalized AI triage advice.</p>
            </div>
          </div>
          <Button size="sm" onClick={() => setIsEditingProfile(true)}>Update Profile</Button>
        </div>
      )}

      {currentUser && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: 'Total Consultations', value: sessions.length, desc: 'Logged chats' },
            { label: 'Active Appointments', value: displayAppts.length, desc: 'Upcoming scheduled' },
            { label: 'Severe Allergies', value: (currentUser.allergies || []).length, desc: 'Critical alert items' },
            { label: 'Chronic Conditions', value: (currentUser.chronicConditions || []).length, desc: 'Monitored issues' },
          ].map((metric, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{metric.label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{metric.value}</p>
              <p className="mt-1 text-[11px] text-slate-500 font-medium">{metric.desc}</p>
            </div>
          ))}
        </div>
      )}

      {currentUser && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {[
            {
              title: 'Medical Allergies',
              type: 'allergies' as const,
              icon: AlertCircle,
              tone: 'text-rose-400',
              items: currentUser.allergies || [],
              placeholder: 'No known severe allergies',
              chip: 'border-rose-200 bg-rose-50 text-rose-700',
              pfx: '⚠️'
            },
            {
              title: 'Chronic Conditions',
              type: 'chronicConditions' as const,
              icon: FileText,
              tone: 'text-blue-700',
              items: currentUser.chronicConditions || [],
              placeholder: 'No chronic conditions listed',
              chip: 'border-blue-200 bg-blue-50 text-blue-700',
              pfx: '•'
            },
          ].map((c) => {
            const I = c.icon;
            const hasItems = c.items.length > 0;
            return (
              <div key={c.title} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-7">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className={cn('flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-ink')}><I className={cn('h-4 w-4', c.tone)} /> {c.title}</h3>
                  <span className="font-mono text-xs text-ink-muted">HIPAA</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {hasItems ? (
                    c.items.map((it, i) => (
                      <span key={i} className={cn('inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-semibold', c.chip)}>
                        <span>{c.pfx} {it}</span>
                        <button onClick={() => handleRemoveItem(c.type, it)} className="text-ink-muted hover:text-ink hover:scale-110 transition-transform">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs text-ink-muted">{c.placeholder}</span>
                  )}
                  
                  {addingType === c.type ? (
                    <div className="flex items-center gap-1">
                      <input type="text" value={newItemVal} onChange={(e) => setNewItemVal(e.target.value)}
                        placeholder="Type new..." autoFocus
                        className="rounded-lg border border-slate-200 bg-base/60 px-2 py-1 text-xs text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none" />
                      <button onClick={handleAddItem} disabled={savingItem}
                        className="rounded-lg bg-brand-400 px-2.5 py-1 text-xs font-bold text-[#04201d] hover:bg-brand-300">
                        {savingItem ? '...' : 'Add'}
                      </button>
                      <button onClick={() => { setAddingType(null); setNewItemVal(''); }}
                        className="rounded-lg border border-slate-200 bg-white p-1 text-ink-soft hover:bg-white">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setAddingType(c.type)} className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-soft hover:bg-white">
                      <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-6 rounded-2xl border border-slate-200 bg-slate-50 p-8 sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-ink">Upcoming Consultations</h3>
            <p className="text-xs text-ink-muted">Synchronized electronic encounters from your triage roadmap</p>
          </div>
          <div className="flex items-center gap-4">
            {isDoctor && (
              <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1">
                <button onClick={() => setViewApptsAs('doctor')} className={cn('rounded-md px-3 py-1 text-xs font-semibold transition-all', viewApptsAs === 'doctor' ? 'bg-white text-ink shadow-sm' : 'text-ink-soft hover:text-ink')}>My Patients</button>
                <button onClick={() => setViewApptsAs('patient')} className={cn('rounded-md px-3 py-1 text-xs font-semibold transition-all', viewApptsAs === 'patient' ? 'bg-white text-ink shadow-sm' : 'text-ink-soft hover:text-ink')}>My Appointments</button>
              </div>
            )}
            <button onClick={() => onChangeTab('appointments')} className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand-700 hover:text-brand-700">
              Book new <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        {apptsLoading && <p className="text-xs text-ink-muted">Loading appointments...</p>}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {displayAppts.map((a: any) => {
            const renderAsPatient = !isDoctor || viewApptsAs === 'patient';
            return (
              <div key={a._id || a.id} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:border-accent-500/40">
                <div className="flex items-start justify-between">
                  <span className="rounded-full border border-accent-500/25 bg-accent-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-blue-700">
                    {a.type || 'Consultation'}
                  </span>
                  <span className="flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                    <Calendar className="h-3.5 w-3.5" /> {a.timeSlot || a.time || 'TBD'}
                  </span>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-surface/80 p-4">
                  {!renderAsPatient ? (
                    <>
                      <div className="grid h-14 w-14 place-items-center rounded-xl bg-brand-50 text-brand-700 font-bold text-xl border border-brand-200 shrink-0">
                        {a.patient?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-ink">{a.patient?.name || 'Unknown Patient'}</h4>
                        <p className="text-xs font-medium text-blue-700">{a.patient?.email}</p>
                        <p className="mt-0.5 text-[11px] text-ink-muted">Age: {a.patient?.age || 'N/A'} • {a.patient?.gender || 'N/A'}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <img src={a.doctor?.image} alt={a.doctor?.name} className="h-14 w-14 rounded-xl object-cover shrink-0" />
                      <div>
                        <h4 className="text-base font-semibold text-ink">{a.doctor?.name}</h4>
                        <p className="text-xs font-medium text-blue-700">{a.doctor?.specialty}</p>
                        <p className="mt-0.5 text-[11px] text-ink-muted">{a.doctor?.hospital}</p>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className={cn('flex items-center gap-1 text-xs font-semibold',
                    a.status === 'confirmed' ? 'text-emerald-300' : 'text-amber-300')}>
                    <CheckCircle2 className="h-4 w-4" /> {a.status || 'Meeting ready'}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setSelectedDetailAppt({...a, renderAsPatient})}>
                      Details
                    </Button>
                    <Button size="sm" onClick={() => a.type === 'telehealth' ? alert('Telehealth room unlocks 10 min prior.') : alert(!renderAsPatient ? `In-person visit with ${a.patient?.name || 'patient'}` : `In-person visit at ${a.doctor?.hospital || 'the clinic'}`)}>
                      {a.type === 'telehealth' ? <Video className="h-3 w-3 mr-1" /> : null} Join
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {displayAppts.length === 0 && !apptsLoading && (
          <p className="text-sm text-ink-muted">No upcoming appointments. <button onClick={() => onChangeTab('appointments')} className="underline text-brand-700">Book one now</button>.</p>
        )}
      </div>

      <div className="space-y-6 rounded-2xl border border-slate-200 bg-slate-50 p-8 sm:p-10">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-ink"><History className="h-5 w-5 text-brand-700" /> Chat Consultation History</h3>
            <p className="text-xs text-ink-muted">Every diagnosis, medicine match, and follow-up persisted</p>
          </div>
          <div className="flex gap-2">
              <select
                value={timeFilter}
                onChange={(e) => {
                  setTimeFilter(e.target.value as any);
                  setChatPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-ink-soft hover:bg-slate-50 focus:border-brand-400 focus:outline-none transition-all cursor-pointer"
                disabled={loading}
              >
                <option value="all_time">All Time</option>
                <option value="past_24h">Past 24 Hours</option>
                <option value="past_week">Past Week</option>
                <option value="past_month">Past Month</option>
                <option value="past_year">Past Year</option>
              </select>
            </div>
          </div>
          <div className="space-y-4">
            {loading && <p className="text-xs text-ink-muted">Loading history...</p>}
            {!loading && (() => {
              const filteredSessions = sessions.filter(s => {
                if (timeFilter === 'all_time') return true;
                if (!s.timestamp) return true;
                const diff = Date.now() - s.timestamp;
                if (timeFilter === 'past_24h') return diff <= 24 * 60 * 60 * 1000;
                if (timeFilter === 'past_week') return diff <= 7 * 24 * 60 * 60 * 1000;
                if (timeFilter === 'past_month') return diff <= 30 * 24 * 60 * 60 * 1000;
                if (timeFilter === 'past_year') return diff <= 365 * 24 * 60 * 60 * 1000;
                return true;
              });
              
              const totalPages = Math.ceil(filteredSessions.length / 5);
              const paginatedSessions = filteredSessions.slice((chatPage - 1) * 5, chatPage * 5);

              return (
                <>
                  {paginatedSessions.map((s) => (
                    <div key={s.id} className="flex flex-col items-start justify-between gap-6 rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:border-brand-400/40 md:flex-row md:items-center">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-white px-2.5 py-0.5 font-mono text-xs font-semibold text-ink-muted">{s.id}</span>
                          <span className="flex items-center gap-1 text-xs text-ink-muted"><Clock className="h-3 w-3" /> {s.date}</span>
                          <span className="rounded border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">{s.messagesCount} exchanges</span>
                        </div>
                        <h4 className="text-lg font-semibold tracking-tight text-ink">{s.title}</h4>
                        <p className="rounded-xl border border-slate-200 bg-base/40 p-3 text-sm leading-relaxed text-ink-soft">
                          <span className="font-semibold text-ink">Summary:</span> {s.id === sessionStorage.getItem('medisage_active_chat') ? 'Consultation in progress...' : s.summary}
                        </p>
                      </div>
                      <div className="flex w-full shrink-0 justify-end gap-3 md:w-auto md:flex-col relative">
                        <div className="absolute -top-4 -right-4">
                          <button onClick={() => setOpenChatMenuId(openChatMenuId === s.id ? null : s.id)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {openChatMenuId === s.id && (
                            <div className="absolute right-0 mt-1 w-32 rounded-lg bg-white shadow-lg border border-slate-200 z-10 overflow-hidden">
                              <button onClick={() => handleDeleteChat(s.id)} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors">
                                <Trash2 className="h-3.5 w-3.5" /> Delete Chat
                              </button>
                            </div>
                          )}
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => exportSession(s)} className="flex-1 md:flex-none mt-2 md:mt-0"><Download className="h-4 w-4 text-brand-700" /> Export</Button>
                        <Button size="sm" onClick={() => { if (onResumeChat) onResumeChat(s.id); }} className="flex-1 md:flex-none"><Stethoscope className="h-4 w-4" /> Resume</Button>
                      </div>
                    </div>
                  ))}
                  
                  {filteredSessions.length === 0 && (
                    <p className="text-sm text-ink-muted">No chat history found for this timeframe.</p>
                  )}

                  {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                      <Button variant="secondary" size="sm" onClick={() => setChatPage(p => Math.max(1, p - 1))} disabled={chatPage === 1}>
                        Previous
                      </Button>
                      <span className="text-xs text-ink-muted font-medium">Page {chatPage} of {totalPages}</span>
                      <Button variant="secondary" size="sm" onClick={() => setChatPage(p => Math.min(totalPages, p + 1))} disabled={chatPage === totalPages}>
                        Next
                      </Button>
                    </div>
                  )}
                </>
              );
            })()}
        </div>
      </div>

      {selectedDetailAppt && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-base/70 p-4 backdrop-blur-md animate-fadeUp">
          <div className="w-full max-w-lg space-y-6 rounded-2xl border border-line bg-surface p-6 shadow-2xl sm:p-8 max-h-[90vh] overflow-y-auto thin-scroll">
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div>
                <Eyebrow tone="blue">Appointment Details</Eyebrow>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                  {selectedDetailAppt.timeSlot || selectedDetailAppt.time || 'Upcoming'}
                </h3>
              </div>
              <button onClick={() => setSelectedDetailAppt(null)} className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-ink-soft hover:bg-slate-200 hover:text-ink transition-colors"><X className="h-4 w-4" /></button>
            </div>

            <div className="space-y-4">
               <div className="rounded-lg bg-slate-50 p-4 text-sm text-ink-soft">
                  <p><span className="font-semibold text-ink">Date:</span> {new Date(selectedDetailAppt.date).toLocaleDateString()}</p>
                  <p><span className="font-semibold text-ink">Type:</span> {selectedDetailAppt.type}</p>
                  {selectedDetailAppt.reason && <p className="mt-1"><span className="font-semibold text-ink">Reason:</span> {selectedDetailAppt.reason}</p>}
                  {selectedDetailAppt.symptoms?.length > 0 && <p className="mt-1"><span className="font-semibold text-ink">Symptoms:</span> {selectedDetailAppt.symptoms.join(', ')}</p>}
               </div>
               
               {!selectedDetailAppt.renderAsPatient ? (
                 <div className="rounded-lg border border-line p-4 text-sm text-ink-soft space-y-1">
                   <h4 className="mb-2 font-semibold text-brand-700">Patient Clinical Profile</h4>
                   <p><span className="font-semibold text-ink">Name:</span> {selectedDetailAppt.patient?.name}</p>
                   <p><span className="font-semibold text-ink">Age:</span> {selectedDetailAppt.patient?.age || 'N/A'}</p>
                   <p><span className="font-semibold text-ink">Gender:</span> {selectedDetailAppt.patient?.gender || 'N/A'}</p>
                   <p><span className="font-semibold text-ink">Allergies:</span> {selectedDetailAppt.patient?.allergies?.length > 0 ? selectedDetailAppt.patient.allergies.join(', ') : 'None'}</p>
                   <p><span className="font-semibold text-ink">Conditions:</span> {selectedDetailAppt.patient?.chronicConditions?.length > 0 ? selectedDetailAppt.patient.chronicConditions.join(', ') : 'None'}</p>
                 </div>
               ) : (
                 <div className="rounded-lg border border-line p-4 text-sm text-ink-soft space-y-1">
                   <h4 className="mb-2 font-semibold text-brand-700">Doctor Profile</h4>
                   <p><span className="font-semibold text-ink">Name:</span> {selectedDetailAppt.doctor?.name}</p>
                   <p><span className="font-semibold text-ink">Specialty:</span> {selectedDetailAppt.doctor?.specialty}</p>
                   <p><span className="font-semibold text-ink">Hospital:</span> {selectedDetailAppt.doctor?.hospital}</p>
                   <p><span className="font-semibold text-ink">Location:</span> {selectedDetailAppt.doctor?.location || 'N/A'}</p>
                   <p><span className="font-semibold text-ink">Experience:</span> {selectedDetailAppt.doctor?.experience || 'N/A'}</p>
                   <p><span className="font-semibold text-ink">Fee:</span> ${selectedDetailAppt.doctor?.consultationFee || 0}</p>
                 </div>
               )}
            </div>

            <div className="flex justify-end pt-4 border-t border-line">
              <Button size="sm" onClick={() => setSelectedDetailAppt(null)}>Close</Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </SectionShell>
  );
};