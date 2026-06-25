import dotenv from 'dotenv';
import { retrieveKnowledge } from '../services/ragService.js';
import { getSpecialtiesForSymptoms, getSpecialtiesForDisease } from '../services/diseaseMapper.js';
import User from '../models/User.js';
import Chat from '../models/Chat.js';

dotenv.config();

export const generateAIResponse = async (req, res) => {
  try {
    const { message, apiKey, apiType, userId, sessionId, patient, chatHistory, questionId, city, chatbotMode } = req.body;
    if (!apiType || (apiType !== 'n8n' && !apiKey)) {
      return res.status(400).json({ message: 'API key and type are required' });
    }

    let dbPatient = patient || {};
    if (userId && /^[0-9a-fA-F]{24}$/.test(userId)) {
      try {
        const user = await User.findById(userId);
        if (user) {
          // 1. Pregnancy checking with 9-month expiration check
          let isPregnant = user.isPregnant || false;
          let declaredAt = user.pregnancyDeclaredAt;

          const lowerMsg = String(message ?? '').toLowerCase();
          const positivePreg = /\b(i am pregnant|pregnancy active|confirmed pregnancy|got pregnant|during pregnancy|since i am pregnant)\b/i.test(lowerMsg) || (lowerMsg.includes('pregnant') && !/\b(not|no|never|isn't|is not|don't|dont)\b/i.test(lowerMsg.substring(Math.max(0, lowerMsg.indexOf('pregnant') - 15), lowerMsg.indexOf('pregnant'))));
          const negativePreg = /\b(not pregnant|no longer pregnant|miscarriage|pregnancy ended|delivered|gave birth)\b/i.test(lowerMsg);

          if (positivePreg) {
            isPregnant = true;
            declaredAt = new Date();
            user.isPregnant = true;
            user.pregnancyDeclaredAt = declaredAt;
            await user.save();
          } else if (negativePreg) {
            isPregnant = false;
            user.isPregnant = false;
            await user.save();
          }

          // Auto-retire pregnancy if > 270 days (9 months)
          if (isPregnant && declaredAt) {
            const diffDays = (Date.now() - new Date(declaredAt).getTime()) / (1000 * 60 * 60 * 24);
            if (diffDays > 270) {
              isPregnant = false;
              user.isPregnant = false;
              await user.save();
            }
          }

          // 2. Dynamic Chronic Conditions Extraction
          const commonChronicConditions = [
            { name: 'Diabetes', keywords: ['diabetes', 'diabetic', 'blood sugar', 'insulin'] },
            { name: 'Hypertension', keywords: ['hypertension', 'high bp', 'blood pressure', 'high blood pressure'] },
            { name: 'Low BP', keywords: ['low bp', 'low blood pressure'] },
            { name: 'High Cholesterol', keywords: ['cholesterol', 'high cholesterol', 'lipids'] },
            { name: 'Asthma', keywords: ['asthma', 'asthmatic', 'inhaler'] },
            { name: 'Thyroid', keywords: ['thyroid', 'hypothyroidism', 'hyperthyroidism'] },
            { name: 'GERD', keywords: ['gerd', 'acid reflux', 'heartburn'] }
          ];

          let updatedHistory = false;
          for (const condition of commonChronicConditions) {
            const hasMatch = condition.keywords.some(k => {
              const idx = lowerMsg.indexOf(k);
              if (idx !== -1) {
                const pre = lowerMsg.substring(Math.max(0, idx - 15), idx);
                const isNegated = /\b(no|not|dont|don't|free of|never|denies|deny)\b/i.test(pre);
                return !isNegated;
              }
              return false;
            });

            if (hasMatch) {
              const normalizedConditions = (user.chronicConditions || []).map(c => c.toLowerCase());
              if (!normalizedConditions.includes(condition.name.toLowerCase())) {
                user.chronicConditions = user.chronicConditions || [];
                user.chronicConditions.push(condition.name);
                updatedHistory = true;
              }
            }
          }

          if (updatedHistory) {
            await user.save();
          }

          dbPatient = {
            name: user.name,
            age: user.age,
            gender: user.gender,
            allergies: user.allergies || [],
            chronicConditions: user.chronicConditions || [],
            isPregnant: isPregnant,
            pregnancyDeclaredAt: declaredAt
          };
        }
      } catch (err) {
        console.error('Failed to update patient profile from message:', err);
      }
    }

    let reply = '';
    let isRawResponse = false;
    let rawData = null;

    let pastDiagnoses = '';
    if (userId) {
      try {
        const pastChats = await Chat.find({
          $or: [{ user: userId }, { userId: userId }],
          isIncognito: { $ne: true }
        }).sort({ updatedAt: -1 }).limit(5);

        const diagnoses = [];
        for (const c of pastChats) {
          if (sessionId && c._id.toString() === sessionId) continue;
          const lastMsg = c.messages[c.messages.length - 1];
          if (lastMsg && lastMsg.assessment && lastMsg.assessment.possibleConditions?.length > 0) {
            const condition = lastMsg.assessment.possibleConditions[0];
            const date = new Date(c.updatedAt).toLocaleDateString();
            diagnoses.push(`[${date}] ${condition.name} (${condition.severity})`);
          }
        }
        if (diagnoses.length > 0) {
          pastDiagnoses = diagnoses.join(' | ');
        }
      } catch (err) {
        console.error('Failed to fetch past diagnoses:', err);
      }
    }

    let finalMessage = message;
    if (chatbotMode === 'bot') {
      finalMessage = `[INSTRUCTION: The user is in 'Bot Mode'. You MUST output valid JSON matching your schema to prevent system crashes. Put your full response in the 'summary' field, set 'responseType' to 'final'. 
IMPORTANT CONVERSATIONAL GUIDELINES: 
- STRICT RULE ON DOCTORS: DO NOT output any doctors in the 'doctorRecommendations' array UNLESS the user explicitly asks for a doctor, specialist, or to book an appointment. If they only state a symptom, leave 'doctorRecommendations' EMPTY.
- MEDICAL DOMAIN ONLY: If the user asks a non-medical question (e.g., general trivia, "what is an aeroplane", coding, math, etc.), DO NOT answer it. Instead, politely explain that you are a clinical AI assistant and can only help with health-related concerns, symptom assessments, and medical appointments.
- If the user's intent is unclear or it is the first message (e.g., "I have fever"): Do NOT start asking diagnostic follow-up questions (like "how long?" or "any other symptoms?"). Instead: Acknowledge the symptom, explain you can help with symptom assessment, finding doctors, or booking, and simply ask what they would like to do.
- IF THE USER ASKS FOR A DOCTOR OR SPECIALIST (e.g., "suggest some doctors", "find a doctor"): DO NOT ask any follow-up diagnostic questions (like "how long have you had it"). IMMEDIATELY suggest a relevant doctor (like a General Physician) and populate the 'doctorRecommendations' JSON array so the UI can render their interactive cards.
- IF THE USER ASKS TO BOOK AN APPOINTMENT: Do NOT pretend to book it conversationally. Instruct the user to click the "Book Appointment" button on the doctor's card. Keep it natural!]\n\n` + message;
    } else {
      finalMessage = `[INSTRUCTION: MEDICAL DOMAIN ONLY. If the user asks a non-medical question, DO NOT answer it. Instead, politely explain that you are a clinical AI assistant and can only help with health-related concerns.]\n\n` + message;
    }

    if (apiType === 'n8n') {
      const webhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/medical-chat';
      const r = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: finalMessage, userId, sessionId, patient: dbPatient, chatHistory, pastDiagnoses, questionId, city, chatbotMode }),
      });
      if (!r.ok) throw new Error('n8n webhook error');
      let rawText = await r.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        data = rawText;
      }

      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) { }
      }

      if (Array.isArray(data) && data.length > 0) {
        data = data[0];
      }

      // If n8n returns a structured finalResponse (e.g. from our advanced workflow)
      if (data.success && data.sessionId) {
        isRawResponse = true;
        rawData = data;
      } else {
        reply = data.reply || data.output || data.response || data.message || data.text || (typeof data === 'string' ? data : JSON.stringify(data));
      }
    } else if (apiType === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
      const sys = chatbotMode === 'bot'
        ? 'You are a healthcare assistant in conversational mode. MEDICAL DOMAIN ONLY: Do not answer non-medical queries. If they ask for doctors, output them in your JSON array so UI cards appear. If they ask to book, DO NOT pretend to book it yourself; tell them to click the "Book Appointment" button on the doctor\'s card. Keep it natural.'
        : 'You are Sage, an expert clinical AI assistant. MEDICAL DOMAIN ONLY: Do not answer non-medical queries. Give concise, compassionate, structured medical recommendations. Always note this is not a definitive diagnosis and to see a doctor if severe.';
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: `${sys}\n\nPatient text: "${message}"` }] }] }),
      });
      if (!r.ok) throw new Error('Gemini API error');
      const data = await r.json();
      reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No content.';
    } else if (apiType === 'openai') {
      const sys = chatbotMode === 'bot'
        ? 'You are a healthcare assistant in conversational mode. MEDICAL DOMAIN ONLY: Do not answer non-medical queries. If they ask for doctors, output them in your JSON array so UI cards appear. If they ask to book, DO NOT pretend to book it yourself; tell them to click the "Book Appointment" button on the doctor\'s card. Keep it natural.'
        : 'You are Sage, an expert medical recommendation chatbot. MEDICAL DOMAIN ONLY: Do not answer non-medical queries. Provide symptom breakdown, self-care, and when to see a specialist.';

      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: sys },
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

    if (isRawResponse) {
      if (chatbotMode === 'bot') {
        const lowerMsg = String(message || '').toLowerCase();
        // Check for explicit intent in the current message or affirmative answer to a previous prompt
        const explicitIntent = /\b(doctor|doctors|specialist|appointment|book|consult|physician|surgeon|pediatrician|dermatologist|psychiatrist|therapist|recommend|suggest)\b/i.test(lowerMsg);
        
        let contextIntent = false;
        if (chatHistory && chatHistory.length > 0) {
          const lastMsg = chatHistory[chatHistory.length - 1];
          if (lastMsg.role === 'assistant' && /\b(doctor|doctors|specialist|appointment|book|consult|physician|recommend)\b/i.test(lastMsg.content)) {
            if (/\b(yes|sure|please|yeah|yep|okay|ok|do it)\b/i.test(lowerMsg)) {
              contextIntent = true;
            }
          }
        }

        if (!explicitIntent && !contextIntent) {
          if (rawData.doctorRecommendations) {
            delete rawData.doctorRecommendations;
          }
        }
      }
      return res.json(rawData);
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
