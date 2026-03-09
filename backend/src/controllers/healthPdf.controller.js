// backend/controllers/healthPdf.controller.js

const axios = require("axios");
const cloudinary = require("cloudinary").v2;
const HealthReport = require("../models/healthReport.model");
const { extractTextFromBuffer } = require("../services/pdfExtractor.service");
const { analyzeHealthText } = require("../services/gemini.service");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ─────────────────────────────────────────
   GET /health/signature
   Backend generates a signed Cloudinary upload URL
───────────────────────────────────────── */
const generatePdfUploadSignature = async (req, res) => {
  try {
    const userId = req.result._id;
    const timestamp = Math.round(Date.now() / 1000);
    const publicId = `health-reports/${userId}/${timestamp}`;

    // Generate signature for frontend
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, public_id: publicId },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature,
      timestamp,
      public_id: publicId,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload`,
    });
  } catch (error) {
    console.error("Error generating PDF upload signature:", error);
    res.status(500).json({ error: "Failed to generate upload credentials" });
  }
};

/* ─────────────────────────────────────────
   POST /health/analyze
   Backend verifies Cloudinary PDF + extracts text + runs AI
───────────────────────────────────────── */
const analyzePdf = async (req, res) => {
  try {
    const { cloudinaryPublicId, secureUrl, reportName } = req.body;
    const userId = req.result._id;

    if (!cloudinaryPublicId || !secureUrl) {
      return res.status(400).json({ error: "cloudinaryPublicId and secureUrl are required" });
    }

    // 1️⃣ Verify PDF exists on Cloudinary
    const cloudinaryResource = await cloudinary.api.resource(cloudinaryPublicId, {
      resource_type: "raw",
    });

    if (!cloudinaryResource) {
      return res.status(400).json({ error: "PDF not found on Cloudinary" });
    }

    // 2️⃣ Prevent duplicate analysis
    const existing = await HealthReport.findOne({ cloudinaryPublicId });
    if (existing) {
      return res.status(409).json({
        error: "This file has already been analyzed",
        reportId: existing._id,
      });
    }

    // 3️⃣ Save initial metadata (status = analyzing)
    const report = await HealthReport.create({
      userId,
      reportName: reportName || cloudinaryResource.original_filename || "Health Report",
      cloudinaryPublicId,
      secureUrl,
      fileSize: cloudinaryResource.bytes,
      status: "analyzing",
    });

    // 4️⃣ Download PDF bytes from Cloudinary
    let pdfBuffer;
    try {
      const pdfRes = await axios.get(secureUrl, {
        responseType: "arraybuffer",
        timeout: 30000,
      });
      pdfBuffer = Buffer.from(pdfRes.data);
    } catch {
      await HealthReport.findByIdAndUpdate(report._id, { status: "failed" });
      return res.status(500).json({ error: "Failed to download PDF from storage" });
    }

    // 5️⃣ Extract text from PDF
    let extractedText;
    try {
      extractedText = await extractTextFromBuffer(pdfBuffer);
    } catch (err) {
      await HealthReport.findByIdAndUpdate(report._id, { status: "failed" });
      return res.status(422).json({ error: err.message });
    }

    // 6️⃣ Run AI analysis
    let aiAnalysis;
    try {
      aiAnalysis = await analyzeHealthText(extractedText, report.reportName);
    } catch (aiErr) {
      await HealthReport.findByIdAndUpdate(report._id, { status: "failed" });
      return res.status(500).json({ error: `AI analysis failed: ${aiErr.message}` });
    }

    // 7️⃣ Update report with AI result
    const updatedReport = await HealthReport.findByIdAndUpdate(
      report._id,
      {
        aiAnalysis,
        severityLevel: aiAnalysis.severityLevel,
        status: "done",
      },
      { new: true }
    );

    res.status(201).json({
      message: "PDF analyzed successfully",
      reportId: updatedReport._id,
      reportName: updatedReport.reportName,
      uploadedAt: updatedReport.createdAt,
      analysis: aiAnalysis,
    });

  } catch (error) {
    console.error("analyzePdf error:", error);
    res.status(500).json({ error: "Failed to analyze health report" });
  }
};

/* ─────────────────────────────────────────
   GET /health/reports
   List all reports (exclude heavy AI analysis)
───────────────────────────────────────── */
const getUserReports = async (req, res) => {
  try {
    const reports = await HealthReport.find({ userId: req.result._id })
      .sort({ createdAt: -1 })
      .select("-aiAnalysis"); // exclude heavy AI field
    res.json({ reports });
  } catch (error) {
    console.error("getUserReports error:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
};

/* ─────────────────────────────────────────
   GET /health/reports/:id
   Single report with full AI analysis
───────────────────────────────────────── */
const getReportById = async (req, res) => {
  try {
    const report = await HealthReport.findOne({
      _id: req.params.reportId,
      userId: req.result._id,
    });
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }
    res.json({ report });
  } catch (error) {
    console.error("getReportById error:", error);
    res.status(500).json({ error: "Failed to fetch report" });
  }
};

/* ─────────────────────────────────────────
   DELETE /health/reports/:id
   Delete PDF from DB + Cloudinary
───────────────────────────────────────── */
const deleteReport = async (req, res) => {
  try {
    const report = await HealthReport.findOneAndDelete({
      _id: req.params.reportId,
      userId: req.result._id,
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    // Delete PDF from Cloudinary
    await cloudinary.uploader.destroy(report.cloudinaryPublicId, {
      resource_type: "raw",
      invalidate: true,
    });

    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("deleteReport error:", error);
    res.status(500).json({ error: "Failed to delete report" });
  }
};

module.exports = {
  generatePdfUploadSignature,
  analyzePdf,
  getUserReports,
  getReportById,
  deleteReport,
};