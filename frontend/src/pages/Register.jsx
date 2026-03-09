// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { Eye, EyeOff, HeartPulse, ChevronLeft, ShieldCheck, Activity } from 'lucide-react';
// import { useState, useEffect } from 'react';
// import { registerUser } from '../authSlice'; 
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate, NavLink } from 'react-router';
// import { motion } from 'framer-motion';

// const signupSchema = z.object({
//   firstName: z.string().min(3, 'Minimum 3 characters required'),
//   emailId: z.string().email('Invalid Email'),
//   password: z.string().min(8, 'Password must be at least 8 characters'),
// });

// function Signup() {
//   const [showPassword, setShowPassword] = useState(false);
//   const [serverError, setServerError] = useState(""); // ✅ FIX: inline error state instead of alert()
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { isAuthenticated, loading } = useSelector((state) => state.auth);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({
//     resolver: zodResolver(signupSchema),
//   });

//   // ✅ FIX: If already authenticated (e.g., user visits signup while logged in), redirect to dashboard
//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate("/");
//     }
//   }, [isAuthenticated, navigate]);

//   const onSubmit = (data) => {
//     setServerError(""); // clear previous errors
//     dispatch(registerUser(data))
//       .unwrap()
//       .then(() => {
//         // ✅ FIX: registerUser.fulfilled sets isAuthenticated=false (user must login).
//         // So navigate to /login, NOT to "/" — there's no session yet.
//         navigate("/login", { 
//           state: { message: "Account created! Please sign in." } // pass success message to login page
//         });
//       })
//       .catch((err) => {
//         // ✅ FIX: Show error inline instead of using alert()
//         setServerError(err?.message || err || "Registration failed. Please try again.");
//       }); 
//   };

//   return (
//     <div className="min-h-screen bg-[#05080a] text-slate-200 font-sans selection:bg-teal-500/30 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      
//       {/* Background Decor */}
//       <div className="fixed inset-0 pointer-events-none">
//         <div className="absolute top-1/4 -left-20 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] animate-pulse"></div>
//         <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1.5s'}}></div>
//       </div>

//       {/* Header / Logo */}
//       <header className="absolute top-0 left-0 w-full flex justify-between items-center px-6 py-6 md:px-12">
//         <NavLink to="/" className="flex items-center gap-2 group">
//           <div className="bg-gradient-to-br from-teal-400 to-emerald-600 p-2 rounded-xl text-black shadow-[0_0_15px_rgba(45,212,191,0.3)]">
//             <HeartPulse size={20} strokeWidth={2.5} />
//           </div>
//           <span className="text-xl font-bold text-white tracking-tight">VITA<span className="text-teal-400">AI</span></span>
//         </NavLink>
//         <NavLink to="/login" className="text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-teal-400 flex items-center gap-1 transition-colors">
//           Returning Patient? <span className="text-teal-500 ml-1">Login</span>
//         </NavLink>
//       </header>

//       <motion.div 
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6, ease: "easeOut" }}
//         className="w-full max-w-md z-10 py-12"
//       >
//         <div className="bg-[#0a0f12]/80 backdrop-blur-3xl border border-white/5 shadow-2xl rounded-[40px] p-8 md:p-10 relative">
//           {/* Subtle Top Border Glow */}
//           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-teal-500/50 to-transparent"></div>

//           <div className="mb-10 text-center">
//             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold uppercase tracking-wider mb-4">
//                <Activity size={12} /> HIPAA Compliant Encryption
//             </div>
//             <h2 className="text-3xl font-semibold text-white tracking-tight">
//               Your Health <span className="text-teal-400">Evolved.</span>
//             </h2>
//             <p className="text-slate-500 text-xs mt-3 leading-relaxed">
//               Join thousands using AI to personalize their wellness journey and medical insights.
//             </p>
//           </div>

//           {/* ✅ FIX: Inline server error banner — no more alert() */}
//           {serverError && (
//             <motion.div
//               initial={{ opacity: 0, y: -8 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[11px] font-medium text-center"
//             >
//               {serverError}
//             </motion.div>
//           )}

//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
//             {/* First Name */}
//             <div>
//               <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Full Name</label>
//               <input
//                 type="text"
//                 placeholder="Dr. John Doe"
//                 className={`w-full bg-slate-900/50 text-white rounded-2xl border px-4 py-3.5 text-sm transition-all duration-300
//                   ${errors.firstName ? 'border-red-500/50' : 'border-white/10 focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5'}`}
//                 {...register('firstName')}
//               />
//               {errors.firstName && <p className="text-red-400 text-[10px] font-medium mt-2 ml-1">{errors.firstName.message}</p>}
//             </div>

//             {/* Email */}
//             <div>
//               <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Medical Email</label>
//               <input
//                 type="email"
//                 placeholder="name@health-center.com"
//                 className={`w-full bg-slate-900/50 text-white rounded-2xl border px-4 py-3.5 text-sm transition-all duration-300
//                   ${errors.emailId ? 'border-red-500/50' : 'border-white/10 focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5'}`}
//                 {...register('emailId')}
//               />
//               {errors.emailId && <p className="text-red-400 text-[10px] font-medium mt-2 ml-1">{errors.emailId.message}</p>}
//             </div>

//             {/* Password */}
//             <div>
//               <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Secure Password</label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   placeholder="••••••••••••"
//                   className={`w-full bg-slate-900/50 text-white rounded-2xl border px-4 py-3.5 text-sm transition-all duration-300
//                     ${errors.password ? 'border-red-500/50' : 'border-white/10 focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5'}`}
//                   {...register('password')}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-teal-400 transition-colors"
//                 >
//                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>
//               {errors.password && <p className="text-red-400 text-[10px] font-medium mt-2 ml-1">{errors.password.message}</p>}
//             </div>

//             {/* Submit */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full rounded-2xl bg-teal-500 py-4 text-black font-bold text-xs uppercase tracking-[0.15em] hover:bg-teal-400 transition-all shadow-[0_10px_25px_rgba(20,184,166,0.2)] active:scale-[0.98] disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
//             >
//               {loading ? (
//                 'Initializing Profile...'
//               ) : (
//                 <>
//                   <ShieldCheck size={16} />
//                   Secure Registration
//                 </>
//               )}
//             </button>
//           </form>

//           {/* Verification Badge */}
//           <div className="mt-8 flex flex-col items-center gap-4">
//             <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
//             <p className="text-[10px] text-slate-500 leading-relaxed text-center px-4">
//               Your data is encrypted using AES-256. By proceeding, you agree to our 
//               <span className="text-slate-300 hover:text-teal-400 cursor-pointer transition-colors px-1">Health Data Protocols</span>.
//             </p>
//           </div>
//         </div>

//         {/* Back Link */}
//         <div className="mt-8 text-center">
//             <NavLink to="/" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center justify-center gap-1">
//                <ChevronLeft size={14} /> View Health Resources
//             </NavLink>
//         </div>
//       </motion.div>
//     </div>
//   );
// }

// export default Signup;

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, HeartPulse, ChevronLeft, ShieldCheck, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { registerUser } from '../authSlice'; 
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { motion } from 'framer-motion';

const signupSchema = z.object({
  firstName: z.string().min(3, 'Minimum 3 characters required'),
  emailId: z.string().email('Invalid Email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState(""); 
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    setServerError(""); 
    dispatch(registerUser(data))
      .unwrap()
      .then(() => {
        navigate("/", { 
          state: { message: "Account created! Please sign in." } 
        });
      })
      .catch((err) => {
        setServerError(err?.message || err || "Registration failed. Please try again.");
      }); 
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-teal-400/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>

      {/* Header / Logo */}
      <header className="absolute top-0 left-0 w-full flex justify-between items-center px-6 py-6 md:px-12">
        <NavLink to="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-2 rounded-xl text-white shadow-[0_5px_15px_rgba(20,184,166,0.3)]">
            <HeartPulse size={20} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">VITA<span className="text-teal-600">AI</span></span>
        </NavLink>
        <NavLink to="/login" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-teal-600 flex items-center gap-1 transition-colors">
          Returning Patient? <span className="text-teal-600 ml-1">Login</span>
        </NavLink>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md z-10 py-12"
      >
        <div className="bg-white/80 backdrop-blur-3xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[40px] p-8 md:p-10 relative">
          {/* Subtle Top Border Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-teal-400/50 to-transparent"></div>

          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-600 text-[10px] font-bold uppercase tracking-wider mb-4">
               <Activity size={12} /> HIPAA Compliant Encryption
            </div>
            <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">
              Your Health <span className="text-teal-600">Evolved.</span>
            </h2>
            <p className="text-slate-500 text-xs mt-3 leading-relaxed">
              Join thousands using AI to personalize their wellness journey and medical insights.
            </p>
          </div>

          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[11px] font-medium text-center"
            >
              {serverError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* First Name */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Full Name</label>
              <input
                type="text"
                placeholder="Dr. John Doe"
                className={`w-full bg-slate-50 text-slate-900 rounded-2xl border px-4 py-3.5 text-sm transition-all duration-300 outline-none
                  ${errors.firstName ? 'border-red-400' : 'border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5'}`}
                {...register('firstName')}
              />
              {errors.firstName && <p className="text-red-500 text-[10px] font-medium mt-2 ml-1">{errors.firstName.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Medical Email</label>
              <input
                type="email"
                placeholder="name@health-center.com"
                className={`w-full bg-slate-50 text-slate-900 rounded-2xl border px-4 py-3.5 text-sm transition-all duration-300 outline-none
                  ${errors.emailId ? 'border-red-400' : 'border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5'}`}
                {...register('emailId')}
              />
              {errors.emailId && <p className="text-red-500 text-[10px] font-medium mt-2 ml-1">{errors.emailId.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Secure Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  className={`w-full bg-slate-50 text-slate-900 rounded-2xl border px-4 py-3.5 text-sm transition-all duration-300 outline-none
                    ${errors.password ? 'border-red-400' : 'border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5'}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-[10px] font-medium mt-2 ml-1">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-teal-600 py-4 text-white font-bold text-xs uppercase tracking-[0.15em] hover:bg-teal-700 transition-all shadow-[0_10px_25px_rgba(13,148,136,0.2)] active:scale-[0.98] disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                'Initializing Profile...'
              ) : (
                <>
                  <ShieldCheck size={16} />
                  Secure Registration
                </>
              )}
            </button>
          </form>

          {/* Verification Badge */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-100 to-transparent"></div>
            <p className="text-[10px] text-slate-400 leading-relaxed text-center px-4">
              Your data is encrypted using AES-256. By proceeding, you agree to our 
              <span className="text-slate-600 font-semibold hover:text-teal-600 cursor-pointer transition-colors px-1 underline underline-offset-4 decoration-teal-500/20">Health Data Protocols</span>.
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
            <NavLink to="/" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors flex items-center justify-center gap-1">
               <ChevronLeft size={14} /> View Health Resources
            </NavLink>
        </div>
      </motion.div>
    </div>
  );
}

export default Signup;