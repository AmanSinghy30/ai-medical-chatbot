import Report from '../models/Report.js';
import { generateReportMarkdown } from '../services/reportGenerator.js';

export const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ patient: req.user.id })
      .populate('appointment', 'date doctor status')
      .populate('chatSession', 'title')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReportById = async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, patient: req.user.id })
      .populate('appointment', 'date doctor status timeSlot')
      .populate('chatSession', 'title messages');
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createReport = async (req, res) => {
  try {
    const { appointmentId, chatSessionId, title, possibleConditions, recommendedSpecialties, knowledgeSources, selfCare, medicines, followUp } = req.body;
    
    const report = await Report.create({
      patient: req.user.id,
      appointment: appointmentId || null,
      chatSession: chatSessionId || null,
      title: title || 'Medical Consultation Report',
      possibleConditions: possibleConditions || [],
      recommendedSpecialties: recommendedSpecialties || [],
      knowledgeSources: knowledgeSources || [],
      selfCare: selfCare || [],
      medicines: medicines || [],
      followUp: followUp || '',
      status: 'draft',
    });
    
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const generateReportPDF = async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, patient: req.user.id })
      .populate('appointment', 'date doctor status')
      .populate('patient', 'name');
    if (!report) return res.status(404).json({ message: 'Report not found' });
    
    const markdown = generateReportMarkdown({
      patientName: report.patient?.name || 'Patient',
      date: new Date(report.generatedAt).toLocaleString(),
      conditions: report.possibleConditions,
      specialties: report.recommendedSpecialties,
      medicines: report.medicines,
      selfCare: report.selfCare,
      followUp: report.followUp,
      ragSources: report.knowledgeSources,
    });
    
    const blob = Buffer.from(markdown);
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="report-${report._id}.md"`);
    res.send(blob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const finalizeReport = async (req, res) => {
  try {
    const { doctorDiagnosis, doctorNotes, prescription } = req.body;
    const report = await Report.findOneAndUpdate(
      { _id: req.params.id, patient: req.user.id },
      { status: 'finalized', doctorDiagnosis, doctorNotes, prescription },
      { new: true }
    );
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReport = async (req, res) => {
  try {
    await Report.findOneAndDelete({ _id: req.params.id, patient: req.user.id });
    res.json({ message: 'Report deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// n8n webhook handler
export const n8nGenerateAndEmail = async (req, res) => {
  try {
    const { reportId } = req.body;
    const report = await Report.findByIdAndUpdate(
      reportId,
      { emailSent: true },
      { new: true }
    ).populate('patient', 'name email');
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
