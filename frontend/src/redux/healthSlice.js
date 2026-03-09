// src/redux/healthSlice.js

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../api/axiosClient";

/* ============================================================
   STEP 1 — Get Cloudinary signature from backend
============================================================ */
export const getUploadSignature = createAsyncThunk(
  "health/getSignature",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/health/signature");
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/* ============================================================
   STEP 2 — Upload PDF directly to Cloudinary (NOT through backend)
   XHR used for progress tracking
============================================================ */
export const uploadToCloudinary = createAsyncThunk(
  "health/uploadCloudinary",
  async ({ file, signatureData, onProgress }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("public_id", signatureData.public_id);
      formData.append("api_key", signatureData.api_key);
      formData.append("timestamp", signatureData.timestamp);
      formData.append("signature", signatureData.signature);

      return await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", signatureData.upload_url);

        // Safe progress callback
        const progressFn = onProgress || (() => {});
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) progressFn(Math.round((e.loaded / e.total) * 100));
        };

        xhr.onload = () => {
          try {
            const res = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(res);
            } else {
              reject(new Error(res.error?.message || "Cloudinary upload failed"));
            }
          } catch {
            reject(new Error("Cloudinary returned invalid JSON"));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.ontimeout = () => reject(new Error("Upload timed out"));
        xhr.timeout = 120000; // 2 min timeout for large PDFs
        xhr.send(formData);
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/* ============================================================
   STEP 3 — Backend extracts PDF text + runs Gemini analysis
============================================================ */
export const analyzePdf = createAsyncThunk(
  "health/analyze",
  async ({ cloudinaryPublicId, secureUrl, reportName }, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post("/health/analyze", {
        cloudinaryPublicId,
        secureUrl,
        reportName,
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/* ============================================================
   Fetch all user's reports (list — no heavy aiAnalysis field)
============================================================ */
export const fetchReports = createAsyncThunk(
  "health/fetchReports",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/health/reports");
      return data.reports;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/* ============================================================
   Fetch single report with full AI analysis
============================================================ */
export const fetchReportById = createAsyncThunk(
  "health/fetchReportById",
  async (reportId, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get(`/health/reports/${reportId}`);
      return data.report;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/* ============================================================
   Delete a report
============================================================ */
export const deleteReport = createAsyncThunk(
  "health/deleteReport",
  async (reportId, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/health/reports/${reportId}`);
      return reportId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/* ============================================================
   SLICE
============================================================ */
const healthSlice = createSlice({
  name: "health",

  initialState: {
    uploadProgress: 0,
    uploadStep: null,   // null | 'signing' | 'uploading' | 'extracting' | 'analyzing' | 'done' | 'error'
    uploadError: null,
    currentAnalysis: null,

    reports: [],
    reportsLoading: false,
    reportsError: null,

    activeReport: null,
    activeReportLoading: false,
    activeReportError: null,
  },

  reducers: {
    resetUpload: (state) => {
      state.uploadProgress = 0;
      state.uploadStep = null;
      state.uploadError = null;
      state.currentAnalysis = null;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    setUploadStep: (state, action) => {
      state.uploadStep = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ── GET SIGNATURE ── */
      .addCase(getUploadSignature.pending, (state) => {
        state.uploadStep = "signing";
        state.uploadProgress = 0;
        state.uploadError = null;
      })
      .addCase(getUploadSignature.rejected, (state, action) => {
        state.uploadStep = "error";
        state.uploadError = action.payload || "Failed to get upload credentials";
      })

      /* ── CLOUDINARY UPLOAD ── */
      .addCase(uploadToCloudinary.pending, (state) => {
        state.uploadStep = "uploading";
        state.uploadProgress = 0;
      })
      .addCase(uploadToCloudinary.fulfilled, (state) => {
        state.uploadStep = "extracting";
        state.uploadProgress = 100;
      })
      .addCase(uploadToCloudinary.rejected, (state, action) => {
        state.uploadStep = "error";
        state.uploadError = action.payload || "Upload to Cloudinary failed";
      })

      /* ── GEMINI ANALYSIS ── */
      .addCase(analyzePdf.pending, (state) => {
        state.uploadStep = "analyzing";
      })
      .addCase(analyzePdf.fulfilled, (state, action) => {
        state.uploadStep = "done";
        state.currentAnalysis = action.payload;
        // Prepend to reports list if already loaded
        if (state.reports.length > 0) {
          state.reports.unshift({
            _id: action.payload.reportId,
            reportName: action.payload.reportName,
            severityLevel: action.payload.analysis?.severityLevel,
            createdAt: action.payload.uploadedAt, // use server timestamp
          });
        }
      })
      .addCase(analyzePdf.rejected, (state, action) => {
        state.uploadStep = "error";
        state.uploadError = action.payload || "AI analysis failed";
      })

      /* ── FETCH REPORTS ── */
      .addCase(fetchReports.pending, (state) => {
        state.reportsLoading = true;
        state.reportsError = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.reportsLoading = false;
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.reportsLoading = false;
        state.reportsError = action.payload || "Failed to load reports";
      })

      /* ── FETCH SINGLE REPORT ── */
      .addCase(fetchReportById.pending, (state) => {
        state.activeReportLoading = true;
        state.activeReportError = null;
        state.activeReport = null;
      })
      .addCase(fetchReportById.fulfilled, (state, action) => {
        state.activeReportLoading = false;
        state.activeReport = action.payload;
      })
      .addCase(fetchReportById.rejected, (state, action) => {
        state.activeReportLoading = false;
        state.activeReportError = action.payload || "Failed to load report";
      })

      /* ── DELETE REPORT ── */
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.reports = state.reports.filter((r) => r._id !== action.payload);
        if (state.activeReport?._id === action.payload) {
          state.activeReport = null;
        }
      });
  },
});

export const { resetUpload, setUploadProgress, setUploadStep } = healthSlice.actions;
export default healthSlice.reducer;