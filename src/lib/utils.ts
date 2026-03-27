// Helper function to get current prompt based on 2-week rotation
export function getCurrentPrompt(prompts: string[], startDate: string): string {
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
export function getCurrentFollowUpQuestions(followUpQuestions: { [key: string]: string }[], startDate: string): { [key: string]: string } {
  if (!followUpQuestions || followUpQuestions.length === 0) return {};
  
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  
  // Every 2 weeks = new prompt
  const questionIndex = Math.floor(diffWeeks / 2) % followUpQuestions.length;
  return followUpQuestions[questionIndex];
}

// Reflection quality validation function
export function validateReflectionQuality(content: string): { isValid: boolean; reason?: string } {
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
