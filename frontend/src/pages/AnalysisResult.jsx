// src/pages/AnalysisResult.jsx
// Fetches single report via Redux and renders the full Gemini analysis
// Accessed via /analysis/:id

import { useEffect } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  HeartPulse, ArrowLeft, AlertTriangle, CheckCircle2,
  Activity, Sparkles, ShieldAlert, Lightbulb,
  Eye, Trash2, Loader2, FileText,
} from 'lucide-react';
import { fetchReportById, deleteReport } from '../redux/healthSlice';

// ── Severity config ──
const SEV = {
  Low:      { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
  Moderate: { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   dot: 'bg-amber-500'   },
  High:     { color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20',  dot: 'bg-orange-500'  },
  Critical: { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     dot: 'bg-red-500'     },
};

const STATUS = {
  Normal:     { color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  Borderline: { color: 'text-amber-400',   bg: 'bg-amber-500/10'   },
  High:       { color: 'text-orange-400',  bg: 'bg-orange-500/10'  },
  Low:        { color: 'text-blue-400',    bg: 'bg-blue-500/10'    },
  Critical:   { color: 'text-red-400',     bg: 'bg-red-500/10'     },
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-[#0a0f12]/80 border border-white/5 rounded-[24px] backdrop-blur-xl p-6 ${className}`}>
    {children}
  </div>
);

const Section = ({ icon, label }) => (
  <h3 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-5">
    <span className="text-teal-500">{icon}</span> {label}
  </h3>
);

export default function AnalysisResult() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { activeReport, activeReportLoading, activeReportError } = useSelector((s) => s.health);

  useEffect(() => {
    dispatch(fetchReportById(id));
  }, [id, dispatch]);

  const handleDelete = async () => {
    if (!confirm('Delete this report permanently?')) return;
    await dispatch(deleteReport(id));
    navigate('/dashboard');
  };

  // ── Loading ──
  if (activeReportLoading) return (
    <div className="min-h-screen bg-[#05080a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={30} className="text-teal-500 animate-spin" />
        <p className="text-slate-500 text-[10px] uppercase tracking-widest">Loading analysis...</p>
      </div>
    </div>
  );

  // ── Error ──
  if (activeReportError || !activeReport) return (
    <div className="min-h-screen bg-[#05080a] flex items-center justify-center">
      <div className="text-center space-y-4">
        <AlertTriangle size={36} className="text-red-400 mx-auto" />
        <p className="text-slate-300 text-sm">{activeReportError || 'Report not found'}</p>
        <NavLink to="/dashboard" className="text-teal-400 text-xs hover:underline block">← Back to dashboard</NavLink>
      </div>
    </div>
  );

  const { reportName, createdAt, severityLevel, aiAnalysis: a, secureUrl } = activeReport;
  const sev = SEV[severityLevel] || SEV.Low;
  const dateStr = new Date(createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#05080a] text-slate-200 font-sans relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-teal-500/3 rounded-full blur-[180px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between border-b border-white/5">
        <NavLink to="/dashboard" className="flex items-center gap-2.5">
          <div className="bg-gradient-to-br from-teal-400 to-emerald-600 p-2 rounded-xl text-black shadow-[0_0_15px_rgba(45,212,191,0.25)]">
            <HeartPulse size={18} strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">VITA<span className="text-teal-400">AI</span></span>
        </NavLink>
        <NavLink to="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">
          <ArrowLeft size={13} /> Dashboard
        </NavLink>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-10 space-y-6 pb-16">

        {/* Report header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{dateStr}</p>
            <h1 className="text-2xl font-semibold text-white">{reportName}</h1>
            <div className={`inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${sev.bg} ${sev.border} ${sev.color}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
              {severityLevel} Risk
            </div>
          </div>
          <div className="flex items-center gap-3">
            {secureUrl && (
              <a href={secureUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-300 transition-colors">
                <FileText size={13} /> View PDF
              </a>
            )}
            <button onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-red-400 transition-colors">
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <Card>
            <Section icon={<Sparkles size={13} />} label="AI Summary" />
            <p className="text-slate-200 leading-relaxed text-sm">{a?.summary || 'No summary available.'}</p>
          </Card>
        </motion.div>

        {/* Plain English */}
        {a?.simpleExplanation && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <Card className="border-teal-500/10">
              <Section icon={<Eye size={13} />} label="Plain English" />
              <p className="text-slate-300 leading-relaxed text-sm">{a.simpleExplanation}</p>
            </Card>
          </motion.div>
        )}

        {/* Key Findings */}
        {a?.keyFindings?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
            <Card>
              <Section icon={<Activity size={13} />} label="Key Health Markers" />
              <div className="space-y-3">
                {a.keyFindings.map((f, i) => {
                  const sc = STATUS[f.status] || STATUS.Normal;
                  return (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-slate-900/50 border border-white/5 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-white">{f.marker}</span>
                          {f.status && (
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>
                              {f.status}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{f.interpretation}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-mono font-bold text-white">{f.value ?? '—'}</p>
                        {f.normalRange && <p className="text-[10px] text-slate-500">Normal: {f.normalRange}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Risk + Warnings — 2-col */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {a?.riskFactors?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="h-full">
                <Section icon={<ShieldAlert size={13} />} label="Risk Factors" />
                <ul className="space-y-2.5">
                  {a.riskFactors.map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          )}
          {a?.warningSigns?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
              <Card className="h-full border-red-500/10">
                <Section icon={<AlertTriangle size={13} />} label="Warning Signs" />
                <ul className="space-y-2.5">
                  {a.warningSigns.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-300">
                      <AlertTriangle size={12} className="text-red-400 mt-0.5 flex-shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Recommendations */}
        {a?.recommendations?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
            <Card>
              <Section icon={<Lightbulb size={13} />} label="Recommendations" />
              <div className="space-y-3">
                {a.recommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-teal-500/5 border border-teal-500/10">
                    <div className="w-6 h-6 rounded-lg bg-teal-500/20 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-teal-400">
                      {i + 1}
                    </div>
                    <p className="text-sm text-slate-200">{r}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Disclaimer */}
        {a?.disclaimer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.32 }}>
            <div className="p-4 border border-white/5 rounded-xl">
              <p className="text-[11px] text-slate-500 text-center leading-relaxed">{a.disclaimer}</p>
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.36 }} className="text-center">
          <NavLink to="/upload-pdf"
            className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-black font-bold text-[11px] uppercase tracking-[0.2em] px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-teal-500/20">
            <Sparkles size={14} /> Analyze Another Report
          </NavLink>
        </motion.div>

      </main>
    </div>
  );
}