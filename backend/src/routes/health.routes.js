// backend/routes/health.routes.js

const express = require("express");
const router = express.Router();
const userAuth = require("../middleware/userMiddleware"); // your existing middleware
const {
  generatePdfUploadSignature,
  analyzePdf,
  getUserReports,
  getReportById,
  deleteReport,
} = require("../controllers/healthPdf.controller");

// All health routes require authentication
router.use(userAuth);

router.get("/signature",          generatePdfUploadSignature);  // Step 1
router.post("/analyze",           analyzePdf);                  // Step 2
router.get("/reports",            getUserReports);
router.get("/reports/:reportId",  getReportById);
router.delete("/reports/:reportId", deleteReport);

module.exports = router;