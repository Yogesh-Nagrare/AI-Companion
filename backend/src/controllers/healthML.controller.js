const HealthMLReport = require("../models/healthReport.model");
const {
  analyzeHealthData,
  getHealthRecords,
  getLatestRecord,
  getRecordById,
} = require("../services/mlService");

// POST /health/ml/analyze
const analyzeWithML = async (req, res) => {
  try {
    const userId = req.result._id;
    const { hba1c, glucose, bmi, age, symptoms = [], manual_text } = req.body;

    if (!hba1c || !glucose || !bmi || !age) {
      return res.status(400).json({
        error: "Required fields: hba1c, glucose, bmi, age",
      });
    }

    const healthPayload = {
      hba1c: parseFloat(hba1c),
      glucose: parseFloat(glucose),
      bmi: parseFloat(bmi),
      age: parseInt(age),
      symptoms: Array.isArray(symptoms) ? symptoms : [],
      ...(manual_text && { manual_text }),
    };

    // Call FastAPI — no token needed anymore
    const mlResult = await analyzeHealthData(healthPayload);

    // Save to MongoDB
    const saved = await HealthMLReport.create({
      userId,
      inputData: healthPayload,
      riskLevel: mlResult.risk_level,
      alert: mlResult.alert,
      report: mlResult.report,
      finalAssessment: mlResult.final_assessment,
      workflowStatus: mlResult.workflow_status,
      fastapiRecordId: mlResult.record_id,
    });

    res.status(201).json({
      message: "ML analysis complete",
      reportId: saved._id,
      risk_level: mlResult.risk_level,
      alert: mlResult.alert,
      report: mlResult.report,
      final_assessment: mlResult.final_assessment,
      workflow_status: mlResult.workflow_status,
    });
  } catch (error) {
    console.error("analyzeWithML error:", error.response?.data || error.message);
    res.status(500).json({
      error: "ML analysis failed. Is the ML server running on port 8000?",
    });
  }
};

// GET /health/ml/reports
const getMLReports = async (req, res) => {
  try {
    const reports = await HealthMLReport.find({ userId: req.result._id })
      .sort({ createdAt: -1 })
      .select("-inputData");
    res.json({ reports });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch ML reports" });
  }
};

// GET /health/ml/reports/:reportId
const getMLReportById = async (req, res) => {
  try {
    const report = await HealthMLReport.findOne({
      _id: req.params.reportId,
      userId: req.result._id,
    });
    if (!report) return res.status(404).json({ error: "Report not found" });
    res.json({ report });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch report" });
  }
};

// DELETE /health/ml/reports/:reportId
const deleteMLReport = async (req, res) => {
  try {
    const report = await HealthMLReport.findOneAndDelete({
      _id: req.params.reportId,
      userId: req.result._id,
    });
    if (!report) return res.status(404).json({ error: "Report not found" });
    res.json({ message: "Report deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete report" });
  }
};

module.exports = { analyzeWithML, getMLReports, getMLReportById, deleteMLReport };