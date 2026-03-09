// src/App.jsx
// Your existing App.jsx with /upload-pdf and /analysis/:id routes added
// Everything else is UNCHANGED from your original

import { Routes, Route, Navigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "../src/authSlice";

import Login from "./pages/login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UploadPdf from "./pages/UploadPdf";       // ← NEW
import AnalysisResult from "./pages/AnalysisResult"; // ← NEW

// Simple protected route wrapper — keeps it inline like your existing pattern
const Protected = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
    
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05080a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
          <p className="text-slate-500 text-[10px] uppercase tracking-widest">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Root: redirect to dashboard if logged in, else login */}
      <Route
        path="/"
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
      />

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/upload-pdf" element={<Protected><UploadPdf /></Protected>} />           {/* ← NEW */}
      <Route path="/analysis/:id" element={<Protected><AnalysisResult /></Protected>} />    {/* ← NEW */}
    </Routes>
  );
}

export default App;