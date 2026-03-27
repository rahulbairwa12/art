import { useState, useEffect } from 'react';
import { PortalEntry } from './components/PortalEntry';
import { ThemePage } from './components/ThemePage';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast, Toaster } from 'sonner';

interface ThemeData {
  userId: string;
  themeId: string;
  theme: {
    title: string;
    description: string;
    youtubeVideoId: string;
    artworkUrl: string;
    currentPrompt: string;
    themeDetails?: {
      artistStatement: string;
      yearCreated: string;
      medium: string;
      dimensions: string;
      inspiration: string;
    };
  };
  tokens: number;
  expiresAt: string;
  unlockedRewards: number[];
}

export default function App() {
  const [themeData, setThemeData] = useState<ThemeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize sample data on first load
  useEffect(() => {
    initSampleData();
  }, []);

  const initSampleData = async () => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0c0022a7/init-sample-data`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  };

  const handleCodeSubmit = async (code: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0c0022a7/validate-code`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ code }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setThemeData(data);
        toast.success('Theme unlocked!');
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

  const handleBackToPortal = () => {
    setThemeData(null);
    toast.info('Returned to portal');
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="size-full">
        {!themeData ? (
          <PortalEntry onCodeSubmit={handleCodeSubmit} />
        ) : (
          <ThemePage
            userId={themeData.userId}
            themeId={themeData.themeId}
            theme={themeData.theme}
            initialTokens={themeData.tokens}
            expiresAt={themeData.expiresAt}
            unlockedRewards={themeData.unlockedRewards}
            onBackToPortal={handleBackToPortal}
          />
        )}
      </div>
    </>
  );
}