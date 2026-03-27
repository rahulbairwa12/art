import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Reflection quality validation function
function validateReflectionQuality(content: string): { isValid: boolean; reason?: string } {
  const trimmedContent = content.trim();
  
  // 1. Check minimum length
  if (trimmedContent.length < 20) {
    return { isValid: false, reason: "Reflection is too short. Please write at least 20 words." };
  }
  
  // 2. Split into words
  const words = trimmedContent.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  if (wordCount < 20) {
    return { isValid: false, reason: "Reflection must contain at least 20 words." };
  }
  
  // 3. Check for repeated words (more than 40% of content is the same word)
  const wordFrequency = new Map<string, number>();
  words.forEach(word => {
    const normalizedWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalizedWord.length > 0) {
      wordFrequency.set(normalizedWord, (wordFrequency.get(normalizedWord) || 0) + 1);
    }
  });
  
  const maxFrequency = Math.max(...Array.from(wordFrequency.values()));
  if (maxFrequency / wordCount > 0.4) {
    return { isValid: false, reason: "Your reflection contains too many repeated words. Please write a more varied response." };
  }
  
  // 4. Check for unique words (at least 50% should be unique)
  const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-z0-9]/g, '')));
  const uniqueRatio = uniqueWords.size / wordCount;
  if (uniqueRatio < 0.5) {
    return { isValid: false, reason: "Your reflection needs more variety. Please use different words and express your thoughts more fully." };
  }
  
  // 5. Check for keyboard mashing (sequences of 5+ consecutive characters that aren't real words)
  const hasKeyboardMashing = /([a-z])\1{4,}|asdf|qwer|zxcv|jkl;|hjkl/i.test(trimmedContent);
  if (hasKeyboardMashing) {
    return { isValid: false, reason: "Your reflection appears to contain random characters. Please write a genuine response." };
  }
  
  // 6. Check average word length (too short suggests single-letter spam)
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / wordCount;
  if (avgWordLength < 2.5) {
    return { isValid: false, reason: "Your reflection seems incomplete. Please write thoughtful sentences." };
  }
  
  // 7. Check for minimum sentence structure (at least 2 sentences)
  const sentences = trimmedContent.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length < 2) {
    return { isValid: false, reason: "Please write at least 2 complete sentences in your reflection." };
  }
  
  // 8. Check for excessive punctuation or special characters
  const specialCharCount = (trimmedContent.match(/[^a-zA-Z0-9\s.!?,;:'"()-]/g) || []).length;
  if (specialCharCount / trimmedContent.length > 0.1) {
    return { isValid: false, reason: "Your reflection contains too many special characters. Please write naturally." };
  }
  
  // 9. Check for all caps (more than 50% uppercase suggests shouting/spam)
  const upperCount = (trimmedContent.match(/[A-Z]/g) || []).length;
  const letterCount = (trimmedContent.match(/[a-zA-Z]/g) || []).length;
  if (letterCount > 0 && upperCount / letterCount > 0.5) {
    return { isValid: false, reason: "Please use normal capitalization in your reflection." };
  }
  
  return { isValid: true };
}

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-0c0022a7/health", (c) => {
  return c.json({ status: "ok" });
});

// Validate artifact code and return theme info
app.post("/make-server-0c0022a7/validate-code", async (c) => {
  try {
    const { code } = await c.req.json();
    
    if (!code) {
      return c.json({ error: "Code is required" }, 400);
    }

    // Check if code exists
    const codeData = await kv.get(`artifact_code:${code}`);
    
    if (!codeData) {
      return c.json({ error: "Invalid artifact code" }, 404);
    }

    // Get theme data
    const themeData = await kv.get(`theme:${codeData.themeId}`);
    
    if (!themeData) {
      return c.json({ error: "Theme not found" }, 404);
    }

    // Calculate current prompt based on rotation
    let currentPrompt = themeData.currentPrompt || "";
    if (themeData.prompts && themeData.prompts.length > 0 && themeData.promptStartDate) {
      currentPrompt = getCurrentPrompt(themeData.prompts, themeData.promptStartDate);
    }

    // Get current follow-up questions based on rotation
    let currentFollowUpQuestions = themeData.followUpQuestions?.[0] || {};
    if (themeData.followUpQuestions && themeData.followUpQuestions.length > 0 && themeData.promptStartDate) {
      currentFollowUpQuestions = getCurrentFollowUpQuestions(themeData.followUpQuestions, themeData.promptStartDate);
    }

    // Get reward tiers (use default if not specified)
    const rewardTiers = themeData.rewardTiers || [
      { tokens: 100, discount: 10, code: 'VIBE10' },
      { tokens: 250, discount: 20, code: 'VIBE20' },
      { tokens: 500, discount: 30, code: 'VIBE30' },
      { tokens: 750, discount: 40, code: 'VIBE40' },
      { tokens: 1000, discount: 50, code: 'VIBE50' },
    ];
    
    // Generate or retrieve user ID
    const userId = codeData.userId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Update code with userId if new
    if (!codeData.userId) {
      await kv.set(`artifact_code:${code}`, { ...codeData, userId });
    }

    // Get user's token data
    const userTokenData = await kv.get(`user_tokens:${userId}`) || { 
      tokens: 0, 
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      unlockedRewards: []
    };
    
    // Check if tokens have expired
    const now = new Date();
    const expiresAt = new Date(userTokenData.expiresAt);
    
    if (now > expiresAt) {
      // Reset tokens if expired
      userTokenData.tokens = 0;
      userTokenData.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
      userTokenData.unlockedRewards = [];
      await kv.set(`user_tokens:${userId}`, userTokenData);
    }

    return c.json({
      userId,
      themeId: codeData.themeId,
      theme: {
        ...themeData,
        currentPrompt,
        currentFollowUpQuestions,
        rewardTiers
      },
      tokens: userTokenData.tokens,
      expiresAt: userTokenData.expiresAt,
      unlockedRewards: userTokenData.unlockedRewards || [],
      promptStartDate: themeData.promptStartDate
    });
  } catch (error) {
    console.log(`Error validating artifact code: ${error}`);
    return c.json({ error: "Server error while validating code" }, 500);
  }
});

// Submit a reflection
app.post("/make-server-0c0022a7/submit-reflection", async (c) => {
  try {
    const { userId, themeId, content, promptId, reflectionType } = await c.req.json();
    
    if (!userId || !themeId || !content) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Check if user is trying to submit a main reflection
    if (reflectionType === 'main' || !reflectionType || reflectionType === 'primary') {
      // Get theme data to check current prompt period
      const themeData = await kv.get(`theme:${themeId}`);
      
      // Get user's last main reflection submission for this theme
      const userProgressKey = `user_progress:${userId}:${themeId}`;
      const userProgress = await kv.get(userProgressKey) || { reflections: [] };
      
      // Find the most recent main reflection
      const mainReflections = userProgress.reflections.filter((r: any) => 
        r.type === 'main' || r.type === 'primary'
      );
      
      if (mainReflections.length > 0) {
        const lastMainReflection = mainReflections[mainReflections.length - 1];
        const lastSubmissionDate = new Date(lastMainReflection.timestamp);
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        
        if (lastSubmissionDate > twoWeeksAgo) {
          // User submitted within the last 2 weeks - check if it's the same prompt period
          const lastSubmissionTime = lastSubmissionDate.getTime();
          const now = Date.now();
          
          // Calculate which 2-week period we're in
          const startDate = themeData?.promptStartDate ? new Date(themeData.promptStartDate).getTime() : now;
          const currentPeriodIndex = Math.floor((now - startDate) / (14 * 24 * 60 * 60 * 1000));
          const lastPeriodIndex = Math.floor((lastSubmissionTime - startDate) / (14 * 24 * 60 * 60 * 1000));
          
          if (currentPeriodIndex === lastPeriodIndex) {
            // Same 2-week period - reject
            const periodStartTime = startDate + (currentPeriodIndex * 14 * 24 * 60 * 60 * 1000);
            const nextAvailableDate = new Date(periodStartTime + 14 * 24 * 60 * 60 * 1000);
            return c.json({ 
              error: "Already submitted reflection for this period",
              nextAvailableDate: nextAvailableDate.toISOString(),
              isOnCooldown: true
            }, 429);
          }
        }
      }
    }

    // Validate reflection quality
    const validationResult = validateReflectionQuality(content);
    if (!validationResult.isValid) {
      return c.json({ 
        error: validationResult.reason,
        isQualityIssue: true 
      }, 400);
    }

    // Calculate tokens based on content length and reflection type
    const wordCount = content.trim().split(/\s+/).length;
    let tokensEarned = 0;
    
    // Base tokens by word count
    if (wordCount >= 100) {
      tokensEarned = 150;
    } else if (wordCount >= 50) {
      tokensEarned = 100;
    } else if (wordCount >= 20) {
      tokensEarned = 50;
    }
    
    // Bonus tokens based on reflection type
    if (reflectionType === 'follow-up') {
      tokensEarned = Math.max(tokensEarned, 100);
    } else if (reflectionType === 'deeper') {
      tokensEarned = Math.max(tokensEarned, 150);
    } else if (reflectionType === 'archive-response') {
      tokensEarned = Math.max(tokensEarned, 120);
    } else if (reflectionType === 'perspective') {
      tokensEarned = Math.max(tokensEarned, 80);
    } else if (reflectionType === 'time-shift') {
      tokensEarned = Math.max(tokensEarned, 150);
    }

    // Create reflection
    const reflectionId = `reflection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const reflection = {
      userId,
      themeId,
      content,
      promptId: promptId || 'default',
      reflectionType: reflectionType || 'primary',
      tokens: tokensEarned,
      timestamp: new Date().toISOString()
    };

    await kv.set(`reflection:${reflectionId}`, reflection);

    // Add to theme reflections
    const themeReflections = await kv.get(`theme_reflections:${themeId}`) || [];
    themeReflections.push(reflectionId);
    await kv.set(`theme_reflections:${themeId}`, themeReflections);
    
    // Track user's reflection progress for this theme
    const userProgressKey = `user_progress:${userId}:${themeId}`;
    const userProgress = await kv.get(userProgressKey) || { reflections: [] };
    userProgress.reflections.push({
      id: reflectionId,
      type: reflectionType || 'primary',
      timestamp: new Date().toISOString()
    });
    await kv.set(userProgressKey, userProgress);

    // Update user tokens
    const currentTokenData = await kv.get(`user_tokens:${userId}`) || {
      tokens: 0,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      unlockedRewards: []
    };
    
    const newTokens = currentTokenData.tokens + tokensEarned;
    
    // Extend expiration date on new activity
    const newExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    
    // Get theme reward tiers for checking unlocked rewards
    const themeData = await kv.get(`theme:${themeId}`);
    const rewardTiers = themeData?.rewardTiers || [
      { tokens: 100, discount: 10, code: 'VIBE10' },
      { tokens: 250, discount: 20, code: 'VIBE20' },
      { tokens: 500, discount: 30, code: 'VIBE30' },
      { tokens: 750, discount: 40, code: 'VIBE40' },
      { tokens: 1000, discount: 50, code: 'VIBE50' },
    ];
    
    // Check for newly unlocked rewards
    const previousRewards = currentTokenData.unlockedRewards || [];
    const newlyUnlocked = [];
    
    for (const tier of rewardTiers) {
      if (newTokens >= tier.tokens && !previousRewards.includes(tier.tokens)) {
        newlyUnlocked.push(tier.tokens);
        previousRewards.push(tier.tokens);
      }
    }
    
    await kv.set(`user_tokens:${userId}`, {
      tokens: newTokens,
      expiresAt: newExpiresAt,
      unlockedRewards: previousRewards
    });

    // Calculate next available date for main reflections
    let nextAvailableDate = null;
    if (reflectionType === 'main' || reflectionType === 'primary') {
      const themeData = await kv.get(`theme:${themeId}`);
      const now = Date.now();
      const startDate = themeData?.promptStartDate ? new Date(themeData.promptStartDate).getTime() : now;
      const currentPeriodIndex = Math.floor((now - startDate) / (14 * 24 * 60 * 60 * 1000));
      const periodStartTime = startDate + (currentPeriodIndex * 14 * 24 * 60 * 60 * 1000);
      nextAvailableDate = new Date(periodStartTime + 14 * 24 * 60 * 60 * 1000).toISOString();
    }

    return c.json({
      success: true,
      tokensEarned,
      totalTokens: newTokens,
      reflectionId,
      expiresAt: newExpiresAt,
      newlyUnlockedRewards: newlyUnlocked,
      nextAvailableDate
    });
  } catch (error) {
    console.log(`Error submitting reflection: ${error}`);
    return c.json({ error: "Server error while submitting reflection" }, 500);
  }
});

// Get archive reflections for a theme
app.get("/make-server-0c0022a7/archive/:themeId", async (c) => {
  try {
    const themeId = c.req.param("themeId");
    
    const reflectionIds = await kv.get(`theme_reflections:${themeId}`) || [];
    
    // Get up to 10 random reflections
    const shuffled = [...reflectionIds].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);
    
    const reflections = [];
    for (const id of selected) {
      const reflection = await kv.get(`reflection:${id}`);
      if (reflection) {
        // Return anonymous version
        reflections.push({
          content: reflection.content,
          timestamp: reflection.timestamp
        });
      }
    }

    return c.json({ reflections });
  } catch (error) {
    console.log(`Error fetching archive reflections: ${error}`);
    return c.json({ error: "Server error while fetching reflections" }, 500);
  }
});

// Get user's reflection progress for a theme
app.get("/make-server-0c0022a7/user-progress/:userId/:themeId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const themeId = c.req.param("themeId");
    
    const userProgressKey = `user_progress:${userId}:${themeId}`;
    const userProgress = await kv.get(userProgressKey) || { reflections: [] };
    
    // Check if user has added this theme's song to their library
    const libraryKey = `library:${userId}:${themeId}`;
    const hasAddedToLibrary = await kv.get(libraryKey) !== null;
    
    // Get redeemed rewards
    const redeemedRewardsKey = `redeemed_rewards:${userId}:${themeId}`;
    const redeemedRewards = await kv.get(redeemedRewardsKey) || [];
    
    return c.json({ ...userProgress, hasAddedToLibrary, redeemedRewards });
  } catch (error) {
    console.log(`Error fetching user progress: ${error}`);
    return c.json({ error: "Server error while fetching progress" }, 500);
  }
});

// Check if user is on cooldown for submitting main reflections
app.get("/make-server-0c0022a7/check-cooldown/:userId/:themeId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const themeId = c.req.param("themeId");
    
    // Get theme data to check current prompt period
    const themeData = await kv.get(`theme:${themeId}`);
    
    // Get user's last main reflection submission for this theme
    const userProgressKey = `user_progress:${userId}:${themeId}`;
    const userProgress = await kv.get(userProgressKey) || { reflections: [] };
    
    // Find the most recent main reflection
    const mainReflections = userProgress.reflections.filter((r: any) => 
      r.type === 'main' || r.type === 'primary'
    );
    
    if (mainReflections.length > 0) {
      const lastMainReflection = mainReflections[mainReflections.length - 1];
      const lastSubmissionDate = new Date(lastMainReflection.timestamp);
      const lastSubmissionTime = lastSubmissionDate.getTime();
      const now = Date.now();
      
      // Calculate which 2-week period we're in
      const startDate = themeData?.promptStartDate ? new Date(themeData.promptStartDate).getTime() : now;
      const currentPeriodIndex = Math.floor((now - startDate) / (14 * 24 * 60 * 60 * 1000));
      const lastPeriodIndex = Math.floor((lastSubmissionTime - startDate) / (14 * 24 * 60 * 60 * 1000));
      
      if (currentPeriodIndex === lastPeriodIndex) {
        // Same 2-week period - user is on cooldown
        const periodStartTime = startDate + (currentPeriodIndex * 14 * 24 * 60 * 60 * 1000);
        const nextAvailableDate = new Date(periodStartTime + 14 * 24 * 60 * 60 * 1000);
        
        return c.json({ 
          isOnCooldown: true,
          nextAvailableDate: nextAvailableDate.toISOString()
        });
      }
    }
    
    // User is not on cooldown
    return c.json({ 
      isOnCooldown: false,
      nextAvailableDate: null
    });
  } catch (error) {
    console.log(`Error checking cooldown status: ${error}`);
    return c.json({ error: "Server error while checking cooldown" }, 500);
  }
});

// Add song to user's library
app.post("/make-server-0c0022a7/add-to-library", async (c) => {
  try {
    const { userId, themeId, youtubeVideoId, title } = await c.req.json();
    
    if (!userId || !themeId || !youtubeVideoId || !title) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    // Store in library
    const libraryKey = `library:${userId}:${themeId}`;
    await kv.set(libraryKey, {
      themeId,
      youtubeVideoId,
      title,
      addedAt: new Date().toISOString()
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error adding to library: ${error}`);
    return c.json({ error: "Server error while adding to library" }, 500);
  }
});

// Redeem a reward code and deduct tokens
app.post("/make-server-0c0022a7/redeem-reward", async (c) => {
  try {
    const { userId, themeId, rewardTier } = await c.req.json();
    
    if (!userId || !themeId || !rewardTier) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    // Get current redeemed rewards
    const redeemedRewardsKey = `redeemed_rewards:${userId}:${themeId}`;
    const redeemedRewards = await kv.get(redeemedRewardsKey) || [];
    
    // Check if already redeemed
    if (redeemedRewards.includes(rewardTier)) {
      return c.json({ error: "Reward already redeemed" }, 400);
    }
    
    // Get user's current token data
    const userTokenData = await kv.get(`user_tokens:${userId}`);
    
    if (!userTokenData) {
      return c.json({ error: "User token data not found" }, 404);
    }

    // Check if user has enough tokens
    if (userTokenData.tokens < rewardTier) {
      return c.json({ error: "Insufficient tokens" }, 400);
    }

    // Deduct tokens
    const remainingTokens = userTokenData.tokens - rewardTier;
    
    // Update user token data
    await kv.set(`user_tokens:${userId}`, {
      ...userTokenData,
      tokens: remainingTokens,
    });
    
    // Add to redeemed rewards
    redeemedRewards.push(rewardTier);
    await kv.set(redeemedRewardsKey, redeemedRewards);
    
    return c.json({ 
      success: true, 
      redeemedRewards,
      remainingTokens,
      tokensDeducted: rewardTier
    });
  } catch (error) {
    console.log(`Error redeeming reward: ${error}`);
    return c.json({ error: "Server error while redeeming reward" }, 500);
  }
});

// Helper function to get current prompt based on 2-week rotation
function getCurrentPrompt(prompts: string[], startDate: string): string {
  if (!prompts || prompts.length === 0) return "";
  
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  
  // Every 2 weeks = new prompt
  const promptIndex = Math.floor(diffWeeks / 2) % prompts.length;
  return prompts[promptIndex];
}

// Helper function to get current follow-up questions based on 2-week rotation
function getCurrentFollowUpQuestions(followUpQuestions: { [key: string]: string }[], startDate: string): { [key: string]: string } {
  if (!followUpQuestions || followUpQuestions.length === 0) return {};
  
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  
  // Every 2 weeks = new prompt
  const questionIndex = Math.floor(diffWeeks / 2) % followUpQuestions.length;
  return followUpQuestions[questionIndex];
}

// Initialize sample themes (for demo purposes)
app.post("/make-server-0c0022a7/init-sample-data", async (c) => {
  try {
    // Theme data configuration
    const themeData: Record<string, any> = {
      'classact': {
        title: "Class Act",
        description: "This theme questions what education is really meant to measure. It asks us to consider the qualities that schools should cultivate—like creativity, curiosity, and critical thinking—beyond what can be graded on a test.",
        youtubeVideoId: "NqxAPe21K28",
        artworkUrl: "https://placehold.co/600x400?text=a1f366",
        themeDetails: {
          artistStatement: "Class Act explores what education is really meant to cultivate. Beyond grades and tests, it asks us to consider the qualities that shape our lives most—curiosity, courage, creativity, and critical thinking. The piece invites viewers to reflect on the lessons that stay with us long after the classroom.",
          yearCreated: "2024",
          medium: "Acrylic on Wood",
          dimensions: "16\" × 18\"",
          inspiration: "Class Act was inspired by the question: What should education actually measure? Through this work, I'm exploring the gap between what schools often reward and the deeper lessons that truly shape who we become. As part of the Wildcard puzzle, the piece invites people to add their own reflections and help build a collective archive of perspectives on learning."
        },
        overviewButtonText: "Full Lesson Plan",
        overviewIcon: "GraduationCap",
        prompts: ["What is one thing you learned outside the classroom that changed the way you see the world?"],
        promptStartDate: "2026-03-08T00:00:00.000Z",
        followUpQuestions: [
          {
            "follow-up": "What moment or experience outside of school taught you that lesson? Walk us through how it unfolded.",
            "deeper": "If you could add this lesson as a required class in every school, what would the curriculum look like?",
            "archive-response": "Someone else shared about learning empathy through volunteer work. What's a life skill you learned outside school that grades could never measure?",
            "perspective": "Imagine you're designing a report card for real life. What would you grade yourself on, and why do those things matter more than test scores?",
            "time-shift": "When you're 80 years old, which lessons from outside the classroom will matter most? Why?"
          }
        ],
        rewardTiers: [
          { tokens: 100, discount: 10, code: 'VIBE10' },
          { tokens: 250, discount: 20, code: 'VIBE20' },
          { tokens: 500, discount: 30, code: 'VIBE30' },
          { tokens: 750, discount: 40, code: 'VIBE40' },
          { tokens: 1000, discount: 50, code: 'VIBE50' },
        ]
      },
      'newbeginnings': {
        title: "New Beginnings",
        description: "This theme reflects on the courage it takes to start again. It asks us to consider how moments of renewal and resilience shape the next chapter of our lives, and what it means to embrace the possibility of change.",
        youtubeVideoId: "g2zBPGrIr3c",
        artworkUrl: "https://placehold.co/600x400?text=94b2f5",
        themeDetails: {
          artistStatement: "New Beginnings explores the courage and hope required to start again. Beyond endings and setbacks, it asks us to consider how renewal, resilience, and possibility shape the next chapter of our lives. The piece invites viewers to reflect on the moments when choosing to begin again changes everything.",
          yearCreated: "2014",
          medium: "Acrylic on Wood",
          dimensions: "16\" x 21\"",
          inspiration: "New Beginnings was inspired by the question: What does it really take to start again? Through this work, I'm exploring the tension between endings and the hope that makes renewal possible. As part of the Wildcard puzzle, the piece invites people to reflect on their own moments of starting over and contribute to a shared archive of stories about resilience and change."
        },
        overviewButtonText: "Renewal Guide",
        overviewIcon: "Sunrise",
        prompts: ["What is a moment when you chose to start over, and what gave you the courage to take that first step?"],
        promptStartDate: "2026-03-08T00:00:00.000Z",
        followUpQuestions: [
          {
            "follow-up": "Describe the moment right before you decided to start over. What were you feeling, and what finally pushed you to make that choice?",
            "deeper": "What part of yourself did you have to let go of in order to begin again? How did that change you?",
            "archive-response": "Someone else wrote about starting over after a major loss. What advice would you give to someone standing at the edge of a new beginning?",
            "perspective": "If you could go back and speak to yourself on the day you started over, what would you say?",
            "time-shift": "Ten years from now, how do you think you'll look back on this moment of starting again? What will it have made possible?"
          }
        ],
        rewardTiers: [
          { tokens: 100, discount: 10, code: 'VIBE10' },
          { tokens: 250, discount: 20, code: 'VIBE20' },
          { tokens: 500, discount: 30, code: 'VIBE30' },
          { tokens: 750, discount: 40, code: 'VIBE40' },
          { tokens: 1000, discount: 50, code: 'VIBE50' },
        ]
      },
      'rootsoflove': {
        title: "Roots of Love",
        description: "This theme explores how generations of resilience, care, and sacrifice planted the roots for the love and community we experience today. It asks us to reflect on the connection between legacy and love.",
        youtubeVideoId: "qGjvJLzT_20",
        artworkUrl: "https://placehold.co/600x400?text=42c483",
        themeDetails: {
          artistStatement: "Roots of Love explores the connection between love and legacy. By pairing the themes of Black History Month and Valentine's Day, the piece reflects on how generations of resilience, care, and sacrifice continue to shape the ways we love and support one another today.",
          yearCreated: "2024",
          medium: "Acrylic on Wood",
          dimensions: "16\" x 18\"",
          inspiration: "Roots of Love was inspired by the overlap between Black History Month and the cultural celebration of love in February. The piece reflects on how the struggles and triumphs of those who came before us planted the roots for the love, community, and resilience we continue to grow today."
        },
        overviewButtonText: "Legacy Guide",
        overviewIcon: "Heart",
        prompts: ["How has the love, sacrifice, or resilience of those who came before you shaped the way you show up in the world today?"],
        promptStartDate: "2026-03-08T00:00:00.000Z",
        followUpQuestions: [
          {
            "follow-up": "Tell us a specific story about someone from a past generation whose sacrifice or resilience made your life possible.",
            "deeper": "What values or lessons from those who came before you do you carry forward in your daily life?",
            "archive-response": "Someone else wrote about their grandmother's strength during difficult times. How do the struggles of previous generations inspire the way you love and support others today?",
            "perspective": "If the people who sacrificed for you could see your life now, what do you think they would be most proud of?",
            "time-shift": "What part of your ancestors' resilience do you hope your children or future generations will inherit from you?"
          }
        ],
        rewardTiers: [
          { tokens: 100, discount: 10, code: 'VIBE10' },
          { tokens: 250, discount: 20, code: 'VIBE20' },
          { tokens: 500, discount: 30, code: 'VIBE30' },
          { tokens: 750, discount: 40, code: 'VIBE40' },
          { tokens: 1000, discount: 50, code: 'VIBE50' },
        ]
      },
      'shereigns': {
        title: "She Reigns!",
        description: "This theme celebrates the power, leadership, and influence of women who shape families, communities, and movements. It asks us to reflect on how strength and compassion coexist in the many ways women lead.",
        youtubeVideoId: "WJtgv1kRw44",
        artworkUrl: "https://placehold.co/600x400?text=c81c6f",
        themeDetails: {
          artistStatement: "She Reigns! celebrates the power, leadership, and influence of women who shape families, communities, and movements. The piece reflects on how strength and compassion coexist, honoring the many ways women lead with resilience, wisdom, and grace.",
          yearCreated: "2024",
          medium: "Acrylic on Wood",
          dimensions: "34' × 19.5'",
          inspiration: "She Reigns! was inspired by the countless women whose leadership and resilience often go unrecognized. The piece reflects on the ways women continue to shape culture, community, and history through courage, care, and unwavering determination."
        },
        overviewButtonText: "Empowerment Guide",
        overviewIcon: "Crown",
        prompts: ["Who is a woman in your life whose strength or leadership has shaped who you are, and what did she teach you?"],
        promptStartDate: "2026-03-08T00:00:00.000Z",
        followUpQuestions: [
          {
            "follow-up": "Describe a specific moment when you witnessed her strength or leadership in action. What did that moment teach you?",
            "deeper": "How has her example changed the way you approach challenges, relationships, or your own leadership?",
            "archive-response": "Someone else wrote about a woman who led with quiet strength. What qualities of the woman in your life do you hope to embody?",
            "perspective": "If she could write you a letter about your own strength and potential, what would it say?",
            "time-shift": "How will her legacy of leadership continue to shape the next generation? What part of her will live on through you?"
          }
        ],
        rewardTiers: [
          { tokens: 100, discount: 10, code: 'VIBE10' },
          { tokens: 250, discount: 20, code: 'VIBE20' },
          { tokens: 500, discount: 30, code: 'VIBE30' },
          { tokens: 750, discount: 40, code: 'VIBE40' },
          { tokens: 1000, discount: 50, code: 'VIBE50' },
        ]
      },
      'worldofwaste': {
        title: "World of Waste",
        description: "This theme confronts the scale of waste produced by modern life. It asks us to consider what our habits of consumption reveal about how we value the planet and its resources.",
        youtubeVideoId: "KafO-OpELi4",
        artworkUrl: "https://placehold.co/600x400?text=6fd616",
        themeDetails: {
          artistStatement: "World of Waste explores the impact of human consumption on the planet we all share. By confronting the scale of what we discard, the piece asks us to consider how our everyday choices shape the health of the environments around us. It invites viewers to reflect on our collective responsibility to care for the world we inhabit.",
          yearCreated: "2024",
          medium: "Acrylic on Wood",
          dimensions: "34\" x 19.5\"",
          inspiration: "World of Waste was inspired by the question: What does our waste say about the way we live? Through this work, I'm exploring the tension between convenience and responsibility in a world defined by excess consumption. As part of the Wildcard puzzle, the piece invites people to contribute their reflections and help build a collective archive of perspectives on environmental stewardship."
        },
        overviewButtonText: "Impact Guide",
        overviewIcon: "Trash2",
        prompts: ["What role does waste play in your daily life, and how do your consumption habits reflect your relationship with the environment?"],
        promptStartDate: "2026-03-08T00:00:00.000Z",
        followUpQuestions: [
          {
            "follow-up": "Walk us through a typical day. What do you throw away without thinking? What do you consciously try to save or reuse?",
            "deeper": "If someone examined your trash for a week, what would it reveal about your values and priorities?",
            "archive-response": "Someone else wrote about feeling guilty every time they use single-use plastics. What's one consumption habit you've tried to change, and what made it hard or easy?",
            "perspective": "Imagine your great-grandchildren discovering a landfill from 2026. What would you want them to understand about the way you lived?",
            "time-shift": "If you could see the environmental impact of every purchase before you made it, how would your consumption habits change?"
          }
        ],
        rewardTiers: [
          { tokens: 100, discount: 10, code: 'VIBE10' },
          { tokens: 250, discount: 20, code: 'VIBE20' },
          { tokens: 500, discount: 30, code: 'VIBE30' },
          { tokens: 750, discount: 40, code: 'VIBE40' },
          { tokens: 1000, discount: 50, code: 'VIBE50' },
        ]
      },
      'echoesoftheeast': {
        title: "Echoes of the East",
        description: "This theme explores the cultural dialogue between Asian American and Pacific Islander communities and Black communities. It invites reflection on how shared histories of resilience, migration, and creativity have shaped music, art, and identity across cultures. Visitors are encouraged to consider how cultural exchange creates echoes that continue to influence generations.",
        youtubeVideoId: "X8Gs-5JMuZo",
        artworkUrl: "https://placehold.co/600x400?text=d203d3",
        themeDetails: {
          artistStatement: "Echoes of the East explores the cultural dialogue between AAPI and Black communities and the ways their histories intersect through art, music, and shared resilience. The piece reflects on how cultural expression travels across communities, influencing new forms of creativity while preserving distinct identities. By highlighting these parallels, the work encourages viewers to see culture not as isolated traditions but as evolving conversations. It invites reflection on the echoes of influence that shape who we are today.",
          yearCreated: "2024",
          medium: "Acrylic on Wood",
          dimensions: "24\" × 18\"",
          inspiration: "Echoes of the East was inspired by the parallels between AAPI and Black cultural contributions, particularly in music, art, and social movements. These communities have often faced similar struggles for recognition while simultaneously influencing one another creatively. The piece reflects on how cultural exchange becomes a powerful force for identity, solidarity, and innovation."
        },
        overviewButtonText: "Cultural Guide",
        overviewIcon: "Globe",
        prompts: ["What is a cultural influence from another community that has shaped the way you see the world?"],
        promptStartDate: "2026-03-08T00:00:00.000Z",
        followUpQuestions: [
          {
            "follow-up": "Tell us the story of how you first encountered this cultural influence. What about it captured your attention or changed your perspective?",
            "deeper": "How has this cross-cultural influence shaped your own sense of identity or the way you express yourself creatively?",
            "archive-response": "Someone else wrote about discovering hip-hop through Asian American artists. What's an example of cultural exchange in music, art, or food that has enriched your life?",
            "perspective": "If you could introduce someone from that community to a part of your own culture, what would you share and why?",
            "time-shift": "How do you think the cultural dialogues happening today will shape the art, music, and identity of the next generation?"
          }
        ],
        rewardTiers: [
          { tokens: 100, discount: 10, code: 'VIBE10' },
          { tokens: 250, discount: 20, code: 'VIBE20' },
          { tokens: 500, discount: 30, code: 'VIBE30' },
          { tokens: 750, discount: 40, code: 'VIBE40' },
          { tokens: 1000, discount: 50, code: 'VIBE50' },
        ]
      },
      'fathersofchange': {
        title: "Fathers of Change",
        description: "This theme explores the role of fatherhood in shaping legacy, resilience, and liberation. Centered on Black fatherhood, it reflects on how guidance, presence, and generational wisdom contribute to both family strength and the ongoing pursuit of freedom.",
        youtubeVideoId: "GkBLGuTUofg",
        artworkUrl: "https://placehold.co/600x400?text=842fac",
        themeDetails: {
          artistStatement: "Fathers of Change explores the power of fatherhood as a force for guidance, resilience, and transformation. By centering Black fatherhood, the piece reflects on how presence, wisdom, and protection shape families and ripple outward into communities. It invites viewers to consider how the legacy passed between generations contributes to the broader story of freedom and liberation.",
          yearCreated: "2024",
          medium: "Acrylic on Wood",
          dimensions: "30\" × 24\"",
          inspiration: "Fathers of Change was inspired by the connection between Black fatherhood and the broader pursuit of freedom symbolized by Juneteenth. Throughout history, fathers have carried forward lessons of resilience, identity, and strength in the face of adversity. The piece reflects on how these generational bonds help sustain the ongoing journey toward liberation."
        },
        overviewButtonText: "Freedom & Fatherhood Guide",
        overviewIcon: "Shield",
        prompts: ["How has a father or father figure influenced the way you understand strength, responsibility, or freedom?"],
        promptStartDate: "2026-03-08T00:00:00.000Z",
        followUpQuestions: [
          {
            "follow-up": "Tell us about a specific moment when you saw him embody strength, responsibility, or freedom. What did that moment teach you?",
            "deeper": "How have his lessons shaped the way you navigate challenges, protect others, or define your own sense of freedom?",
            "archive-response": "Someone else wrote about a father figure who taught them resilience through quiet sacrifice. What's a lesson from your father or father figure that you carry with you every day?",
            "perspective": "If you could have one more conversation with him, what would you ask or tell him about the impact he's had on your life?",
            "time-shift": "How do you hope the next generation will understand and redefine strength, responsibility, and fatherhood?"
          }
        ],
        rewardTiers: [
          { tokens: 100, discount: 10, code: 'VIBE10' },
          { tokens: 300, discount: 20, code: 'VIBE20' },
          { tokens: 600, discount: 30, code: 'VIBE30' },
          { tokens: 900, discount: 40, code: 'VIBE40' },
          { tokens: 1200, discount: 50, code: 'VIBE50' },
        ]
      },
      'unapologeticallyproud': {
        title: "Unapologetically Proud",
        description: "This theme explores the courage of living authentically and the importance of dignity, visibility, and allyship. It invites reflection on how pride, community, and support help create a world where people can live and express themselves freely.",
        youtubeVideoId: "4OJZ5wvb9hc",
        artworkUrl: "https://placehold.co/600x400?text=068b76",
        themeDetails: {
          artistStatement: "Unapologetically Proud explores the power of living openly and authentically. The piece reflects on the courage it takes to claim one's identity while celebrating the role of community and allyship in creating spaces of belonging. It invites viewers to consider how dignity, visibility, and solidarity contribute to a more inclusive world.",
          yearCreated: "2024",
          medium: "Acrylic on Wood",
          dimensions: "20.25\" × 18\"",
          inspiration: "Unapologetically Proud was inspired by the ongoing journey toward equality and acceptance within LGBTQ+ communities. The piece reflects on how pride movements have created spaces for people to live authentically while encouraging others to stand in solidarity as allies. It celebrates the courage of those who live openly and help shape a more compassionate and inclusive future."
        },
        overviewButtonText: "Pride Guide",
        overviewIcon: "Flag",
        externalLink: "https://vibesandvirtues.com/pages/landing?id=puz6#gallery-ambient-glow",
        musicLibraryLink: "https://mailchi.mp/4147f1882f30/czxhp59i3u",
        prompts: ["What does living authentically mean to you?"],
        promptStartDate: "2026-03-08T00:00:00.000Z",
        followUpQuestions: [
          {
            "follow-up": "What experiences or influences have helped you become more comfortable expressing who you are?",
            "deeper": "Why do you think authenticity can sometimes be difficult for people to embrace?",
            "archive-response": "After reading another reflection, what part of their story resonates with your own experiences?",
            "perspective": "How might someone from a different background or generation understand the idea of pride and identity differently?",
            "time-shift": "What kind of world do you hope future generations will experience when it comes to identity and belonging?"
          }
        ],
        rewardTiers: [
          { tokens: 100, discount: 10, code: 'VIBE10' },
          { tokens: 250, discount: 20, code: 'VIBE20' },
          { tokens: 500, discount: 30, code: 'VIBE30' },
          { tokens: 750, discount: 40, code: 'VIBE40' },
          { tokens: 1000, discount: 50, code: 'VIBE50' },
        ]
      },
      'patriotparadox': {
        title: "Patriot Paradox",
        description: "This theme explores the complexity of patriotism in modern America. It invites reflection on whether love for one's country requires celebration, critique, or both, and asks visitors to consider how pride and accountability can coexist.",
        youtubeVideoId: "iN9awwv9hAw",
        artworkUrl: "https://placehold.co/600x400?text=c7822f",
        themeDetails: {
          artistStatement: "Patriot Paradox explores the tension between pride and critique in the idea of modern patriotism. The piece reflects on how love for one's country can coexist with discomfort, questioning, and a desire for progress. It invites viewers to consider whether true patriotism lies in celebrating a nation as it is, or working toward what it could become.",
          yearCreated: "2024",
          medium: "Acrylic on Wood",
          dimensions: "30\" × 24\"",
          inspiration: "Patriot Paradox was inspired by the conflicting emotions many people feel when thinking about national identity today. While patriotism is often framed as unquestioning pride, the realities of history and present-day struggles invite deeper reflection. The piece explores whether confronting these contradictions may be one of the most meaningful ways to engage with the idea of patriotism."
        },
        overviewButtonText: "Patriot Guide",
        overviewIcon: "Flag",
        externalLink: "https://vibesandvirtues.com/pages/landing?id=puz8#gallery-ambient-glow",
        musicLibraryLink: "https://mailchi.mp/5fc68eebf0a6/7cpjn1jabo",
        prompts: ["What does patriotism mean to you in today's world?"],
        promptStartDate: "2026-03-08T00:00:00.000Z",
        followUpQuestions: [
          {
            "follow-up": "How do you balance love for your country with awareness of its flaws?",
            "deeper": "Can true patriotism exist without questioning or critique?",
            "archive-response": "After reading another reflection, what part of their perspective challenges or expands your own view?",
            "perspective": "How can people disagree about patriotism while still respecting one another?",
            "time-shift": "How do you think future generations will define patriotism differently from today?"
          }
        ],
        rewardTiers: [
          { tokens: 100, discount: 10, code: 'VIBE10' },
          { tokens: 250, discount: 20, code: 'VIBE20' },
          { tokens: 500, discount: 30, code: 'VIBE30' },
          { tokens: 750, discount: 40, code: 'VIBE40' },
          { tokens: 1000, discount: 50, code: 'VIBE50' },
        ]
      },
      'fallforward': {
        title: "Fall Forward",
        description: "This theme explores the idea that growth often emerges from setbacks. Inspired by the symbolism of the fall season, it reflects on how moments of loss, transition, and change can create space for renewal and resilience.",
        youtubeVideoId: "R6cPqbL_4i4",
        artworkUrl: "https://placehold.co/600x400?text=dd3ecd",
        themeDetails: {
          artistStatement: "Fall Forward explores the relationship between failure, change, and personal growth. Just as trees shed their leaves in autumn to prepare for new life, the piece reflects on how setbacks can clear space for transformation and new beginnings. It invites viewers to reconsider falling not as defeat, but as movement that ultimately carries us forward.",
          yearCreated: "2024",
          medium: "Acrylic on Wood",
          dimensions: "18\" × 26\"",
          inspiration: "Fall Forward was inspired by the symbolism of the fall season and the phrase \"falling forward.\" In nature, autumn represents a time of letting go in order to prepare for renewal. The piece reflects on how challenges, mistakes, and transitions can become catalysts for growth rather than signs of failure."
        },
        overviewButtonText: "Growth Guide",
        overviewIcon: "Leaf",
        externalLink: "https://vibesandvirtues.com/pages/landing?id=puz10#gallery-ambient-glow",
        musicLibraryLink: "https://mailchi.mp/d7fb6f420be7/xxb7np875c",
        prompts: ["What is a setback in your life that ultimately helped you grow?"],
        promptStartDate: "2026-03-08T00:00:00.000Z",
        followUpQuestions: [
          {
            "follow-up": "What did that experience teach you that success alone might not have?",
            "deeper": "Why do you think failure or struggle can sometimes lead to deeper growth?",
            "archive-response": "After reading another reflection, what part of their story resonates with your own experience?",
            "perspective": "How might your past self view the setback differently now?",
            "time-shift": "How might the challenges you face today shape the person you become in the future?"
          }
        ],
        rewardTiers: [
          { tokens: 100, discount: 10, code: 'VIBE10' },
          { tokens: 250, discount: 20, code: 'VIBE20' },
          { tokens: 500, discount: 30, code: 'VIBE30' },
          { tokens: 750, discount: 40, code: 'VIBE40' },
          { tokens: 1000, discount: 50, code: 'VIBE50' },
        ]
      },
      'frighttovote': {
        title: "Fright to Vote",
        description: "This theme explores the tension between fear and participation in democracy. Inspired by the atmosphere of October and Halloween, it invites reflection on how intimidation, uncertainty, and doubt can shape civic engagement—and why courage in the face of fear is essential to a healthy democracy.",
        youtubeVideoId: "1a6eTs7XG8o",
        artworkUrl: "https://placehold.co/600x400?text=f366e2",
        themeDetails: {
          artistStatement: "Fright to Vote explores the role fear can play in shaping democratic participation. Drawing parallels to the symbolism of Halloween, the piece reflects on how intimidation, misinformation, and uncertainty can discourage civic engagement. It invites viewers to consider the courage required to participate in democracy and protect the right to vote.",
          yearCreated: "2024",
          medium: "Acrylic on Wood",
          dimensions: "20.5\" × 31\"",
          inspiration: "Fright to Vote was inspired by the question: What happens when fear influences who participates in democracy? In many moments throughout history, fear has been used as a tool to discourage civic participation. This piece reflects on the responsibility to confront that fear and ensure democracy remains accessible to all."
        },
        overviewButtonText: "Civic Guide",
        overviewIcon: "Vote",
        externalLink: "https://vibesandvirtues.com/pages/landing?id=puz11#gallery-ambient-glow",
        musicLibraryLink: "https://mailchi.mp/743d45b3781a/xlpndjstm2",
        prompts: ["What fears or barriers do you think prevent people from participating in democracy?"],
        promptStartDate: "2026-03-08T00:00:00.000Z",
        followUpQuestions: [
          {
            "follow-up": "How might we help people overcome those barriers to civic participation?",
            "deeper": "Why is it important to protect voting rights even when we feel afraid or uncertain?",
            "archive-response": "After reading another reflection, what resonates with you about their perspective on democracy?",
            "perspective": "How has your own understanding of civic responsibility evolved over time?",
            "time-shift": "What kind of democracy do you want to help create for future generations?"
          }
        ],
        rewardTiers: [
          { tokens: 100, discount: 10, code: 'VIBE10' },
          { tokens: 250, discount: 20, code: 'VIBE20' },
          { tokens: 500, discount: 30, code: 'VIBE30' },
          { tokens: 750, discount: 40, code: 'VIBE40' },
          { tokens: 1000, discount: 50, code: 'VIBE50' },
        ]
      },
      'gatherround': {
        title: "Gather Round",
        description: "This theme explores the tension between historical truth and present-day tradition surrounding Thanksgiving. It invites reflection on whether it is possible to acknowledge the difficult realities of history while still valuing the moments of gratitude, family, and togetherness the holiday represents today.",
        youtubeVideoId: "HQHF3ChlqYQ",
        artworkUrl: "https://placehold.co/600x400?text=a4e5bf",
        themeDetails: {
          artistStatement: "Gather Round explores the complexity of Thanksgiving as both a moment of family unity and a holiday rooted in contested historical narratives. The piece reflects on how traditions evolve and asks viewers to consider whether gratitude and historical awareness can exist at the same table. It invites reflection on how we gather not only to celebrate, but also to remember and learn.",
          yearCreated: "2024",
          medium: "Acrylic on Wood",
          dimensions: "21\" × 30\"",
          inspiration: "Gather Round was inspired by the question: Can we hold gratitude and historical truth at the same table? Thanksgiving is often associated with warmth and family, yet the holiday's origins carry painful perspectives for many Native communities. This piece reflects on the possibility of honoring both gratitude and truth while reimagining what gathering together can mean today."
        },
        overviewButtonText: "Gathering Guide",
        overviewIcon: "Users",
        externalLink: "https://vibesandvirtues.com/pages/landing?id=puz12#gallery-ambient-glow",
        musicLibraryLink: "https://mailchi.mp/ea837bca22b3/8sain1dpnx",
        prompts: ["How can we celebrate traditions while also acknowledging the fuller truth of history behind them?"],
        promptStartDate: "2026-03-08T00:00:00.000Z",
        followUpQuestions: [
          {
            "follow-up": "Think about a tradition you participate in. What parts of its history have you learned about, and what parts might still be unknown to you?",
            "deeper": "Why do you think it's important—or difficult—to hold both gratitude and historical awareness at the same time?",
            "archive-response": "Someone else wrote about wrestling with family traditions that have complicated histories. How do you navigate honoring your loved ones while staying true to your values?",
            "perspective": "If you could reshape a holiday tradition to better reflect both truth and gratitude, what would you change?",
            "time-shift": "What do you hope future generations will say about how we approached tradition and truth in this era?"
          }
        ],
        themeColors: {
          primary: "#C56A2D",
          secondary: "#E89A3D",
          tertiary: "#5C3A21",
          accent: "#F3E5C8"
        },
        themeBadge: "🍽️",
        archiveName: "🍽️ Gather Round Archive",
        reflectionCTA: "🍽️ Share Your Story",
        progressReportName: "Your Gathering Journey",
        archiveSectionName: "🍽️ The Table of Stories",
        continueSectionHeading: "🍽️ Keep the Conversation Going",
        rewardTiers: [
          { tokens: 100, discount: 10, code: 'VIBE10' },
          { tokens: 250, discount: 20, code: 'VIBE20' },
          { tokens: 500, discount: 30, code: 'VIBE30' },
          { tokens: 750, discount: 40, code: 'VIBE40' },
          { tokens: 1000, discount: 50, code: 'VIBE50' },
        ]
      },
      'under-the-mistletoe': {
        title: "Under the Mistletoe",
        description: "The holiday season often reminds us that love is the thread that connects us through both joy and hardship. Under the Mistletoe invites you to reflect on how kindness, generosity, and presence become the greatest gifts we can give to one another.",
        youtubeVideoId: "JXMN9HhAEgo",
        artworkUrl: "https://placehold.co/600x400?text=57660e",
        themeDetails: {
          artistStatement: "Under the Mistletoe explores the ways love becomes the greatest gift during the holiday season. Beyond presents and festivities, the piece reflects on how kindness, generosity, and genuine presence create the most meaningful connections. It invites viewers to consider how love helps us navigate both the joys and challenges of this special time of year.",
          yearCreated: "2024",
          medium: "Acrylic on Wood",
          dimensions: "18\" × 24\"",
          inspiration: "Under the Mistletoe was inspired by the question: What role does love play in making the holidays meaningful? In a season often defined by material gifts and busy schedules, this piece reflects on the deeper gifts of connection, compassion, and being truly present with those we care about."
        },
        overviewButtonText: "Holiday Love Guide",
        overviewIcon: "Heart",
        externalLink: "https://vibesandvirtues.com/pages/landing?id=puz13#gallery-ambient-glow",
        musicLibraryLink: "https://mailchi.mp/046f7c3f060d/chpixq2fk1",
        prompts: ["What role does love play in helping people navigate the joys and challenges of the holiday season?"],
        promptStartDate: "2026-03-08T00:00:00.000Z",
        followUpQuestions: [
          {
            "follow-up": "What traditions or moments during the holidays help you feel most connected to others?",
            "deeper": "Why do you think love and connection become especially meaningful during this time of year?",
            "archive-response": "Someone else reflected on how small acts of kindness transformed their holiday experience. How can small acts of kindness or generosity change someone's experience of the holidays?",
            "perspective": "Who in your life helps make the holiday season feel meaningful, and why?",
            "time-shift": "Looking back on this holiday season years from now, what moments of love and connection will you remember most?"
          }
        ],
        themeColors: {
          primary: "#C1121F",
          secondary: "#1B5E20",
          tertiary: "#D4AF37",
          accent: "#F5F5F5"
        },
        themeBadge: "🎄",
        archiveName: "🎄 Under the Mistletoe Archive",
        reflectionCTA: "🎄 Share Your Heart",
        progressReportName: "Your Holiday Love Journey",
        archiveSectionName: "🎄 Stories of Holiday Love",
        continueSectionHeading: "🎄 Keep Spreading the Love",
        rewardTiers: [
          { tokens: 100, discount: 10, code: 'VIBE10' },
          { tokens: 250, discount: 20, code: 'VIBE20' },
          { tokens: 500, discount: 30, code: 'VIBE30' },
          { tokens: 750, discount: 40, code: 'VIBE40' },
          { tokens: 1000, discount: 50, code: 'VIBE50' },
        ]
      }
    };

    // Add themes to KV store
    for (const [key, value] of Object.entries(themeData)) {
      await kv.set(`theme:${key}`, value);
    }

    // Add artifact codes to KV store
    await kv.set("artifact_code:CLASSACT", { themeId: "classact" });
    await kv.set("artifact_code:NEWBEGIN", { themeId: "newbeginnings" });
    await kv.set("artifact_code:ROOTSLOVE", { themeId: "rootsoflove" });
    await kv.set("artifact_code:SHEREIGNS", { themeId: "shereigns" });
    await kv.set("artifact_code:WORLDWASTE", { themeId: "worldofwaste" });
    await kv.set("artifact_code:ECHOEAST", { themeId: "echoesoftheeast" });
    await kv.set("artifact_code:FATHERSCHANGE", { themeId: "fathersofchange" });
    await kv.set("artifact_code:UNAPOLPRIDE", { themeId: "unapologeticallyproud" });
    await kv.set("artifact_code:PROUD2024", { themeId: "unapologeticallyproud" });
    await kv.set("artifact_code:PATRIOTPARADOX", { themeId: "patriotparadox" });
    await kv.set("artifact_code:PARADOXUSA", { themeId: "patriotparadox" });
    await kv.set("artifact_code:FALLFORWARD", { themeId: "fallforward" });
    await kv.set("artifact_code:AUTUMN2024", { themeId: "fallforward" });
    await kv.set("artifact_code:FRIGHTTOVOTE", { themeId: "frighttovote" });
    await kv.set("artifact_code:VOTEWITHOUTFEAR", { themeId: "frighttovote" });
    await kv.set("artifact_code:OCTOBERVOTE", { themeId: "frighttovote" });
    await kv.set("artifact_code:GATHERROUND", { themeId: "gatherround" });
    await kv.set("artifact_code:THANKSGIVINGTRUTH", { themeId: "gatherround" });
    await kv.set("artifact_code:SHARETHE_TABLE", { themeId: "gatherround" });
    await kv.set("artifact_code:MISTLETOE1", { themeId: "under-the-mistletoe" });
    await kv.set("artifact_code:HOLIDAYLOVE", { themeId: "under-the-mistletoe" });
    await kv.set("artifact_code:SEASONOFLOVE", { themeId: "under-the-mistletoe" });

    return c.json({ success: true, message: "Sample data initialized" });
  } catch (error) {
    console.log(`Error initializing sample data: ${error}`);
    return c.json({ error: "Server error while initializing data" }, 500);
  }
});

Deno.serve(app.fetch);