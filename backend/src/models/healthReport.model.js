const mongoose = require("mongoose");

const healthMLReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    inputData: {
      hba1c: Number,
      glucose: Number,
      bmi: Number,
      age: Number,
      symptoms: [String],
      manual_text: String,
    },
    // From FastAPI ML pipeline response
    riskLevel: {
      type: String,
      enum: ["Low", "Moderate", "High", "Critical", null],
      default: null,
    },
    alert: {
      type: Boolean,
      default: false,
    },
    report: {
      type: String, // patient-friendly text from Alert Agent
    },
    finalAssessment: {
      type: mongoose.Schema.Types.Mixed, // { score, ml_probability, abnormal_count, symptom_score }
    },
    workflowStatus: {
      type: String,
      default: "completed",
    },
    fastapiRecordId: {
      type: Number, // FastAPI's own DB record ID (for cross-reference)
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HealthMLReport", healthMLReportSchema);