// src/pages/FinalResult.jsx
// Accessed via /result/:id
// Shows complete output: ML risk pipeline + Gemini PDF analysis

import { useEffect } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  HeartPulse, ArrowLeft, AlertTriangle, CheckCircle2,
  Activity, Sparkles, ShieldAlert, Lightbulb,
  Eye, Trash2, Loader2, FileText, AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { fetchMLReportById, deleteMLReport } from '../redux/healthSlice';

const SEV = {
  Low:      { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-500', ring: '#10b981' },
  Moderate: { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   dot: 'bg-amber-500',   ring: '#f59e0b' },
  High:     { color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20',  dot: 'bg-orange-500',  ring: '#f97316' },
  Critical: { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     dot: 'bg-red-500',     ring: '#ef4444' },
};

const GEMINI_STATUS = {
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

const SectionHead = ({ icon, label }) => (
  <h3 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-5">
    <span className="text-teal-500">{icon}</span> {label}
  </h3>
);

export default function FinalResult() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { activeMLReport, activeMLReportLoading, mlAnalysisResult } = useSelector((s) => s.health);

  useEffect(() => {
    if (id) dispatch(fetchMLReportById(id));
  }, [id, dispatch]);

  // Use fetched report OR fallback to in-memory result if just analyzed
  const report = activeMLReport || (mlAnalysisResult?.reportId === id ? mlAnalysisResult : null);

  const handleDelete = async () => {
    if (!confirm('Delete this analysis permanently?')) return;
    await dispatch(deleteMLReport(id));
    navigate('/dashboard');
  };

  if (activeMLReportLoading) return (
    <div className="min-h-screen bg-[#05080a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={30} className="text-teal-500 animate-spin" />
        <p className="text-slate-500 text-[10px] uppercase tracking-widest">Loading results...</p>
      </div>
    </div>
  );

  if (!report) return (
    <div className="min-h-screen bg-[#05080a] flex items-center justify-center">
      <div className="text-center space-y-4">
        <AlertTriangle size={36} className="text-red-400 mx-auto" />
        <p className="text-slate-300 text-sm">Result not found</p>
        <NavLink to="/dashboard" className="text-teal-400 text-xs hover:underline block">← Back to dashboard</NavLink>
      </div>
    </div>
  );

  const riskLevel  = report.riskLevel  || report.risk_level;
  const alert      = report.alert;
  const mlReport   = report.report;
  const fa         = report.finalAssessment || report.final_assessment || {};
  const input      = report.inputData  || {};
  const gemini     = report.aiAnalysis || null; // from PDF flow if available
  const sev        = SEV[riskLevel] || SEV.Low;
  const createdAt  = report.createdAt  ? new Date(report.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
  const ringScore  = Math.round((fa.score || 0) * 100);
  const circumference = 2 * Math.PI * 38;
  const dashOffset = circumference - (circumference * (fa.score || 0));

  return (
    <div className="min-h-screen bg-[#05080a] text-slate-200 font-sans relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-teal-500/3 rounded-full blur-[180px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/3 rounded-full blur-[180px]" />
      </div>

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

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-10 space-y-6 pb-20">

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2">
          {['Upload PDF', 'Add Symptoms', 'View Result'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                ${i < 2  ? 'bg-teal-500/10 border border-teal-500/20 text-teal-600 opacity-50' : ''}
                ${i === 2 ? 'bg-teal-500/20 border border-teal-500/40 text-teal-400'            : ''}`}>
                {i < 2 ? <CheckCircle2 size={10} /> : <span>3</span>} {s}
              </div>
              {i < 2 && <div className="w-4 h-px bg-white/10" />}
            </div>
          ))}
        </div>

        {/* ── HERO: Risk + Score ── */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Risk card */}
          <Card className={`${sev.border}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{createdAt}</p>
                <h1 className="text-2xl font-semibold text-white">Analysis Result</h1>
              </div>
              <button onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-[10px] font-bold text-red-400 transition-colors">
                <Trash2 size={11} /> Delete
              </button>
            </div>

            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold uppercase tracking-wider mb-5 ${sev.bg} ${sev.border} ${sev.color}`}>
              <div className={`w-2 h-2 rounded-full ${sev.dot}`} />
              {riskLevel} Risk
            </div>

            {alert && (
              <div className="flex gap-2.5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
                <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300 leading-relaxed font-medium">
                  ⚠️ Alert triggered — please consult a healthcare professional soon.
                </p>
              </div>
            )}

            {mlReport && (
              <div className="p-4 bg-teal-500/5 border border-teal-500/10 rounded-xl">
                <p className="text-sm text-slate-200 leading-relaxed">{mlReport}</p>
              </div>
            )}
          </Card>

          {/* Score breakdown */}
          <Card>
            <SectionHead icon={<Activity size={13} />} label="Score breakdown" />
            <div className="flex items-center gap-5 mb-5">
              <svg width="90" height="90" viewBox="0 0 90 90">
                <circle cx="45" cy="45" r="38" fill="none" stroke="#1e293b" strokeWidth="7" />
                <circle cx="45" cy="45" r="38" fill="none"
                  stroke={sev.ring} strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={circumference} strokeDashoffset={dashOffset}
                  style={{ transform:'rotate(-90deg)', transformOrigin:'45px 45px', transition:'stroke-dashoffset .8s ease' }} />
                <text x="45" y="50" textAnchor="middle"
                  style={{ fontSize:18, fontWeight:500, fill:'white', fontFamily:'inherit' }}>
                  {ringScore}%
                </text>
              </svg>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Final fused score</p>
                <p className="text-[11px] text-slate-500">ML×0.6 + labs×0.3 + symptoms×0.1</p>
              </div>
            </div>

            {[
              { label: 'ML Probability',  val: Math.round((fa.ml_probability || 0) * 100),                              color: 'bg-teal-500'   },
              { label: 'Abnormal labs',   val: Math.min(Math.round(((fa.abnormal_count || 0) / 3) * 100), 100),         color: 'bg-amber-400'  },
              { label: 'Symptom score',   val: Math.round((fa.symptom_score || 0) * 100),                               color: 'bg-indigo-400' },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex items-center gap-2 mb-2.5">
                <span className="text-[11px] text-slate-400 w-28 shrink-0">{label}</span>
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${color}`} style={{ width:`${val}%` }} />
                </div>
                <span className="text-[11px] text-slate-400 w-9 text-right">{val}%</span>
              </div>
            ))}

            {/* Input values used */}
            {Object.keys(input).length > 0 && (
              <div className="mt-4 p-3 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">Values used</p>
                <div className="grid grid-cols-2 gap-2">
                  {['hba1c','glucose','bmi','age'].filter(k => input[k]).map((k) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-[11px] text-slate-500 uppercase">{k}</span>
                      <span className="text-[11px] text-slate-300 font-mono">{input[k]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* ── Gemini PDF Analysis (if available) ── */}
        {gemini && (
          <>
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3">PDF Analysis (Gemini)</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {gemini.summary && (
              <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}>
                <Card>
                  <SectionHead icon={<Sparkles size={13} />} label="AI Summary" />
                  <p className="text-slate-200 leading-relaxed text-sm">{gemini.summary}</p>
                </Card>
              </motion.div>
            )}

            {gemini.simpleExplanation && (
              <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.12 }}>
                <Card className="border-teal-500/10">
                  <SectionHead icon={<Eye size={13} />} label="Plain English" />
                  <p className="text-slate-300 leading-relaxed text-sm">{gemini.simpleExplanation}</p>
                </Card>
              </motion.div>
            )}

            {gemini.keyFindings?.length > 0 && (
              <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.16 }}>
                <Card>
                  <SectionHead icon={<Activity size={13} />} label="Key Health Markers" />
                  <div className="space-y-3">
                    {gemini.keyFindings.map((f, i) => {
                      const sc = GEMINI_STATUS[f.status] || GEMINI_STATUS.Normal;
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
                          <div className="text-right shrink-0">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gemini.riskFactors?.length > 0 && (
                <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
                  <Card className="h-full">
                    <SectionHead icon={<ShieldAlert size={13} />} label="Risk Factors" />
                    <ul className="space-y-2.5">
                      {gemini.riskFactors.map((r, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </motion.div>
              )}
              {gemini.warningSigns?.length > 0 && (
                <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.24 }}>
                  <Card className="h-full border-red-500/10">
                    <SectionHead icon={<AlertTriangle size={13} />} label="Warning Signs" />
                    <ul className="space-y-2.5">
                      {gemini.warningSigns.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-red-300">
                          <AlertTriangle size={12} className="text-red-400 mt-0.5 shrink-0" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </motion.div>
              )}
            </div>
          </>
        )}

        {/* ── Recommendations (ML or Gemini) ── */}
        {gemini?.recommendations?.length > 0 && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.28 }}>
            <Card>
              <SectionHead icon={<Lightbulb size={13} />} label="Recommendations" />
              <div className="space-y-3">
                {gemini.recommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-teal-500/5 border border-teal-500/10">
                    <div className="w-6 h-6 rounded-lg bg-teal-500/20 flex items-center justify-center shrink-0 text-[10px] font-bold text-teal-400">
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
        {gemini?.disclaimer && (
          <div className="p-4 border border-white/5 rounded-xl">
            <p className="text-[11px] text-slate-500 text-center leading-relaxed">{gemini.disclaimer}</p>
          </div>
        )}

        {/* CTA */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <NavLink to="/upload-pdf"
            className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-black font-bold text-[11px] uppercase tracking-[0.2em] px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-teal-500/20">
            <FileText size={14} /> New Report
          </NavLink>
          <NavLink to="/health-check"
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-[11px] uppercase tracking-[0.2em] px-6 py-3.5 rounded-xl transition-all">
            <ShieldCheck size={14} /> New Risk Check
          </NavLink>
          <NavLink to="/dashboard"
            className="flex items-center justify-center gap-2 border border-white/10 hover:bg-white/5 text-slate-400 font-bold text-[11px] uppercase tracking-[0.2em] px-6 py-3.5 rounded-xl transition-all">
            <ArrowLeft size={14} /> Dashboard
          </NavLink>
        </motion.div>

      </main>
    </div>
  );
}