// backend/models/healthReport.model.js

const mongoose = require("mongoose");

const healthReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reportName: { type: String, default: "Health Report", trim: true },

    // Cloudinary fields
    cloudinaryPublicId: { type: String, required: true, unique: true },
    secureUrl: { type: String, required: true },
    fileSize: { type: Number, default: null }, // bytes

    // Quick-access top-level fields (also stored inside aiAnalysis)
    severityLevel: {
      type: String,
      enum: ["Low", "Moderate", "High", "Critical", null],
      default: null,
    },

    // Full Gemini analysis stored as a flexible object
    aiAnalysis: {
      summary: String,
      keyFindings: [
        {
          marker: String,
          value: String,
          normalRange: String,
          status: { type: String, enum: ["Normal", "Borderline", "High", "Low", "Critical"] },
          interpretation: String,
          _id: false,
        },
      ],
      riskFactors: [String],
      recommendations: [String],
      severityLevel: String,
      warningSigns: [String],
      simpleExplanation: String,
      disclaimer: String,
    },

    status: {
      type: String,
      enum: ["uploaded", "analyzing", "done", "failed"],
      default: "uploaded",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HealthReport", healthReportSchema);