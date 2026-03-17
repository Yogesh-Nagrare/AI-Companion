// src/redux/healthSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../api/axiosClient";

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
        const progressFn = onProgress || (() => {});
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) progressFn(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          try {
            const res = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) resolve(res);
            else reject(new Error(res.error?.message || "Cloudinary upload failed"));
          } catch { reject(new Error("Cloudinary returned invalid JSON")); }
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.ontimeout = () => reject(new Error("Upload timed out"));
        xhr.timeout = 120000;
        xhr.send(formData);
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

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

export const analyzeWithML = createAsyncThunk(
  "health/analyzeWithML",
  async (healthData, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post("/health/ml/analyze", healthData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchMLReports = createAsyncThunk(
  "health/fetchMLReports",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/health/ml/reports");
      return data.reports;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchMLReportById = createAsyncThunk(
  "health/fetchMLReportById",
  async (reportId, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get(`/health/ml/reports/${reportId}`);
      return data.report;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const deleteMLReport = createAsyncThunk(
  "health/deleteMLReport",
  async (reportId, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/health/ml/reports/${reportId}`);
      return reportId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const healthSlice = createSlice({
  name: "health",
  initialState: {
    // PDF upload
    uploadProgress: 0,
    uploadStep: null,
    uploadError: null,
    currentAnalysis: null,

    // 🆕 Extracted PDF data passed to HealthCheck
    pdfExtractedData: null, // { hba1c, glucose, bmi, age, reportId, geminiAnalysis, reportName }

    // PDF reports
    reports: [],
    reportsLoading: false,
    reportsError: null,
    activeReport: null,
    activeReportLoading: false,
    activeReportError: null,

    // ML reports
    mlReports: [],
    mlReportsLoading: false,
    mlReportsError: null,
    activeMLReport: null,
    activeMLReportLoading: false,
    mlAnalysisLoading: false,
    mlAnalysisError: null,
    mlAnalysisResult: null,
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
    resetMLAnalysis: (state) => {
      state.mlAnalysisLoading = false;
      state.mlAnalysisError = null;
      state.mlAnalysisResult = null;
    },
    // 🆕 Store extracted PDF values to pre-fill HealthCheck
    setPdfExtractedData: (state, action) => {
      state.pdfExtractedData = action.payload;
    },
    clearPdfExtractedData: (state) => {
      state.pdfExtractedData = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getUploadSignature.pending, (state) => {
        state.uploadStep = "signing";
        state.uploadProgress = 0;
        state.uploadError = null;
      })
      .addCase(getUploadSignature.rejected, (state, action) => {
        state.uploadStep = "error";
        state.uploadError = action.payload || "Failed to get upload credentials";
      })
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
      .addCase(analyzePdf.pending, (state) => {
        state.uploadStep = "analyzing";
      })
      .addCase(analyzePdf.fulfilled, (state, action) => {
        state.uploadStep = "done";
        state.currentAnalysis = action.payload;
        // 🆕 Store extracted ML input values for HealthCheck pre-fill
        if (action.payload?.mlAnalysis?.extracted_input || action.payload?.mlExtractedInput) {
          const extracted = action.payload.mlExtractedInput || action.payload.mlAnalysis?.extracted_input;
          state.pdfExtractedData = {
            hba1c:          extracted?.hba1c    || null,
            glucose:        extracted?.glucose  || null,
            bmi:            extracted?.bmi      || null,
            age:            extracted?.age      || null,
            reportId:       action.payload.reportId,
            reportName:     action.payload.reportName,
            geminiAnalysis: action.payload.analysis,
          };
        }
        if (state.reports.length > 0) {
          state.reports.unshift({
            _id:           action.payload.reportId,
            reportName:    action.payload.reportName,
            severityLevel: action.payload.analysis?.severityLevel,
            createdAt:     action.payload.uploadedAt,
          });
        }
      })
      .addCase(analyzePdf.rejected, (state, action) => {
        state.uploadStep = "error";
        state.uploadError = action.payload || "AI analysis failed";
      })
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
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.reports = state.reports.filter((r) => r._id !== action.payload);
        if (state.activeReport?._id === action.payload) state.activeReport = null;
      })
      .addCase(analyzeWithML.pending, (state) => {
        state.mlAnalysisLoading = true;
        state.mlAnalysisError = null;
        state.mlAnalysisResult = null;
      })
      .addCase(analyzeWithML.fulfilled, (state, action) => {
        state.mlAnalysisLoading = false;
        state.mlAnalysisResult = action.payload;
      })
      .addCase(analyzeWithML.rejected, (state, action) => {
        state.mlAnalysisLoading = false;
        state.mlAnalysisError = action.payload || "ML analysis failed";
      })
      .addCase(fetchMLReports.pending, (state) => {
        state.mlReportsLoading = true;
        state.mlReportsError = null;
      })
      .addCase(fetchMLReports.fulfilled, (state, action) => {
        state.mlReportsLoading = false;
        state.mlReports = action.payload;
      })
      .addCase(fetchMLReports.rejected, (state, action) => {
        state.mlReportsLoading = false;
        state.mlReportsError = action.payload || "Failed to load ML reports";
      })
      .addCase(fetchMLReportById.pending, (state) => {
        state.activeMLReportLoading = true;
        state.activeMLReport = null;
      })
      .addCase(fetchMLReportById.fulfilled, (state, action) => {
        state.activeMLReportLoading = false;
        state.activeMLReport = action.payload;
      })
      .addCase(fetchMLReportById.rejected, (state) => {
        state.activeMLReportLoading = false;
      })
      .addCase(deleteMLReport.fulfilled, (state, action) => {
        state.mlReports = state.mlReports.filter((r) => r._id !== action.payload);
        if (state.activeMLReport?._id === action.payload) state.activeMLReport = null;
      });
  },
});

export const {
  resetUpload,
  setUploadProgress,
  setUploadStep,
  resetMLAnalysis,
  setPdfExtractedData,
  clearPdfExtractedData,
} = healthSlice.actions;

export default healthSlice.reducer;