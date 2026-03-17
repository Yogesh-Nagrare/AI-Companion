// src/pages/Dashboard.jsx
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartPulse, FileText, Upload, Activity,
  ShieldCheck, LogOut, Plus, Loader2,
  ChevronRight, Trash2, AlertCircle, Sparkles,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice';
import {
  fetchReports,
  deleteReport,
  fetchMLReports,
  deleteMLReport,
} from '../redux/healthSlice';
import { useNavigate, NavLink } from 'react-router';

// ── Risk color maps ──────────────────────────────────────────
const SEVERITY = {
  Low:      { badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',  ring: '#10b981' },
  Moderate: { badge: 'bg-amber-50   text-amber-700   border-amber-100',    ring: '#f59e0b' },
  High:     { badge: 'bg-orange-50  text-orange-700  border-orange-100',   ring: '#f97316' },
  Critical: { badge: 'bg-red-50     text-red-700     border-red-100',      ring: '#ef4444' },
};

// ── Pipeline steps definition ────────────────────────────────
const PIPELINE_STEPS = [
  { id: 'extract_pdf',    label: 'Extract PDF',     desc: 'Lab values parsed from report'          },
  { id: 'analyze_report', label: 'Analyze report',  desc: 'Abnormal parameters detected'           },
  { id: 'predict_risk',   label: 'Predict risk',    desc: 'ML model diabetes probability'          },
  { id: 'check_symptoms', label: 'Check symptoms',  desc: 'Symptom pattern matching'               },
  { id: 'merge_results',  label: 'Merge results',   desc: 'ML×0.6 + labs×0.3 + symptoms×0.1'      },
  { id: 'generate_alert', label: 'Generate alert',  desc: 'Patient-facing report created'          },
  { id: 'finalize',       label: 'Finalize',        desc: 'Workflow completed'                      },
];

export default function Dashboard() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  // ── Redux state ──────────────────────────────────────────
  const { user }                                      = useSelector((s) => s.auth);
  const { reports, reportsLoading }                   = useSelector((s) => s.health);
  const { mlReports, mlReportsLoading, mlAnalysisResult } = useSelector((s) => s.health);

  useEffect(() => {
    dispatch(fetchReports());
    dispatch(fetchMLReports());
  }, [dispatch]);

  const handleLogout = async () => {
    try { await dispatch(logoutUser()).unwrap(); } catch (_) {}
    navigate('/login');
  };

  const handleDeletePdf = (e, id) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm('Delete this report?')) return;
    dispatch(deleteReport(id));
  };

  const handleDeleteML = (e, id) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm('Delete this ML result?')) return;
    dispatch(deleteMLReport(id));
  };

  // ── Latest ML result for pipeline display ───────────────
  const latest     = mlReports[0] || null;
  const latestScore = latest?.finalAssessment?.score || mlAnalysisResult?.final_assessment?.score || 0;
  const latestRisk  = latest?.riskLevel || mlAnalysisResult?.risk_level || null;
  const latestAlert = latest?.alert     || mlAnalysisResult?.alert      || false;
  const latestReport= latest?.report    || mlAnalysisResult?.report     || null;
  const fa          = latest?.finalAssessment || mlAnalysisResult?.final_assessment || {};

  const ringPct     = Math.round(latestScore * 100);
  const circumference = 2 * Math.PI * 30; // r=30
  const dashOffset  = circumference - (circumference * latestScore);

  const initials = user?.firstName?.slice(0, 2).toUpperCase() || 'VI';

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans">

      {/* ══ SIDEBAR ══════════════════════════════════════════ */}
      <aside className="w-20 md:w-60 bg-white border-r border-slate-200 flex flex-col py-6 px-3 shrink-0 shadow-sm">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10 px-2">
          <div className="bg-teal-600 p-2 rounded-xl text-white shadow-[0_4px_12px_rgba(13,148,136,0.3)]">
            <HeartPulse size={18} strokeWidth={2.5} />
          </div>
          <span className="hidden md:block text-lg font-semibold text-slate-900">
            VITA<span className="text-teal-600">AI</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          <SidebarLink icon={<Activity size={18} />}   label="Overview"       active />
          <NavLink to="/upload-pdf">
            <SidebarLink icon={<Upload size={18} />}   label="Upload PDF" />
          </NavLink>
          <NavLink to="/health-check">
            <SidebarLink icon={<ShieldCheck size={18} />} label="Risk Check" />
          </NavLink>
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all w-full"
        >
          <LogOut size={18} />
          <span className="hidden md:block text-xs font-semibold uppercase tracking-widest">Sign out</span>
        </button>
      </aside>

      {/* ══ MAIN ═════════════════════════════════════════════ */}
      <main className="flex-1 overflow-y-auto">

        {/* ── Header ── */}
        <header className="px-6 py-6 flex items-center justify-between border-b border-slate-100 bg-white">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Diagnostic Hub</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Welcome back, <span className="text-teal-600 font-medium">{user?.firstName || 'User'}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NavLink to="/upload-pdf"
              className="hidden md:flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm">
              <Plus size={13} /> New Report
            </NavLink>
            <NavLink to="/health-check"
              className="hidden md:flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold px-4 py-2 rounded-xl transition-all">
              <ShieldCheck size={13} /> Risk Check
            </NavLink>
            <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 font-semibold text-sm flex items-center justify-center">
              {initials}
            </div>
          </div>
        </header>

        <div className="px-6 py-6 space-y-6">

          {/* ── Metric Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Risk Score',
                value: latestScore ? `${Math.round(latestScore * 100)}%` : '—',
                badge: latestRisk,
                color: SEVERITY[latestRisk]?.badge || 'bg-slate-100 text-slate-500 border-slate-200',
              },
              {
                label: 'ML Reports',
                value: mlReports.length,
                badge: 'Total',
                color: 'bg-blue-50 text-blue-700 border-blue-100',
              },
              {
                label: 'PDF Reports',
                value: reports.length,
                badge: 'Total',
                color: 'bg-teal-50 text-teal-700 border-teal-100',
              },
              {
                label: 'Alerts Fired',
                value: mlReports.filter(r => r.alert).length,
                badge: 'Critical only',
                color: 'bg-red-50 text-red-700 border-red-100',
              },
            ].map(({ label, value, badge, color }) => (
              <div key={label} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">{label}</p>
                <p className="text-2xl font-semibold text-slate-900">{value}</p>
                {badge && (
                  <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-2 ${color}`}>
                    {badge}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* ── Pipeline + Score ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Pipeline Steps */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  ML Pipeline — last run
                </h2>
                {latestRisk && (
                  <span className={`ml-auto text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${SEVERITY[latestRisk]?.badge || ''}`}>
                    {latestRisk}
                  </span>
                )}
              </div>

              {/* Steps */}
              <div className="space-y-0">
                {PIPELINE_STEPS.map((step, i) => {
                  const isAlert   = step.id === 'generate_alert';
                  const isDone    = latest || mlAnalysisResult;
                  const stepState = isDone
                    ? (isAlert && latestAlert ? 'alert' : 'done')
                    : 'idle';

                  return (
                    <div key={step.id} className="flex gap-3 relative">
                      {/* Vertical connector */}
                      {i < PIPELINE_STEPS.length - 1 && (
                        <div className="absolute left-[14px] top-8 bottom-0 w-px bg-slate-100 z-0" />
                      )}

                      {/* Dot */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 z-10 mt-1
                        ${stepState === 'done'  ? 'bg-teal-500 text-white' : ''}
                        ${stepState === 'alert' ? 'bg-amber-400 text-white' : ''}
                        ${stepState === 'idle'  ? 'bg-slate-100 text-slate-400 border border-slate-200' : ''}
                      `}>
                        {stepState === 'done'  ? '✓' : ''}
                        {stepState === 'alert' ? '!' : ''}
                        {stepState === 'idle'  ? (i + 1) : ''}
                      </div>

                      {/* Content */}
                      <div className="pb-4 flex-1">
                        <p className="text-sm font-medium text-slate-800">{step.label}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {stepState !== 'idle' ? step.desc : 'Waiting...'}
                        </p>
                        {stepState !== 'idle' && (
                          <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1
                            ${stepState === 'done'  ? 'bg-teal-50 text-teal-700' : ''}
                            ${stepState === 'alert' ? 'bg-amber-50 text-amber-700' : ''}
                          `}>
                            {stepState === 'alert' ? 'alert fired' : 'completed'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty state */}
              {!latest && !mlAnalysisResult && (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-400 mb-3">No ML analysis run yet</p>
                  <NavLink to="/health-check"
                    className="inline-flex items-center gap-1.5 bg-teal-600 text-white text-xs font-semibold px-4 py-2 rounded-xl">
                    <ShieldCheck size={12} /> Run Risk Check
                  </NavLink>
                </div>
              )}
            </div>

            {/* Score + Alert */}
            <div className="lg:col-span-5 flex flex-col gap-4">

              {/* Ring chart */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-4">
                  Score breakdown
                </h2>
                <div className="flex items-center gap-4 mb-4">
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="30"
                      fill="none" stroke="#f1f5f9" strokeWidth="6" />
                    <circle cx="40" cy="40" r="30"
                      fill="none"
                      stroke={SEVERITY[latestRisk]?.ring || '#0d9488'}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '40px 40px', transition: 'stroke-dashoffset .8s ease' }}
                    />
                    <text x="40" y="45" textAnchor="middle"
                      style={{ fontSize: 15, fontWeight: 500, fill: 'currentColor', fontFamily: 'inherit' }}>
                      {ringPct}%
                    </text>
                  </svg>
                  <div>
                    <p className="text-base font-semibold text-slate-900">{latestRisk || 'No data'}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Fused final score</p>
                  </div>
                </div>

                {/* Bars */}
                {[
                  { label: 'ML model',      pct: Math.round((fa.ml_probability  || 0) * 100), color: 'bg-teal-500'   },
                  { label: 'Abnormal labs', pct: Math.min(Math.round(((fa.abnormal_count || 0) / 3) * 100), 100), color: 'bg-amber-400' },
                  { label: 'Symptoms',      pct: Math.round((fa.symptom_score   || 0) * 100), color: 'bg-indigo-400' },
                ].map(({ label, pct, color }) => (
                  <div key={label} className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] text-slate-400 w-24 shrink-0">{label}</span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[11px] text-slate-400 w-8 text-right">{pct}%</span>
                  </div>
                ))}
              </div>

              {/* Alert box */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex-1">
                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-3">
                  Latest alert
                </h2>

                {latestAlert && latestReport ? (
                  <>
                    <div className="flex gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mb-4">
                      <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700 leading-relaxed">{latestReport}</p>
                    </div>
                    <div className="flex gap-2">
                      <NavLink to="/health-check"
                        className="flex-1 text-center bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-all">
                        New analysis
                      </NavLink>
                      {mlReports[0] && (
                        <button
                          onClick={() => navigate(`/analysis/${mlReports[0]._id}`)}
                          className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold py-2.5 rounded-xl transition-all">
                          View report
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <Sparkles size={24} className="text-slate-200 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">No alerts yet</p>
                    <NavLink to="/health-check"
                      className="inline-flex items-center gap-1.5 mt-3 text-teal-600 text-xs font-semibold hover:underline">
                      Run a risk check →
                    </NavLink>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── ML Reports Table ── */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <ShieldCheck size={13} className="text-teal-600" /> ML Risk Results
              </h2>
              <NavLink to="/health-check"
                className="flex items-center gap-1 text-teal-600 text-[10px] font-semibold hover:underline">
                <Plus size={11} /> New check
              </NavLink>
            </div>

            {mlReportsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={20} className="text-teal-600 animate-spin" />
              </div>
            ) : mlReports.length === 0 ? (
              <div className="text-center py-10">
                <ShieldCheck size={28} className="text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400 mb-1">No risk checks yet</p>
                <NavLink to="/health-check"
                  className="inline-flex items-center gap-1.5 mt-2 bg-teal-600 text-white text-xs font-semibold px-4 py-2 rounded-xl">
                  <ShieldCheck size={12} /> Run Risk Check
                </NavLink>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {mlReports.map((r, i) => (
                  <motion.div
                    key={r._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="p-2 bg-slate-100 rounded-xl shrink-0">
                      <ShieldCheck size={14} className="text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        Risk Check — {new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{r.report || 'No report text'}</p>
                    </div>
                    {r.riskLevel && (
                      <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border shrink-0 ${SEVERITY[r.riskLevel]?.badge || ''}`}>
                        {r.riskLevel}
                      </span>
                    )}
                    <button
                      onClick={(e) => handleDeleteML(e, r._id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* ── PDF Reports Table ── */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <FileText size={13} className="text-teal-600" /> PDF Reports
              </h2>
              <NavLink to="/upload-pdf"
                className="flex items-center gap-1 text-teal-600 text-[10px] font-semibold hover:underline">
                <Plus size={11} /> Upload PDF
              </NavLink>
            </div>

            {reportsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={20} className="text-teal-600 animate-spin" />
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-10">
                <FileText size={28} className="text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400 mb-1">No PDF reports yet</p>
                <NavLink to="/upload-pdf"
                  className="inline-flex items-center gap-1.5 mt-2 bg-teal-600 text-white text-xs font-semibold px-4 py-2 rounded-xl">
                  <Upload size={12} /> Upload PDF
                </NavLink>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {reports.map((r, i) => (
                  <motion.div
                    key={r._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <NavLink
                      to={`/analysis/${r._id}`}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="p-2 bg-slate-100 rounded-xl shrink-0">
                        <FileText size={14} className="text-teal-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{r.reportName}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                          {r.mlRiskLevel && <span className="ml-1">· ML included</span>}
                        </p>
                      </div>
                      {r.severityLevel && (
                        <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border shrink-0 ${SEVERITY[r.severityLevel]?.badge || ''}`}>
                          {r.severityLevel}
                        </span>
                      )}
                      {r.mlRiskLevel && (
                        <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border shrink-0 ${SEVERITY[r.mlRiskLevel]?.badge || ''}`}>
                          ML: {r.mlRiskLevel}
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleDeletePdf(e, r._id)}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-teal-600 transition-colors" />
                      </div>
                    </NavLink>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

function SidebarLink({ icon, label, active = false }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all
      ${active
        ? 'bg-teal-50 text-teal-700 border border-teal-100'
        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800'
      }`}>
      {icon}
      <span className="hidden md:block text-xs font-semibold uppercase tracking-widest">{label}</span>
    </div>
  );
}