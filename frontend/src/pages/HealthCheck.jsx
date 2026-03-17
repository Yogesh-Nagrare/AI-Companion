// src/pages/HealthCheck.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeWithML, resetMLAnalysis } from '../redux/healthSlice';
import {
  HeartPulse, Sparkles, Loader2, AlertCircle,
  ArrowLeft, Activity, CheckCircle2, FileText,
} from 'lucide-react';

const SYMPTOMS = [
  "Fatigue / Low energy",
  "Polyuria (frequent urination)",
  "Polydipsia (excessive thirst)",
  "Blurred vision",
  "Slow healing wounds",
  "Unexplained weight loss",
  "Numbness in hands/feet",
  "Frequent infections",
];

const PIPELINE_STEPS = [
  { id: 1, label: 'Analyze report',  desc: 'Validating lab parameters'        },
  { id: 2, label: 'Predict risk',    desc: 'ML model scoring'                  },
  { id: 3, label: 'Check symptoms',  desc: 'Mapping symptom patterns'          },
  { id: 4, label: 'Merge results',   desc: 'Fusing all signals'                },
  { id: 5, label: 'Generate alert',  desc: 'Creating patient report'           },
];

export default function HealthCheck() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { mlAnalysisLoading, mlAnalysisResult, mlAnalysisError, pdfExtractedData } =
    useSelector((s) => s.health);

  // Pre-fill from PDF extraction
  const [form, setForm] = useState({
    hba1c:       pdfExtractedData?.hba1c    ? String(pdfExtractedData.hba1c)    : '',
    glucose:     pdfExtractedData?.glucose  ? String(pdfExtractedData.glucose)  : '',
    bmi:         pdfExtractedData?.bmi      ? String(pdfExtractedData.bmi)      : '',
    age:         pdfExtractedData?.age      ? String(pdfExtractedData.age)      : '',
    manual_text: '',
  });
  const [symptoms,   setSymptoms]   = useState([]);
  const [localError, setLocalError] = useState('');
  const [activeStep, setActiveStep] = useState(0); // fake pipeline progress

  // If PDF data loaded after mount, update form
  useEffect(() => {
    if (pdfExtractedData) {
      setForm((prev) => ({
        ...prev,
        hba1c:   pdfExtractedData.hba1c   ? String(pdfExtractedData.hba1c)   : prev.hba1c,
        glucose: pdfExtractedData.glucose ? String(pdfExtractedData.glucose) : prev.glucose,
        bmi:     pdfExtractedData.bmi     ? String(pdfExtractedData.bmi)     : prev.bmi,
        age:     pdfExtractedData.age     ? String(pdfExtractedData.age)     : prev.age,
      }));
    }
  }, [pdfExtractedData]);

  // Animate pipeline steps while loading
  useEffect(() => {
    if (!mlAnalysisLoading) { setActiveStep(0); return; }
    setActiveStep(1);
    const timers = [1,2,3,4].map((step, i) =>
      setTimeout(() => setActiveStep(step + 1), (i + 1) * 2200)
    );
    return () => timers.forEach(clearTimeout);
  }, [mlAnalysisLoading]);

  // Redirect to /result/:id when ML analysis completes
  useEffect(() => {
    if (mlAnalysisResult?.reportId) {
      const timer = setTimeout(() => {
        navigate(`/result/${mlAnalysisResult.reportId}`);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [mlAnalysisResult, navigate]);

  // Reset ML state on unmount
  useEffect(() => {
    return () => dispatch(resetMLAnalysis());
  }, [dispatch]);

  const toggleSymptom = (s) =>
    setSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!form.hba1c || !form.glucose || !form.bmi || !form.age) {
      setLocalError('Please fill in all required fields.');
      return;
    }
    dispatch(analyzeWithML({
      hba1c:       parseFloat(form.hba1c),
      glucose:     parseFloat(form.glucose),
      bmi:         parseFloat(form.bmi),
      age:         parseInt(form.age),
      symptoms,
      manual_text: form.manual_text || undefined,
    }));
  };

  const fromPdf = !!pdfExtractedData;

  return (
    <div className="min-h-screen bg-[#05080a] text-slate-200 font-sans relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[150px]" />
      </div>

      <header className="relative z-10 px-6 py-5 flex items-center justify-between border-b border-white/5">
        <NavLink to="/dashboard" className="flex items-center gap-2.5">
          <div className="bg-gradient-to-br from-teal-400 to-emerald-600 p-2 rounded-xl text-black">
            <HeartPulse size={18} strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold text-white">VITA<span className="text-teal-400">AI</span></span>
        </NavLink>
        <NavLink to={fromPdf ? '/upload-pdf' : '/dashboard'}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">
          <ArrowLeft size={13} /> {fromPdf ? 'Back to Upload' : 'Dashboard'}
        </NavLink>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-10 space-y-6">

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2">
          {['Upload PDF', 'Add Symptoms', 'View Result'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                ${i === 0 ? 'bg-teal-500/10 border border-teal-500/20 text-teal-600 line-through opacity-50' : ''}
                ${i === 1 ? 'bg-teal-500/20 border border-teal-500/40 text-teal-400' : ''}
                ${i === 2 ? 'bg-white/5 border border-white/10 text-slate-600' : ''}`}>
                {i === 0 ? <CheckCircle2 size={10} /> : <span>{i + 1}</span>} {s}
              </div>
              {i < 2 && <div className="w-4 h-px bg-white/10" />}
            </div>
          ))}
        </div>

        {/* PDF source banner */}
        {fromPdf && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
            className="flex items-center gap-3 p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl">
            <FileText size={14} className="text-teal-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-teal-300">Lab values extracted from PDF</p>
              <p className="text-[11px] text-teal-500 truncate">{pdfExtractedData.reportName}</p>
            </div>
            <span className="text-[10px] text-teal-500 font-semibold uppercase tracking-wider">Pre-filled</span>
          </motion.div>
        )}

        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold uppercase tracking-wider mb-3">
            <Activity size={11} /> Step 2 — Add symptoms
          </div>
          <h1 className="text-3xl font-semibold text-white">
            Health <span className="text-teal-400">Risk Check</span>
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            {fromPdf ? 'Verify your lab values and select any symptoms.' : 'Enter your lab values and select any symptoms.'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-[#0a0f12]/80 border border-white/5 rounded-[32px] backdrop-blur-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Lab Values */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                Lab Values {fromPdf && <span className="text-teal-500 normal-case font-normal ml-1">(extracted from PDF — verify before submitting)</span>}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'hba1c',   label: 'HbA1c (%)',      placeholder: 'e.g. 6.8', hint: 'Normal: below 5.7%'   },
                  { key: 'glucose', label: 'Glucose (mg/dL)', placeholder: 'e.g. 148', hint: 'Fasting normal: 70–99' },
                  { key: 'bmi',     label: 'BMI',             placeholder: 'e.g. 29',  hint: 'Normal: 18.5–24.9'    },
                  { key: 'age',     label: 'Age (years)',     placeholder: 'e.g. 45',  hint: ''                      },
                ].map(({ key, label, placeholder, hint }) => (
                  <div key={key}>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                      {label} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number" step="any"
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      placeholder={placeholder}
                      disabled={mlAnalysisLoading}
                      className={`w-full bg-slate-900/50 border rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-teal-500/10 transition-all placeholder:text-slate-600 disabled:opacity-50
                        ${fromPdf && form[key] ? 'border-teal-500/30 focus:border-teal-500/50' : 'border-white/10 focus:border-teal-500/50'}`}
                    />
                    {hint && <p className="text-[10px] text-slate-600 mt-1">{hint}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                Symptoms <span className="text-slate-600 normal-case font-normal">(select all that apply)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SYMPTOMS.map((s) => (
                  <button key={s} type="button" onClick={() => toggleSymptom(s)}
                    disabled={mlAnalysisLoading}
                    className={`text-left px-3 py-2.5 rounded-xl border text-[11px] font-medium transition-all disabled:opacity-40
                      ${symptoms.includes(s)
                        ? 'border-teal-500/50 bg-teal-500/10 text-teal-300'
                        : 'border-white/10 bg-slate-900/30 text-slate-400 hover:border-white/20'}`}>
                    {symptoms.includes(s) ? '✓ ' : ''}{s}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                Clinical Notes <span className="text-slate-600 normal-case font-normal">(optional)</span>
              </label>
              <textarea value={form.manual_text} onChange={(e) => setForm({ ...form, manual_text: e.target.value })}
                placeholder="e.g. Family history of diabetes, current medications..."
                rows={3} disabled={mlAnalysisLoading}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-teal-500/50 transition-all placeholder:text-slate-600 resize-none disabled:opacity-50" />
            </div>

            {/* Error */}
            {(localError || mlAnalysisError) && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">{localError || mlAnalysisError}</p>
              </div>
            )}

            {/* Pipeline progress while loading */}
            <AnimatePresence>
              {mlAnalysisLoading && (
                <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                  className="space-y-2 overflow-hidden bg-slate-900/40 rounded-2xl p-4 border border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Running ML Pipeline...</p>
                  {PIPELINE_STEPS.map((step) => {
                    const done    = step.id < activeStep;
                    const current = step.id === activeStep;
                    return (
                      <div key={step.id} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px]
                          ${done    ? 'bg-teal-500 text-white'                              : ''}
                          ${current ? 'bg-teal-500/20 border border-teal-500/50'            : ''}
                          ${!done && !current ? 'bg-slate-800 border border-white/10'       : ''}`}>
                          {done    && <CheckCircle2 size={11} className="text-white" />}
                          {current && <Loader2 size={10} className="text-teal-400 animate-spin" />}
                        </div>
                        <div className="flex-1">
                          <span className={`text-[11px] font-semibold ${current ? 'text-teal-400' : done ? 'text-slate-400' : 'text-slate-600'}`}>
                            {step.label}
                          </span>
                          {current && <span className="text-[10px] text-slate-500 ml-2">{step.desc}</span>}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success redirect indicator */}
            <AnimatePresence>
              {mlAnalysisResult && (
                <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                  className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Analysis complete!</p>
                    <p className="text-[11px] text-emerald-500 mt-0.5">Loading your results...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" disabled={mlAnalysisLoading || !!mlAnalysisResult}
              className="w-full bg-teal-500 hover:bg-teal-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-bold text-[11px] uppercase tracking-[0.2em] py-4 rounded-xl transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2">
              {mlAnalysisLoading
                ? <><Loader2 size={15} className="animate-spin" /> Running ML Pipeline...</>
                : <><Sparkles size={15} /> Run Full Analysis</>
              }
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}