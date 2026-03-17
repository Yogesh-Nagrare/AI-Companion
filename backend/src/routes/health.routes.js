const express = require("express");
const router = express.Router();
const userAuth = require("../middleware/userMiddleware");
const {
  generatePdfUploadSignature,
  analyzePdf,
  getUserReports,
  getReportById,
  deleteReport,
} = require("../controllers/healthPdf.controller");

// 🆕 Import ML controller
const {
  analyzeWithML,
  getMLReports,
  getMLReportById,
  deleteMLReport,
} = require("../controllers/healthML.controller");

router.use(userAuth);

// ── Existing PDF/Gemini routes (UNCHANGED) ──
router.get("/signature",              generatePdfUploadSignature);
router.post("/analyze",               analyzePdf);
router.get("/reports",                getUserReports);
router.get("/reports/:reportId",      getReportById);
router.delete("/reports/:reportId",   deleteReport);

// ── 🆕 New ML routes ──
router.post("/ml/analyze",            analyzeWithML);
router.get("/ml/reports",             getMLReports);
router.get("/ml/reports/:reportId",   getMLReportById);
router.delete("/ml/reports/:reportId", deleteMLReport);

module.exports = router;