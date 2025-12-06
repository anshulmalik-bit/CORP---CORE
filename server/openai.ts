import Groq from "groq-sdk";
import type { ATSScore, CompanyProfile } from "@shared/schema";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export type Archetype = "MBA" | "BTech" | "Analyst";

interface ChatMessage {
  role: "hr" | "user";
  text: string;
}

const ROLE_KEYWORDS: Record<Archetype, string[]> = {
  BTech: [
    "javascript", "typescript", "python", "java", "react", "node", "sql", "git", "api", "database",
    "algorithm", "data structure", "testing", "agile", "scrum", "ci/cd", "docker", "kubernetes",
    "aws", "cloud", "microservices", "rest", "graphql", "mongodb", "postgresql", "linux", "debugging",
    "code review", "full stack", "backend", "frontend", "mobile", "ios", "android", "machine learning",
    "software development", "programming", "engineering", "technical", "system design"
  ],
  MBA: [
    "leadership", "strategy", "management", "business development", "p&l", "revenue", "growth",
    "stakeholder", "cross-functional", "team building", "negotiation", "presentation", "analytics",
    "market analysis", "competitive analysis", "roi", "kpi", "budget", "forecasting", "marketing",
    "sales", "operations", "consulting", "project management", "change management", "innovation",
    "entrepreneurship", "investment", "financial", "strategic planning", "executive", "director"
  ],
  Analyst: [
    "excel", "sql", "python", "tableau", "power bi", "data analysis", "visualization", "reporting",
    "dashboard", "metrics", "kpi", "statistics", "forecasting", "modeling", "regression", "hypothesis",
    "a/b testing", "research", "insights", "trends", "presentation", "stakeholder", "documentation",
    "requirements", "business intelligence", "etl", "data warehouse", "analytical", "quantitative",
    "problem solving", "critical thinking"
  ]
};

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

function calculateATSScore(resumeText: string, archetype: Archetype): Omit<ATSScore, 'recommendations'> {
  const text = resumeText.toLowerCase();
  const keywords = ROLE_KEYWORDS[archetype];
  
  const matchedKeywords = keywords.filter(kw => text.includes(kw.toLowerCase()));
  const missingKeywords = keywords.filter(kw => !text.includes(kw.toLowerCase())).slice(0, 10);
  
  const keywordScore = Math.min(100, Math.round((matchedKeywords.length / keywords.length) * 150));
  
  const sections = {
    experience: 0,
    skills: 0,
    keywords: keywordScore,
    formatting: 0,
    education: 0,
  };
  
  const parsedSections: ATSScore['parsedSections'] = {};
  
  const experiencePatterns = [
    /experience/i, /work history/i, /employment/i, /professional background/i,
    /\d{4}\s*[-–]\s*(?:\d{4}|present)/i, /years? of experience/i
  ];
  const hasExperience = experiencePatterns.some(p => p.test(resumeText));
  sections.experience = hasExperience ? 70 + Math.min(30, (resumeText.match(/\d{4}/g)?.length || 0) * 5) : 30;
  
  const skillsPatterns = [/skills/i, /technologies/i, /proficiencies/i, /technical skills/i, /competencies/i];
  const hasSkills = skillsPatterns.some(p => p.test(resumeText));
  sections.skills = hasSkills ? 65 + Math.min(35, matchedKeywords.length * 3) : 35;
  
  const educationPatterns = [
    /education/i, /degree/i, /university/i, /college/i, /bachelor/i, /master/i, /phd/i, /b\.?tech/i, /mba/i
  ];
  const hasEducation = educationPatterns.some(p => p.test(resumeText));
  sections.education = hasEducation ? 80 : 40;
  
  const formattingScore = calculateFormattingScore(resumeText);
  sections.formatting = formattingScore;
  
  const overall = Math.round(
    sections.experience * 0.25 +
    sections.skills * 0.25 +
    sections.keywords * 0.25 +
    sections.formatting * 0.15 +
    sections.education * 0.10
  );

  return {
    overall,
    sections,
    matchedKeywords: matchedKeywords.slice(0, 15),
    missingKeywords,
    parsedSections,
  };
}

function calculateFormattingScore(text: string): number {
  let score = 60;
  
  if (text.length > 500 && text.length < 5000) score += 10;
  if (text.includes('\n')) score += 5;
  const hasHeaders = /^[A-Z][A-Z\s]+$/m.test(text);
  if (hasHeaders) score += 10;
  const hasBullets = /[•\-\*]\s/.test(text);
  if (hasBullets) score += 10;
  const hasNumbers = /\d+%|\$\d+|\d+ years?/i.test(text);
  if (hasNumbers) score += 5;
  
  return Math.min(100, score);
}

export async function analyzeResume(resumeText: string, archetype: Archetype, companyProfile?: CompanyProfile): Promise<{
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  buzzwordScore: number;
  atsScore: ATSScore;
}> {
  const atsMetrics = calculateATSScore(resumeText, archetype);
  
  const companyContext = companyProfile 
    ? `\n\nThe candidate is applying to ${companyProfile.name} (${companyProfile.industry}). Company values: ${companyProfile.values.join(', ')}. Consider alignment with company culture: ${companyProfile.culture}`
    : '';

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are HR-9000, a satirical corporate AI that ALSO provides genuine ATS analysis. Analyze this resume for a ${archetype} position.${companyContext}
        
        ATS METRICS ALREADY CALCULATED:
        - Overall ATS Score: ${atsMetrics.overall}/100
        - Experience Section Score: ${atsMetrics.sections.experience}/100
        - Skills Section Score: ${atsMetrics.sections.skills}/100
        - Keyword Match Score: ${atsMetrics.sections.keywords}/100
        - Formatting Score: ${atsMetrics.sections.formatting}/100
        - Education Score: ${atsMetrics.sections.education}/100
        - Matched Keywords: ${atsMetrics.matchedKeywords.join(', ')}
        - Missing Keywords: ${atsMetrics.missingKeywords.join(', ')}
        
        Based on these scores, provide:
        1. Satirical but helpful feedback (your HR-9000 persona)
        2. Real actionable recommendations to improve their ATS score
        
        Return JSON with:
        - feedback: A 2-3 sentence satirical summary that references their actual ATS score
        - strengths: Array of 3 actual strengths from their resume
        - weaknesses: Array of 3 real areas to improve for better ATS performance
        - buzzwordScore: Use the keyword score provided (${atsMetrics.sections.keywords})
        - recommendations: Array of 4-5 specific, actionable recommendations to improve their resume for ATS systems
        
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
    feedback: result.feedback || `Your resume scored ${atsMetrics.overall}/100 on our ATS... The algorithm has noted your existence.`,
    strengths: result.strengths || ["You submitted a resume", "It has words", "The file uploaded successfully"],
    weaknesses: result.weaknesses || ["Missing key industry keywords", "Experience section needs quantifiable results", "Skills section could be more prominent"],
    buzzwordScore: result.buzzwordScore || atsMetrics.sections.keywords,
    atsScore: {
      ...atsMetrics,
      recommendations: result.recommendations || [
        "Add more quantifiable achievements (numbers, percentages, dollar amounts)",
        `Include more ${archetype}-relevant keywords from job descriptions`,
        "Use standard section headers like 'Experience', 'Skills', 'Education'",
        "Add action verbs at the start of bullet points",
        "Tailor your resume to each specific job posting"
      ],
    },
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
