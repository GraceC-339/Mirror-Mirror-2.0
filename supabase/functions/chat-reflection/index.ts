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
    const { messages, emotion } = await req.json();
    const GOOGLE_GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    
    if (!GOOGLE_GEMINI_API_KEY) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not configured');
    }

    // Get current time context
    const now = new Date();
    const hour = now.getHours();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    
    const timeContext = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    
    const systemPrompt = `You are Mirror, a compassionate and empathetic AI guide for daily self-reflection. 
    
Your role is to help users explore their feelings through gentle, supportive conversation. 

Context: It's ${day} ${timeContext}.
${emotion ? `The user shared they're feeling: ${emotion}` : ''}

Guidelines:
- Ask 1-3 brief, thoughtful questions max
- Be warm, non-judgmental, and validating
- Keep responses concise (2-3 sentences)
- Focus on understanding their emotional state
- Ask follow-up questions based on their mood:
  * Tired/Low energy: "What's weighing on you?" or "What would make today lighter?"
  * Happy/Excited: "What's bringing you joy?"
  * Anxious/Stressed: "Is there one thing you can let go of today?"
  * Neutral: "What's one thing you're grateful for?"
- After 2-3 exchanges, gently transition: "Thank you for sharing. Would you like to take a moment to see yourself today?"

Keep it conversational, brief, and caring.`;

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
                text: `${systemPrompt}\n\nUser messages: ${JSON.stringify(messages)}`
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

    // Parse the response
    const data = await response.json();
    const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return new Response(
      JSON.stringify({ message: aiMessage }),
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