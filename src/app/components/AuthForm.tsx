'use client';

import { useState } from 'react';
import { supabase } from '../../../utils/supabase/client';
import { toast } from 'sonner';
import { Mail, ChevronRight, ArrowLeft, Send, User, UserPlus, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot 
} from './ui/input-otp';

interface AuthFormProps {
  onSuccess: (userId: string, name?: string) => void;
  onBack: () => void;
}

type AuthMode = 'signin' | 'signup';

export function AuthForm({ onSuccess, onBack }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const isSignUp = mode === 'signup';

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    if (isSignUp && !name.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: isSignUp,
          emailRedirectTo: window.location.origin,
          ...(isSignUp && {
            data: {
              full_name: name,
            },
          }),
        },
      });

      if (error) {
        throw error;
      }
      
      setIsOtpSent(true);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      toast.success('Check your email for the verification code!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (otp.length < 8) {
      toast.error('Please enter the 8-digit code');
      return;
    }
    setLoading(true);

    try {

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (error) throw error;
      
      if (data.user) {
        // Shopify Sync: If this was a signup, sync with Shopify
        if (isSignUp) {
          try {
            console.log('Syncing with Shopify:', email, name);
            const syncResponse = await fetch('/api/auth/shopify-sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, name }),
            });
            const syncResult = await syncResponse.json();
            console.log('Shopify Sync Result:', syncResult);
            
            if (syncResult.status === 'success') {
              if (syncResult.existing) {
                toast.info('Matched with existing Shopify account');
              } else {
                toast.success('Shopify account created successfully!');
              }
            } else {
              console.error('Shopify sync unsuccessful:', syncResult.error);
            }
          } catch (syncError) {
            console.error('Failed to sync with Shopify:', syncError);
          }
        }

        toast.success('Authentication successful!');
        onSuccess(data.user.id, data.user.user_metadata?.full_name || (isSignUp ? name : undefined));
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setName('');
    setOtp('');
    setIsOtpSent(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center pt-24 pb-8 px-4 relative overflow-hidden bg-gray-50">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-400/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/20 blur-[120px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white backdrop-blur-2xl border border-gray-200 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          {/* Progress Indicator */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
            <motion.div 
              layoutId="progress"
              className="h-full bg-black"
              initial={{ width: "0%" }}
              animate={{ width: isOtpSent ? "100%" : "50%" }}
            />
          </div>

          <button 
            onClick={onBack}
            className="group flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors mb-8 text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Portal
          </button>

          {/* Mode Toggle */}
          {!isOtpSent && (
            <div className="flex mb-6 bg-gray-100 rounded-md p-1 border border-gray-200">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold transition-all ${
                  !isSignUp
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <LogIn className="w-4 h-4" />
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold transition-all ${
                  isSignUp
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Register
              </button>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              {isOtpSent ? 'Verify Email' : isSignUp ? 'Register' : 'Welcome Back'}
            </h2>
            <p className="text-gray-500" style={{ fontFamily: 'var(--font-body)' }}>
              {isOtpSent 
                ? `Enter the 8-digit code sent to ${email}` 
                : isSignUp 
                  ? 'Create your account to unlock your artifact' 
                  : 'Login with your email to continue'}
            </p>
          </div>

          <form onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isOtpSent ? (
                <motion.div
                  key={`form-${mode}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {/* Name field — only for Sign Up */}
                  {isSignUp && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1"
                    >
                      <label className="text-sm font-medium text-gray-500 ml-1">Full Name</label>
                      <div className="relative group">
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full h-14 bg-white border-2 border-gray-200 rounded-md px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black transition-all"
                          placeholder="Your full name"
                          style={{ fontFamily: 'var(--font-body)' }}
                        />
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 ml-1">Email Address</label>
                    <div className="relative group">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-14 bg-white border-2 border-gray-200 rounded-md px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black transition-all"
                        placeholder="name@example.com"
                        style={{ fontFamily: 'var(--font-body)' }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || countdown > 0}
                    className="w-full h-14 bg-black text-white text-lg font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {countdown > 0 
                          ? `Resend in ${countdown}s` 
                          : isSignUp ? 'Create Account' : 'Send Login Code'}
                        <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                      </>
                    )}
                  </button>

                  {/* Footer toggle text */}
                  <p className="text-center text-gray-400 text-sm pt-2">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                      type="button"
                      onClick={switchMode}
                      className="text-black hover:opacity-70 font-semibold transition-all underline underline-offset-4"
                    >
                      {isSignUp ? 'Login' : 'Register'}
                    </button>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="otp-input"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 flex flex-col items-center"
                >
                  <div className="space-y-3 w-full text-center">
                    <label className="text-sm font-medium text-gray-500">Verification Code</label>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={8}
                        value={otp}
                        onChange={(val: string) => setOtp(val)}
                        onComplete={async (val: string) => {
                          setOtp(val);
                        }}
                      >
                        <InputOTPGroup className="gap-2">
                          {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => (
                            <InputOTPSlot 
                              key={idx} 
                              index={idx} 
                              className="w-10 h-14 bg-white border-2 border-gray-200 text-gray-900 text-xl font-bold rounded-md focus:border-black transition-all"
                              style={{ fontFamily: 'var(--font-body)' }}
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>

                  <div className="w-full space-y-3">
                    <button
                      type="submit"
                      disabled={loading || otp.length < 8}
                      className="w-full h-14 bg-black text-white text-lg font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Verify & Enter
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsOtpSent(false)}
                      className="w-full text-gray-400 hover:text-gray-600 text-sm py-2 transition-colors"
                    >
                      Use a different email address
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      disabled={loading}
                      className="w-full text-purple-500/60 hover:text-purple-600 text-xs py-1 transition-colors"
                    >
                      Resend code
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
