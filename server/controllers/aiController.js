import dotenv from 'dotenv';
import { retrieveKnowledge } from '../services/ragService.js';
import { getSpecialtiesForSymptoms, getSpecialtiesForDisease } from '../services/diseaseMapper.js';

dotenv.config();

export const generateAIResponse = async (req, res) => {
  try {
    const { message, apiKey, apiType } = req.body;
    if (!apiType || (apiType !== 'n8n' && !apiKey)) {
      return res.status(400).json({ message: 'API key and type are required' });
    }

    let reply = '';

    if (apiType === 'n8n') {
      const r = await fetch('http://localhost:5678/webhook/medical-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!r.ok) throw new Error('n8n webhook error');
      const data = await r.json();
      reply = data.reply || data.output || data.response || data.message || data.text || (typeof data === 'string' ? data : JSON.stringify(data));
    } else if (apiType === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
      const sys = 'You are Sage, an expert clinical AI assistant. Give concise, compassionate, structured medical recommendations. Always note this is not a definitive diagnosis and to see a doctor if severe.';
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: `${sys}\n\nPatient symptom: "${message}"\n\nGive possible reasons, precautions, and when to seek urgent care.` }] }] }),
      });
      if (!r.ok) throw new Error('Gemini API error');
      const data = await r.json();
      reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No content.';
    } else if (apiType === 'openai') {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are Sage, an expert medical recommendation chatbot. Provide symptom breakdown, self-care, and when to see a specialist.' },
            { role: 'user', content: message },
          ],
          temperature: 0.5,
          max_tokens: 500,
        }),
      });
      if (!r.ok) throw new Error('OpenAI API error');
      const data = await r.json();
      reply = data.choices?.[0]?.message?.content || 'No content.';
    } else {
      return res.status(400).json({ message: 'Unsupported API type' });
    }

    res.json({ reply });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms, pain, duration, pregnant } = req.body;
    const s = symptoms.join(' ').toLowerCase();

    // 1. RAG Knowledge Retrieval
    const ragResults = retrieveKnowledge(symptoms, 5);

    // 2. Determine Possible Conditions with Confidence
    let possibleConditions = [];
    let severity = 'Low';
    let summary = 'Mild self-limiting discomfort. Rest and general home self-care recommended.';
    let plan = ['Drink 8–10 glasses of water daily', 'Light stretching and rest', 'Paracetamol if mild headache'];
    let urgency = 'Monitor at home. Schedule GP if symptoms persist > 48 hours.';
    let medCategories = ['Analgesic & Antipyretic'];

    if (ragResults.length > 0) {
      possibleConditions = ragResults.map((r) => ({
        name: r.disease,
        confidence: r.confidence,
        severity: r.severity,
        description: r.description,
        urgency: r.urgency,
        precautions: r.precautions,
      }));
      severity = possibleConditions[0].severity;
      summary = `Based on symptom analysis, the most likely condition is **${possibleConditions[0].name}** (confidence: ${Math.round(possibleConditions[0].confidence * 100)}%).\n\n${possibleConditions[0].description}`;
      plan = possibleConditions[0].treatment?.split('.').filter(Boolean).map((t) => t.trim()) || plan;
      urgency = possibleConditions[0].urgency || urgency;
    }

    // 3. Disease-to-Specialty Mapping
    let doctorSpecialties = [];
    if (possibleConditions.length > 0) {
      const diseaseNames = possibleConditions.map((c) => c.name);
      for (const disease of diseaseNames) {
        const specs = getSpecialtiesForDisease(disease);
        specs.forEach((s) => doctorSpecialties.push(s));
      }
    }
    // Also map from raw symptoms
    const symptomSpecs = getSpecialtiesForSymptoms(symptoms);
    symptomSpecs.forEach((s) => doctorSpecialties.push(s));
    doctorSpecialties = [...new Set(doctorSpecialties)];
    if (doctorSpecialties.length === 0) doctorSpecialties = ['General Physician'];

    // 4. Severity override for critical symptoms
    if (/chest|shortness|sharp lower|stroke|faint|bleed/.test(s) || pain >= 9) {
      severity = 'urgent';
      summary = '⚠️ CRITICAL symptoms flagged. Inputs warrant immediate ER or 911 evaluation.';
      plan = ['Go to nearest ER immediately', 'Do not self-medicate', 'Stay calm, sit upright'];
      urgency = 'Emergency — seek care immediately. Do not delay.';
      doctorSpecialties = ['Emergency Medicine', 'Cardiologist', 'Pulmonologist'];
    } else if (pain >= 6) {
      severity = 'high';
    } else if (pain >= 3) {
      severity = 'moderate';
    }

    if (pregnant && severity !== 'urgent') {
      severity = 'high';
      urgency += ' \n⚠️ Pregnancy detected — consult obstetrician promptly for any medication.';
      doctorSpecialties.push('Obstetrician');
    }

    // 5. Determine medicine categories based on conditions
    if (possibleConditions.length > 0) {
      medCategories = possibleConditions.map((c) => {
        if (c.name.includes('Flu') || c.name.includes('COVID') || c.name.includes('Pneumonia')) return 'Analgesic & Antipyretic';
        if (c.name.includes('Migraine')) return 'Analgesic & Triptan';
        if (c.name.includes('GERD')) return 'Proton Pump Inhibitor';
        if (c.name.includes('Eczema')) return 'Antihistamine & Topical Corticosteroid';
        if (c.name.includes('Hypertension')) return 'Antihypertensive';
        if (c.name.includes('Asthma')) return 'Bronchodilator & Inhaled Corticosteroid';
        if (c.name.includes('UTI')) return 'Antibiotic';
        if (c.name.includes('Anxiety')) return 'Anxiolytic & SSRI';
        if (c.name.includes('Diabetes')) return 'Antidiabetic';
        return 'Analgesic & Antipyretic';
      });
      medCategories = [...new Set(medCategories)];
    }

    res.json({
      severity,
      summary,
      plan,
      urgency,
      doctorSpecialties,
      medCategories,
      pain,
      duration,
      pregnant,
      // New RAG-enhanced fields
      possibleConditions,
      knowledgeSources: ragResults.map((r) => ({
        id: r.id,
        disease: r.disease,
        description: r.description,
        confidence: r.confidence,
        recommendedSpecialty: r.recommendedSpecialty,
      })),
      ragEnhanced: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRAGSources = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: 'Query parameter required' });
    const results = retrieveKnowledge(query, 5);
    res.json({
      query,
      results,
      totalResults: results.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDiseaseSpecialtyMap = async (req, res) => {
  try {
    const { getAllSpecialtyMappings } = await import('../services/diseaseMapper.js');
    res.json(getAllSpecialtyMappings());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
