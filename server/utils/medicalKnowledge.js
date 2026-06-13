const medicalKnowledge = [
  {
    id: 'flu-001',
    disease: 'Influenza',
    symptoms: ['fever', 'headache', 'muscle aches', 'fatigue', 'cough', 'sore throat', 'chills', 'body aches'],
    description: 'A viral respiratory infection caused by influenza viruses. Typically seasonal with sudden onset.',
    treatment: 'Rest, hydration, antiviral medication (oseltamivir) if within 48 hours, acetaminophen or ibuprofen for fever and pain.',
    recommendedSpecialty: 'General Physician',
    severity: 'moderate',
    urgency: 'Schedule appointment within 24-48 hours',
    precautions: 'Isolate to prevent spread. High-risk patients (elderly, pregnant, immunocompromised) should seek care promptly.'
  },
  {
    id: 'covid-001',
    disease: 'COVID-19',
    symptoms: ['fever', 'dry cough', 'fatigue', 'loss of taste', 'loss of smell', 'shortness of breath', 'sore throat', 'body aches'],
    description: 'Respiratory illness caused by SARS-CoV-2. Can range from mild to severe with potential for long-term complications.',
    treatment: 'Supportive care, rest, hydration. Antivirals (Paxlovid) for high-risk patients. Monitor oxygen levels.',
    recommendedSpecialty: 'Pulmonologist',
    severity: 'moderate',
    urgency: 'Test immediately. Seek care if breathing difficulty or oxygen saturation < 94%',
    precautions: 'Isolate for 5-10 days. Wear mask. Monitor symptoms closely.'
  },
  {
    id: 'pneumonia-001',
    disease: 'Pneumonia',
    symptoms: ['chest pain', 'productive cough', 'fever', 'chills', 'shortness of breath', 'fatigue', 'rapid breathing'],
    description: 'Infection that inflames air sacs in one or both lungs, which may fill with fluid or pus.',
    treatment: 'Antibiotics for bacterial pneumonia, antivirals for viral. Rest, fluids, bronchodilators, possible hospitalization.',
    recommendedSpecialty: 'Pulmonologist',
    severity: 'high',
    urgency: 'Urgent medical evaluation required. Chest X-ray needed for diagnosis.',
    precautions: 'Complete full antibiotic course. Monitor breathing rate and temperature. Elderly patients need close monitoring.'
  },
  {
    id: 'migraine-001',
    disease: 'Migraine',
    symptoms: ['throbbing headache', 'nausea', 'vomiting', 'sensitivity to light', 'sensitivity to sound', 'visual aura', 'one-sided pain'],
    description: 'Neurological condition characterized by severe, recurring headaches often accompanied by other symptoms.',
    treatment: 'Acute: triptans, NSAIDs, antiemetics. Preventive: beta-blockers, topiramate, CGRP inhibitors. Lifestyle modifications.',
    recommendedSpecialty: 'Neurologist',
    severity: 'moderate',
    urgency: 'Schedule appointment if recurrent or first severe episode. Emergency if sudden "thunderclap" headache.',
    precautions: 'Identify triggers (stress, sleep changes, certain foods). Maintain regular sleep schedule.'
  },
  {
    id: 'gerd-001',
    disease: 'Gastroesophageal Reflux Disease (GERD)',
    symptoms: ['heartburn', 'acid reflux', 'chest pain', 'difficulty swallowing', 'chronic cough', 'hoarseness', 'regurgitation'],
    description: 'Chronic digestive disorder where stomach acid frequently flows back into the esophagus.',
    treatment: 'PPIs (omeprazole), H2 blockers, antacids. Lifestyle: smaller meals, avoid trigger foods, elevate head of bed.',
    recommendedSpecialty: 'Gastroenterologist',
    severity: 'low',
    urgency: 'Schedule appointment if symptoms persist > 2 weeks or occur > 2x/week.',
    precautions: 'Avoid alcohol, caffeine, spicy/fatty foods. Do not lie down within 3 hours of eating. Weight management.'
  },
  {
    id: 'eczema-001',
    disease: 'Atopic Dermatitis (Eczema)',
    symptoms: ['itchy skin', 'dry skin', 'red patches', 'scaly skin', 'crusting', 'skin inflammation', 'rash'],
    description: 'Chronic inflammatory skin condition causing itchy, inflamed skin. Often linked to allergies and asthma.',
    treatment: 'Topical corticosteroids, moisturizers (emollients), calcineurin inhibitors. Avoid triggers. Antihistamines for itching.',
    recommendedSpecialty: 'Dermatologist',
    severity: 'low',
    urgency: 'Schedule appointment if widespread, infected, or unresponsive to OTC treatments.',
    precautions: 'Use fragrance-free products. Moisturize daily. Avoid hot showers. Identify and avoid triggers.'
  },
  {
    id: 'hypertension-001',
    disease: 'Hypertension (High Blood Pressure)',
    symptoms: ['headache', 'dizziness', 'blurred vision', 'chest pain', 'shortness of breath', 'nosebleeds', 'often asymptomatic'],
    description: 'Chronic condition where blood pressure in arteries is persistently elevated. Often called a "silent killer."',
    treatment: 'Lifestyle: DASH diet, exercise, sodium reduction. Medications: ACE inhibitors, ARBs, calcium channel blockers, diuretics.',
    recommendedSpecialty: 'Cardiologist',
    severity: 'high',
    urgency: 'Emergency if BP > 180/120 with symptoms. Otherwise schedule within 1-2 weeks.',
    precautions: 'Monitor BP daily. Limit sodium < 2,300mg/day. Maintain healthy weight. Regular follow-up.'
  },
  {
    id: 'asthma-001',
    disease: 'Asthma',
    symptoms: ['wheezing', 'shortness of breath', 'chest tightness', 'cough', 'difficulty breathing', 'nighttime symptoms'],
    description: 'Chronic inflammatory disease of the airways causing reversible airflow obstruction and bronchospasm.',
    treatment: 'Rescue inhalers (albuterol). Controller: inhaled corticosteroids, LABA, leukotriene modifiers. Avoid triggers.',
    recommendedSpecialty: 'Pulmonologist',
    severity: 'moderate',
    urgency: 'Emergency if severe attack, blue lips, inability to speak. Otherwise schedule appointment.',
    precautions: 'Always carry rescue inhaler. Identify triggers. Get flu vaccine annually. Use spacer with inhalers.'
  },
  {
    id: 'uti-001',
    disease: 'Urinary Tract Infection',
    symptoms: ['burning urination', 'frequent urination', 'urgency', 'pelvic pain', 'cloudy urine', 'blood in urine', 'fever'],
    description: 'Bacterial infection in any part of the urinary system: kidneys, bladder, ureters, or urethra.',
    treatment: 'Antibiotics (nitrofurantoin, trimethoprim, ciprofloxacin). Hydration, cranberry supplements. Complete full course.',
    recommendedSpecialty: 'General Physician',
    severity: 'moderate',
    urgency: 'Schedule within 24 hours. Urgent if fever, back pain, or vomiting (possible kidney infection).',
    precautions: 'Drink plenty of water. Urinate after intercourse. Wipe front to back. Avoid irritating feminine products.'
  },
  {
    id: 'anxiety-001',
    disease: 'Generalized Anxiety Disorder',
    symptoms: ['excessive worry', 'restlessness', 'fatigue', 'difficulty concentrating', 'irritability', 'muscle tension', 'sleep disturbance'],
    description: 'Mental health condition characterized by persistent, excessive worry about various aspects of daily life.',
    treatment: 'CBT, mindfulness, SSRIs (sertraline, escitalopram), SNRIs. Lifestyle: exercise, sleep hygiene, limit caffeine.',
    recommendedSpecialty: 'Psychiatrist',
    severity: 'moderate',
    urgency: 'Schedule appointment if interfering with daily functioning. Crisis support if suicidal thoughts.',
    precautions: 'Avoid alcohol and recreational drugs. Practice relaxation techniques. Maintain consistent routine.'
  },
  {
    id: 'diabetes-001',
    disease: 'Type 2 Diabetes Mellitus',
    symptoms: ['increased thirst', 'frequent urination', 'hunger', 'fatigue', 'blurred vision', 'slow healing', 'numbness'],
    description: 'Chronic metabolic disorder characterized by high blood sugar, insulin resistance, and relative insulin deficiency.',
    treatment: 'Metformin, GLP-1 agonists, SGLT2 inhibitors. Diet: low carb, portion control. Exercise, weight management.',
    recommendedSpecialty: 'Endocrinologist',
    severity: 'high',
    urgency: 'Schedule within 1 week if newly diagnosed. Emergency if severe hyperglycemia or DKA symptoms.',
    precautions: 'Monitor blood glucose regularly. Foot care daily. Regular eye exams. HbA1c every 3-6 months.'
  },
  {
    id: 'anemia-001',
    disease: 'Iron Deficiency Anemia',
    symptoms: ['fatigue', 'weakness', 'pale skin', 'shortness of breath', 'dizziness', 'cold hands', 'brittle nails'],
    description: 'Condition caused by lack of iron leading to reduced hemoglobin and impaired oxygen transport.',
    treatment: 'Iron supplements (ferrous sulfate), vitamin C to enhance absorption. Diet: red meat, spinach, lentils, fortified cereals.',
    recommendedSpecialty: 'General Physician',
    severity: 'low',
    urgency: 'Schedule appointment within 1-2 weeks. Urgent if chest pain or severe shortness of breath.',
    precautions: 'Take iron with vitamin C, avoid calcium/coffee within 2 hours. Check for GI bleeding causes.'
  }
];

export default medicalKnowledge;
