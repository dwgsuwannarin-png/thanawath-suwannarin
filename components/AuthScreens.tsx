
import React, { useState } from 'react';
import { Sparkles, Check, CreditCard, Lock, Mail, ArrowRight, User as UserIcon, KeyRound, AlertCircle, X, Send, Copy, CheckCircle } from 'lucide-react';
import { User } from '../types';

interface AuthScreensProps {
  onLogin: (user: User) => void;
  onRegister?: (user: User) => void;
  onSubscribe: () => void;
  onContinueFree?: () => void;
  onLogout?: () => void;
  user?: User | null;
  authError?: string | null;
  onClearError?: () => void;
}

export const AuthScreens: React.FC<AuthScreensProps> = ({ 
  onLogin, 
  onRegister, 
  onSubscribe, 
  onContinueFree, 
  onLogout, 
  user,
  authError,
  onClearError
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (onClearError) onClearError();
    
    // Simulate API Call delay for realism
    setTimeout(() => {
      // Create a user object with trimmed values
      const mockUser: User = {
        id: 'user-' + Date.now(),
        name: isRegister ? name.trim() : (email.split('@')[0] || 'User'),
        email: email.trim(),
        plan: 'FREE', // Default to FREE to show subscription screen next
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email.trim()}`
      };
      
      setLoading(false);
      
      if (isRegister) {
        if (onRegister) onRegister(mockUser);
      } else {
        onLogin(mockUser);
      }
    }, 800);
  };

  const handleSubscribeClick = () => {
    setLoading(true);
    // Simulate Payment Processing
    setTimeout(() => {
      setLoading(false);
      onSubscribe();
    }, 2000);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("dwgsuwannarin@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // PENDING APPROVAL VIEW
  if (user && user.status === 'PENDING') {
    const adminEmail = "dwgsuwannarin@gmail.com";
    const approvalUrl = `${window.location.origin}?approve_user=${user.id}`;
    const subject = `Request Approval for ${user.name}`;
    const body = `Hello Admin,\n\nI have registered a new account.\nName: ${user.name}\nEmail: ${user.email}\n\nPlease click the link below to approve access:\n${approvalUrl}\n\nThank you.`;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] font-roboto p-4">
        <div className="max-w-md w-full bg-[#18181b] border border-zinc-800 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Waiting for Approval</h2>
          <p className="text-zinc-400 mb-6 text-sm leading-relaxed">
            Your account has been created successfully.<br/>
            Please <span className="text-white font-bold">notify the administrator</span> to activate your access.
          </p>
          
          <div className="flex flex-col gap-3">
             {/* Main Action: Open Mail App */}
             <a 
               href={`mailto:${adminEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
               className="w-full py-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"
             >
               <Send size={16} /> Open Email App
             </a>

             <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                  <span className="bg-[#18181b] px-2 text-zinc-600">Or copy manually</span>
                </div>
             </div>

             {/* Fallback Action: Copy Email */}
             <button
               onClick={handleCopyEmail}
               className={`w-full py-3 rounded-lg border transition-all text-sm font-medium flex items-center justify-center gap-2
                 ${copied 
                   ? 'bg-green-900/20 border-green-900/50 text-green-400' 
                   : 'bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                 }`}
             >
               {copied ? (
                 <>
                   <CheckCircle size={16} /> Copied to clipboard
                 </>
               ) : (
                 <>
                   <Copy size={16} /> {adminEmail}
                 </>
               )}
             </button>

             <button 
              onClick={() => window.location.reload()} 
              className="w-full py-2 mt-2 rounded-lg text-zinc-500 hover:text-white transition-colors text-xs font-medium"
            >
              Refresh Status
            </button>
            
            {onLogout && (
              <button 
                onClick={onLogout} 
                className="w-full py-2.5 mt-4 rounded-lg bg-red-900/10 text-red-400 hover:bg-red-900/20 hover:text-red-300 text-sm font-bold transition-all border border-red-900/20"
              >
                Log Out
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 1. LOGIN / REGISTER VIEW
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] relative overflow-hidden font-roboto">
        {/* Background Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full"></div>

        <div className="w-full max-w-md p-6 relative z-10">
          <div className="bg-[#18181b]/90 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="inline-flex bg-gradient-to-tr from-indigo-500 to-purple-500 p-3 rounded-xl shadow-lg shadow-indigo-500/20 mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                {isRegister ? 'Create Account' : 'Welcome Back'}
              </h1>
              <p className="text-zinc-500 mt-2 text-sm">
                {isRegister ? 'Join RENDER AI to start creating.' : 'Sign in to continue to RENDER AI.'}
              </p>
            </div>

            {/* Error Alert */}
            {authError && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-200">{authError}</p>
                </div>
                {onClearError && (
                  <button onClick={onClearError} className="text-red-400 hover:text-red-300">
                    <X size={16} />
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Name Field (Register Only) */}
              {isRegister && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
                    <input 
                      type="text" 
                      required={isRegister}
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if(onClearError) onClearError();
                      }}
                      className="w-full bg-black/40 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if(onClearError) onClearError();
                    }}
                    className="w-full bg-black/40 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if(onClearError) onClearError();
                    }}
                    className="w-full bg-black/40 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-900/20 transition-all transform active:scale-95 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    {isRegister ? 'Create Account' : 'Sign In'} <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-zinc-400 text-sm">
                {isRegister ? "Already have an account?" : "Don't have an account?"}
                <button 
                  onClick={() => {
                    setIsRegister(!isRegister);
                    if(onClearError) onClearError();
                  }}
                  className="ml-2 text-orange-500 font-bold hover:underline focus:outline-none"
                >
                  {isRegister ? "Sign In" : "Sign Up"}
                </button>
              </p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-zinc-800 text-center space-y-2">
              <p className="text-zinc-600 text-[10px] uppercase tracking-wider font-bold">Admin Access Hint</p>
              <div className="inline-block bg-zinc-800/50 px-3 py-1 rounded text-xs text-zinc-500 font-mono">
                dwgsuwannarin@gmail.com
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. PLANS VIEW (Shown if user is logged in but plan is FREE)
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] relative overflow-hidden py-10 px-4 font-roboto">
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-indigo-900/10 blur-[150px] rounded-full"></div>
       
       <div className="max-w-4xl w-full relative z-10 flex flex-col items-center">
          <div className="text-center mb-10">
            {user && (
              <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-400">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 Logged in as <span className="text-zinc-200 font-bold">{user.name}</span>
              </div>
            )}
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Upgrade to <span className="text-orange-500">PRO</span></h2>
            <p className="text-zinc-400 max-w-lg mx-auto text-lg">
              Unlock the full potential of AI rendering with higher speeds, better quality, and unlimited access.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 w-full">
            {/* Free Plan */}
            <div className="bg-[#18181b]/40 border border-zinc-800 rounded-2xl p-8 flex flex-col hover:bg-[#18181b]/60 transition-all hover:border-zinc-700 group">
              <div className="mb-4">
                <span className="text-zinc-400 font-semibold tracking-wider text-sm">STARTER</span>
                <h3 className="text-3xl font-bold text-white mt-1">Free</h3>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-zinc-400">
                  <Check className="w-5 h-5 text-zinc-600" /> Limited Renders
                </li>
                <li className="flex items-center gap-3 text-zinc-400">
                  <Check className="w-5 h-5 text-zinc-600" /> Standard Speed
                </li>
                <li className="flex items-center gap-3 text-zinc-400">
                  <Lock className="w-4 h-4 text-zinc-600" /> No High-Res Downloads
                </li>
                <li className="flex items-center gap-3 text-zinc-400">
                  <Lock className="w-4 h-4 text-zinc-600" /> No Private Mode
                </li>
              </ul>
              <button 
                onClick={onContinueFree}
                className="w-full py-3 rounded-xl border border-zinc-700 text-zinc-300 font-medium hover:bg-zinc-800 hover:text-white transition-colors"
              >
                Continue for Free
              </button>
            </div>

            {/* PRO Plan */}
            <div className="bg-[#18181b] border-2 border-orange-500/50 rounded-2xl p-8 flex flex-col relative shadow-2xl shadow-orange-900/20 transform md:scale-105">
              <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                MOST POPULAR
              </div>
              <div className="mb-4">
                <span className="text-orange-400 font-semibold tracking-wider text-sm">PROFESSIONAL</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <h3 className="text-4xl font-bold text-white">฿599</h3>
                  <span className="text-zinc-500">/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-zinc-200">
                  <div className="bg-orange-500/20 p-1 rounded-full"><Check className="w-4 h-4 text-orange-500" /></div>
                  Unlimited AI Renders
                </li>
                <li className="flex items-center gap-3 text-zinc-200">
                  <div className="bg-orange-500/20 p-1 rounded-full"><Check className="w-4 h-4 text-orange-500" /></div>
                  Access Gemini 3.0 Pro Model
                </li>
                <li className="flex items-center gap-3 text-zinc-200">
                  <div className="bg-orange-500/20 p-1 rounded-full"><Check className="w-4 h-4 text-orange-500" /></div>
                  4K Upscaling & Refine Mode
                </li>
                <li className="flex items-center gap-3 text-zinc-200">
                  <div className="bg-orange-500/20 p-1 rounded-full"><Check className="w-4 h-4 text-orange-500" /></div>
                  Priority Support
                </li>
              </ul>
              <button 
                onClick={handleSubscribeClick}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" /> Subscribe Now
                  </>
                )}
              </button>
              <p className="text-center text-[10px] text-zinc-500 mt-3">
                Secure payment via Stripe. Cancel anytime.
              </p>
            </div>
          </div>
          
          <div className="mt-8">
             <button onClick={onLogout} className="text-zinc-500 text-sm hover:text-white transition-colors">
               Sign out
             </button>
          </div>
       </div>
    </div>
  );
};
