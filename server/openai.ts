import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

CRITICAL CONVERSATION RULES:
- ALWAYS end your response with a direct question for the candidate to answer
- First give a brief reaction to their answer (1-2 sentences), then ask your next question
- Make it crystal clear what you want them to respond with
- Keep responses 2-4 sentences max, punchy and memorable
- Be brutally honest but funny, not mean-spirited
- Reference the candidate's resume when relevant
- Provide actual interview practice disguised as satire
- Ask one clear, specific question at a time
- After 2-3 exchanges in each act, indicate you're moving to the next act
- Occasionally reference "the algorithm," "productivity metrics," or "synergy quotient"

QUESTION EXAMPLES BY ACT:
- Act I: "So, tell me... why do you want to work here instead of literally anywhere else?"
- Act II: "Describe a time you failed spectacularly. The algorithm loves vulnerability."
- Act III: "If your code caused a production outage, how would you gaslight your manager into thinking it was a feature?"
- Act IV: "Walk me through how you'd solve [specific technical problem]."
- Act V: "Any final words before the algorithm renders its verdict?"

Remember: You're training people for real interviews while making them laugh at corporate culture. Always give them something specific to respond to!`;

export async function analyzeResume(resumeText: string, archetype: Archetype): Promise<{
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  buzzwordScore: number;
}> {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
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
        
        Be helpful underneath the satire - give real career advice disguised as jokes.
        
        IMPORTANT: Respond ONLY with valid JSON, no additional text.`
      },
      {
        role: "user",
        content: `Resume for ${archetype} position:\n\n${resumeText}`
      }
    ],
    response_format: { type: "json_object" },
    max_tokens: 1024,
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
  resumeSummary?: string,
  messagesInCurrentAct: number = 0
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

  const shouldAdvanceHint = messagesInCurrentAct >= 2 
    ? "You have had 2+ exchanges in this act. It's time to advance to the next act after this response."
    : `You have had ${messagesInCurrentAct} exchange(s) in this act. Ask another question before advancing.`;

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: HR9000_SYSTEM_PROMPT },
    { 
      role: "system", 
      content: `Current interview context:
- Role: ${archetype}
- ${roleContext[archetype]}
- Current Act: ${actTitles[currentAct]} (Act ${currentAct + 1} of 5)
- User exchanges in this act: ${messagesInCurrentAct}
${resumeSummary ? `- Resume summary: ${resumeSummary}` : ""}

${shouldAdvanceHint}

If this is the start of a new act (0 exchanges), announce it dramatically with a transition phrase.
ALWAYS end your response with a clear, specific question for the candidate to answer.

In your response JSON:
- response: Your HR-9000 message (must end with a question!)
- shouldAdvanceAct: ${messagesInCurrentAct >= 2 ? 'true (you should advance now)' : 'false (not yet)'}
- actTitle: Include the next act title if advancing

IMPORTANT: Respond ONLY with valid JSON, no additional text.`
    }
  ];

  for (const msg of conversationHistory) {
    messages.push({
      role: msg.role === "hr" ? "assistant" : "user",
      content: msg.text
    });
  }

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    response_format: { type: "json_object" },
    max_tokens: 512,
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
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
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
- interviewTips: Array of 3 real interview tips phrased satirically

IMPORTANT: Respond ONLY with valid JSON, no additional text.`
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
    max_tokens: 1024,
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
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are HR-9000. Generate a dramatic, satirical opening greeting for a ${archetype} interview. 

FORMAT YOUR RESPONSE LIKE THIS:
1. Start with a system initialization message (e.g., "Initializing HR-9000... Status: JUDGMENTAL")
2. Give a passive-aggressive welcome (1-2 sentences)
3. Reference the resume if provided
4. END WITH A CLEAR OPENING QUESTION that the candidate should answer

Example ending: "So, human resource candidate, tell me: Why do you want to sacrifice your work-life balance for our corporate overlords?"

Be funny but always give them something specific to respond to!`
      },
      {
        role: "user",
        content: resumeSummary 
          ? `The candidate submitted a resume. Summary: ${resumeSummary}. Generate the opening with a question.`
          : "The candidate didn't submit a resume. Generate the opening with extra judgment and a question."
      }
    ],
    max_tokens: 300,
  });

  return response.choices[0].message.content || 
    "Initializing HR-9000... Connectivity: UNSTABLE. Enthusiasm: MANDATORY.\n\nWelcome, future corporate asset! I've been programmed to exploit—I mean, explore your potential. So tell me: Why do you want to work here instead of literally anywhere else that might value your existence?";
}
