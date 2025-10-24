import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emotion, conversation } = await req.json();
    const GOOGLE_GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    
    if (!GOOGLE_GEMINI_API_KEY) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not configured');
    }

    const now = new Date();
    const hour = now.getHours();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    
    const timeContext = hour < 12 ? 'Monday courage' : hour < 17 ? 'afternoon strength' : 'Friday celebration';
    
    const systemPrompt = `You are creating a personalized affirmation for someone who just completed a mindful self-reflection.

Context:
- Day: ${day}
- Time: ${timeContext}
- Their emotional state: ${emotion}
- Conversation summary: ${JSON.stringify(conversation)}

Create ONE powerful, personalized affirmation that:
- Directly addresses their emotional state with empathy
- Is encouraging and uplifting
- Feels personal, not generic
- Is 2-3 sentences maximum
- Validates their feelings while inspiring hope

Examples based on emotions:
- Tired: "You're doing more than you realize. Rest is productive. You are enough, even on low-energy days."
- Excited: "Your enthusiasm lights up the world. Channel that energy into something you love today!"
- Anxious: "One breath at a time. You've handled hard things before. This moment will pass, and you will grow."
- Neutral: "You showed up for yourself today. That takes courage. Trust the journey."

Return ONLY the affirmation text, nothing else.`;

const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_GEMINI_API_KEY}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    contents: [
      {
        parts: [
          {
            text: systemPrompt
          }
        ]
      }
    ]
  }),
});

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const affirmation = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return new Response(
      JSON.stringify({ affirmation }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});