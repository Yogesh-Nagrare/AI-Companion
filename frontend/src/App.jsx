// src/App.jsx

import { Routes, Route, Navigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./authSlice";          // ✅ fixed path

import Login from "./pages/login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UploadPdf from "./pages/UploadPdf";
import AnalysisResult from "./pages/AnalysisResult";
import HealthCheck from "./pages/HealthCheck";
import FinalResult from './pages/FinalResult';

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
      {/* Root redirect */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
      />

      {/* Public routes */}
      <Route path="/login"  element={<Login />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/result/:id" element={<Protected><FinalResult /></Protected>} />

      {/* Protected routes */}
      <Route path="/dashboard"      element={<Protected><Dashboard /></Protected>} />
      <Route path="/upload-pdf"     element={<Protected><UploadPdf /></Protected>} />
      <Route path="/analysis/:id"   element={<Protected><AnalysisResult /></Protected>} />
      <Route path="/health-check"   element={<Protected><HealthCheck /></Protected>} />  {/* ✅ protected */}
    </Routes>
  );
}

export default App;