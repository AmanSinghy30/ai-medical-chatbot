import { Doctor, Medicine, HealthTip, ChatSession } from '../types';

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Lin',
    specialty: 'Internal Medicine & Triage',
    experience: '14 Years',
    rating: 4.9,
    reviewsCount: 342,
    hospital: 'Stanford Health Care',
    location: 'Palo Alto, CA',
    consultationFee: 120,
    availableNext: 'Today at 3:30 PM',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
    bio: 'Expert in complex diagnostic challenges, viral infections, and chronic disease management.'
  },
  {
    id: 'doc-2',
    name: 'Dr. Marcus Vance',
    specialty: 'Cardiology',
    experience: '19 Years',
    rating: 4.8,
    reviewsCount: 512,
    hospital: 'Mount Sinai Hospital',
    location: 'New York, NY',
    consultationFee: 200,
    availableNext: 'Tomorrow at 10:00 AM',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
    bio: 'Specializing in preventive cardiology, hypertension, arrhythmia, and chest pain evaluation.'
  },
  {
    id: 'doc-3',
    name: 'Dr. Emily Al-Mansoor',
    specialty: 'Dermatology',
    experience: '11 Years',
    rating: 4.9,
    reviewsCount: 289,
    hospital: 'UCLA Medical Center',
    location: 'Los Angeles, CA',
    consultationFee: 150,
    availableNext: 'Today at 5:00 PM',
    image: 'https://images.unsplash.com/photo-1594824813583-d480cc78ebf0?auto=format&fit=crop&w=300&q=80',
    bio: 'Board-certified dermatologist focusing on acute allergic rashes, eczema, skin infections, and cosmetic derma.'
  },
  {
    id: 'doc-4',
    name: 'Dr. David Thorne',
    specialty: 'Gastroenterology',
    experience: '16 Years',
    rating: 4.7,
    reviewsCount: 198,
    hospital: 'Johns Hopkins Medicine',
    location: 'Baltimore, MD',
    consultationFee: 175,
    availableNext: 'Thu, Oct 29',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80',
    bio: 'Advanced focus on GI motility, acid reflux (GERD), IBS, and unexplained abdominal distress.'
  },
  {
    id: 'doc-5',
    name: 'Dr. Jessica Gupta',
    specialty: 'Pediatrics',
    experience: '12 Years',
    rating: 5.0,
    reviewsCount: 430,
    hospital: 'Boston Children’s Hospital',
    location: 'Boston, MA',
    consultationFee: 130,
    availableNext: 'Today at 4:15 PM',
    image: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=300&q=80',
    bio: 'Passionate about infant nutrition, early childhood fevers, behavioral milestones, and immunization.'
  },
  {
    id: 'doc-6',
    name: 'Dr. Arthur Pendelton',
    specialty: 'Neurology',
    experience: '22 Years',
    rating: 4.9,
    reviewsCount: 610,
    hospital: 'Mayo Clinic',
    location: 'Rochester, MN',
    consultationFee: 250,
    availableNext: 'Fri, Oct 30',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    bio: 'Renowned expert in chronic migraines, neuropathy, vestibular disorders, and sleep apnea.'
  }
];

export const MOCK_MEDICINES: Medicine[] = [
  {
    id: 'med-1',
    name: 'Tylenol Extra Strength',
    genericName: 'Acetaminophen 500mg',
    type: 'Tablet',
    category: 'Analgesic & Antipyretic',
    recommendedDosage: '1-2 tablets every 6 hours as needed. Do not exceed 4,000mg per day.',
    sideEffects: ['Nausea in rare cases', 'Liver strain if overdosed'],
    precautions: 'Avoid alcoholic beverages while taking this medication. Check other cough/cold meds to ensure no unintended double acetaminophen dosage.',
    isOTC: true,
    price: '$9.49'
  },
  {
    id: 'med-2',
    name: 'Advil Liqui-Gels',
    genericName: 'Ibuprofen 200mg',
    type: 'Capsule',
    category: 'Non-Steroidal Anti-inflammatory (NSAID)',
    recommendedDosage: '1 capsule every 4 to 6 hours while symptoms persist.',
    sideEffects: ['Stomach upset', 'Mild heartburn'],
    precautions: 'Take with food or milk to prevent GI irritation. Not recommended for patients with a history of severe stomach ulcers.',
    isOTC: true,
    price: '$11.99'
  },
  {
    id: 'med-3',
    name: 'Zyrtec 24hr',
    genericName: 'Cetirizine Hydrochloride 10mg',
    type: 'Tablet',
    category: 'Antihistamine',
    recommendedDosage: '1 tablet once daily. Do not take more than 1 tablet in 24 hours.',
    sideEffects: ['Drowsiness (in approx. 14% of users)', 'Dry mouth'],
    precautions: 'Use caution when driving or operating machinery until you know how this medication affects you.',
    isOTC: true,
    price: '$18.50'
  },
  {
    id: 'med-4',
    name: 'Prilosec OTC',
    genericName: 'Omeprazole Magnesium 20mg',
    type: 'Tablet',
    category: 'Proton Pump Inhibitor (PPI)',
    recommendedDosage: '1 tablet swallowed whole, with a glass of water, 30 minutes before breakfast for 14 days.',
    sideEffects: ['Headache', 'Mild abdominal gas'],
    precautions: 'Do not crush or chew. If your acid reflux symptoms persist past 14 days, consult a gastroenterologist.',
    isOTC: true,
    price: '$14.25'
  },
  {
    id: 'med-5',
    name: 'Amoxil (Prescription Sample)',
    genericName: 'Amoxicillin 500mg',
    type: 'Capsule',
    category: 'Antibiotic (Penicillin class)',
    recommendedDosage: '1 capsule every 8 hours for 7-10 days exactly as prescribed.',
    sideEffects: ['Diarrhea', 'Mild skin rash'],
    precautions: 'Requires Doctor Prescription. Do not take if you have a known penicillin allergy. Finish the entire course even if you feel better.',
    isOTC: false,
    price: '$24.00'
  },
  {
    id: 'med-6',
    name: 'Robitussin Honey DM',
    genericName: 'Dextromethorphan + Guaifenesin',
    type: 'Syrup',
    category: 'Cough Suppressant & Expectorant',
    recommendedDosage: '20 mL every 4 hours as needed for chest congestion and cough.',
    sideEffects: ['Mild dizziness', 'Digestive settlement'],
    precautions: 'Drink plenty of warm water to help loosen mucus. Do not give to children under 4 years of age.',
    isOTC: true,
    price: '$8.99'
  }
];

export const MOCK_HEALTH_TIPS: HealthTip[] = [
  {
    id: 'tip-1',
    title: 'The 30-30 Rule for Digital Eye Strain & Headaches',
    category: 'Fitness',
    snippet: 'Every 30 minutes, look at something 30 feet away for 30 seconds to reset ciliary muscle fatigue.',
    fullContent: 'Prolonged screen time forces your intraocular muscles into continuous contraction, leading to frontal headaches, dry eyes, and blurred vision. Implementing the 30-30-30 rule drastically decreases eye strain. Additionally, position your monitor 20-24 inches away and tilt it 15 degrees below eye level to minimize tear evaporation.',
    readTime: '2 min read',
    doctorRecommended: 'Dr. Sarah Lin'
  },
  {
    id: 'tip-2',
    title: 'Electrolyte Balance vs. Plain Water During Fevers',
    category: 'Nutrition',
    snippet: 'Why drinking only plain water during a high fever can sometimes dilute your essential sodium levels.',
    fullContent: 'When you sweat profusely from a fever or experience gastrointestinal loss, your body loses critical electrolytes (sodium, potassium, chloride) alongside water. Consuming excessive plain non-mineral water can lead to hyponatremia. Always replenish with oral rehydration salts (ORS), coconut water, or weak broths.',
    readTime: '3 min read',
    doctorRecommended: 'Dr. Jessica Gupta'
  },
  {
    id: 'tip-3',
    title: 'Optimizing Sleep Architecture for Immune Regeneration',
    category: 'Sleep',
    snippet: 'Deep NREM sleep is when your body synthesizes critical cytokines and infection-fighting antibodies.',
    fullContent: 'Research consistently shows that individuals who get less than 6 hours of sleep are 4.2 times more likely to catch viral infections after exposure than those sleeping 8 hours. During deep slow-wave sleep, your brain reduces cortisol and accelerates white blood cell production. Keep your bedroom at 65°F (18°C) for optimal NREM consolidation.',
    readTime: '4 min read',
    doctorRecommended: 'Dr. Arthur Pendelton'
  },
  {
    id: 'tip-4',
    title: 'Recognizing Acid Reflux (GERD) Trigger Combos',
    category: 'Nutrition',
    snippet: 'It’s often not just spicy food, but the timing of dinner combined with late-night caffeine or fats.',
    fullContent: 'The lower esophageal sphincter (LES) takes up to 3 hours to fully seal after a heavy meal. If you recline or go to bed within this window, gastric acid easily creeps up the esophagus. Avoid combining high-fat proteins with carbonation within 4 hours of bedtime. Elevating the head of your bed by 6 inches can also prevent nocturnal reflux.',
    readTime: '3 min read',
    doctorRecommended: 'Dr. David Thorne'
  }
];

export const MOCK_SESSIONS: ChatSession[] = [
  {
    id: 'session-101',
    title: 'Sudden Evening Fever & Headache',
    date: 'Yesterday, 8:40 PM',
    messagesCount: 8,
    summary: 'Assessed mild viral infection symptoms. Recommended Tylenol 500mg, cold compress, and hydration. Logged patient pain at 5/10.'
  },
  {
    id: 'session-102',
    title: 'Persistent Seasonal Allergic Rhinitis',
    date: 'Oct 18, 2026',
    messagesCount: 12,
    summary: 'Reviewed skin itching and sneezing triggers. Advised Zyrtec 10mg daily and connected with Dr. Emily Al-Mansoor.'
  },
  {
    id: 'session-103',
    title: 'Post-Workout Knee Strain Inquiry',
    date: 'Oct 04, 2026',
    messagesCount: 6,
    summary: 'Recommended R.I.C.E protocol (Rest, Ice, Compression, Elevation) and topical anti-inflammatory gel.'
  }
];
