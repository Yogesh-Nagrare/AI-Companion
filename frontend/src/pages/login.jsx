// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate, NavLink } from 'react-router'; 
// import { loginUser } from "../authSlice";
// import { useEffect, useState } from 'react';
// import { Eye, EyeOff, HeartPulse, ChevronLeft, ShieldCheck, Activity } from 'lucide-react';
// import { motion } from 'framer-motion';

// const loginSchema = z.object({
//   emailId: z.string().email("Invalid Email"),
//   password: z.string().min(8, "Password must be at least 8 characters") 
// });

// function Login() {
//   const [showPassword, setShowPassword] = useState(false);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { isAuthenticated, loading } = useSelector((state) => state.auth);
  
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({ resolver: zodResolver(loginSchema) });

//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate('/');
//     }
//   }, [isAuthenticated, navigate]);

//   const onSubmit = (data) => {
//     dispatch(loginUser(data));
//   };

//   return (
//     <div className="min-h-screen bg-[#05080a] text-slate-200 font-sans selection:bg-teal-500/30 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      
//       {/* Background Decor (Matching Health Theme) */}
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
//         <NavLink to="/" className="text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-white flex items-center gap-1 transition-colors">
//           <ChevronLeft size={14} /> Back to home
//         </NavLink>
//       </header>

//       <motion.div 
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6, ease: "easeOut" }}
//         className="w-full max-w-md z-10"
//       >
//         <div className="bg-[#0a0f12]/80 backdrop-blur-3xl border border-white/5 shadow-2xl rounded-[40px] p-8 md:p-10 relative">
//           {/* Subtle Top Border Glow */}
//           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-teal-500/50 to-transparent"></div>

//           <div className="mb-10 text-center md:text-left">
//             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold uppercase tracking-wider mb-4">
//                <Activity size={12} /> Secure Access
//             </div>
//             <h2 className="text-3xl font-semibold text-white tracking-tight">
//               Welcome <span className="text-teal-400">Back.</span>
//             </h2>
//             <p className="text-slate-500 text-xs mt-3 leading-relaxed">
//               Sign in to access your health records and AI diagnostics.
//             </p>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//             {/* Email */}
//             <div>
//               <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Medical Email</label>
//               <input
//                 type="email"
//                 placeholder="name@health-center.com"
//                 className={`w-full bg-slate-900/50 text-white rounded-2xl border px-4 py-3.5 text-sm transition-all duration-300
//                   ${errors.emailId ? 'border-red-500/50' : 'border-white/10 focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5'}
//                   outline-none placeholder:text-slate-700`}
//                 {...register('emailId')}
//               />
//               {errors.emailId && <p className="text-red-400 text-[10px] font-medium mt-2 ml-1">{errors.emailId.message}</p>}
//             </div>

//             {/* Password */}
//             <div>
//               <div className="flex justify-between items-center mb-2 ml-1">
//                 <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Security Password</label>
//                 <NavLink to="/forgot-password" size="xs" className="text-[10px] font-bold uppercase tracking-widest text-teal-500 hover:text-teal-400 transition-colors">
//                   Forgot?
//                 </NavLink>
//               </div>
//               <div className="relative">
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   placeholder="••••••••••••"
//                   className={`w-full bg-slate-900/50 text-white rounded-2xl border px-4 py-3.5 text-sm transition-all duration-300
//                     ${errors.password ? 'border-red-500/50' : 'border-white/10 focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5'}
//                     outline-none placeholder:text-slate-700`}
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
//                 'Authenticating...'
//               ) : (
//                 <>
//                   <ShieldCheck size={16} />
//                   Secure Sign In
//                 </>
//               )}
//             </button>
//           </form>

//           {/* Divider */}
//           <div className="flex items-center my-10">
//             <span className="flex-1 border-b border-white/5" />
//             <span className="mx-4 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Partner Portals</span>
//             <span className="flex-1 border-b border-white/5" />
//           </div>

//           {/* Footer */}
//           <p className="text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
//             New to Vita AI?{' '}
//             <NavLink to="/signup" className="text-white hover:text-teal-400 transition-colors underline underline-offset-8 decoration-teal-500/30">
//               Create Patient Account
//             </NavLink>
//           </p>
//         </div>
//       </motion.div>
      
//       {/* Disclaimer */}
//       <p className="mt-8 text-[10px] text-slate-600 uppercase tracking-widest font-medium">
//         Encrypted Endpoint: <span className="text-slate-500">v2.4.0-secure</span>
//       </p>
//     </div>
//   );
// }

// export default Login;

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router'; 
import { loginUser } from "../authSlice";
import { useEffect, useState } from 'react';
import { Eye, EyeOff, HeartPulse, ChevronLeft, ShieldCheck, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password must be at least 8 characters") 
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      
      {/* Background Decor (Light Theme) */}
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
        <NavLink to="/" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 flex items-center gap-1 transition-colors">
          <ChevronLeft size={14} /> Back to home
        </NavLink>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white/70 backdrop-blur-3xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[40px] p-8 md:p-10 relative">
          {/* Subtle Top Border Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-teal-400/50 to-transparent"></div>

          <div className="mb-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-600 text-[10px] font-bold uppercase tracking-wider mb-4">
               <Activity size={12} /> Secure Access
            </div>
            <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">
              Welcome <span className="text-teal-600">Back.</span>
            </h2>
            <p className="text-slate-500 text-xs mt-3 leading-relaxed">
              Sign in to access your health records and AI diagnostics.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Medical Email</label>
              <input
                type="email"
                placeholder="name@health-center.com"
                className={`w-full bg-slate-50 text-slate-900 rounded-2xl border px-4 py-3.5 text-sm transition-all duration-300
                  ${errors.emailId ? 'border-red-400' : 'border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5'}
                  outline-none placeholder:text-slate-400`}
                {...register('emailId')}
              />
              {errors.emailId && <p className="text-red-500 text-[10px] font-medium mt-2 ml-1">{errors.emailId.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Security Password</label>
                <NavLink to="/forgot-password" size="xs" className="text-[10px] font-bold uppercase tracking-widest text-teal-600 hover:text-teal-500 transition-colors">
                  Forgot?
                </NavLink>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  className={`w-full bg-slate-50 text-slate-900 rounded-2xl border px-4 py-3.5 text-sm transition-all duration-300
                    ${errors.password ? 'border-red-400' : 'border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5'}
                    outline-none placeholder:text-slate-400`}
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
                'Authenticating...'
              ) : (
                <>
                  <ShieldCheck size={16} />
                  Secure Sign In
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-10">
            <span className="flex-1 border-b border-slate-100" />
            <span className="mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Partner Portals</span>
            <span className="flex-1 border-b border-slate-100" />
          </div>

          {/* Footer */}
          <p className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
            New to Vita AI?{' '}
            <NavLink to="/signup" className="text-slate-900 hover:text-teal-600 transition-colors underline underline-offset-8 decoration-teal-500/30">
              Create Patient Account
            </NavLink>
          </p>
        </div>
      </motion.div>
      
      {/* Disclaimer */}
      <p className="mt-8 text-[10px] text-slate-400 uppercase tracking-widest font-medium">
        Encrypted Endpoint: <span className="text-slate-500 font-bold">v2.4.0-secure</span>
      </p>
    </div>
  );
}

export default Login;