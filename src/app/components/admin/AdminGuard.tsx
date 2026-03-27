'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Key, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    // Check if previously authorized in this session
    const authRecord = sessionStorage.getItem('admin_auth');
    if (authRecord === 'true') {
      setIsAuthorized(true);
    }
    setIsCheckingSession(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.authorized) {
        setIsAuthorized(true);
        sessionStorage.setItem('admin_auth', 'true');
      } else {
        setError('Invalid admin password');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
      </div>
    );
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="border-gray-200 shadow-xl overflow-hidden">
          <CardHeader className="bg-yellow-400 p-8 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4 shadow-inner">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-white font-black text-2xl tracking-tight uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
              Restricted Access
            </CardTitle>
            <p className="text-white/80 text-sm font-bold mt-1">Admin Authorization Required</p>
          </CardHeader>
          <CardContent className="p-8 pt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block ml-1">
                  Access Key
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password..."
                    className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-yellow-400 focus:ring-yellow-400"
                    autoFocus
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-red-600 text-sm font-bold"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gray-900 border-none hover:bg-black text-white font-bold transition-all shadow-lg active:scale-95"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Authorize Entry'
                )}
              </Button>
            </form>
            
            <p className="mt-8 text-center text-gray-400 text-[10px] uppercase font-bold tracking-widest">
              Vibes & Virtues Internal Security Tool
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
