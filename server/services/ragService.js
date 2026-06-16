import medicalKnowledge from '../utils/medicalKnowledge.js';

/**
 * Simple RAG (Retrieval-Augmented Generation) service
 * For production: swap in Qdrant or Pinecone vector DB
 * This uses TF-IDF-style keyword matching for a student project
 */

const tokenize = (text) => {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
};

const computeTFIDF = (query, document) => {
  const qTokens = tokenize(query);
  const docTokens = tokenize(document);
  const totalTerms = docTokens.length || 1;
  let score = 0;

  for (const qToken of qTokens) {
    const termFreq = docTokens.filter((t) => t === qToken).length;
    const tf = termFreq / totalTerms;
    const idf = Math.log(1 + (medicalKnowledge.length / (medicalKnowledge.filter((d) => 
      tokenize([d.disease, d.description, ...d.symptoms].join(' ')).includes(qToken)
    ).length || 1)));
    score += tf * idf;
  }

  // Symptom overlap bonus
  const docSymptoms = medicalKnowledge.find((d) => 
    document.includes(d.disease.toLowerCase())
  )?.symptoms || [];
  
  const symptomOverlap = qTokens.filter((q) => docSymptoms.some((s) => s.includes(q))).length;
  score += symptomOverlap * 0.5; // Weighted boost for symptom matches

  return score;
};

export const retrieveKnowledge = (symptoms, topK = 5) => {
  const query = Array.isArray(symptoms) ? symptoms.join(' ') : symptoms;
  const scored = medicalKnowledge.map((doc) => {
    const docText = [doc.disease, doc.description, ...doc.symptoms].join(' ');
    const score = computeTFIDF(query, docText);
    return { ...doc, score };
  });

  return scored
    .filter((doc) => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((doc) => ({
      id: doc.id,
      disease: doc.disease,
      description: doc.description,
      symptoms: doc.symptoms,
      treatment: doc.treatment,
      recommendedSpecialty: doc.recommendedSpecialty,
      severity: doc.severity,
      urgency: doc.urgency,
      precautions: doc.precautions,
      confidence: Math.min(0.95, Math.round((doc.score + 0.3) * 100) / 100),
    }));
};

export const getKnowledgeById = (id) => {
  return medicalKnowledge.find((doc) => doc.id === id);
};

export const getAllKnowledge = () => medicalKnowledge;
