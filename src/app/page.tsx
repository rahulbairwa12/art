'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';

import { PortalEntry } from './components/PortalEntry';
import { AuthForm } from './components/AuthForm';
import { Header } from './components/Header';
import { supabase } from '../../utils/supabase/client';
import { User } from '@supabase/supabase-js';

type AppStep = 'code' | 'auth';

interface ThemeData {
  userId: string;
  themeId: string;
  theme: {
    title: string;
  };
  tokens?: number;
}

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState<AppStep>('code');
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [themeData, setThemeData] = useState<ThemeData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isThemeAlreadyUnlocked, setIsThemeAlreadyUnlocked] = useState(false);

  const fetchUserTheme = async (userId: string) => {
    setIsChecking(true);
    try {
      const themeResponse = await fetch(`/api/user-theme?userId=${userId}`);
      const themeResult = await themeResponse.json();
      
      if (themeResult.hasTheme) {
        setThemeData({ ...themeResult, userId });
        setIsThemeAlreadyUnlocked(true);
        // Automatically redirect to theme if they log in and already have a theme
        if (step === 'auth' || !pendingCode) {
            router.push('/theme');
        }
      } else if (pendingCode) {
        handleCodeSubmit(pendingCode, userId);
        setPendingCode(null);
      } else if (step === 'auth') {
        setStep('code');
      }
    } catch (err) {
      console.error('Error fetching user theme:', err);
    } finally {
      setIsChecking(false);
    }
  };

  const checkSession = async () => {
    setIsChecking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchUserTheme(session.user.id);
      } else {
        const savedDevUser = localStorage.getItem('dev_user');
        if (savedDevUser) {
          const devUser = JSON.parse(savedDevUser);
          setUser(devUser);
          await fetchUserTheme(devUser.id);
        } else {
          setIsChecking(false);
        }
      }
    } catch (err) {
      console.error('Error checking session:', err);
      setIsChecking(false);
    }
  };

  const initSampleData = async () => {
    try {
      await fetch('/api/init-sample-data', { method: 'POST' });
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  };

  useEffect(() => {
    void initSampleData();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        const savedDevUser = localStorage.getItem('dev_user');
        setUser(savedDevUser ? JSON.parse(savedDevUser) : null);
      }
    });

    checkSession();
    return () => subscription.unsubscribe();
  }, []);

  const handleCodeSubmit = async (code: string, authenticatedUserId?: string) => {
    setIsLoading(true);
    const targetUserId = authenticatedUserId || user?.id;

    try {
      const response = await fetch('/api/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: code.toLowerCase().trim(),
          userId: targetUserId
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.alreadyUnlocked) {
          setThemeData(data);
          setIsThemeAlreadyUnlocked(true);
          toast.info('You already have a theme unlocked.');
          return;
        }

        if (targetUserId) {
          toast.success('Theme unlocked!');
          router.push('/theme');
        } else {
          setPendingCode(code);
          setStep('auth');
          toast.success('Code verified! Please sign in to unlock your theme.');
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Invalid artifact code');
      }
    } catch (error) {
      console.error('Error validating code:', error);
      toast.error('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = (userId: string, userName?: string) => {
    if (userId.startsWith('dev_')) {
      const decodedEmail = atob(userId.replace('dev_', ''));
      const mockUser = {
        id: userId,
        email: decodedEmail,
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: { full_name: userName || '' },
      } as any;
      setUser(mockUser);
      localStorage.setItem('dev_user', JSON.stringify(mockUser));
    }

    fetchUserTheme(userId);
    toast.success('Logged in!');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('dev_user');
    setThemeData(null);
    setPendingCode(null);
    setIsThemeAlreadyUnlocked(false);
    setStep('code');
    toast.success('Logged out successfully');
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      <Header 
        user={user} 
        onLogout={handleLogout} 
        tokens={themeData?.tokens}
        themeData={themeData}
        onLoginRequest={() => setStep('auth')}
      />
      
      <div className="size-full transition-all duration-500">
        {isChecking ? (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-foreground/60 font-medium italic">Synchronizing Artifact Status...</p>
            </div>
          </div>
        ) : (
          <>
            {step === 'code' && (
              <PortalEntry 
                onCodeSubmit={handleCodeSubmit} 
                onLoginRequest={!user ? () => setStep('auth') : undefined}
                onOpenTheme={() => router.push('/theme')}
                isThemeAlreadyUnlocked={isThemeAlreadyUnlocked}
                unlockedThemeTitle={themeData?.theme?.title || (themeData as any)?.title}
                isLoading={isLoading} 
              />
            )}
            
            {step === 'auth' && (
              <AuthForm 
                onSuccess={(userId, name) => handleAuthSuccess(userId, name)} 
                onBack={() => setStep('code')} 
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}
