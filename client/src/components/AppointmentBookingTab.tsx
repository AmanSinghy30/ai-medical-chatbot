import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, X, Video, Building, ChevronLeft, AlertTriangle } from 'lucide-react';
import { Doctor } from '../types';
import { getDoctors, getDoctorAvailability, createAppointment, getAppointments, getMyDoctorProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';
import { SectionShell, Eyebrow, Button } from './ui';

interface Props {
  preSelectedDoctor?: Doctor | null;
  onBack?: () => void;
}

export const AppointmentBookingTab: React.FC<Props> = ({ preSelectedDoctor, onBack }) => {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(preSelectedDoctor || null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [appointmentType, setAppointmentType] = useState<'in-person' | 'telehealth'>('in-person');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Doctor onboarding state
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (isDoctor) {
      setProfileLoading(true);
      getMyDoctorProfile().then(({ data }) => {
        setDoctorProfile(data);
      }).catch(err => console.error(err))
        .finally(() => setProfileLoading(false));
    }
  }, [isDoctor]);

  useEffect(() => {
    if (!preSelectedDoctor) {
      setLoading(true);
      getDoctors().then(({ data }) => {
        const mapped = data.map((d: any) => ({
          id: d._id, name: d.name, specialty: d.specialty, experience: d.experience,
          rating: d.rating, reviewsCount: d.reviewsCount, hospital: d.hospital,
          location: d.location, consultationFee: d.consultationFee,
          availableNext: d.availableNext, image: d.image, bio: d.bio,
        }));
        setDoctors(mapped);
      }).catch(() => setDoctors([])).finally(() => setLoading(false));
    }

    getAppointments({ upcoming: 'true' }).then(({ data }) => {
      setAppointments(data || []);
    }).catch(() => setAppointments([]));
  }, [preSelectedDoctor]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      getDoctorAvailability(selectedDoctor.id, selectedDate).then(({ data }) => {
        setAvailableSlots(data.available || []);
      }).catch(() => setAvailableSlots([]));
    }
  }, [selectedDoctor, selectedDate]);

  const book = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) return;
    setBooking(true);
    setBookingError('');
    try {
      await createAppointment({
        doctorId: selectedDoctor.id,
        date: selectedDate,
        timeSlot: selectedSlot,
        type: appointmentType,
        reason: reason || 'General consultation',
      });
      setBooked(true);
      setTimeout(() => {
        setBooked(false);
        setSelectedDoctor(null);
        setSelectedDate('');
        setSelectedSlot('');
        setReason('');
        setShowForm(false);
        getAppointments({ upcoming: 'true' }).then(({ data }) => setAppointments(data || []));
      }, 3000);
    } catch (err: any) {
      console.error('Booking failed:', err);
      const msg = err.response?.data?.message || 'Booking failed. Please try again.';
      setBookingError(msg);
    } finally {
      setBooking(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <SectionShell className="py-12 animate-fadeUp">
      <div className="mb-10 space-y-3 rounded-2xl border border-line bg-surface/70 p-8">
        <div className="flex items-center gap-2">
          {onBack && (
            <button onClick={onBack} className="rounded-lg border border-line bg-white/[0.04] px-2 py-1 text-xs text-ink-soft hover:bg-white/[0.08]">
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <Eyebrow tone="brand"><Calendar className="h-3.5 w-3.5" /> Appointment Booking</Eyebrow>
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {isDoctor ? 'Your Schedule' : 'Schedule Your Consultation'}
        </h2>
        <p className="max-w-2xl text-md leading-relaxed text-ink-soft">
          {isDoctor ? (doctorProfile?.isProfileComplete ? 'View your upcoming appointments and patient details.' : 'Complete your medical profile to start accepting appointments.') : 'Select a verified specialist, choose a time slot, and confirm your appointment. Telehealth options available.'}
        </p>
      </div>

      {isDoctor ? (
        profileLoading ? (
          <p className="text-sm text-ink-muted">Loading profile...</p>
        ) : doctorProfile && !doctorProfile.isProfileComplete ? (
          <div className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-line bg-surface p-8 shadow-2xl text-center">
            <h3 className="text-2xl font-semibold text-ink">Action Required</h3>
            <p className="text-sm text-ink-soft">
              Please complete your professional medical profile in the Dashboard before you can manage your appointments.
            </p>
            <Button className="w-full sm:w-auto" onClick={() => window.location.href = '/dashboard'}>
              Go to Dashboard
            </Button>
          </div>
        ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-ink">Upcoming Consultations</h3>
            <span className="text-xs text-ink-muted">{appointments.length} patients booked</span>
          </div>
          {appointments.length === 0 ? (
            <p className="text-sm text-ink-muted">No appointments booked yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {appointments.map((appt: any) => (
                <div key={appt._id} className="flex flex-col gap-3 rounded-xl border border-line bg-raised/50 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 text-sm font-bold text-slate-950">
                        {appt.patient?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink">{appt.patient?.name || 'Unknown Patient'}</p>
                        <p className="text-xs text-ink-muted">{appt.patient?.email}</p>
                      </div>
                    </div>
                    <span className={cn('rounded px-2 py-0.5 text-[10px] font-bold',
                      appt.status === 'confirmed' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300')}>
                      {appt.status}
                    </span>
                  </div>
                  
                  <div className="rounded-lg bg-base/40 p-3 text-xs text-ink-soft">
                    {appt.consultId && <p className="mb-2 rounded bg-brand-500/10 px-2 py-1 font-mono text-[10px] font-bold text-brand-300">ID: {appt.consultId}</p>}
                    <p><span className="font-semibold text-ink">Date:</span> {new Date(appt.date).toLocaleDateString()}</p>
                    <p><span className="font-semibold text-ink">Time:</span> {appt.timeSlot}</p>
                    <p><span className="font-semibold text-ink">Type:</span> {appt.type}</p>
                    {appt.reason && <p className="mt-1"><span className="font-semibold text-ink">Reason:</span> {appt.reason}</p>}
                    {appt.symptoms?.length > 0 && <p className="mt-1"><span className="font-semibold text-ink">Symptoms:</span> {appt.symptoms.join(', ')}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )
      ) : (
        <>
          {/* Upcoming Appointments */}
      {appointments.length > 0 && (
        <div className="mb-10 space-y-4 rounded-2xl border border-line bg-raised/40 p-8">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-ink"><Calendar className="h-5 w-5 text-brand-300" /> Upcoming Appointments</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {appointments.map((appt: any) => (
              <div key={appt._id} className="flex items-center gap-4 rounded-xl border border-line bg-white/[0.02] p-4">
                <img src={appt.doctor?.image} alt={appt.doctor?.name} className="h-12 w-12 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{appt.doctor?.name}</p>
                  <p className="text-xs text-accent-400">{appt.doctor?.specialty}</p>
                  <p className="text-xs text-ink-muted">{new Date(appt.date).toLocaleDateString()} · {appt.timeSlot} · {appt.status}</p>
                </div>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold',
                  appt.status === 'confirmed' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300')}>
                  {appt.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {booked ? (
        <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-10 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-semibold text-emerald-200">Appointment Confirmed!</h3>
          <p className="text-sm text-emerald-300/80">A confirmation email has been sent. You will receive a reminder 24 hours before your appointment.</p>
          <p className="text-xs text-emerald-300/60">n8n automation: Email confirmation triggered + Calendar invite sent</p>
        </div>
      ) : !showForm && !preSelectedDoctor ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-ink">Select a Doctor</h3>
            <span className="text-xs text-ink-muted">{doctors.length} specialists available</span>
          </div>
          {loading && <p className="text-sm text-ink-muted">Loading doctors...</p>}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doc) => (
              <button key={doc.id} onClick={() => { setSelectedDoctor(doc); setShowForm(true); }}
                className="text-left rounded-xl border border-line bg-raised/50 p-6 transition-all hover:border-accent-500/40 hover:bg-raised">
                <div className="flex items-center gap-4 mb-3">
                  <img src={doc.image} alt={doc.name} className="h-14 w-14 rounded-xl object-cover" />
                  <div>
                    <h4 className="text-sm font-semibold text-ink">{doc.name}</h4>
                    <p className="text-xs text-accent-400">{doc.specialty}</p>
                  </div>
                </div>
                <p className="text-xs text-ink-muted mb-2">⭐ {doc.rating} · {doc.hospital}</p>
                <p className="text-xs font-semibold text-ink">${doc.consultationFee} / session</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-line bg-raised/40 p-8">
          {/* Selected Doctor */}
          {selectedDoctor && (
            <div className="flex items-center gap-4 rounded-xl border border-line bg-white/[0.02] p-4">
              <img src={selectedDoctor.image} alt={selectedDoctor.name} className="h-16 w-16 rounded-xl object-cover" />
              <div className="flex-1">
                <h4 className="text-base font-semibold text-ink">{selectedDoctor.name}</h4>
                <p className="text-xs text-accent-400">{selectedDoctor.specialty}</p>
                <p className="text-xs text-ink-muted">{selectedDoctor.hospital} · {selectedDoctor.location}</p>
              </div>
              <button onClick={() => { setSelectedDoctor(null); setShowForm(false); }}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-ink-soft hover:bg-white/10 hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Appointment Type */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Appointment Type</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['in-person', Building, 'In-Person'],
                ['telehealth', Video, 'Telehealth'],
              ].map(([val, Icon, label]) => {
                const I = Icon as React.ComponentType<{ className?: string }>;
                return (
                  <button key={val as string} onClick={() => setAppointmentType(val as any)}
                    className={cn('flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-semibold transition-all',
                      appointmentType === val ? 'border-accent-400/50 bg-accent-500/10 text-accent-400' : 'border-line bg-white/[0.02] text-ink-soft hover:bg-white/[0.05]')}>
                    <I className="h-4 w-4" /> {label as string}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Select Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-ink-muted" />
              <input type="date" min={today} max={maxDate}
                value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-xl border border-line bg-base/60 py-3 pl-10 pr-4 text-sm text-ink focus:border-accent-400 focus:outline-none" />
            </div>
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Available Time Slots <span className="text-ink-muted">({availableSlots.length} available)</span>
              </label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {availableSlots.length > 0 ? availableSlots.map((slot) => (
                  <button key={slot} onClick={() => setSelectedSlot(slot)}
                    className={cn('rounded-xl border py-2.5 text-xs font-semibold transition-all',
                      selectedSlot === slot ? 'border-accent-400/50 bg-accent-500/10 text-accent-400' : 'border-line bg-white/[0.02] text-ink-soft hover:bg-white/[0.05]')}>
                    <Clock className="h-3 w-3 inline mr-1" /> {slot}
                  </button>
                )) : (
                  <p className="col-span-full text-xs text-ink-muted">No slots available for this date. Please select another date.</p>
                )}
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Reason for Visit</label>
            <textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="Describe your symptoms or reason for consultation..."
              className="w-full rounded-xl border border-line bg-base/60 p-3 text-sm text-ink placeholder:text-ink-muted focus:border-accent-400 focus:outline-none" />
          </div>

          {/* Booking Error */}
          {bookingError && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300">
              <AlertTriangle className="h-4 w-4 shrink-0" /> {bookingError}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-line pt-4">
            <Button variant="secondary" onClick={() => { setShowForm(false); setSelectedDoctor(null); }}>Back</Button>
            <Button size="lg" disabled={!selectedSlot || booking} onClick={book}>
              {booking ? 'Confirming...' : 'Confirm Appointment'} <CheckCircle2 className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-center text-[10px] text-ink-muted">
            n8n automation: After confirmation, an email is sent and a calendar event is created automatically.
          </p>
        </div>
      )}
        </>
      )}
    </SectionShell>
  );
};
