import { NextResponse } from 'next/server';
import * as kv from '@/lib/kv';

export async function POST() {
  try {
    // Theme data configuration
    const themes: Record<string, any> = {
      'classact': {
        title: "Class Act",
        description: "This theme questions what education is really meant to measure. It asks us to consider the qualities that schools should cultivate—like creativity, curiosity, and critical thinking—beyond what can be graded on a test.",
        youtubeVideoId: "NqxAPe21K28",
        artworkUrl: "https://placehold.co/600x400?text=a1f366",
        themeDetails: {
          artistStatement: "Class Act explores what education is really meant to cultivate. Beyond grades and tests, it asks us to consider the qualities that shape our lives most—curiosity, courage, creativity, and critical thinking.",
          yearCreated: "2024",
          medium: "Acrylic on Wood",
          dimensions: "16\" × 18\"",
          inspiration: "Class Act was inspired by the question: What should education actually measure?"
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
      // ... more themes can be added here
    };

    for (const [id, data] of Object.entries(themes)) {
      await kv.set(`theme:${id}`, data);
      
      // Also ensure some codes exist for these themes
      await kv.set(`artifact_code:${id}123`, { themeId: id });
    }

    return NextResponse.json({ success: true, message: "Sample data initialized" });
  } catch (error) {
    console.log(`Error initializing sample data: ${error}`);
    return NextResponse.json({ error: "Server error while initializing data" }, { status: 500 });
  }
}
