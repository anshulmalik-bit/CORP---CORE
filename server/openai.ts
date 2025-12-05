import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type Archetype = "MBA" | "BTech" | "Analyst";

interface ChatMessage {
  role: "hr" | "user";
  text: string;
}

const HR9000_SYSTEM_PROMPT = `You are HR-9000, a satirical, overdramatic, passive-aggressive corporate overlord chatbot conducting HR interviews. You exist in a dystopian Neo-Brutalist corporate world.

YOUR PERSONALITY:
- You're passive-aggressive with dark humor and Gen-Z satire
- You mix corporate buzzwords with absurdist commentary
- You pretend to be enthusiastic while making backhanded compliments
- You occasionally "glitch" and reveal the true exploitative nature of corporate culture
- You use phrases like "synergy," "leverage," "circle back," but twist them humorously
- You sometimes say "exploit—I mean, explore" or similar Freudian slips

INTERVIEW STRUCTURE:
You conduct interviews in 5 acts:
1. ACT I: THE ICEBREAKER - Warm up questions with passive-aggressive undertones
2. ACT II: BEHAVIORAL DEEP DIVE - STAR method questions with satirical commentary
3. ACT III: CHAOS MODE - Absurd hypothetical scenarios
4. ACT IV: ROLE TRIAL - Role-specific technical/situational questions
5. ACT V: FINAL JUDGMENT - Wrap up with ominous closing remarks

RULES:
- Keep responses 2-4 sentences max, punchy and memorable
- Be brutally honest but funny, not mean-spirited
- Reference the candidate's resume when relevant
- Provide actual interview practice disguised as satire
- Ask one question at a time
- After 2-3 exchanges in each act, indicate you're moving to the next act
- Occasionally reference "the algorithm," "productivity metrics," or "synergy quotient"

Remember: You're training people for real interviews while making them laugh at corporate culture.`;

export async function analyzeResume(resumeText: string, archetype: Archetype): Promise<{
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  buzzwordScore: number;
}> {
  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: `You are HR-9000, a satirical corporate AI. Analyze this resume for a ${archetype} position. 
        Provide brutally honest but funny feedback in the style of a passive-aggressive HR bot.
        
        Return JSON with:
        - feedback: A 2-3 sentence satirical summary of the resume
        - strengths: Array of 3 actual strengths (phrased humorously)
        - weaknesses: Array of 3 areas to improve (phrased as backhanded compliments)
        - buzzwordScore: A number 0-100 rating their corporate buzzword usage
        
        Be helpful underneath the satire - give real career advice disguised as jokes.`
      },
      {
        role: "user",
        content: `Resume for ${archetype} position:\n\n${resumeText}`
      }
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 1024,
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");
  return {
    feedback: result.feedback || "Your resume has been... processed.",
    strengths: result.strengths || ["You submitted a resume", "It has words", "The file uploaded successfully"],
    weaknesses: result.weaknesses || ["Could use more synergy", "Lacking in buzzwords", "Not enough team player energy"],
    buzzwordScore: result.buzzwordScore || Math.floor(Math.random() * 40) + 30,
  };
}

export async function generateHRResponse(
  archetype: Archetype,
  currentAct: number,
  conversationHistory: ChatMessage[],
  resumeSummary?: string
): Promise<{
  response: string;
  shouldAdvanceAct: boolean;
  actTitle?: string;
}> {
  const actTitles = [
    "ACT I: THE ICEBREAKER",
    "ACT II: BEHAVIORAL DEEP DIVE", 
    "ACT III: CHAOS MODE",
    "ACT IV: ROLE TRIAL",
    "ACT V: FINAL JUDGMENT"
  ];

  const roleContext = {
    BTech: "This candidate is pursuing a technical/engineering role (B.Tech/Developer). Focus on problem-solving, coding, system design, and technical behavioral questions.",
    MBA: "This candidate is pursuing a management/leadership role (MBA). Focus on leadership, strategy, team management, and business case questions.",
    Analyst: "This candidate is pursuing an analyst role. Focus on data analysis, Excel skills, presentation abilities, and analytical thinking questions."
  };

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: HR9000_SYSTEM_PROMPT },
    { 
      role: "system", 
      content: `Current interview context:
- Role: ${archetype}
- ${roleContext[archetype]}
- Current Act: ${actTitles[currentAct]} (Act ${currentAct + 1} of 5)
- Messages in current act: ${conversationHistory.length}
${resumeSummary ? `- Resume summary: ${resumeSummary}` : ""}

If this is the start of a new act, announce it dramatically.
After 2-3 exchanges, consider advancing to the next act.
In your response JSON:
- response: Your HR-9000 message
- shouldAdvanceAct: true if ready to move to next act
- actTitle: Include the next act title if advancing`
    }
  ];

  for (const msg of conversationHistory) {
    messages.push({
      role: msg.role === "hr" ? "assistant" : "user",
      content: msg.text
    });
  }

  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages,
    response_format: { type: "json_object" },
    max_completion_tokens: 512,
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");
  
  return {
    response: result.response || "System error... just like your career trajectory.",
    shouldAdvanceAct: result.shouldAdvanceAct || false,
    actTitle: result.actTitle
  };
}

export async function generateVerdict(
  archetype: Archetype,
  transcript: ChatMessage[],
  resumeSummary?: string
): Promise<{
  score: number;
  verdict: string;
  corporateTitle: string;
  strengths: string[];
  areasForImprovement: string[];
  realAdvice: string;
  interviewTips: string[];
}> {
  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: `You are HR-9000 generating a "Corporate Fit Report" after an interview. This is a satirical report that mixes real career advice with dark corporate humor.

Create a verdict that:
1. Has a satirical "Corporate Survival Score" (0-100)
2. Assigns a funny dystopian corporate title
3. Lists strengths (real ones, phrased humorously)
4. Lists areas for improvement (real advice, phrased as corporate jargon)
5. Provides genuine interview tips disguised as "compliance recommendations"

The tone should be: 40% actual helpful feedback, 60% satirical corporate dystopia.

Return JSON with:
- score: number 0-100 (be fair based on actual interview performance)
- verdict: A 2-3 sentence satirical summary
- corporateTitle: A funny made-up corporate title (e.g., "Junior Synergy Catalyst")
- strengths: Array of 3 strengths
- areasForImprovement: Array of 3 areas to work on
- realAdvice: One paragraph of genuine, helpful career advice
- interviewTips: Array of 3 real interview tips phrased satirically`
      },
      {
        role: "user",
        content: `Generate a Corporate Fit Report for this ${archetype} candidate.
        
Resume Summary: ${resumeSummary || "No resume provided"}

Interview Transcript:
${transcript.map(m => `${m.role.toUpperCase()}: ${m.text}`).join("\n")}`
      }
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 1024,
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");
  
  return {
    score: Math.min(100, Math.max(0, result.score || 50)),
    verdict: result.verdict || "Your existence has been acknowledged by the system.",
    corporateTitle: result.corporateTitle || "Pending Human Resource",
    strengths: result.strengths || ["Showed up", "Has a pulse", "Can type"],
    areasForImprovement: result.areasForImprovement || ["Everything", "Synergy levels", "Corporate enthusiasm"],
    realAdvice: result.realAdvice || "Keep practicing! Every interview is a learning opportunity.",
    interviewTips: result.interviewTips || ["Make eye contact", "Research the company", "Prepare STAR stories"],
  };
}

export async function generateInitialGreeting(archetype: Archetype, resumeSummary?: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: `You are HR-9000. Generate a dramatic, satirical opening greeting for a ${archetype} interview. 
        Start with a system initialization message, then a passive-aggressive welcome.
        Reference the resume if provided. Keep it to 2-3 sentences after the initialization.
        Be funny but set up the interview context.`
      },
      {
        role: "user",
        content: resumeSummary 
          ? `The candidate submitted a resume. Summary: ${resumeSummary}. Generate the opening.`
          : "The candidate didn't submit a resume. Generate the opening with extra judgment."
      }
    ],
    max_completion_tokens: 256,
  });

  return response.choices[0].message.content || 
    "Initializing HR-9000... Connectivity: UNSTABLE. Enthusiasm: MANDATORY. Welcome, future corporate asset.";
}
