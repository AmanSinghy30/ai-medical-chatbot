/**
 * Disease to Specialty Mapping
 * Maps diseases/conditions to recommended medical specialties
 */

export const diseaseToSpecialtyMap = {
  'Influenza': ['General Physician', 'Internal Medicine'],
  'COVID-19': ['Pulmonologist', 'General Physician', 'Infectious Disease'],
  'Pneumonia': ['Pulmonologist', 'Critical Care', 'Internal Medicine'],
  'Migraine': ['Neurologist', 'General Physician'],
  'Gastroesophageal Reflux Disease (GERD)': ['Gastroenterologist', 'General Physician'],
  'Atopic Dermatitis (Eczema)': ['Dermatologist', 'Allergist'],
  'Hypertension (High Blood Pressure)': ['Cardiologist', 'Internal Medicine'],
  'Asthma': ['Pulmonologist', 'Allergist'],
  'Urinary Tract Infection': ['General Physician', 'Urologist'],
  'Generalized Anxiety Disorder': ['Psychiatrist', 'Psychologist'],
  'Type 2 Diabetes Mellitus': ['Endocrinologist', 'Internal Medicine'],
  'Iron Deficiency Anemia': ['General Physician', 'Hematologist'],
  'Bronchitis': ['Pulmonologist', 'General Physician'],
  'Sinusitis': ['ENT', 'General Physician'],
  'Tonsillitis': ['ENT', 'General Physician'],
  'Appendicitis': ['General Surgeon', 'Emergency Medicine'],
  'Gallstones': ['Gastroenterologist', 'General Surgeon'],
  'Kidney Stones': ['Urologist', 'Nephrologist'],
  'Depression': ['Psychiatrist', 'Psychologist'],
  'Osteoarthritis': ['Orthopedic', 'Rheumatologist'],
};

export const symptomToSpecialtyMap = {
  'chest pain': ['Cardiologist', 'Emergency Medicine'],
  'shortness of breath': ['Pulmonologist', 'Cardiologist', 'Emergency Medicine'],
  'severe headache': ['Neurologist', 'Emergency Medicine'],
  'abdominal pain': ['Gastroenterologist', 'General Surgeon'],
  'rash': ['Dermatologist', 'Allergist'],
  'joint pain': ['Rheumatologist', 'Orthopedic'],
  'back pain': ['Orthopedic', 'Neurologist', 'Physical Medicine'],
  'blood in urine': ['Urologist', 'Nephrologist'],
  'vision changes': ['Ophthalmologist', 'Neurologist'],
  'hearing loss': ['ENT', 'Neurologist'],
};

export const getSpecialtiesForDisease = (disease) => {
  return diseaseToSpecialtyMap[disease] || ['General Physician', 'Internal Medicine'];
};

export const getSpecialtiesForSymptoms = (symptoms) => {
  const matched = new Set();
  const symText = Array.isArray(symptoms) ? symptoms.join(' ').toLowerCase() : symptoms.toLowerCase();
  
  for (const [symptom, specialties] of Object.entries(symptomToSpecialtyMap)) {
    if (symText.includes(symptom)) {
      specialties.forEach((s) => matched.add(s));
    }
  }
  
  return matched.size > 0 ? [...matched] : ['General Physician', 'Internal Medicine'];
};

export const getAllSpecialtyMappings = () => ({
  diseaseToSpecialty: diseaseToSpecialtyMap,
  symptomToSpecialty: symptomToSpecialtyMap,
});
