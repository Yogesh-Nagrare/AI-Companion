// // src/pages/Dashboard.jsx
// // Your existing Dashboard with:
// //   1. "Upload PDF" sidebar link that navigates to /upload-pdf
// //   2. Recent reports list in a new card below the existing layout
// // All original code preserved — only additive changes

// import { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   HeartPulse, FileText, Video, Send,
//   Activity, ShieldCheck, Zap, LogOut,
//   Upload, CheckCircle2, Loader2, Sparkles,
//   ChevronRight, Trash2, Plus,
// } from 'lucide-react';
// import { useDispatch, useSelector } from 'react-redux';
// import { logoutUser } from '../authSlice';
// import { fetchReports, deleteReport } from '../redux/healthSlice';
// import { useNavigate, NavLink } from 'react-router';

// const SEVERITY_COLORS = {
//   Low:      "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
//   Moderate: "text-amber-400   bg-amber-500/10   border-amber-500/20",
//   High:     "text-orange-400  bg-orange-500/10  border-orange-500/20",
//   Critical: "text-red-400     bg-red-500/10     border-red-500/20",
// };

// function Dashboard() {
//   // ── Existing state (unchanged) ──
//   const [file, setFile] = useState(null);
//   const [fileType, setFileType] = useState(null);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [response, setResponse] = useState("");
//   const [logoutLoading, setLogoutLoading] = useState(false);

//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   // ── NEW: pull reports from Redux ──
//   const { reports, reportsLoading } = useSelector((state) => state.health);
//   const { user } = useSelector((state) => state.auth);

//   // ── Load reports on mount ──
//   useEffect(() => {
//     dispatch(fetchReports());
//   }, [dispatch]);

//   // ── Existing handlers (unchanged) ──
//   const handleLogout = async () => {
//     setLogoutLoading(true);
//     try {
//       await dispatch(logoutUser()).unwrap();
//     } catch (err) {
//       console.warn("Logout API error:", err);
//     } finally {
//       setLogoutLoading(false);
//       navigate('/login');
//     }
//   };

//   const simulateAnalysis = (e) => {
//     e.preventDefault();
//     if (!file) return;
//     setIsAnalyzing(true);
//     setResponse("");
//     setTimeout(() => {
//       setIsAnalyzing(false);
//       setResponse(
//         `Analysis Complete: The provided ${fileType.toUpperCase()} indicates stable metabolic markers. ` +
//         `I've noted a slight trend in recovery heart rate efficiency. Suggesting a 5% increase in zone 2 cardio duration. ` +
//         `Would you like me to cross-reference this with your last month's lab results?`
//       );
//     }, 3000);
//   };

//   const onFileChange = (e, type) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile) {
//       setFile(selectedFile);
//       setFileType(type);
//       setResponse("");
//     }
//   };

//   const handleDeleteReport = async (e, reportId) => {
//     e.stopPropagation();
//     if (!confirm("Delete this report permanently?")) return;
//     dispatch(deleteReport(reportId));
//   };

//   const initials = user?.firstName?.slice(0, 2).toUpperCase() || "AI";

//   return (
//     <div className="min-h-screen bg-[#05080a] text-slate-200 font-sans flex overflow-hidden">

//       {/* ── Sidebar (added Upload PDF link) ── */}
//       <aside className="w-20 md:w-64 bg-[#0a0f12] border-r border-white/5 flex flex-col items-center md:items-start py-8 px-4 z-20">
//         <div className="flex items-center gap-3 mb-12 md:px-4">
//           <div className="bg-gradient-to-br from-teal-400 to-emerald-600 p-2 rounded-xl text-black shadow-[0_0_15px_rgba(45,212,191,0.3)]">
//             <HeartPulse size={20} strokeWidth={2.5} />
//           </div>
//           <span className="hidden md:block text-xl font-bold text-white tracking-tight">VITA<span className="text-teal-400">AI</span></span>
//         </div>

//         <nav className="flex-1 w-full space-y-2">
//           {/* Existing links */}
//           <SidebarLink icon={<Activity size={20} />} label="Overview" active />
//           <SidebarLink icon={<FileText size={20} />} label="Health Records" />
//           <SidebarLink icon={<Zap size={20} />} label="AI Diagnostics" />
//           {/* ── NEW: Upload PDF link ── */}
//           <NavLink to="/upload-pdf">
//             <SidebarLink icon={<Upload size={20} />} label="Upload PDF" />
//           </NavLink>
//         </nav>

//         <button
//           onClick={handleLogout}
//           disabled={logoutLoading}
//           className="mt-auto flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 transition-colors w-full group disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {logoutLoading ? <Loader2 size={20} className="animate-spin" /> : <LogOut size={20} />}
//           <span className="hidden md:block font-bold text-[10px] uppercase tracking-widest">
//             {logoutLoading ? 'Signing Out...' : 'Terminate Session'}
//           </span>
//         </button>
//       </aside>

//       {/* ── Main Content ── */}
//       <main className="flex-1 relative overflow-y-auto">
//         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

//         {/* Header (updated avatar to use real user initials) */}
//         <header className="px-8 py-8 flex justify-between items-center">
//           <div>
//             <h1 className="text-2xl font-semibold text-white tracking-tight">Diagnostic Hub</h1>
//             <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-medium">
//               System Status: <span className="text-emerald-500">Optimal</span>
//             </p>
//           </div>
//           <div className="flex items-center gap-4">
//             {/* ── NEW: Quick upload button ── */}
//             <NavLink to="/upload-pdf"
//               className="hidden md:flex items-center gap-2 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-400 font-bold text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all">
//               <Plus size={14} /> New Report
//             </NavLink>
//             <div className="hidden md:block text-right">
//               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Bio-Sync</p>
//               <p className="text-sm text-teal-400 font-mono">98.2 BPM</p>
//             </div>
//             <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-teal-400 font-bold text-sm">
//               {initials}
//             </div>
//           </div>
//         </header>

//         <section className="px-8 pb-12 space-y-8">

//           {/* ── EXISTING: Original 12-col grid layout (100% unchanged) ── */}
//           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

//             {/* Left Column: Uploaders */}
//             <div className="lg:col-span-5 space-y-6">
//               <div className="bg-[#0a0f12]/80 border border-white/5 p-6 rounded-[32px] backdrop-blur-xl">
//                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
//                   <Upload size={14} className="text-teal-500" /> Data Ingestion
//                 </h3>
//                 <div className="grid grid-cols-1 gap-4">
//                   {/* PDF Upload */}
//                   <label className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-6 transition-all duration-300 flex flex-col items-center justify-center gap-3
//                     ${fileType === 'pdf' ? 'border-teal-500/50 bg-teal-500/5' : 'border-white/5 hover:border-white/10 bg-black/20'}`}>
//                     <input type="file" accept=".pdf" className="hidden" onChange={(e) => onFileChange(e, 'pdf')} />
//                     <div className="p-3 bg-slate-900 rounded-xl group-hover:scale-110 transition-transform">
//                       <FileText size={24} className={fileType === 'pdf' ? 'text-teal-400' : 'text-slate-500'} />
//                     </div>
//                     <div className="text-center">
//                       <p className="text-xs font-bold text-white uppercase tracking-wider">Clinical PDF</p>
//                       <p className="text-[10px] text-slate-500 mt-1">Lab reports, Scans</p>
//                     </div>
//                   </label>
//                   {/* Video Upload */}
//                   <label className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-6 transition-all duration-300 flex flex-col items-center justify-center gap-3
//                     ${fileType === 'video' ? 'border-teal-500/50 bg-teal-500/5' : 'border-white/5 hover:border-white/10 bg-black/20'}`}>
//                     <input type="file" accept="video/*" className="hidden" onChange={(e) => onFileChange(e, 'video')} />
//                     <div className="p-3 bg-slate-900 rounded-xl group-hover:scale-110 transition-transform">
//                       <Video size={24} className={fileType === 'video' ? 'text-teal-400' : 'text-slate-500'} />
//                     </div>
//                     <div className="text-center">
//                       <p className="text-xs font-bold text-white uppercase tracking-wider">Movement Video</p>
//                       <p className="text-[10px] text-slate-500 mt-1">Gait analysis, Exercise</p>
//                     </div>
//                   </label>
//                 </div>

//                 {file && (
//                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
//                     className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
//                     <CheckCircle2 size={18} className="text-emerald-500" />
//                     <span className="text-[10px] font-bold text-emerald-200 uppercase truncate flex-1">{file.name}</span>
//                   </motion.div>
//                 )}

//                 <button
//                   onClick={simulateAnalysis}
//                   disabled={!file || isAnalyzing}
//                   className="w-full mt-6 bg-teal-500 hover:bg-teal-400 disabled:opacity-30 text-black font-bold text-[10px] uppercase tracking-[0.2em] py-4 rounded-xl transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
//                 >
//                   {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
//                   {isAnalyzing ? 'Processing Bio-Data' : 'Begin AI Analysis'}
//                 </button>

//                 {/* ── NEW: Deep PDF Analysis CTA (below existing button) ── */}
//                 <NavLink to="/upload-pdf"
//                   className="w-full mt-3 flex items-center justify-center gap-2 border border-teal-500/20 text-teal-400 font-bold text-[10px] uppercase tracking-[0.2em] py-3 rounded-xl transition-all hover:bg-teal-500/5">
//                   <FileText size={14} /> Full PDF Analysis →
//                 </NavLink>
//               </div>
//             </div>

//             {/* Right Column: AI Output (100% unchanged) */}
//             <div className="lg:col-span-7 flex flex-col h-[600px]">
//               <div className="bg-[#0a0f12]/80 border border-white/5 rounded-[32px] backdrop-blur-xl flex flex-col flex-1 overflow-hidden shadow-2xl">
//                 <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
//                   <div className="flex items-center gap-3">
//                     <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
//                     <h3 className="text-xs font-bold text-white uppercase tracking-widest">Neural Insights Feed</h3>
//                   </div>
//                   <ShieldCheck size={16} className="text-slate-500" />
//                 </div>

//                 <div className="flex-1 p-8 overflow-y-auto space-y-6">
//                   <AnimatePresence mode="wait">
//                     {isAnalyzing && (
//                       <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//                         className="flex flex-col items-center justify-center h-full text-center space-y-4">
//                         <div className="relative">
//                           <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-xl animate-pulse" />
//                           <Loader2 size={40} className="text-teal-500 animate-spin relative z-10" />
//                         </div>
//                         <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Decoding Medical Patterns...</p>
//                       </motion.div>
//                     )}
//                     {!isAnalyzing && !response && (
//                       <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//                         className="flex flex-col items-center justify-center h-full text-center opacity-30">
//                         <Zap size={48} className="mb-4 text-slate-500" />
//                         <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Waiting for Ingestion</p>
//                       </motion.div>
//                     )}
//                     {!isAnalyzing && response && (
//                       <motion.div key="response" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
//                         className="bg-slate-900/50 border border-teal-500/20 p-6 rounded-2xl relative">
//                         <Sparkles size={16} className="absolute -top-2 -left-2 text-teal-400" />
//                         <p className="text-sm leading-relaxed text-slate-200 font-medium">{response}</p>
//                         <div className="mt-6 flex gap-2">
//                           <button className="text-[10px] font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors border border-white/5">
//                             Save to Records
//                           </button>
//                           <NavLink to="/upload-pdf" className="text-[10px] font-bold uppercase tracking-widest bg-teal-500 text-black px-4 py-2 rounded-lg transition-colors">
//                             Full PDF Analysis
//                           </NavLink>
//                         </div>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>

//                 <div className="p-6 bg-black/40 border-t border-white/5">
//                   <div className="relative">
//                     <input type="text" placeholder="Ask follow-up question..."
//                       className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-teal-500/50 transition-all placeholder:text-slate-600" />
//                     <button className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-500 hover:text-teal-400 transition-colors">
//                       <Send size={16} />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* ── NEW: Health Reports List (appears below existing grid) ── */}
//           <div className="bg-[#0a0f12]/80 border border-white/5 rounded-[32px] backdrop-blur-xl overflow-hidden">
//             <div className="p-6 border-b border-white/5 flex items-center justify-between">
//               <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
//                 <FileText size={14} className="text-teal-500" /> Health Reports
//               </h3>
//               <NavLink to="/upload-pdf"
//                 className="flex items-center gap-1.5 text-teal-400 hover:text-teal-300 text-[10px] font-bold uppercase tracking-widest transition-colors">
//                 <Plus size={12} /> Upload New
//               </NavLink>
//             </div>

//             {reportsLoading ? (
//               <div className="flex items-center justify-center py-10">
//                 <Loader2 size={22} className="text-teal-500 animate-spin" />
//               </div>
//             ) : reports.length === 0 ? (
//               <div className="flex flex-col items-center justify-center py-12 text-center px-6">
//                 <div className="p-4 bg-slate-900 rounded-2xl mb-3">
//                   <FileText size={28} className="text-slate-600" />
//                 </div>
//                 <p className="text-slate-500 text-sm font-medium mb-1">No reports yet</p>
//                 <p className="text-slate-600 text-xs mb-5">Upload a health PDF to get AI-powered insights</p>
//                 <NavLink to="/upload-pdf"
//                   className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-black font-bold text-[10px] uppercase tracking-widest px-5 py-3 rounded-xl transition-all">
//                   <Upload size={12} /> Upload PDF
//                 </NavLink>
//               </div>
//             ) : (
//               <div className="divide-y divide-white/5">
//                 {reports.map((report, i) => (
//                   <motion.div key={report._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
//                     <NavLink to={`/analysis/${report._id}`}
//                       className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors group">
//                       <div className="p-2.5 bg-slate-900 rounded-xl border border-white/5 flex-shrink-0">
//                         <FileText size={16} className="text-teal-400" />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p className="text-sm font-semibold text-white truncate">{report.reportName}</p>
//                         <p className="text-[10px] text-slate-500 mt-0.5">
//                           {new Date(report.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
//                         </p>
//                       </div>
//                       {report.severityLevel && (
//                         <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border flex-shrink-0 ${SEVERITY_COLORS[report.severityLevel]}`}>
//                           {report.severityLevel}
//                         </span>
//                       )}
//                       <div className="flex items-center gap-1">
//                         <button onClick={(e) => handleDeleteReport(e, report._id)}
//                           className="p-1.5 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 rounded-lg hover:bg-red-500/10">
//                           <Trash2 size={13} />
//                         </button>
//                         <ChevronRight size={15} className="text-slate-600 group-hover:text-teal-400 transition-colors" />
//                       </div>
//                     </NavLink>
//                   </motion.div>
//                 ))}
//               </div>
//             )}
//           </div>

//         </section>
//       </main>
//     </div>
//   );
// }

// function SidebarLink({ icon, label, active = false }) {
//   return (
//     <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 group
//       ${active ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'}`}>
//       {icon}
//       <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest">{label}</span>
//     </div>
//   );
// }

// export default Dashboard;


// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartPulse, FileText, Video, Send,
  Activity, ShieldCheck, Zap, LogOut,
  Upload, CheckCircle2, Loader2, Sparkles,
  ChevronRight, Trash2, Plus,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice';
import { fetchReports, deleteReport } from '../redux/healthSlice';
import { useNavigate, NavLink } from 'react-router';

const SEVERITY_COLORS = {
  Low:      "text-emerald-600 bg-emerald-50 border-emerald-100",
  Moderate: "text-amber-600   bg-amber-50   border-amber-100",
  High:     "text-orange-600  bg-orange-50  border-orange-100",
  Critical: "text-red-600     bg-red-50     border-red-100",
};

function Dashboard() {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [response, setResponse] = useState("");
  const [logoutLoading, setLogoutLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { reports, reportsLoading } = useSelector((state) => state.health);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (err) {
      console.warn("Logout API error:", err);
    } finally {
      setLogoutLoading(false);
      navigate('/login');
    }
  };

  const simulateAnalysis = (e) => {
    e.preventDefault();
    if (!file) return;
    setIsAnalyzing(true);
    setResponse("");
    setTimeout(() => {
      setIsAnalyzing(false);
      setResponse(
        `Analysis Complete: The provided ${fileType.toUpperCase()} indicates stable metabolic markers. ` +
        `I've noted a slight trend in recovery heart rate efficiency. Suggesting a 5% increase in zone 2 cardio duration. ` +
        `Would you like me to cross-reference this with your last month's lab results?`
      );
    }, 3000);
  };

  const onFileChange = (e, type) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileType(type);
      setResponse("");
    }
  };

  const handleDeleteReport = async (e, reportId) => {
    e.stopPropagation();
    if (!confirm("Delete this report permanently?")) return;
    dispatch(deleteReport(reportId));
  };

  const initials = user?.firstName?.slice(0, 2).toUpperCase() || "AI";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-20 md:w-64 bg-white border-r border-slate-200 flex flex-col items-center md:items-start py-8 px-4 z-20 shadow-sm">
        <div className="flex items-center gap-3 mb-12 md:px-4">
          <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-2 rounded-xl text-white shadow-[0_5px_15px_rgba(20,184,166,0.3)]">
            <HeartPulse size={20} strokeWidth={2.5} />
          </div>
          <span className="hidden md:block text-xl font-bold text-slate-900 tracking-tight">VITA<span className="text-teal-600">AI</span></span>
        </div>

        <nav className="flex-1 w-full space-y-2">
          <SidebarLink icon={<Activity size={20} />} label="Overview" active />
          <SidebarLink icon={<FileText size={20} />} label="Health Records" />
          <SidebarLink icon={<Zap size={20} />} label="AI Diagnostics" />
          <NavLink to="/upload-pdf">
            <SidebarLink icon={<Upload size={20} />} label="Upload PDF" />
          </NavLink>
        </nav>

        <button
          onClick={handleLogout}
          disabled={logoutLoading}
          className="mt-auto flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 transition-colors w-full group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {logoutLoading ? <Loader2 size={20} className="animate-spin" /> : <LogOut size={20} />}
          <span className="hidden md:block font-bold text-[10px] uppercase tracking-widest">
            {logoutLoading ? 'Signing Out...' : 'Terminate Session'}
          </span>
        </button>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 relative overflow-y-auto">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-400/5 rounded-full blur-[120px] pointer-events-none" />

        <header className="px-8 py-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Diagnostic Hub</h1>
            <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-medium">
              System Status: <span className="text-emerald-600 font-bold">Optimal</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <NavLink to="/upload-pdf"
              className="hidden md:flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-500/10">
              <Plus size={14} /> New Report
            </NavLink>
            <div className="hidden md:block text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Bio-Sync</p>
              <p className="text-sm text-teal-600 font-mono font-bold">98.2 BPM</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-teal-600 font-bold text-sm">
              {initials}
            </div>
          </div>
        </header>

        <section className="px-8 pb-12 space-y-8">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Column: Uploaders */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-slate-200 p-6 rounded-[32px] shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Upload size={14} className="text-teal-600" /> Data Ingestion
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <label className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-6 transition-all duration-300 flex flex-col items-center justify-center gap-3
                    ${fileType === 'pdf' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-teal-300 bg-slate-50/50'}`}>
                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => onFileChange(e, 'pdf')} />
                    <div className="p-3 bg-white shadow-sm rounded-xl group-hover:scale-110 transition-transform">
                      <FileText size={24} className={fileType === 'pdf' ? 'text-teal-600' : 'text-slate-400'} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Clinical PDF</p>
                      <p className="text-[10px] text-slate-500 mt-1">Lab reports, Scans</p>
                    </div>
                  </label>
                  
                  <label className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-6 transition-all duration-300 flex flex-col items-center justify-center gap-3
                    ${fileType === 'video' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-teal-300 bg-slate-50/50'}`}>
                    <input type="file" accept="video/*" className="hidden" onChange={(e) => onFileChange(e, 'video')} />
                    <div className="p-3 bg-white shadow-sm rounded-xl group-hover:scale-110 transition-transform">
                      <Video size={24} className={fileType === 'video' ? 'text-teal-600' : 'text-slate-400'} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Movement Video</p>
                      <p className="text-[10px] text-slate-500 mt-1">Gait analysis, Exercise</p>
                    </div>
                  </label>
                </div>

                {file && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    <span className="text-[10px] font-bold text-emerald-700 uppercase truncate flex-1">{file.name}</span>
                  </motion.div>
                )}

                <button
                  onClick={simulateAnalysis}
                  disabled={!file || isAnalyzing}
                  className="w-full mt-6 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-[10px] uppercase tracking-[0.2em] py-4 rounded-xl transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {isAnalyzing ? 'Processing Bio-Data' : 'Begin AI Analysis'}
                </button>

                <NavLink to="/upload-pdf"
                  className="w-full mt-3 flex items-center justify-center gap-2 border border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-[0.2em] py-3 rounded-xl transition-all hover:bg-slate-50">
                  <FileText size={14} /> Full PDF Analysis →
                </NavLink>
              </div>
            </div>

            {/* Right Column: AI Output */}
            <div className="lg:col-span-7 flex flex-col h-[600px]">
              <div className="bg-white border border-slate-200 rounded-[32px] flex flex-col flex-1 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Neural Insights Feed</h3>
                  </div>
                  <ShieldCheck size={16} className="text-slate-400" />
                </div>

                <div className="flex-1 p-8 overflow-y-auto space-y-6">
                  <AnimatePresence mode="wait">
                    {isAnalyzing && (
                      <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <Loader2 size={40} className="text-teal-600 animate-spin" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Decoding Medical Patterns...</p>
                      </motion.div>
                    )}
                    {!isAnalyzing && !response && (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center h-full text-center opacity-40">
                        <Zap size={48} className="mb-4 text-slate-300" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Waiting for Ingestion</p>
                      </motion.div>
                    )}
                    {!isAnalyzing && response && (
                      <motion.div key="response" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                        className="bg-teal-50/50 border border-teal-100 p-6 rounded-2xl relative">
                        <Sparkles size={16} className="absolute -top-2 -left-2 text-teal-600" />
                        <p className="text-sm leading-relaxed text-slate-700 font-medium">{response}</p>
                        <div className="mt-6 flex gap-2">
                          <button className="text-[10px] font-bold uppercase tracking-widest bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors">
                            Save to Records
                          </button>
                          <NavLink to="/upload-pdf" className="text-[10px] font-bold uppercase tracking-widest bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm">
                            Full PDF Analysis
                          </NavLink>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100">
                  <div className="relative">
                    <input type="text" placeholder="Ask follow-up question..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-teal-500 transition-all placeholder:text-slate-400" />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600 hover:text-teal-700 transition-colors">
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Health Reports List ── */}
          <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <FileText size={14} className="text-teal-600" /> Health Reports
              </h3>
              <NavLink to="/upload-pdf"
                className="flex items-center gap-1.5 text-teal-600 hover:text-teal-700 text-[10px] font-bold uppercase tracking-widest transition-colors">
                <Plus size={12} /> Upload New
              </NavLink>
            </div>

            {reportsLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={22} className="text-teal-600 animate-spin" />
              </div>
            ) : reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <div className="p-4 bg-slate-50 rounded-2xl mb-3">
                  <FileText size={28} className="text-slate-300" />
                </div>
                <p className="text-slate-500 text-sm font-medium mb-1">No reports yet</p>
                <p className="text-slate-400 text-xs mb-5">Upload a health PDF to get AI-powered insights</p>
                <NavLink to="/upload-pdf"
                  className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] uppercase tracking-widest px-5 py-3 rounded-xl transition-all shadow-md">
                  <Upload size={12} /> Upload PDF
                </NavLink>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {reports.map((report, i) => (
                  <motion.div key={report._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                    <NavLink to={`/analysis/${report._id}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group">
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex-shrink-0">
                        <FileText size={16} className="text-teal-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{report.reportName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                          {new Date(report.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                        </p>
                      </div>
                      {report.severityLevel && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border flex-shrink-0 ${SEVERITY_COLORS[report.severityLevel]}`}>
                          {report.severityLevel}
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <button onClick={(e) => handleDeleteReport(e, report._id)}
                          className="p-1.5 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 rounded-lg hover:bg-red-50">
                          <Trash2 size={13} />
                        </button>
                        <ChevronRight size={15} className="text-slate-300 group-hover:text-teal-600 transition-colors" />
                      </div>
                    </NavLink>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </section>
      </main>
    </div>
  );
}

function SidebarLink({ icon, label, active = false }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 group
      ${active ? 'bg-teal-50 text-teal-600 border border-teal-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}>
      {icon}
      <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </div>
  );
}

export default Dashboard;