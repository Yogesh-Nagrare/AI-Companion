const axios = require("axios");

const FASTAPI = process.env.FASTAPI_URL;
const API_KEY = process.env.ML_API_KEY || "mern-ml-secret-key";

// Shared headers for every FastAPI call
const mlHeaders = {
  "Content-Type": "application/json",
  "x-api-key": API_KEY,
};

// ── Send health data → full ML pipeline ──────────────────────
const analyzeHealthData = async (healthData) => {
  const res = await axios.post(
    `${FASTAPI}/api/v1/health/health-data`,
    healthData,
    { headers: mlHeaders, timeout: 60000 }
  );
  return res.data;
};

// ── Get all health records ────────────────────────────────────
const getHealthRecords = async () => {
  const res = await axios.get(`${FASTAPI}/api/v1/health/health-data`, {
    headers: mlHeaders,
  });
  return res.data;
};

// ── Get latest health record ──────────────────────────────────
const getLatestRecord = async () => {
  const res = await axios.get(`${FASTAPI}/api/v1/health/latest`, {
    headers: mlHeaders,
  });
  return res.data;
};

// ── Get single record by ID ───────────────────────────────────
const getRecordById = async (recordId) => {
  const res = await axios.get(
    `${FASTAPI}/api/v1/health/health-data/${recordId}`,
    { headers: mlHeaders }
  );
  return res.data;
};

module.exports = {
  analyzeHealthData,
  getHealthRecords,
  getLatestRecord,
  getRecordById,
};