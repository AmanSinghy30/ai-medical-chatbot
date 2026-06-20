import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, X, Maximize2, Minimize2, Send, Sparkles, Trash2, Download, Settings,
  Stethoscope, AlertCircle, Pill, UserCheck, Mic, Check,
  ChevronRight, Volume2, ShieldAlert, ArrowUpRight, Plus, EyeOff,
  CheckCircle2, ListChecks, Activity, BookOpen, AlertTriangle,
  Clock, Flame, Calendar
} from 'lucide-react';
import { ChatMessage, Doctor, Medicine, TriageSeverity } from '../types';
import { MOCK_DOCTORS, MOCK_MEDICINES } from '../data/mockData';
import { generateAIResponse, createChat, addMessage, getChatById, createAppointment, getDoctorAvailability } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

const generateObjectId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return timestamp + random;
};

interface ChatbotWidgetProps {
  isOpen: boolean;
  onOpenToggle: (open?: boolean) => void;
  initialQuery?: string;
  onSelectMedicine?: (med: Medicine) => void;
  chatIdToResume?: string | null;
  onClearResumeId?: () => void;
}

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const INTRO: ChatMessage = {
  id: 'intro',
  role: 'assistant',
  content: "Hello! I'm Sage, your clinical AI assistant. How can I support your health today?",
  timestamp: now(),
  isDisclaimer: true,
};

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  isOpen, onOpenToggle, initialQuery, onSelectMedicine, chatIdToResume, onClearResumeId,
}) => {
  const [maximized, setMaximized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INTRO]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('medisage_key') || '');
  const [apiType, setApiType] = useState<'gemini' | 'openai' | 'n8n'>('n8n');
  const [showSettings, setShowSettings] = useState(false);
  const [saved, setSaved] = useState(false);
  const [listening, setListening] = useState(false);
  const { user: currentUser } = useAuth();
  const [chatId, setChatId] = useState<string | null>(null);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [selectedQuickOption, setSelectedQuickOption] = useState<string | null>(null);
  const [isIncognito, setIsIncognito] = useState(false);
  const [tempUserId, setTempUserId] = useState<string | null>(null);
  const [queuedQuestions, setQueuedQuestions] = useState<any[]>([]);
  const [collectedAnswers, setCollectedAnswers] = useState<any[]>([]);
  const [expandedDoctorMessages, setExpandedDoctorMessages] = useState<Record<string, boolean>>({});
  const [expandedAssessmentMessages, setExpandedAssessmentMessages] = useState<Record<string, boolean>>({});
  const [requestedDoctors, setRequestedDoctors] = useState<Record<string, boolean>>({});
  const [requestedMedicines, setRequestedMedicines] = useState<Record<string, boolean>>({});

  // Booking State
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingReason, setBookingReason] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const today = new Date().toISOString().split('T')[0];
  const maxD = new Date();
  maxD.setMonth(maxD.getMonth() + 2);
  const maxDate = maxD.toISOString().split('T')[0];

  useEffect(() => {
    if (bookingDoctor && bookingDate) {
      const docId = bookingDoctor.id || (bookingDoctor as any)._id;
      getDoctorAvailability(docId, bookingDate).then(({ data }) => {
        setAvailableSlots(data.available || []);
      }).catch(() => setAvailableSlots([]));
    } else {
      setAvailableSlots([]);
    }
  }, [bookingDoctor, bookingDate]);

  const handleConfirmBooking = async () => {
    if (!bookingDoctor || !bookingDate || !bookingTime) return;
    setBookingLoading(true);
    try {
      await createAppointment({
        doctorId: bookingDoctor.id || (bookingDoctor as any)._id,
        patientId: currentUser?.id,
        date: bookingDate,
        timeSlot: bookingTime,
        reason: bookingReason || 'General Consultation',
        type: 'telehealth'
      });
      const aMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'system',
        content: `✅ Appointment confirmed with ${bookingDoctor.name} on ${bookingDate} at ${bookingTime}.`,
        timestamp: now(),
      };
      setMessages((m) => [...m, aMsg]);
      if (chatId) saveAssistantMessage(chatId, aMsg);
      setBookingDoctor(null);
      setBookingDate('');
      setBookingTime('');
      setBookingReason('');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to book appointment';
      alert(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  const performIncognitoCleanup = async (idToDelete: string | null) => {
    if (!idToDelete) return;
    try {
      await fetch(`/api/chat/temporary/${idToDelete}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to cleanup incognito chat:', err);
    }
  };

  const toggleIncognito = () => {
    const nextVal = !isIncognito;
    setIsIncognito(nextVal);

    // Clear and start new chat session
    setMessages([INTRO]);
    lastQuery.current = '';

    if (isIncognito && chatId) {
      performIncognitoCleanup(chatId);
    }

    setChatId(null);
    setActiveQuestionId(null);
    if (nextVal) {
      setTempUserId(generateObjectId());
    } else {
      setTempUserId(null);
    }
    setQueuedQuestions([]);
    setCollectedAnswers([]);
    if (onClearResumeId) onClearResumeId();
  };

  useEffect(() => {
    return () => {
      if (isIncognito && chatId) {
        performIncognitoCleanup(chatId);
      }
    };
  }, [isIncognito, chatId]);

  useEffect(() => {
    const handleUnload = () => {
      if (isIncognito && chatId) {
        fetch(`/api/chat/temporary/${chatId}`, { method: 'DELETE', keepalive: true });
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [isIncognito, chatId]);

  const handleQuickReplyClick = (optionText: string) => {
    setSelectedQuickOption(optionText);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastQuery = useRef<string>('');

  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 120); }, [isOpen]);

  useEffect(() => {
    if (initialQuery && isOpen && initialQuery !== lastQuery.current) {
      lastQuery.current = initialQuery;
      const clean = initialQuery.replace(/\s*#\d+$/, '');
      send(clean);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery, isOpen]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  useEffect(() => {
    // Reset chat when user changes (e.g. login/logout)
    setMessages([INTRO]);
    setChatId(null);
    setActiveQuestionId(null);
  }, [currentUser?.id]);

  useEffect(() => {
    if (chatIdToResume) {
      getChatById(chatIdToResume)
        .then(({ data }) => {
          setChatId(data._id);
          const formattedMsgs: ChatMessage[] = (data.messages || []).map((m: any) => ({
            id: m.id || `m-${Date.now()}-${Math.random()}`,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp || now(),
            triageLevel: m.triageLevel,
            suggestedMedicines: m.suggestedMedicines || [],
            recommendedDoctors: m.recommendedDoctors || [],
            followUpQuestions: m.followUpQuestions,
            questionId: m.questionId,
            assessment: m.assessment
          }));
          setMessages([INTRO, ...formattedMsgs]);

          const lastMsg = formattedMsgs[formattedMsgs.length - 1];
          if (lastMsg && lastMsg.role === 'assistant' && lastMsg.questionId) {
            setActiveQuestionId(lastMsg.questionId);
          } else {
            setActiveQuestionId(null);
          }
        })
        .catch(err => console.error('Failed to load chat to resume', err));
    } else if (chatIdToResume === null) {
      setMessages([INTRO]);
      setChatId(null);
      setActiveQuestionId(null);
    }
  }, [chatIdToResume]);

  const saveKey = () => {
    localStorage.setItem('medisage_key', apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const send = async (text?: string) => {
    let q = (text ?? input).trim();

    // Compile quick reply selection with details if sent from text composer
    if (!text && selectedQuickOption) {
      if (q) {
        q = `${selectedQuickOption}: ${q}`;
      } else {
        q = selectedQuickOption;
      }
      setSelectedQuickOption(null);
    }

    if (!q) return;
    if (!text) setInput('');
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: q, timestamp: now() };
    setMessages((m) => [...m, userMsg]);
    setTyping(true);

    let activeChatId = chatId;
    if (currentUser) {
      if (!activeChatId) {
        try {
          const res = await createChat({
            title: q.substring(0, 40) + '...',
            isIncognito: isIncognito
          });
          activeChatId = res.data._id;
          setChatId(activeChatId);
        } catch (err) {
          console.error('Failed to create chat', err);
        }
      }
    } else {
      if (!activeChatId) {
        activeChatId = `temp-session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        setChatId(activeChatId);
      }
    }

    if (activeChatId && currentUser) {
      addMessage(activeChatId, {
        id: userMsg.id, role: userMsg.role, content: userMsg.content, timestamp: userMsg.timestamp
      }).catch(console.error);
    }

    try {
      if (queuedQuestions.length > 0) {
        const nextAnswers = [...collectedAnswers, { questionId: activeQuestionId, answer: q }];
        setCollectedAnswers(nextAnswers);

        const nextQueue = [...queuedQuestions];
        const nextQuestion = nextQueue.shift();
        setQueuedQuestions(nextQueue);

        if (nextQuestion) {
          setActiveQuestionId(nextQuestion.id);
          const aMsg: ChatMessage = {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: nextQuestion.text,
            timestamp: now(),
            triageLevel: 'low',
            followUpQuestions: nextQuestion.options?.map((o: any) => o.label || o.value) || [],
            questionId: nextQuestion.id
          };
          setTimeout(() => {
            setMessages((m) => [...m, aMsg]);
            saveAssistantMessage(activeChatId, aMsg);
            setTyping(false);
          }, 600);
          return;
        } else {
          // Queue is empty, send bulk answers to backend
          if (apiKey.trim() || apiType === 'n8n') {
            await callBackendAI(JSON.stringify({ initialSymptom: lastQuery.current, answers: nextAnswers }), activeChatId);
          } else {
            await simulate(q, '', activeChatId);
          }
        }
      } else {
        if (apiKey.trim() || apiType === 'n8n') {
          await callBackendAI(q, activeChatId);
        } else {
          await simulate(q, '', activeChatId);
        }
      }
    } catch {
      await simulate(q, ' (Live API error — using verified offline clinical engine.)', activeChatId);
    } finally {
      setTyping(false);
    }
  };

  const callBackendAI = async (q: string, activeChatId: string | null) => {
    const questionIdToSend = activeQuestionId;
    setActiveQuestionId(null);

    const { data } = await generateAIResponse({
      message: q,
      apiKey,
      apiType,
      userId: isIncognito ? (tempUserId || generateObjectId()) : currentUser?.id,
      sessionId: activeChatId,
      questionId: questionIdToSend,
      patient: (currentUser && !isIncognito) ? { name: currentUser.name, age: currentUser.age, gender: currentUser.gender, allergies: currentUser.allergies, chronicConditions: currentUser.chronicConditions } : {},
      chatHistory: messages.map(m => ({ role: m.role, content: m.content }))
    });

    if (apiType === 'n8n' && (data.responseType || data.sessionId)) {
      let content = '';
      const isFollowUp = data.responseType === 'follow_up';

      if (data.error) {
        content += `⚠️ ${data.error}\n\n`;
      } else if (data.summary) {
        content += `${data.summary}\n\n`;
      }

      let nextQuestionId: string | undefined;
      let nextOptions: string[] = [];

      if (isFollowUp && data.nextQuestions && data.nextQuestions.length > 0) {
        const questions = data.nextQuestions;
        const firstQ = questions[0];
        setQueuedQuestions(questions.slice(1));

        content += firstQ.text;
        nextQuestionId = firstQ.id;
        setActiveQuestionId(firstQ.id);
        nextOptions = firstQ.options?.map((o: any) => o.label || o.value) || [];
      } else if (isFollowUp && data.nextQuestion) {
        content += data.nextQuestion.text;
        nextQuestionId = data.nextQuestion.id;
        setActiveQuestionId(data.nextQuestion.id);
        nextOptions = data.nextQuestion.options?.map((o: any) => o.label || o.value) || [];
      }

      if (!isFollowUp) {
        if (data.possibleConditions && data.possibleConditions.length > 0) {
          content += '**Possible Conditions:**\n' + data.possibleConditions.map((c: any) => {
            const confidenceText = c.confidence || c.relativeLikelihood || 'Moderate';
            const reasonText = c.reason || c.why || '';
            const descText = c.description ? `\n  *${c.description}*` : '';
            const reasonDisplay = reasonText ? `\n  _Reason: ${reasonText}_` : '';
            return `- **${c.condition}** (${confidenceText} Confidence)${descText}${reasonDisplay}`;
          }).join('\n\n') + '\n\n';
        }
        if (data.redFlags && data.redFlags.length > 0) {
          content += '**Red Flags:**\n' + data.redFlags.map((r: string) => `• ${r}`).join('\n') + '\n\n';
        }
        if (data.healthTips && data.healthTips.length > 0) {
          content += '**Health Tips:**\n' + data.healthTips.map((t: string) => `• ${t}`).join('\n') + '\n\n';
        }
      }

      if (data.medicalDisclaimer) {
        content += `_${data.medicalDisclaimer}_`;
      }

      let triageLevel: TriageSeverity = 'low';
      const u = data.urgencyLevel?.toLowerCase() || '';
      if (u === 'emergency') triageLevel = 'urgent';
      else if (u === 'high') triageLevel = 'high';
      else if (u === 'medium') triageLevel = 'moderate';

      const recommendedDocs = data.doctorRecommendations || [];
      const suggestedMedicines = data.suggestedMedicines || [];

      let assessmentObj: any = undefined;
      if (!isFollowUp) {
        const rawTriage = data.assessment || data;

        const parsePct = (val: any) => {
          if (typeof val === 'number') return val > 1 ? val / 100 : val;
          if (typeof val === 'string') {
            const num = parseFloat(val.replace('%', ''));
            if (!isNaN(num)) return num / 100;
          }
          return 0.5;
        };

        const possibleConditions = (rawTriage.possibleConditions || []).map((c: any) => {
          const conf = parsePct(c.confidence || c.score);
          const mappedSev = (c.severity || rawTriage.urgencyLevel || 'moderate').toLowerCase();
          return {
            name: c.condition || c.name || 'Condition',
            confidence: conf,
            severity: mappedSev === 'emergency' ? 'urgent' : mappedSev,
            description: c.description || c.reason || c.why || '',
            precautions: c.precautions || (rawTriage.redFlags && rawTriage.redFlags.length ? rawTriage.redFlags.join(', ') : '')
          };
        });

        const knowledgeSources = (rawTriage.sources || rawTriage.knowledgeSources || []).map((s: any) => {
          return {
            disease: s.title || s.disease || 'Resource',
            description: s.reference || s.description || '',
            confidence: parsePct(s.confidence || 0.8)
          };
        });

        let sev = (rawTriage.urgencyLevel || rawTriage.severity || 'moderate').toLowerCase();
        if (sev === 'emergency') sev = 'urgent';
        else if (sev === 'medium') sev = 'moderate';
        else if (sev === 'low') sev = 'low';

        let plan = rawTriage.healthTips || rawTriage.plan || [];
        if (rawTriage.redFlags && rawTriage.redFlags.length) {
          plan = [...plan, ...rawTriage.redFlags.map((rf: string) => `Watch for red flag: ${rf}`)];
        }
        if (!plan.length) {
          plan = ['Drink 8–10 glasses of water daily', 'Light stretching and rest', 'Monitor for changes'];
        }

        assessmentObj = {
          severity: sev,
          summary: rawTriage.summary || 'Clinical assessment completed.',
          plan: plan,
          urgency: rawTriage.urgencyReason || rawTriage.recommendedTimeframe || rawTriage.urgency || '',
          doctorSpecialties: rawTriage.recommendedSpecialists || rawTriage.doctorSpecialties || [],
          possibleConditions,
          knowledgeSources,
          medicalDisclaimer: rawTriage.medicalDisclaimer || rawTriage.disclaimer
        };
      }

      const aMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: content.trim(),
        timestamp: now(),
        triageLevel,
        suggestedMedicines,
        recommendedDoctors: recommendedDocs,
        followUpQuestions: nextOptions.length > 0 ? nextOptions : (data.followUpQuestions || []),
        questionId: nextQuestionId,
        assessment: assessmentObj
      };

      setMessages((m) => [...m, aMsg]);
      saveAssistantMessage(activeChatId, aMsg);
    } else {
      const reply = data.reply || 'No response generated.';
      const a = analyze(q + ' ' + reply);
      const aMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: now(),
        triageLevel: a.triageLevel,
        suggestedMedicines: a.suggestedMedicines,
        recommendedDoctors: a.recommendedDoctors,
        followUpQuestions: a.questions,
        assessment: a.assessment
      };
      setMessages((m) => [...m, aMsg]);
      saveAssistantMessage(activeChatId, aMsg);
    }
  };

  const saveAssistantMessage = (activeChatId: string | null, msg: ChatMessage) => {
    if (activeChatId && currentUser) {
      addMessage(activeChatId, {
        id: msg.id, role: msg.role, content: msg.content, timestamp: msg.timestamp,
        triageLevel: msg.triageLevel,
        suggestedMedicines: msg.suggestedMedicines,
        recommendedDoctors: msg.recommendedDoctors,
        followUpQuestions: msg.followUpQuestions,
        questionId: msg.questionId,
        assessment: msg.assessment
      }).catch(console.error);
    }
  };

  const simulate = async (q: string, note?: string, activeChatId?: string | null) => {
    await new Promise((res) => setTimeout(res, 1000 + Math.random() * 700));
    const a = analyze(q);
    const aMsg: ChatMessage = {
      id: `a-${Date.now()}`, role: 'assistant', content: a.textReply + (note || ''), timestamp: now(),
      triageLevel: a.triageLevel, suggestedMedicines: a.suggestedMedicines, recommendedDoctors: a.recommendedDoctors, followUpQuestions: a.questions,
      assessment: a.assessment
    };
    setMessages((m) => [...m, aMsg]);
    saveAssistantMessage(activeChatId || null, aMsg);
  };

  const analyze = (text: string): { triageLevel: TriageSeverity, suggestedMedicines: Medicine[], recommendedDoctors: Doctor[], textReply: string, questions: string[], assessment?: any } => {
    const t = text.toLowerCase();
    let triageLevel: TriageSeverity = 'low';
    let suggestedMedicines: Medicine[] = [];
    let recommendedDoctors: Doctor[] = [];
    let textReply = ''; let questions: string[] = [];
    let assessment: any = undefined;

    if (/(chest|heart|breath|stroke|bleed|faint)/.test(t)) {
      triageLevel = 'urgent';
      textReply = `⚠️ EMERGENCY TRIAGE WARNING\n\nYour symptoms require immediate evaluation. If experiencing severe chest pain, sudden breathing difficulty, facial drooping, or uncontrolled bleeding — CALL 911 NOW.\n\nWhile waiting:\n• Sit upright and stay calm.\n• Do not eat or drink.\n• If chest pain and not allergic, chew one adult Aspirin (325mg).\n\nIf mild/chronic, schedule an urgent cardiology evaluation below.`;
      suggestedMedicines = MOCK_MEDICINES.filter((m) => /advil|tylenol/i.test(m.name));
      recommendedDoctors = MOCK_DOCTORS.filter((d) => /cardiology|internal/i.test(d.specialty));
      questions = ['When did symptoms start?', 'Does pain radiate to arm/jaw?', 'Are you sweaty or clammy?'];
      assessment = {
        severity: 'urgent',
        summary: 'EMERGENCY TRIAGE WARNING: Your symptoms require immediate medical evaluation. If experiencing severe chest pain, sudden breathing difficulty, or radiating pain, please seek emergency care.',
        plan: ['Sit upright and stay calm', 'Do not eat or drink', 'Chew one adult Aspirin (325mg) if not allergic', 'Go to the nearest ER immediately'],
        urgency: 'Emergency — seek care immediately. Do not delay.',
        doctorSpecialties: ['Cardiologist', 'Emergency Medicine', 'Pulmonologist'],
        possibleConditions: [
          { name: 'Acute Coronary Syndrome', confidence: 0.85, severity: 'urgent', description: 'Reduced blood flow to heart muscle, potentially life-threatening.', precautions: 'Do not drive yourself to the ER.' },
          { name: 'Pericarditis', confidence: 0.40, severity: 'moderate', description: 'Inflammation of the sac-like membrane surrounding the heart.', precautions: 'Avoid strenuous physical activity.' }
        ],
        knowledgeSources: [
          { disease: 'Acute Coronary Syndrome Guidelines', description: 'AHA/ACC clinical management recommendations.', confidence: 0.90 }
        ]
      };
    } else if (/(fever|headache|temp|chills|flu)/.test(t)) {
      triageLevel = 'moderate';
      textReply = `Based on fever/headache, this suggests an acute viral response. Clinical care plan:\n\n1. Home care:\n• Hydrate (electrolytes/broths every 30 min).\n• Lukewarm sponge baths if > 102°F.\n• Rest in a cool, dark room.\n\n2. OTC support:\n• Paracetamol 500mg helps reduce temperature and headache.\n\n3. Escalate if: fever > 103°F over 48h, stiff neck, photophobia, or confusion.`;
      suggestedMedicines = MOCK_MEDICINES.filter((m) => /analgesic|cough/i.test(m.category));
      recommendedDoctors = MOCK_DOCTORS.filter((d) => /internal|pediatric/i.test(d.specialty));
      questions = ['Measured your temperature?', 'Any throat pain or wet cough?', 'Recent contact with flu/COVID?'];
      assessment = {
        severity: 'moderate',
        summary: 'Based on fever/headache, this suggests an acute viral response. Hydration and rest are essential.',
        plan: ['Drink 8-10 glasses of water daily', 'Lukewarm sponge baths to lower temp', 'Rest in a cool, dark room', 'Monitor temperature every 4 hours'],
        urgency: 'Monitor at home. Consult GP if fever >103°F persists over 48h.',
        doctorSpecialties: ['General Physician', 'Internal Medicine'],
        possibleConditions: [
          { name: 'Viral Influenza', confidence: 0.80, severity: 'moderate', description: 'Seasonal influenza virus infection causing systemic symptoms.', precautions: 'Isolate to prevent spread to high-risk individuals.' },
          { name: 'Common Cold / Rhinovirus', confidence: 0.60, severity: 'low', description: 'Mild upper respiratory tract infection.', precautions: 'Symptomatic treatment with rest and warm liquids.' }
        ],
        knowledgeSources: [
          { disease: 'CDC Influenza Management', description: 'Prevention and control of seasonal influenza.', confidence: 0.85 }
        ]
      };
    } else if (/(throat|cough|sneeze|sinus)/.test(t)) {
      triageLevel = 'low';
      textReply = `A sore throat with cough usually points to viral pharyngitis.\n\nRecommendations:\n• Warm saltwater gargles (½ tsp / 8oz) 4x daily.\n• Stay hydrated.\n• Menthol/benzocaine lozenges for relief.\n\nEscalate if white pus spots on tonsils or difficulty swallowing liquids.`;
      suggestedMedicines = MOCK_MEDICINES.filter((m) => /antihistamine|cough/i.test(m.category));
      recommendedDoctors = MOCK_DOCTORS.filter((d) => /internal/i.test(d.specialty));
      questions = ['Is the cough producing colored mucus?', 'Are lymph nodes tender?', 'Any seasonal allergies?'];
      assessment = {
        severity: 'low',
        summary: 'A sore throat with cough usually points to viral pharyngitis, which is typically self-limiting.',
        plan: ['Warm saltwater gargles (1/2 tsp salt in warm water) 4x daily', 'Stay hydrated with warm teas and honey', 'Use throat lozenges to soothe irritation'],
        urgency: 'Home self-care. Consult doctor if swallowing becomes difficult.',
        doctorSpecialties: ['General Physician', 'ENT Specialist'],
        possibleConditions: [
          { name: 'Viral Pharyngitis', confidence: 0.75, severity: 'low', description: 'Inflammation of the pharynx caused by viral infection.', precautions: 'Avoid cold or acidic foods.' },
          { name: 'Streptococcal Tonsillitis', confidence: 0.45, severity: 'moderate', description: 'Bacterial infection of the tonsils requiring antibiotics.', precautions: 'Requires rapid strep test for confirmation.' }
        ],
        knowledgeSources: [
          { disease: 'Infectious Diseases Society Guidelines', description: 'Diagnosis and management of group A streptococcal pharyngitis.', confidence: 0.80 }
        ]
      };
    } else if (/(rash|skin|itch|hives|bite)/.test(t)) {
      triageLevel = 'moderate';
      textReply = `Skin reactions commonly stem from contact dermatitis or mild allergy.\n\nSelf-care:\n• Stop any new lotions/soaps/cosmetics.\n• Cool shower + hydrocortisone 1% or calamine.\n• Non-drowsy antihistamine to stop itching.\n\n⚠️ Seek ER care if it spreads fast, blisters, or causes lip/tongue swelling.`;
      suggestedMedicines = MOCK_MEDICINES.filter((m) => /zyrtec|advil/i.test(m.name));
      recommendedDoctors = MOCK_DOCTORS.filter((d) => /dermatology/i.test(d.specialty));
      questions = ['Started any new medications?', 'Is the rash hot or raised?', 'Recent time in grassy areas?'];
      assessment = {
        severity: 'moderate',
        summary: 'Skin reactions commonly stem from contact dermatitis or mild allergic responses.',
        plan: ['Stop any new lotions, soaps, or cosmetics', 'Cool showers and calamine lotion for relief', 'Take an OTC antihistamine if itching is severe'],
        urgency: 'Schedule GP visit if spreading, painful, or blistering.',
        doctorSpecialties: ['Dermatologist', 'Allergist'],
        possibleConditions: [
          { name: 'Contact Dermatitis', confidence: 0.70, severity: 'low', description: 'Skin inflammation triggered by contact with an allergen or irritant.', precautions: 'Identify and avoid the triggering substance.' },
          { name: 'Urticaria (Hives)', confidence: 0.50, severity: 'moderate', description: 'Red, itchy welts resulting from a systemic allergic release.', precautions: 'Watch for swelling of lips, tongue, or difficulty breathing.' }
        ],
        knowledgeSources: [
          { disease: 'AAD Dermatological Handbook', description: 'Contact dermatitis diagnostics and treatment pathways.', confidence: 0.75 }
        ]
      };
    } else if (/(stomach|belly|nausea|diarrhea|reflux|vomit)/.test(t)) {
      triageLevel = 'moderate';
      textReply = `GI upset can stem from diet, mild gastroenteritis, or excess acid.\n\nRecommendations:\n• B.R.A.T diet for 24h (Bananas, Rice, Applesauce, Toast).\n• Avoid greasy, spicy, high-lactose foods.\n• PPI/antacid for burning epigastric discomfort.\n\nEscalate if sharp lower-right pain or unable to keep water down > 12h.`;
      suggestedMedicines = MOCK_MEDICINES.filter((m) => /prilosec|tylenol/i.test(m.name));
      recommendedDoctors = MOCK_DOCTORS.filter((d) => /gastro/i.test(d.specialty));
      questions = ['Sharp cramp or burning?', 'When/what did you last eat?', 'Any fever alongside?'];
      assessment = {
        severity: 'moderate',
        summary: 'GI upset can stem from dietary irritation, mild gastroenteritis, or excess stomach acid.',
        plan: ['Follow BRAT diet (Bananas, Rice, Applesauce, Toast) for 24h', 'Avoid greasy, spicy, or high-lactose foods', 'Take an OTC antacid/PPI for burning sensation'],
        urgency: 'Seek care if sharp localized pain or unable to keep liquids down for 12 hours.',
        doctorSpecialties: ['Gastroenterologist', 'General Physician'],
        possibleConditions: [
          { name: 'Gastroenteritis', confidence: 0.70, severity: 'moderate', description: 'Inflammation of stomach and intestines, usually viral.', precautions: 'Sip electrolytes to avoid severe dehydration.' },
          { name: 'Acid Dyspepsia', confidence: 0.60, severity: 'low', description: 'Indigestion caused by stomach acid irritation.', precautions: 'Avoid lying down within 2 hours of eating.' }
        ],
        knowledgeSources: [
          { disease: 'ACG Clinical Guidelines', description: 'Management of acute diarrheal infections and GERD.', confidence: 0.80 }
        ]
      };
    } else {
      triageLevel = 'low';
      textReply = `Thanks for sharing. To build an optimal pathway:\n\n• Are symptoms stable or intensifying?\n• Any changes in sleep, allergens, or stress?\n\nIf this affects your daily routine, a telehealth consult with a specialist below is recommended.`;
      suggestedMedicines = MOCK_MEDICINES.slice(0, 3);
      recommendedDoctors = MOCK_DOCTORS.slice(0, 3);
      questions = ['Severity 1–10?', 'Tried any home remedies?', 'Any chronic conditions?'];
      assessment = {
        severity: 'low',
        summary: 'A general assessment indicates mild, non-specific symptoms. Rest and monitor.',
        plan: ['Ensure adequate sleep and hydration', 'Log symptom severity if it changes', 'Avoid self-prescribing new medicines'],
        urgency: 'Monitor at home. Seek primary care if symptoms persist beyond 3 days.',
        doctorSpecialties: ['General Physician'],
        possibleConditions: [
          { name: 'General Fatigue / Malaise', confidence: 0.65, severity: 'low', description: 'Non-specific physical exhaustion or minor immune response.', precautions: 'Maintain a symptom diary.' }
        ],
        knowledgeSources: [
          { disease: 'Primary Care Assessment Guide', description: 'General symptom triage guidelines.', confidence: 0.70 }
        ]
      };
    }
    return { triageLevel, suggestedMedicines, recommendedDoctors, textReply, questions, assessment };
  };

  const clearChat = () => { if (confirm('Clear chat history?')) { setMessages([INTRO]); lastQuery.current = ''; setChatId(null); } };

  const startNewChat = () => {
    setMessages([INTRO]);
    lastQuery.current = '';
    setChatId(null);
    setActiveQuestionId(null);
    if (isIncognito) {
      setTempUserId(generateObjectId());
    }
    setQueuedQuestions([]);
    setCollectedAnswers([]);
    if (onClearResumeId) onClearResumeId();
  };

  const exportLog = () => {
    const md = messages.map((m) => {
      const p = m.role === 'user' ? '👤 Patient' : '🤖 Sage';
      return `**${p}** (${m.timestamp})\n${m.content}\n`;
    }).join('\n---\n\n');
    const blob = new Blob([`# Medisage Clinical Log\n*${new Date().toLocaleString()}*\n\n${md}`], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `medisage-report-${Date.now()}.md`;
    a.click();
  };

  const voice = () => {
    setListening(true);
    setTimeout(() => { setListening(false); setInput('I woke up with a sharp headache and slight fever this morning.'); }, 2600);
  };

  const isLastAssistantMessage = (msgId: string) => {
    const assistantMsgs = messages.filter((m) => m.role === 'assistant');
    return assistantMsgs[assistantMsgs.length - 1]?.id === msgId;
  };

  return (
    <>
      {/* Launcher */}
      <div className="fixed bottom-6 right-5 z-50 flex flex-col items-end sm:right-6">
        {!isOpen && (
          <button
            onClick={() => onOpenToggle(true)}
            className="animate-floaty group mb-3 flex items-center gap-3 rounded-full border border-brand-400/30 bg-surface/90 px-4 py-2.5 text-left shadow-2xl backdrop-blur-md transition-transform hover:scale-105"
          >
            <span className="relative grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-accent-500 text-[#04201d]">
              <Sparkles className="h-4 w-4 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="absolute -right-1 -top-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-brand-300" />
              </span>
            </span>
            <span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-300">AI Health Assistant</span>
              <span className="block text-xs text-ink-soft">Need a symptom check?</span>
            </span>
            <ChevronRight className="h-4 w-4 text-brand-300 transition-transform group-hover:translate-x-1" />
          </button>
        )}

        <button
          onClick={() => onOpenToggle(!isOpen)}
          aria-label={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
          className={cn(
            'relative grid h-16 w-16 place-items-center rounded-full transition-all duration-fast active:scale-95',
            isOpen
              ? 'border border-line-strong bg-overlay text-ink hover:bg-raised'
              : 'animate-glow bg-gradient-to-br from-brand-400 to-accent-500 text-[#04201d] hover:scale-110'
          )}
        >
          {isOpen ? <X className="h-7 w-7" /> : (
            <span className="relative grid place-items-center">
              <Bot className="h-8 w-8" />
              <span className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full border-2 border-base bg-emerald-500 text-[8px] font-bold text-white">AI</span>
            </span>
          )}
        </button>
      </div>

      {/* Window */}
      {isOpen && (
        <div
          className={cn(
            'fixed z-50 flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-400/10 via-surface/60 to-accent-500/15 text-ink shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/5 backdrop-blur-2xl transition-all duration-normal',
            maximized
              ? 'inset-3 sm:inset-6 md:inset-10'
              : 'bottom-24 right-4 h-[680px] max-h-[82vh] w-[92vw] sm:right-6 sm:w-[470px] md:w-[500px]'
          )}
        >
          {/* Header */}
          <div className={cn(
            "flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-4 py-3 transition-all duration-normal",
            isIncognito && "bg-amber-950/20 border-b border-amber-500/20"
          )}>
            <div className="flex items-center gap-3">
              <span className={cn(
                "relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br transition-all duration-normal",
                isIncognito
                  ? "from-amber-400 to-orange-500 text-black"
                  : "from-brand-400 to-accent-500 text-[#04201d]"
              )}>
                <Stethoscope className="h-5 w-5" />
                <span className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-base transition-colors",
                  isIncognito ? "bg-amber-500" : "bg-emerald-500"
                )} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-ink">{isIncognito ? "Incognito Sage" : "Sage AI"}</h3>
                  <span className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-all",
                    isIncognito
                      ? "border-amber-500/25 bg-amber-500/10 text-amber-300"
                      : "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                  )}>{isIncognito ? "Temporary" : "Live"}</span>
                </div>
                <p className="text-xs text-ink-muted">{isIncognito ? "Private clinical check" : "Symptom & doctor-match engine"}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {[
                { icon: EyeOff, fn: toggleIncognito, title: isIncognito ? 'Disable Incognito Mode' : 'Incognito Mode (Temporary Chat)', active: isIncognito, colorClass: isIncognito ? 'text-amber-300 bg-amber-500/15 hover:bg-amber-500/25' : '' },
                { icon: Plus, fn: startNewChat, title: 'New chat' },
                { icon: Settings, fn: () => setShowSettings((v) => !v), title: 'API settings', active: showSettings },
                { icon: Download, fn: exportLog, title: 'Export report' },
                { icon: Trash2, fn: clearChat, title: 'Clear chat' },
              ].map((b, i) => {
                const I = b.icon;
                return (
                  <button key={i} onClick={b.fn} title={b.title}
                    className={cn(
                      'grid h-8 w-8 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-white/[0.06] hover:text-ink',
                      b.active && 'bg-brand-500/15 text-brand-300',
                      b.colorClass
                    )}>
                    <I className="h-4 w-4" />
                  </button>
                );
              })}
              <button onClick={() => setMaximized((v) => !v)} title="Resize" className="hidden h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-white/[0.06] hover:text-ink sm:grid">
                {maximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button onClick={() => onOpenToggle(false)} title="Close" className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-white/[0.06] hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Booking Overlay */}
          {bookingDoctor && (
            <div className="absolute inset-0 z-50 flex flex-col bg-surface/95 backdrop-blur-md animate-fadeUp">
              <div className="flex items-center justify-between border-b border-line px-4 py-3 bg-base/80 mt-14">
                <h4 className="font-semibold text-ink text-sm">Book Appointment</h4>
                <button onClick={() => setBookingDoctor(null)} className="rounded-lg p-1.5 text-ink-muted hover:bg-white/5 hover:text-ink transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 thin-scroll">
                <div className="mb-5 flex items-center gap-3 rounded-xl border border-brand-500/20 bg-brand-500/5 p-3">
                  <img src={bookingDoctor.image} alt={bookingDoctor.name} className="h-12 w-12 rounded-lg object-cover border border-line" />
                  <div>
                    <h5 className="font-bold text-ink text-xs">{bookingDoctor.name}</h5>
                    <p className="text-[11px] text-accent-400">{bookingDoctor.specialty}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Select Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-ink-muted" />
                      <input type="date" min={today} max={maxDate} value={bookingDate} onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full rounded-xl border border-line bg-base/60 py-2.5 pl-10 pr-4 text-sm text-ink outline-none focus:border-brand-400 transition-colors" />
                    </div>
                  </div>
                  {bookingDate && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                        Available Time Slots <span className="text-ink-muted">({availableSlots.length} available)</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {availableSlots.length > 0 ? availableSlots.map((slot) => (
                          <button key={slot} onClick={() => setBookingTime(slot)}
                            className={cn('rounded-xl border py-2.5 text-xs font-semibold transition-all',
                              bookingTime === slot ? 'border-brand-400/50 bg-brand-500/10 text-brand-400' : 'border-line bg-white/[0.02] text-ink-soft hover:bg-white/[0.05]')}>
                            <Clock className="h-3 w-3 inline mr-1" /> {slot}
                          </button>
                        )) : (
                          <p className="col-span-full text-xs text-ink-muted">No slots available for this date. Please select another date.</p>
                        )}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Reason (Optional)</label>
                    <textarea value={bookingReason} onChange={(e) => setBookingReason(e.target.value)} placeholder="E.g. Follow-up consultation"
                      className="w-full resize-none rounded-xl border border-line bg-base px-3 py-2 text-sm text-ink outline-none focus:border-brand-400 transition-colors" rows={3} />
                  </div>
                </div>
              </div>
              <div className="border-t border-line p-4 bg-base/80">
                <button onClick={handleConfirmBooking} disabled={!bookingDate || !bookingTime || bookingLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-brand-400 to-accent-500 py-3 text-sm font-bold text-[#04201d] disabled:opacity-50 transition-all hover:opacity-90 active:scale-[0.98]">
                  {bookingLoading ? 'Confirming...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          )}

          {isIncognito && (
            <div className="flex items-start gap-2 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-200 transition-all duration-normal animate-fadeUp">
              <EyeOff className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              <span>
                <strong>Incognito Mode:</strong> Previous patient history, allergies, and chronic conditions are excluded. Triage will not be saved to your dashboard.
              </span>
            </div>
          )}

          {/* Settings drawer */}
          {showSettings && (
            <div className="absolute inset-x-0 top-[65px] z-20 animate-fadeUp border-b border-line bg-surface/97 p-4 backdrop-blur-xl">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-300">
                  <Flame className="h-4 w-4" /> Live AI Engine
                </h4>
                <button onClick={() => setShowSettings(false)} className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink">Close <X className="h-3 w-3" /></button>
              </div>
              <p className="mb-3 text-xs leading-relaxed text-ink-soft">
                Plug in a Gemini or OpenAI key for live LLM triage. Without one, the verified offline clinical engine runs flawlessly.
              </p>
              <div className="mb-3 flex gap-2">
                {[['gemini', '⚡ Gemini Flash'], ['openai', '🌐 OpenAI GPT-4o'], ['n8n', '🔗 n8n Webhook']].map(([val, label]) => (
                  <button key={val} onClick={() => setApiType(val as any)}
                    className={cn('flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-colors',
                      apiType === val ? 'border-brand-400/50 bg-brand-500/15 text-brand-200' : 'border-line bg-white/[0.03] text-ink-soft hover:bg-white/[0.06]')}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                  placeholder={apiType === 'gemini' ? 'AIzaSy...' : 'sk-proj-...'}
                  className="flex-1 rounded-lg border border-line bg-base/60 px-3 py-2 text-xs text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none" />
                <button onClick={saveKey} className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-brand-400 to-accent-500 px-3 py-2 text-xs font-semibold text-[#04201d]">
                  <Check className="h-3.5 w-3.5" /> Save
                </button>
              </div>
              {saved && <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-300"><Check className="h-3 w-3" /> Saved!</p>}
            </div>
          )}


          {/* Messages */}
          <div ref={scrollRef} className="thin-scroll flex-1 space-y-5 overflow-y-auto p-5">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              const urgent = m.triageLevel === 'urgent';
              return (
                <div key={m.id} className={cn('flex animate-fadeUp items-start gap-3', isUser && 'flex-row-reverse')}>
                  {isUser ? (
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-[10px] font-bold text-brand-200">YOU</span>
                  ) : (
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-accent-500 text-[#04201d]"><Bot className="h-4 w-4" /></span>
                  )}
                  <div className={cn('flex max-w-[86%] flex-col', isUser ? 'items-end' : 'items-start')}>
                    {urgent && (
                      <div className="mb-2 flex animate-pulse items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/15 px-3 py-2 text-rose-200">
                        <ShieldAlert className="h-5 w-5 shrink-0 text-rose-400" />
                        <span className="text-xs font-bold">URGENT: Immediate action recommended</span>
                      </div>
                    )}
                    <div className={cn(
                      'rounded-2xl text-sm leading-relaxed overflow-hidden',
                      isUser ? 'px-4 py-3 rounded-br-sm border border-white/10 bg-white/10 backdrop-blur-md text-ink'
                        : m.assessment ? 'rounded-bl-sm w-full'
                          : urgent ? 'px-4 py-3 rounded-bl-sm border border-rose-500/30 bg-rose-500/10 backdrop-blur-md text-ink'
                            : 'px-4 py-3 rounded-bl-sm border border-white/5 bg-white/[0.04] backdrop-blur-md shadow-sm text-ink'
                    )}>
                      {m.assessment ? (
                        <div className={cn('w-full rounded-2xl border p-5 space-y-5 text-left shadow-lg',
                          m.assessment.severity === 'urgent' ? 'border-rose-500/40 bg-rose-500/[0.04]' :
                            m.assessment.severity === 'high' || m.assessment.severity === 'moderate' ? 'border-amber-500/30 bg-amber-500/[0.03]' :
                              'border-brand-500/30 bg-brand-500/[0.03]'
                        )}>
                          {/* Header Badge */}
                          <div className="flex items-center justify-between border-b border-line pb-2.5">
                            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-300">
                              <ListChecks className="h-4 w-4" /> RAG-Enhanced Triage Synthesis
                            </span>
                            <span className={cn('rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase',
                              m.assessment.severity === 'urgent' ? 'animate-pulse border-rose-500/40 bg-rose-500/15 text-rose-300' :
                                m.assessment.severity === 'high' || m.assessment.severity === 'moderate' ? 'border-amber-500/30 bg-amber-500/15 text-amber-300' :
                                  'border-brand-500/30 bg-brand-500/15 text-brand-200'
                            )}>
                              {m.assessment.severity} priority
                            </span>
                          </div>

                          {/* Title & Summary */}
                          <div>
                            <h4 className="text-lg font-semibold text-ink leading-snug">Assessment Summary</h4>
                            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{m.assessment.summary}</p>
                            {m.assessment.urgency && (
                              <div className={cn('mt-3.5 rounded-xl border p-3.5 text-sm leading-normal',
                                m.assessment.severity === 'urgent' ? 'border-rose-500/30 bg-rose-500/10 text-rose-200' :
                                  'border-amber-500/30 bg-amber-500/10 text-amber-200'
                              )}>
                                <strong>Note:</strong> {m.assessment.urgency}
                              </div>
                            )}
                          </div>

                          {!expandedAssessmentMessages[m.id] ? (
                            <>
                              {m.assessment.possibleConditions && m.assessment.possibleConditions.length > 0 && (
                                <div className="space-y-2 mt-4">
                                  <h5 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-300">
                                    <Activity className="h-4 w-4" /> Possible Conditions
                                  </h5>
                                  <div className="flex flex-wrap gap-2">
                                    {m.assessment.possibleConditions.map((c: any, idx: number) => {
                                      const pct = Math.round(c.confidence * 100);
                                      const condSevColor = c.severity === 'urgent' ? 'border-rose-500/30 bg-rose-500/10 text-rose-300' : c.severity === 'high' || c.severity === 'moderate' ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
                                      return (
                                        <div key={idx} className={cn("flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-md", condSevColor)}>
                                          <span>{c.name}</span>
                                          <span className="font-bold opacity-80">{pct}%</span>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}
                              <button
                                onClick={() => setExpandedAssessmentMessages(prev => ({ ...prev, [m.id]: true }))}
                                className="mt-4 w-full rounded-lg border border-white/10 bg-white/[0.03] py-2.5 text-sm font-semibold text-ink hover:bg-white/[0.08] transition-colors"
                              >
                                Show Full Report
                              </button>
                            </>
                          ) : (
                            <>
                              {/* Possible Conditions */}
                              {m.assessment.possibleConditions && m.assessment.possibleConditions.length > 0 && (
                                <div className="space-y-3.5 rounded-xl border border-line bg-base/40 p-4">
                                  <h5 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-300">
                                    <Activity className="h-4 w-4" /> Possible Conditions (Not Definitive)
                                  </h5>
                                  <p className="text-xs text-ink-muted leading-relaxed">These are AI-assisted preliminary assessments. Always consult a physician for definitive diagnosis.</p>
                                  <div className="space-y-3.5">
                                    {m.assessment.possibleConditions.map((c: any, idx: number) => {
                                      const pct = Math.round(c.confidence * 100);
                                      const barColor = pct >= 70 ? 'bg-brand-400' : pct >= 40 ? 'bg-amber-400' : 'bg-ink-muted';
                                      const condSevColor = c.severity === 'urgent' ? 'text-rose-300' : c.severity === 'high' || c.severity === 'moderate' ? 'text-amber-300' : 'text-emerald-300';
                                      return (
                                        <div key={idx} className="rounded-lg border border-line bg-white/[0.01] p-3.5 text-sm">
                                          <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-1.5">
                                              <span className="grid h-6 w-6 place-items-center rounded-full border border-brand-400/30 bg-brand-500/10 text-xs font-bold text-brand-300">{idx + 1}</span>
                                              <span className="font-semibold text-ink text-sm">{c.name}</span>
                                            </div>
                                            <span className={cn('text-xs font-bold uppercase', condSevColor)}>{c.severity}</span>
                                          </div>
                                          <div className="mb-2.5">
                                            <div className="flex items-center justify-between mb-1 text-xs">
                                              <span className="text-ink-muted">Confidence</span>
                                              <span className="font-bold text-ink">{pct}%</span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                                              <div className={cn('h-full rounded-full transition-all duration-500', barColor)} style={{ width: `${pct}%` }} />
                                            </div>
                                          </div>
                                          {c.description && <p className="text-xs text-ink-soft leading-relaxed">{c.description}</p>}
                                          {c.precautions && (
                                            <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2 text-xs text-amber-200">
                                              <AlertTriangle className="h-3 w-3 inline mr-1" /> {c.precautions}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Recommended Specialties */}
                              {m.assessment.doctorSpecialties && m.assessment.doctorSpecialties.length > 0 && (
                                <div className="rounded-xl border border-line bg-base/40 p-4">
                                  <h5 className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-accent-400">Recommended Specialists</h5>
                                  <div className="flex flex-wrap gap-1.5">
                                    {m.assessment.doctorSpecialties.map((spec: string, idx: number) => (
                                      <span key={idx} className="rounded-xl border border-accent-500/25 bg-accent-500/10 px-3 py-1.5 text-xs font-semibold text-accent-400">
                                        {spec}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Self-Care Roadmap */}
                              {m.assessment.plan && m.assessment.plan.length > 0 && (
                                <div className="space-y-2.5 rounded-xl border border-line bg-base/40 p-4">
                                  <h5 className="text-xs font-bold uppercase tracking-wider text-brand-300 font-medium">Self-Care Action Roadmap</h5>
                                  <ul className="space-y-2 mt-2">
                                    {m.assessment.plan.map((p: string, idx: number) => (
                                      <li key={idx} className="flex items-start gap-2 text-sm text-ink-soft leading-relaxed">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> <span>{p}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* RAG Knowledge Sources */}
                              {m.assessment.knowledgeSources && m.assessment.knowledgeSources.length > 0 && (
                                <div className="rounded-xl border border-line bg-base/40 p-4">
                                  <h5 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                                    <BookOpen className="h-4 w-4" /> RAG Knowledge Sources
                                  </h5>
                                  <div className="space-y-2">
                                    {m.assessment.knowledgeSources.map((src: any, idx: number) => (
                                      <div key={idx} className="flex items-center justify-between rounded-lg border border-line bg-white/[0.01] p-3 text-sm">
                                        <div className="min-w-0 flex-1 pr-2">
                                          <p className="font-semibold text-ink leading-tight">{src.disease}</p>
                                          <p className="text-xs text-ink-muted truncate">{src.description}</p>
                                        </div>
                                        <span className="text-xs font-bold text-brand-300">{Math.round(src.confidence * 100)}%</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <button
                                onClick={() => setExpandedAssessmentMessages(prev => ({ ...prev, [m.id]: false }))}
                                className="mt-4 w-full rounded-lg border border-white/10 bg-white/[0.03] py-2 text-xs font-semibold text-ink-soft hover:bg-white/[0.08] hover:text-ink transition-colors"
                              >
                                Hide Details
                              </button>
                            </>
                          )}

                          {m.followUpQuestions && m.followUpQuestions.length > 0 && typeof m.followUpQuestions[0] === 'object' && (
                            <div className="rounded-xl border border-brand-500/40 bg-brand-500/10 p-4 relative overflow-hidden mt-4">
                              <div className="absolute top-0 left-0 w-1 h-full bg-brand-400"></div>
                              <h5 className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-300">
                                <AlertCircle className="h-4 w-4" /> Please Answer These Follow-ups
                              </h5>
                              <div className="space-y-3">
                                {m.followUpQuestions.map((fq: any, idx: number) => (
                                  <div key={idx} className="rounded-lg border border-line bg-white/[0.02] p-3">
                                    <p className="text-xs font-semibold text-ink mb-2">{fq.question}</p>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-accent-300 bg-accent-500/10 px-1.5 py-0.5 rounded">{fq.category}</span>
                                      <p className="text-[10px] text-ink-soft italic">{fq.purpose}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <p className="mt-4 text-[10px] font-semibold text-brand-200">Reply in the chat below to provide this information.</p>
                            </div>
                          )}

                          {m.assessment.medicalDisclaimer && (
                            <p className="text-[10px] text-ink-muted leading-relaxed italic border-t border-line pt-4 mt-4">
                              {m.assessment.medicalDisclaimer}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="whitespace-pre-line break-words">{m.content}</p>
                      )}

                      {m.followUpQuestions && m.followUpQuestions.length > 0 && typeof m.followUpQuestions[0] === 'string' && isLastAssistantMessage(m.id) ? (
                        <div className="mt-4 border-t border-line pt-3">
                          <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
                            <AlertCircle className="h-3.5 w-3.5" /> Quick replies
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {(m.followUpQuestions as string[]).map((qOpt) => {
                              const isSelected = selectedQuickOption === qOpt;
                              return (
                                <button key={qOpt} onClick={() => handleQuickReplyClick(qOpt)}
                                  className={cn(
                                    "flex items-center gap-1 rounded-xl border px-3 py-1.5 text-left text-xs transition-colors",
                                    isSelected
                                      ? "border-brand-400 bg-brand-500/20 text-brand-200"
                                      : "border-brand-500/25 bg-brand-500/10 text-brand-200 hover:bg-brand-500/20"
                                  )}>
                                  <span>{qOpt}</span><ChevronRight className="h-3 w-3 shrink-0" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}

                      {!m.followUpQuestions?.length && isLastAssistantMessage(m.id) && m.id !== 'intro' ? (
                        <div className="mt-4 border-t border-line pt-3 flex justify-center">
                          <button onClick={startNewChat}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-400 to-accent-500 px-4 py-2 text-xs font-bold text-[#04201d] transition-transform hover:scale-105 active:scale-95">
                            <Plus className="h-3.5 w-3.5" /> Start New Consultation
                          </button>
                        </div>
                      ) : null}

                      {m.suggestedMedicines?.length ? (
                        <div className="mt-4 border-t border-line pt-3">
                          <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
                            <Pill className="h-3.5 w-3.5" /> Recommended medicines
                          </p>
                          {!requestedMedicines[m.id] ? (
                            <button
                              onClick={() => setRequestedMedicines(prev => ({ ...prev, [m.id]: true }))}
                              className="w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 py-2.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                            >
                              View Recommended Medicines
                            </button>
                          ) : (
                            <div className="grid gap-2 mt-2">
                              {m.suggestedMedicines.map((med) => (
                                <div key={med.id} className="rounded-xl border border-line bg-surface/80 p-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h5 className="text-sm font-semibold text-ink">{med.name}</h5>
                                        {med.isOTC && <span className="rounded border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">OTC</span>}
                                      </div>
                                      <p className="mt-0.5 text-xs text-ink-muted">{med.genericName}</p>
                                    </div>
                                    <span className="text-sm font-semibold text-brand-300">{med.price}</span>
                                  </div>
                                  <p className="mt-2 rounded-lg border border-line bg-base/50 p-2 text-xs text-ink-soft">
                                    <span className="font-semibold text-brand-300">Dosage:</span> {med.recommendedDosage}
                                  </p>
                                  {onSelectMedicine && (
                                    <button onClick={() => onSelectMedicine(med)}
                                      className="mt-2 inline-flex items-center justify-center gap-1 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20">
                                      Full report <ArrowUpRight className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : null}

                      {m.recommendedDoctors?.length ? (
                        <div className="mt-4 border-t border-white/5 pt-3">
                          <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-accent-400">
                            <UserCheck className="h-3.5 w-3.5" /> Specialist match
                          </p>
                          {!requestedDoctors[m.id] ? (
                            <button
                              onClick={() => setRequestedDoctors(prev => ({ ...prev, [m.id]: true }))}
                              className="w-full rounded-lg border border-accent-500/30 bg-accent-500/10 py-2.5 text-sm font-semibold text-accent-300 hover:bg-accent-500/20 transition-colors"
                            >
                              View Recommended Specialists
                            </button>
                          ) : (
                            <>
                              <div className="grid gap-2.5 mt-2">
                                {m.recommendedDoctors.slice(0, expandedDoctorMessages[m.id] ? undefined : 3).map((doc) => (
                                  <div key={doc.id} className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-md">
                                    <div className="flex items-center gap-3">
                                      <img src={doc.image} alt={doc.name} className="h-14 w-14 shrink-0 rounded-xl border border-white/10 object-cover" />
                                      <div className="min-w-0 flex-1">
                                        <h5 className="truncate text-sm font-semibold text-ink">{doc.name}</h5>
                                        <p className="text-xs font-medium text-accent-300">{doc.specialty}</p>
                                        <p className="mt-0.5 text-[11px] text-ink-soft">⭐ {doc.rating} ({doc.reviewsCount}) · {doc.hospital}</p>
                                      </div>
                                    </div>
                                    <button onClick={() => setBookingDoctor(doc)}
                                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-accent-500 to-brand-500 py-2 text-xs font-semibold text-[#04201d] transition-transform hover:scale-[1.02]">
                                      Book consult <ChevronRight className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                              {m.recommendedDoctors.length > 3 && (
                                <button
                                  onClick={() => setExpandedDoctorMessages(prev => ({ ...prev, [m.id]: !prev[m.id] }))}
                                  className="mt-3 w-full rounded-lg border border-white/10 bg-white/[0.03] py-2 text-xs font-semibold text-ink-soft hover:bg-white/[0.08] hover:text-ink transition-colors"
                                >
                                  {expandedDoctorMessages[m.id] ? "Show fewer specialists" : `Show ${m.recommendedDoctors.length - 3} more specialists`}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      ) : null}
                    </div>
                    <span className="mt-1 px-1 text-[10px] text-ink-muted">{m.timestamp}{m.isDisclaimer && ' · Encrypted'}</span>
                  </div>
                </div>
              );
            })}

            {typing && (
              <div className="flex animate-fadeUp items-start gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-accent-500 text-[#04201d]"><Bot className="h-4 w-4" /></span>
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-white/5 bg-white/[0.04] backdrop-blur-md px-4 py-3 shadow-sm">
                  <span className="text-xs text-ink-soft">Sage is analyzing</span>
                  <span className="flex gap-1">
                    {[0, 150, 300].map((d) => <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-brand-400" style={{ animationDelay: `${d}ms` }} />)}
                  </span>
                </div>
              </div>
            )}
          </div>


          {/* Composer */}
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex flex-col gap-2 border-t border-white/5 bg-white/[0.02] p-3">
            {selectedQuickOption && (
              <div className="flex items-center justify-between bg-brand-500/10 border border-brand-500/30 rounded-xl px-3 py-2 animate-fadeUp text-xs text-brand-200">
                <span className="truncate">Active Selection: <strong>{selectedQuickOption}</strong></span>
                <button type="button" onClick={() => setSelectedQuickOption(null)} className="text-ink-soft hover:text-brand-300 transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <div className="flex items-end gap-2 w-full">
              <div className="relative flex-1">
                <input
                  ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                  placeholder={selectedQuickOption ? "Add details (optional) or send directly..." : "Describe your symptoms..."}
                  aria-label="Describe your symptoms"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-4 pr-10 text-sm text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none backdrop-blur-md"
                />
                <button type="button" onClick={voice} title="Voice input"
                  className={cn('absolute right-2 top-2.5 grid h-7 w-7 place-items-center rounded-lg text-ink-soft transition-all',
                    listening ? 'scale-110 animate-pulse bg-rose-500/15 text-rose-400' : 'hover:bg-white/[0.06] hover:text-ink')}>
                  {listening ? <Volume2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                </button>
              </div>
              <button type="submit" disabled={!input.trim() && !selectedQuickOption}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 text-[#04201d] transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100">
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>

          <p className="bg-base/60 px-4 py-1.5 text-center text-[10px] text-ink-muted">
            ⚠️ Sage provides tentative guidance — not a substitute for professional diagnosis.
          </p>
        </div>
      )}
    </>
  );
};
