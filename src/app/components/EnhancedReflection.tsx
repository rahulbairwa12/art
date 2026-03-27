import { useState, useEffect } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Sparkles, CheckCircle2, Clock } from 'lucide-react';

interface EnhancedReflectionProps {
  onReflectionSubmit: (content: string, type: string) => Promise<void>;
  completedReflections: string[];
  randomArchiveReflection: { content: string; timestamp: string } | null;
  isInFollowUpWindow: boolean;
  hasSubmittedMainReflection: boolean;
  submittedPrimaryReflection: string;
  nextPromptDate: string | null;
  followUpQuestions?: {
    'follow-up'?: string;
    'deeper'?: string;
    'archive-response'?: string;
    'perspective'?: string;
    'time-shift'?: string;
  };
}

export function EnhancedReflection({
  onReflectionSubmit,
  completedReflections,
  randomArchiveReflection,
  isInFollowUpWindow,
  hasSubmittedMainReflection,
  submittedPrimaryReflection,
  nextPromptDate,
  followUpQuestions
}: EnhancedReflectionProps) {
  // Primary reflection state
  const [primaryReflection, setPrimaryReflection] = useState('');
  const [isPrimarySubmitting, setIsPrimarySubmitting] = useState(false);

  // Follow-up reflection states
  const [followUpReflection, setFollowUpReflection] = useState('');
  const [isFollowUpSubmitting, setIsFollowUpSubmitting] = useState(false);
  const [submittedFollowUpReflection, setSubmittedFollowUpReflection] = useState('');

  // Deeper reflection state
  const [deeperReflection, setDeeperReflection] = useState('');
  const [isDeeperSubmitting, setIsDeeperSubmitting] = useState(false);

  // Archive response state
  const [archiveResponse, setArchiveResponse] = useState('');
  const [isArchiveSubmitting, setIsArchiveSubmitting] = useState(false);

  // Perspective reflections
  const [teacherPerspective, setTeacherPerspective] = useState('');
  const [studentPerspective, setStudentPerspective] = useState('');
  const [isPerspectiveSubmitting, setIsPerspectiveSubmitting] = useState(false);

  // Time-shift reflection
  const [timeShiftReflection, setTimeShiftReflection] = useState('');
  const [isTimeShiftSubmitting, setIsTimeShiftSubmitting] = useState(false);

  // Countdown timer state
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [hoursRemaining, setHoursRemaining] = useState(0);
  const [minutesRemaining, setMinutesRemaining] = useState(0);

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  };

  const getTokenReward = (wordCount: number, type: string) => {
    if (type === 'primary' || type === 'main') {
      if (wordCount >= 100) return 150;
      if (wordCount >= 50) return 100;
      if (wordCount >= 20) return 50;
    } else if (type === 'follow-up' || type === 'followup') return 100;
    else if (type === 'deeper') return 150;
    else if (type === 'archive-response' || type === 'archive') return 120;
    else if (type === 'perspective') return 80;
    else if (type === 'time-shift') return 150;
    return 0;
  };

  const handlePrimarySubmit = async () => {
    const wordCount = getWordCount(primaryReflection);
    if (wordCount < 20) return;

    setIsPrimarySubmitting(true);
    try {
      await onReflectionSubmit(primaryReflection, 'main');
      setPrimaryReflection('');
    } finally {
      setIsPrimarySubmitting(false);
    }
  };

  const handleFollowUpSubmit = async () => {
    const wordCount = getWordCount(followUpReflection);
    if (wordCount < 20) return;

    setIsFollowUpSubmitting(true);
    try {
      await onReflectionSubmit(followUpReflection, 'follow-up');
      setSubmittedFollowUpReflection(followUpReflection); // Save the follow-up reflection
      setFollowUpReflection('');
    } finally {
      setIsFollowUpSubmitting(false);
    }
  };

  const handleDeeperSubmit = async () => {
    const wordCount = getWordCount(deeperReflection);
    if (wordCount < 20) return;

    setIsDeeperSubmitting(true);
    try {
      await onReflectionSubmit(deeperReflection, 'deeper');
      setDeeperReflection('');
    } finally {
      setIsDeeperSubmitting(false);
    }
  };

  const handleArchiveSubmit = async () => {
    const wordCount = getWordCount(archiveResponse);
    if (wordCount < 20) return;

    setIsArchiveSubmitting(true);
    try {
      await onReflectionSubmit(archiveResponse, 'archive-response');
      setArchiveResponse('');
    } finally {
      setIsArchiveSubmitting(false);
    }
  };

  const handlePerspectiveSubmit = async (text: string, perspective: 'teacher' | 'student') => {
    const wordCount = getWordCount(text);
    if (wordCount < 20) return;

    setIsPerspectiveSubmitting(true);
    try {
      await onReflectionSubmit(text, 'perspective');
      if (perspective === 'teacher') setTeacherPerspective('');
      else setStudentPerspective('');
    } finally {
      setIsPerspectiveSubmitting(false);
    }
  };

  const handleTimeShiftSubmit = async () => {
    const wordCount = getWordCount(timeShiftReflection);
    if (wordCount < 20) return;

    setIsTimeShiftSubmitting(true);
    try {
      await onReflectionSubmit(timeShiftReflection, 'time-shift');
      setTimeShiftReflection('');
    } finally {
      setIsTimeShiftSubmitting(false);
    }
  };

  const hasPrimary = completedReflections.includes('main');
  const hasFollowUp = completedReflections.includes('follow-up');
  const hasDeeper = completedReflections.includes('deeper');
  const hasArchiveResponse = completedReflections.includes('archive-response');
  const hasPerspective = completedReflections.includes('perspective');
  const hasTimeShift = completedReflections.includes('time-shift');

  // Update countdown timer
  useEffect(() => {
    if (!nextPromptDate || !hasPrimary) return;

    const updateCountdown = () => {
      const nextDate = new Date(nextPromptDate);
      const now = new Date();
      const diff = nextDate.getTime() - now.getTime();
      
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setDaysRemaining(days);
        setHoursRemaining(hours);
        setMinutesRemaining(minutes);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [nextPromptDate, hasPrimary]);

  const primaryWordCount = getWordCount(primaryReflection);
  const followUpWordCount = getWordCount(followUpReflection);
  const deeperWordCount = getWordCount(deeperReflection);
  const archiveWordCount = getWordCount(archiveResponse);
  const teacherWordCount = getWordCount(teacherPerspective);
  const studentWordCount = getWordCount(studentPerspective);
  const timeShiftWordCount = getWordCount(timeShiftReflection);

  return (
    <div className="space-y-8">
      
      {/* Primary Reflection */}
      {!hasPrimary ? (
        <div>
          <Textarea
            value={primaryReflection}
            onChange={(e) => setPrimaryReflection(e.target.value)}
            placeholder="Write your reflection here…"
            className="min-h-[200px] text-base bg-background border-border resize-none mb-3"
            style={{ fontFamily: 'var(--font-body)' }}
          />

          <div className="flex items-center justify-between mb-4">
            <span className="text-base text-foreground/80 font-bold" style={{ fontFamily: 'var(--font-body)' }}>
              Word count: <span className="font-black">{primaryWordCount} words</span>
            </span>
            {primaryWordCount >= 20 && (
              <span className="text-base text-accent font-black flex items-center gap-1"
                    style={{ fontFamily: 'var(--font-body)' }}>
                <Sparkles className="w-4 h-4" />
                +{getTokenReward(primaryWordCount, 'primary')} Tokens
              </span>
            )}
          </div>

          <Button
            onClick={handlePrimarySubmit}
            disabled={isPrimarySubmitting || primaryWordCount < 20}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {isPrimarySubmitting ? 'Adding to Archive...' : 'Add My Reflection to the Archive'}
          </Button>

          {primaryWordCount < 20 && primaryWordCount > 0 && (
            <p className="text-sm text-center text-foreground/70 font-bold mt-2"
               style={{ fontFamily: 'var(--font-body)' }}>
              Minimum 20 words required
            </p>
          )}
        </div>
      ) : (
        <div className="py-6 px-4">
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-4">
              <CheckCircle2 className="w-8 h-8 text-white" />
              <p className="text-white font-black text-lg md:text-xl" style={{ fontFamily: 'var(--font-heading)' }}>
                Primary Reflection Complete!
              </p>
            </div>
            
            {nextPromptDate && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border-2 border-white/40">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-white animate-pulse" />
                  <p className="text-white font-bold text-sm md:text-base" style={{ fontFamily: 'var(--font-heading)' }}>
                    Next Prompt Available In:
                  </p>
                </div>
                
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <div className="bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-white/50">
                    <div className="text-center">
                      <span className="text-3xl md:text-4xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                        {daysRemaining}
                      </span>
                      <p className="text-xs font-bold text-white/90 mt-1">
                        {daysRemaining === 1 ? 'day' : 'days'}
                      </p>
                    </div>
                  </div>
                  
                  <span className="text-2xl font-black text-white">:</span>
                  
                  <div className="bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-white/50">
                    <div className="text-center">
                      <span className="text-3xl md:text-4xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                        {hoursRemaining}
                      </span>
                      <p className="text-xs font-bold text-white/90 mt-1">
                        {hoursRemaining === 1 ? 'hour' : 'hours'}
                      </p>
                    </div>
                  </div>
                  
                  <span className="text-2xl font-black text-white">:</span>
                  
                  <div className="bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-white/50">
                    <div className="text-center">
                      <span className="text-3xl md:text-4xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                        {minutesRemaining}
                      </span>
                      <p className="text-xs font-bold text-white/90 mt-1">
                        {minutesRemaining === 1 ? 'min' : 'mins'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Follow-Up Reflection (unlocked after primary) */}
      {hasPrimary && !hasFollowUp && (
        <>
          <Separator className="my-8 opacity-20" />
          <div className="text-center mb-6">
            <h3 className="text-2xl font-black text-accent mb-2"
                style={{ fontFamily: 'var(--font-heading)' }}>
              Deeper Reflection
            </h3>
            {!isInFollowUpWindow ? (
              <div className="bg-muted/50 border-2 border-muted-foreground/30 rounded-lg p-4 mt-4">
                <p className="text-base text-foreground/70 font-bold"
                   style={{ fontFamily: 'var(--font-body)' }}>
                  ⏰ Follow-up reflections are locked. Submit a new main reflection to unlock a 2-minute bonus window!
                </p>
              </div>
            ) : (
              <p className="text-base text-foreground/80 font-bold"
                 style={{ fontFamily: 'var(--font-body)' }}>
                You've unlocked a deeper question.
              </p>
            )}
          </div>

          {isInFollowUpWindow && (
            <Card className="p-6 md:p-8 bg-card border-border">
              {/* Display the original reflection */}
              {submittedPrimaryReflection && (
                <div className="mb-6 p-4 bg-muted/30 border-2 border-accent/40 rounded-lg">
                  <p className="text-sm font-bold text-accent/80 mb-2"
                     style={{ fontFamily: 'var(--font-heading)' }}>
                    YOUR ORIGINAL REFLECTION:
                  </p>
                  <p className="text-base text-foreground/90 leading-relaxed italic"
                     style={{ fontFamily: 'var(--font-body)' }}>
                    "{submittedPrimaryReflection}"
                  </p>
                </div>
              )}
              
              <p className="text-xl text-center text-foreground/95 leading-relaxed mb-6 font-bold"
                 style={{ fontFamily: 'var(--font-body)' }}>
                {followUpQuestions?.['follow-up'] || "Why do you think this lesson is often overlooked?"}
              </p>

              <Textarea
                value={followUpReflection}
                onChange={(e) => setFollowUpReflection(e.target.value)}
                placeholder="Write your follow-up reflection…"
                className="min-h-[150px] text-base bg-background border-border resize-none mb-3"
                style={{ fontFamily: 'var(--font-body)' }}
              />

              <div className="flex items-center justify-between mb-4">
                <span className="text-base text-foreground/80 font-bold" style={{ fontFamily: 'var(--font-body)' }}>
                  Word count: <span className="font-black">{followUpWordCount} words</span>
                </span>
                {followUpWordCount >= 20 && (
                  <span className="text-base text-accent font-black flex items-center gap-1"
                        style={{ fontFamily: 'var(--font-body)' }}>
                    <Sparkles className="w-4 h-4" />
                    +{getTokenReward(followUpWordCount, 'follow-up')} Tokens
                  </span>
                )}
              </div>

              <Button
                onClick={handleFollowUpSubmit}
                disabled={isFollowUpSubmitting || followUpWordCount < 20}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {isFollowUpSubmitting ? 'Adding to Archive...' : 'Submit Follow-Up Reflection'}
              </Button>
            </Card>
          )}
        </>
      )}

      {/* Third Deeper Reflection (unlocked after follow-up) */}
      {hasFollowUp && !hasDeeper && isInFollowUpWindow && (
        <>
          <Separator className="my-8 opacity-20" />
          <div className="text-center mb-6">
            <h3 className="text-2xl font-black text-accent mb-2"
                style={{ fontFamily: 'var(--font-heading)' }}>
              Reflection Chain
            </h3>
            <p className="text-base text-foreground/80 font-bold"
               style={{ fontFamily: 'var(--font-body)' }}>
              Build on your previous reflection with deeper insights.
            </p>
          </div>

          <Card className="p-6 md:p-8 bg-card border-border">
            {/* Display previous reflections */}
            {submittedPrimaryReflection && (
              <div className="mb-6 space-y-4">
                <div className="p-4 bg-muted/30 border-2 border-accent/40 rounded-lg">
                  <p className="text-sm font-bold text-accent/80 mb-2"
                     style={{ fontFamily: 'var(--font-heading)' }}>
                    YOUR ORIGINAL REFLECTION:
                  </p>
                  <p className="text-base text-foreground/90 leading-relaxed italic"
                     style={{ fontFamily: 'var(--font-body)' }}>
                    "{submittedPrimaryReflection}"
                  </p>
                </div>
                
                {submittedFollowUpReflection && (
                  <div className="p-4 bg-muted/30 border-2 border-primary/40 rounded-lg">
                    <p className="text-sm font-bold text-primary/80 mb-2"
                       style={{ fontFamily: 'var(--font-heading)' }}>
                      YOUR FOLLOW-UP REFLECTION:
                    </p>
                    <p className="text-base text-foreground/90 leading-relaxed italic"
                       style={{ fontFamily: 'var(--font-body)' }}>
                      "{submittedFollowUpReflection}"
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <p className="text-xl text-center text-foreground/95 leading-relaxed mb-6 font-bold"
               style={{ fontFamily: 'var(--font-body)' }}>
              {followUpQuestions?.['deeper'] || "Who taught you this lesson in real life?"}
            </p>

            <Textarea
              value={deeperReflection}
              onChange={(e) => setDeeperReflection(e.target.value)}
              placeholder="Write your deeper reflection…"
              className="min-h-[150px] text-base bg-background border-border resize-none mb-3"
              style={{ fontFamily: 'var(--font-body)' }}
            />

            <div className="flex items-center justify-between mb-4">
              <span className="text-base text-foreground/80 font-bold" style={{ fontFamily: 'var(--font-body)' }}>
                Word count: <span className="font-black">{deeperWordCount} words</span>
              </span>
              {deeperWordCount >= 20 && (
                <span className="text-base text-accent font-black flex items-center gap-1"
                      style={{ fontFamily: 'var(--font-body)' }}>
                  <Sparkles className="w-4 h-4" />
                  +{getTokenReward(deeperWordCount, 'deeper')} Tokens
                </span>
              )}
            </div>

            <Button
              onClick={handleDeeperSubmit}
              disabled={isDeeperSubmitting || deeperWordCount < 20}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {isDeeperSubmitting ? 'Adding to Archive...' : 'Submit Deeper Reflection'}
            </Button>
          </Card>
        </>
      )}

      {/* Archive Response Feature */}
      {hasPrimary && randomArchiveReflection && !hasArchiveResponse && isInFollowUpWindow && (
        <>
          <Separator className="my-8 opacity-20" />
          <div className="text-center mb-6">
            <h3 className="text-2xl font-black text-accent mb-2"
                style={{ fontFamily: 'var(--font-heading)' }}>
              Respond to Archive Entry
            </h3>
            <p className="text-base text-foreground/80 font-bold"
               style={{ fontFamily: 'var(--font-body)' }}>
              Engage with another visitor's reflection.
            </p>
          </div>

          <Card className="p-6 md:p-8 bg-card border-border">
            <div className="mb-6 p-4 bg-muted/30 rounded-md border border-border/50">
              <p className="text-base text-foreground/80 leading-relaxed italic"
                 style={{ fontFamily: 'var(--font-body)' }}>
                "{randomArchiveReflection.content}"
              </p>
            </div>

            <p className="text-lg text-center text-foreground/90 mb-6 font-bold"
               style={{ fontFamily: 'var(--font-body)' }}>
              {followUpQuestions?.['archive-response'] || "What would you add to this reflection?"}
            </p>

            <Textarea
              value={archiveResponse}
              onChange={(e) => setArchiveResponse(e.target.value)}
              placeholder="Write your response…"
              className="min-h-[150px] text-base bg-background border-border resize-none mb-3"
              style={{ fontFamily: 'var(--font-body)' }}
            />

            <div className="flex items-center justify-between mb-4">
              <span className="text-base text-foreground/80 font-bold" style={{ fontFamily: 'var(--font-body)' }}>
                Word count: <span className="font-black">{archiveWordCount} words</span>
              </span>
              {archiveWordCount >= 20 && (
                <span className="text-base text-accent font-black flex items-center gap-1"
                      style={{ fontFamily: 'var(--font-body)' }}>
                  <Sparkles className="w-4 h-4" />
                  +{getTokenReward(archiveWordCount, 'archive')} Tokens
                </span>
              )}
            </div>

            <Button
              onClick={handleArchiveSubmit}
              disabled={isArchiveSubmitting || archiveWordCount < 20}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {isArchiveSubmitting ? 'Adding Response...' : 'Submit Archive Response'}
            </Button>
          </Card>
        </>
      )}

      {/* Multi-Perspective Reflection */}
      {hasDeeper && !hasPerspective && (
        <>
          <Separator className="my-8 opacity-20" />
          <div className="text-center mb-6">
            <h3 className="text-2xl font-black text-accent mb-2"
                style={{ fontFamily: 'var(--font-heading)' }}>
              Perspective Reflection
            </h3>
            <p className="text-base text-foreground/80 font-bold"
               style={{ fontFamily: 'var(--font-body)' }}>
              Consider this from a different angle.
            </p>
          </div>

          <Card className="p-6 md:p-8 bg-card border-border">
            <p className="text-xl text-center text-foreground/95 leading-relaxed mb-6 font-bold"
               style={{ fontFamily: 'var(--font-body)' }}>
              {followUpQuestions?.['perspective'] || "Imagine you're designing a report card for real life. What would you grade yourself on, and why do those things matter more than test scores?"}
            </p>

            <Textarea
              value={teacherPerspective}
              onChange={(e) => setTeacherPerspective(e.target.value)}
              placeholder="Write your perspective reflection…"
              className="min-h-[150px] text-base bg-background border-border resize-none mb-3"
              style={{ fontFamily: 'var(--font-body)' }}
            />

            <div className="flex items-center justify-between mb-4">
              <span className="text-base text-foreground/80 font-bold" style={{ fontFamily: 'var(--font-body)' }}>
                Word count: <span className="font-black">{teacherWordCount} words</span>
              </span>
              {teacherWordCount >= 20 && (
                <span className="text-base text-accent font-black flex items-center gap-1"
                      style={{ fontFamily: 'var(--font-body)' }}>
                  <Sparkles className="w-4 h-4" />
                  +80 Tokens
                </span>
              )}
            </div>

            <Button
              onClick={() => handlePerspectiveSubmit(teacherPerspective, 'teacher')}
              disabled={isPerspectiveSubmitting || teacherWordCount < 20}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {isPerspectiveSubmitting ? 'Adding to Archive...' : 'Submit Perspective Reflection'}
            </Button>
          </Card>
        </>
      )}

      {/* Time-Shift Reflection */}
      {hasPerspective && !hasTimeShift && (
        <>
          <Separator className="my-8 opacity-20" />
          <div className="text-center mb-6">
            <h3 className="text-2xl font-black text-accent mb-2"
                style={{ fontFamily: 'var(--font-heading)' }}>
              Future Reflection
            </h3>
          </div>

          <Card className="p-6 md:p-8 bg-card border-border">
            <p className="text-xl text-center text-foreground/95 leading-relaxed mb-4 font-bold"
               style={{ fontFamily: 'var(--font-body)' }}>
              {followUpQuestions?.['time-shift'] || "How might your answer to this question change in 10 years?"}
            </p>

            <p className="text-base text-center text-foreground/80 font-bold mb-6"
               style={{ fontFamily: 'var(--font-body)' }}>
              This reflection captures how perspectives evolve over time.
            </p>

            <Textarea
              value={timeShiftReflection}
              onChange={(e) => setTimeShiftReflection(e.target.value)}
              placeholder="Write your future reflection…"
              className="min-h-[150px] text-base bg-background border-border resize-none mb-3"
              style={{ fontFamily: 'var(--font-body)' }}
            />

            <div className="flex items-center justify-between mb-4">
              <span className="text-base text-foreground/80 font-bold" style={{ fontFamily: 'var(--font-body)' }}>
                Word count: <span className="font-black">{timeShiftWordCount} words</span>
              </span>
              {timeShiftWordCount >= 20 && (
                <span className="text-base text-accent font-black flex items-center gap-1"
                      style={{ fontFamily: 'var(--font-body)' }}>
                  <Sparkles className="w-4 h-4" />
                  +150 Tokens
                </span>
              )}
            </div>

            <Button
              onClick={handleTimeShiftSubmit}
              disabled={isTimeShiftSubmitting || timeShiftWordCount < 20}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {isTimeShiftSubmitting ? 'Adding to Archive...' : 'Submit Future Reflection'}
            </Button>
          </Card>
        </>
      )}

      {/* All Complete Message */}
      {hasTimeShift && (
        <>
          <Separator className="my-8 opacity-20" />
          <div className="text-center py-8">
            <Sparkles className="w-16 h-16 text-accent mx-auto mb-4" />
            <h3 className="text-2xl font-black text-accent mb-2"
                style={{ fontFamily: 'var(--font-heading)' }}>
              Journey Complete
            </h3>
            <p className="text-base text-foreground/80 font-bold max-w-md mx-auto"
               style={{ fontFamily: 'var(--font-body)' }}>
              You've contributed deeply to the Wildcard Cultural Archive. Your reflections help shape the collective wisdom of this community.
            </p>
          </div>
        </>
      )}
    </div>
  );
}