// src/pages/UploadPdf.jsx
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import {
  HeartPulse, FileText, Upload, X, CheckCircle2,
  Loader2, Sparkles, ArrowLeft, AlertCircle,
} from 'lucide-react';
import {
  getUploadSignature,
  uploadToCloudinary,
  analyzePdf,
  resetUpload,
  setUploadProgress,
} from '../redux/healthSlice';
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";
<<<<<<< HEAD
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

=======
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.min.mjs`;
>>>>>>> 2521827850d11c527a3dac8cfef97e2f5624a469
const STEPS = [
  { id: 'signing',    label: 'Getting credentials'  },
  { id: 'uploading',  label: 'Uploading to cloud'    },
  { id: 'extracting', label: 'Reading PDF text'      },
  { id: 'analyzing',  label: 'Extracting lab values' },
];

const stepIndex = (step) => STEPS.findIndex((s) => s.id === step);

export default function UploadPdf() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { uploadStep, uploadProgress, uploadError, currentAnalysis } = useSelector((s) => s.health);

  const [file, setFile]           = useState(null);
  const [reportName, setReportName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState('');
  const [pdfPreview, setPdfPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    dispatch(resetUpload());
    return () => dispatch(resetUpload());
  }, [dispatch]);

  // 🆕 After done → go to health-check (not analysis page)
  useEffect(() => {
    if (uploadStep === 'done' && currentAnalysis?.reportId) {
      const timer = setTimeout(() => navigate('/health-check'), 900);
      return () => clearTimeout(timer);
    }
  }, [uploadStep, currentAnalysis, navigate]);

  const validateFile = (f) => {
    if (!f) return 'No file selected';
    if (f.type !== 'application/pdf') return 'Only PDF files are supported';
    if (f.size > 20 * 1024 * 1024) return 'File must be under 20MB';
    return null;
  };

  const generatePdfPreview = async (f) => {
    try {
      const arrayBuffer = await f.arrayBuffer();
      const pdf  = await getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas  = document.createElement('canvas');
      canvas.width  = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
      setPdfPreview(canvas.toDataURL('image/png'));
    } catch {
      setPdfPreview(null);
    }
  };

  const handleFileSelect = (selected) => {
    const err = validateFile(selected);
    if (err) { setLocalError(err); return; }
    setLocalError('');
    setFile(selected);
    generatePdfPreview(selected);
    setReportName((prev) =>
      prev ? prev : selected.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ')
    );
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFileSelect(dropped);
  }, []); // eslint-disable-line

  const onDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false); };

  const handleAnalyze = async () => {
    if (!file) return;
    setLocalError('');

    const sigResult = await dispatch(getUploadSignature());
    if (getUploadSignature.rejected.match(sigResult)) return;

    const uploadResult = await dispatch(uploadToCloudinary({
      file,
      signatureData: sigResult.payload,
      onProgress: (pct) => dispatch(setUploadProgress(pct)),
    }));
    if (uploadToCloudinary.rejected.match(uploadResult)) return;

    const cd = uploadResult.payload;
    if (!cd?.public_id || !cd?.secure_url) {
      setLocalError('Upload succeeded but Cloudinary returned unexpected data. Please retry.');
      return;
    }

    dispatch(analyzePdf({
      cloudinaryPublicId: cd.public_id,
      secureUrl: cd.secure_url,
      reportName: reportName.trim() || file.name,
    }));
  };

  const isProcessing   = ['signing','uploading','extracting','analyzing'].includes(uploadStep);
  const error          = localError || (uploadStep === 'error' ? uploadError : null);
  const currentStepIdx = stepIndex(uploadStep);

  return (
    <div className="min-h-screen bg-[#05080a] text-slate-200 font-sans relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-emerald-600/5 rounded-full blur-[120px]" />
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

      <main className="relative z-10 max-w-xl mx-auto px-6 py-12">

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['Upload PDF', 'Add Symptoms', 'View Result'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                ${i === 0 ? 'bg-teal-500/20 border border-teal-500/40 text-teal-400' : 'bg-white/5 border border-white/10 text-slate-600'}`}>
                <span>{i + 1}</span> {s}
              </div>
              {i < 2 && <div className="w-4 h-px bg-white/10" />}
            </div>
          ))}
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold uppercase tracking-wider mb-4">
            <Sparkles size={11} /> Step 1 — Upload your lab report
          </div>
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            Upload Health <span className="text-teal-400">Report</span>
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
            We'll extract your lab values automatically, then you add symptoms on the next step.
          </p>
        </div>

        <div className="bg-[#0a0f12]/80 border border-white/5 rounded-[32px] backdrop-blur-xl p-8 space-y-6">

          {/* Drop zone */}
          <div
            onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={[
              'border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer',
              isDragging              ? 'border-teal-500 bg-teal-500/5 scale-[1.01]' : '',
              file && !isDragging     ? 'border-teal-500/40 bg-teal-500/5'           : '',
              !file && !isDragging    ? 'border-white/10 hover:border-white/20 bg-black/20' : '',
              isProcessing            ? 'pointer-events-none opacity-60'              : '',
            ].join(' ')}
          >
            <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }} />

            <AnimatePresence mode="wait">
              {file ? (
                <motion.div key="file" initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.9 }}
                  className="flex flex-col items-center gap-3 text-center">
                  <div className="p-4 bg-teal-500/10 rounded-2xl border border-teal-500/20 flex items-center justify-center">
                    {pdfPreview
                      ? <img src={pdfPreview} alt="preview" className="w-16 h-20 object-contain rounded-md shadow-md" />
                      : <FileText size={32} className="text-teal-400" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{file.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{(file.size / (1024*1024)).toFixed(2)} MB · PDF</p>
                  </div>
                  {!isProcessing && (
                    <button onClick={(e) => {
                      e.stopPropagation();
                      setFile(null); setReportName(''); setLocalError(''); setPdfPreview(null);
                      dispatch(resetUpload());
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }} className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest font-bold">
                      <X size={11} /> Remove
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  className="flex flex-col items-center gap-3 text-center">
                  <div className={`p-4 rounded-2xl border transition-all ${isDragging ? 'bg-teal-500/10 border-teal-500/30' : 'bg-slate-900 border-white/5'}`}>
                    <Upload size={30} className={isDragging ? 'text-teal-400' : 'text-slate-500'} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{isDragging ? 'Drop your PDF here' : 'Drag & drop or click to browse'}</p>
                    <p className="text-xs text-slate-500 mt-1">PDF only · Max 20MB</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Report name */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Report Name <span className="text-slate-600 normal-case font-normal">(optional)</span>
            </label>
            <input type="text" value={reportName} onChange={(e) => setReportName(e.target.value)}
              placeholder="e.g. HbA1c Test — January 2025" disabled={isProcessing}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/10 transition-all placeholder:text-slate-600 disabled:opacity-50" />
          </div>

          {/* Progress steps */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                className="space-y-3 overflow-hidden pt-2">
                {STEPS.map((step, i) => {
                  const done    = i < currentStepIdx;
                  const current = step.id === uploadStep;
                  return (
                    <div key={step.id} className="flex items-center gap-3">
                      <div className={['w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all',
                        done    ? 'bg-teal-500'                               : '',
                        current ? 'bg-teal-500/15 border border-teal-500/50'  : '',
                        !done && !current ? 'bg-slate-800 border border-white/10' : '',
                      ].join(' ')}>
                        {done    && <CheckCircle2 size={13} className="text-black" />}
                        {current && <Loader2 size={12} className="text-teal-400 animate-spin" />}
                        {!done && !current && <span className="w-1.5 h-1.5 rounded-full bg-slate-600 block" />}
                      </div>
                      <span className={['text-[11px] font-bold uppercase tracking-widest transition-colors',
                        current ? 'text-teal-400' : done ? 'text-slate-400' : 'text-slate-600',
                      ].join(' ')}>
                        {step.label}{step.id === 'uploading' && current && uploadProgress > 0 && ` · ${uploadProgress}%`}
                      </span>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Done */}
          <AnimatePresence>
            {uploadStep === 'done' && (
              <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Lab values extracted!</p>
                  <p className="text-[11px] text-emerald-500 mt-0.5">Taking you to add symptoms...</p>
                </div>
              </motion.div>
            )}
            {error && uploadStep !== 'done' && (
              <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs text-red-300">{error}</span>
                  <button onClick={() => { dispatch(resetUpload()); setLocalError(''); setPdfPreview(null); }}
                    className="block mt-2 text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-widest">
                    ↺ Try again
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button onClick={handleAnalyze} disabled={!file || isProcessing || uploadStep === 'done'}
            className="w-full bg-teal-500 hover:bg-teal-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-bold text-[11px] uppercase tracking-[0.2em] py-4 rounded-xl transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2">
            {isProcessing
              ? <><Loader2 size={15} className="animate-spin" /> Processing...</>
              : <><Sparkles size={15} /> Extract Lab Values</>
            }
          </button>
          <p className="text-center text-[10px] text-slate-600">PDF encrypted in transit · Takes 10–25 seconds</p>
        </div>
      </main>
    </div>
  );
}