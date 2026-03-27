'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabase/client';
import { ThemePage } from '../components/ThemePage';
import { Header } from '../components/Header';
import { toast, Toaster } from 'sonner';

export default function ThemeRoute() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [themeData, setThemeData] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSessionAndTheme = async () => {
      setIsChecking(true);
      try {
        let currentUser = null;
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          currentUser = session.user;
        } else {
          const devUserStr = localStorage.getItem('dev_user');
          if (devUserStr) currentUser = JSON.parse(devUserStr);
        }

        if (!currentUser) {
          toast.error("Please log in to view your theme.");
          router.push('/');
          return;
        }

        setUser(currentUser);

        const response = await fetch(`/api/user-theme?userId=${currentUser.id}`);
        const data = await response.json();

        if (data.hasTheme) {
          setThemeData({ ...data, userId: currentUser.id });
        } else {
          toast.error("You haven't unlocked a theme yet.");
          router.push('/');
        }
      } catch (error) {
        console.error('Error in checkSessionAndTheme:', error);
        toast.error("Failed to load your theme.");
        router.push('/');
      } finally {
        setIsChecking(false);
      }
    };
    checkSessionAndTheme();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-yellow-400/80 font-medium italic">Loading your artifact...</p>
        </div>
      </div>
    );
  }

  if (!themeData) {
    return null;
  }

  return (
    <main className="min-h-screen relative">
      <Toaster position="top-center" />
      <Header 
        user={user} 
        onLogout={async () => {
          await supabase.auth.signOut();
          localStorage.removeItem('dev_user');
          router.push('/');
        }} 
        tokens={themeData.tokens}
        themeTitle={themeData.theme.title}
        variant="theme"
        themeData={themeData}
      />
      <div className="pt-16 md:pt-20">
        <ThemePage
          userId={themeData.userId}
          themeId={themeData.themeId}
          theme={themeData.theme}
          initialTokens={themeData.tokens}
          expiresAt={themeData.expiresAt}
          unlockedRewards={themeData.unlockedRewards}
          onBackToPortal={() => router.push('/')}
        />
      </div>
    </main>
  );
}
