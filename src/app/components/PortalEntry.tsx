import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { motion } from 'motion/react';
const wildcardLogo = 'https://cdn.shopify.com/s/files/1/0328/9032/3077/files/58677d22-b18f-474f-8a96-8a91bbd76cb8.png?v=1774589972';

interface PortalEntryProps {
  onCodeSubmit: (code: string) => void;
  onLoginRequest?: () => void;
  onOpenTheme?: () => void;
  isLoading?: boolean;
  isThemeAlreadyUnlocked?: boolean;
  unlockedThemeTitle?: string;
}

export function PortalEntry({ 
  onCodeSubmit, 
  onLoginRequest, 
  onOpenTheme,
  isLoading, 
  isThemeAlreadyUnlocked,
  unlockedThemeTitle
}: PortalEntryProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!code.trim()) {
      setError('Please enter an artifact code');
      return;
    }
    setError('');
    onCodeSubmit(code.toUpperCase().trim());
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center pt-24 pb-8 px-4 relative overflow-hidden bg-gray-50">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-400/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/20 blur-[120px] rounded-full" />

      {/* Subtle puzzle pattern background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="puzzle" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M50,0 L50,20 C50,25 45,25 45,30 C45,35 50,35 50,40 L50,60 C50,65 55,65 55,70 C55,75 50,75 50,80 L50,100" 
                    stroke="currentColor" strokeWidth="1" fill="none"/>
              <path d="M0,50 L20,50 C25,50 25,45 30,45 C35,45 35,50 40,50 L60,50 C65,50 65,55 70,55 C75,55 75,50 80,50 L100,50" 
                    stroke="currentColor" strokeWidth="1" fill="none"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#puzzle)"/>
        </svg>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-12">
          {/* Wildcard Logo */}
          <div className="flex justify-center mb-8">
            <motion.img 
              src={wildcardLogo} 
              alt="Wildcard Logo" 
              className="w-64 md:w-80 h-auto"
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                rotate: 0,
                y: [0, -10, 0]
              }}
              transition={{
                opacity: { duration: 0.6 },
                scale: { duration: 0.6, type: "spring", stiffness: 200 },
                rotate: { duration: 0.6, type: "spring", stiffness: 150 },
                y: { 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.6
                }
              }}
              whileHover={{ 
                scale: 1.05, 
                rotate: [0, -5, 5, -5, 0],
                transition: { 
                  rotate: { duration: 0.5 },
                  scale: { duration: 0.2 }
                }
              }}
            />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-semibold mb-6 tracking-tight" 
              style={{ fontFamily: 'var(--font-heading)' }}>
            ARTIFACT PORTAL
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/80 mb-6" 
             style={{ fontFamily: 'var(--font-body)' }}>
            This piece belongs to a puzzle still unfolding.
          </p>
          
          <p className="text-base text-foreground/60 leading-relaxed max-w-sm mx-auto"
             style={{ fontFamily: 'var(--font-body)' }}>
            {isThemeAlreadyUnlocked ? "Welcome back to your unlocked theme." : "Enter the code assigned to you to unlock the story, music, and reflections connected to this theme."}
          </p>
        </div>

        {isThemeAlreadyUnlocked ? (
          <div className="space-y-6">
            <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-6 text-center">
              <p className="text-sm text-foreground/60 mb-1">UNLOCKED THEME</p>
              <h3 className="text-2xl font-semibold text-primary">{unlockedThemeTitle || "Your Theme"}</h3>
              <p className="text-sm text-foreground/60 mt-4">You already have an active theme. You can only unlock one theme per account.</p>
            </div>
            
            <Button 
              onClick={onOpenTheme}
              className="w-full h-14 text-lg font-medium bg-primary hover:bg-primary/90 
                         text-primary-foreground transition-colors"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Open My Theme
            </Button>

            {!onLoginRequest && (
              <p className="text-center text-sm text-foreground/40 mt-4">
                Want to unlock a different theme? Log out and use a different account.
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="text"
                placeholder="Enter Artifact Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-14 text-center text-lg tracking-wider bg-white border-2 border-foreground/20 
                           focus:border-accent transition-colors uppercase"
                style={{ fontFamily: 'var(--font-body)' }}
              />
              {error && (
                <p className="text-destructive text-sm mt-2 text-center">{error}</p>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full h-14 text-lg font-medium bg-primary hover:bg-primary/90 
                           text-primary-foreground transition-colors"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {isLoading ? 'Unlocking…' : 'Unlock Theme'}
              </Button>


            </div>
          </form>
        )}

        <div className="mt-8 text-center" />
      </div>
    </div>
  );
}