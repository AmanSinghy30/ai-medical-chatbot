export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor';
  avatar?: string;
  age?: number;
  gender?: string;
  allergies?: string[];
  chronicConditions?: string[];
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  reviewsCount: number;
  hospital: string;
  location: string;
  consultationFee: number;
  availableNext: string;
  image: string;
  bio: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  type: 'Tablet' | 'Syrup' | 'Capsule' | 'Ointment' | 'Injection';
  category: string;
  recommendedDosage: string;
  sideEffects: string[];
  precautions: string;
  isOTC: boolean;
  price: string;
}

export interface HealthTip {
  id: string;
  title: string;
  category: 'Nutrition' | 'Mental Health' | 'Sleep' | 'Fitness' | 'Immunity';
  snippet: string;
  fullContent: string;
  readTime: string;
  doctorRecommended?: string;
}

export type TriageSeverity = 'low' | 'moderate' | 'high' | 'urgent';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  triageLevel?: TriageSeverity;
  suggestedMedicines?: Medicine[];
  recommendedDoctors?: Doctor[];
  followUpQuestions?: Array<string | {
    question: string;
    purpose: string;
    category: string;
  }>;
  isDisclaimer?: boolean;
  questionId?: string;
  assessment?: {
    severity: string;
    summary: string;
    plan: string[];
    urgency: string;
    doctorSpecialties?: string[];
    possibleConditions?: Array<{
      name: string;
      confidence: number;
      severity: string;
      description?: string;
      precautions?: string;
    }>;
    knowledgeSources?: Array<{
      disease: string;
      description: string;
      confidence: number;
    }>;
    medicalDisclaimer?: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  date: string;
  messagesCount: number;
  summary: string;
}
