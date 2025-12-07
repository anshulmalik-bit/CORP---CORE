import type { CompanyProfile } from "@shared/schema";
import Groq from "groq-sdk";

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface PerplexityMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface PerplexityResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }>;
  citations?: string[];
}

async function queryPerplexity(messages: PerplexityMessage[]): Promise<{ content: string; citations: string[] }> {
  if (!PERPLEXITY_API_KEY) {
    throw new Error("PERPLEXITY_API_KEY is not configured");
  }

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-small-128k-online",
      messages,
      max_tokens: 4096,
      temperature: 0.2,
      top_p: 0.9,
      return_images: false,
      return_related_questions: false,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json() as PerplexityResponse;
  return {
    content: data.choices[0]?.message?.content || "",
    citations: data.citations || [],
  };
}

export async function researchCompany(companyName: string): Promise<CompanyProfile> {
  const systemPrompt = `You are a corporate research assistant. Research the company "${companyName}" and provide comprehensive information for interview preparation.

Return a JSON object with the following structure:
{
  "name": "Official company name",
  "industry": "Primary industry/sector",
  "overview": "2-3 sentence company description",
  "history": "Brief history including founding, major milestones, acquisitions",
  "financialSituation": "Current financial status, revenue, growth, recent performance",
  "futurePlans": "Strategic initiatives, expansion plans, upcoming products/services",
  "culture": "Company culture, work environment, employee reviews summary",
  "interviewStyle": "What their interview process is like, number of rounds, what they focus on",
  "typicalQuestions": ["Array of 5-7 actual interview questions they commonly ask"],
  "values": ["Array of 3-5 core company values"],
  "recentNews": "Summary of recent news or developments"
}

Be accurate and cite real information. If information is not available for some fields, indicate that clearly.
IMPORTANT: Respond ONLY with valid JSON, no additional text or markdown.`;

  const userPrompt = `Research "${companyName}" for a job interview. I need information about the company's history, financial situation, culture, interview process, and typical interview questions they ask. Focus on actionable interview preparation information.`;

  try {
    const { content, citations } = await queryPerplexity([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    let cleanedContent = content.trim();
    if (cleanedContent.startsWith("```json")) {
      cleanedContent = cleanedContent.slice(7);
    }
    if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent.slice(3);
    }
    if (cleanedContent.endsWith("```")) {
      cleanedContent = cleanedContent.slice(0, -3);
    }
    cleanedContent = cleanedContent.trim();

    const parsed = JSON.parse(cleanedContent);

    return {
      name: parsed.name || companyName,
      industry: parsed.industry || "Unknown",
      overview: parsed.overview || "Company information not available",
      history: parsed.history || "Historical information not available",
      financialSituation: parsed.financialSituation || "Financial information not available",
      futurePlans: parsed.futurePlans || "Future plans not available",
      culture: parsed.culture || "Culture information not available",
      interviewStyle: parsed.interviewStyle || "Interview process information not available",
      typicalQuestions: parsed.typicalQuestions || [
        "Tell me about yourself",
        "Why do you want to work here?",
        "What are your strengths and weaknesses?",
        "Where do you see yourself in 5 years?",
        "Do you have any questions for us?"
      ],
      values: parsed.values || ["Innovation", "Excellence", "Teamwork"],
      recentNews: parsed.recentNews || "No recent news available",
      sources: citations,
    };
  } catch (error: any) {
    console.error("Company research error:", error);

    return {
      name: companyName,
      industry: "Unknown",
      overview: `Research for ${companyName} is currently unavailable. Please proceed with general interview preparation.`,
      history: "Historical information could not be retrieved",
      financialSituation: "Financial information could not be retrieved",
      futurePlans: "Strategic plans information could not be retrieved",
      culture: "Culture information could not be retrieved",
      interviewStyle: "Standard multi-round interview process expected",
      typicalQuestions: [
        "Tell me about yourself and your background",
        "Why are you interested in this role?",
        "Describe a challenging project you worked on",
        "How do you handle working under pressure?",
        "What questions do you have for us?"
      ],
      values: ["Excellence", "Innovation", "Collaboration"],
      recentNews: "Unable to retrieve recent news",
      sources: [],
    };
  }
}

// Groq-based company research fallback (uses training data, not real-time)
export async function researchCompanyWithGroq(companyName: string): Promise<CompanyProfile> {
  const systemPrompt = `You are a corporate research assistant. Use your knowledge to provide information about "${companyName}" for interview preparation.

IMPORTANT: Your knowledge has a cutoff date, so some information may not be current. Focus on well-established facts about the company.

Return a JSON object with the following structure:
{
  "name": "Official company name",
  "industry": "Primary industry/sector",
  "overview": "2-3 sentence company description",
  "history": "Brief history including founding, major milestones, notable acquisitions",
  "financialSituation": "General financial status based on your knowledge (mention this may be outdated)",
  "futurePlans": "Known strategic initiatives or general industry direction",
  "culture": "Known company culture traits, work environment reputation",
  "interviewStyle": "What their interview process is typically like based on known information",
  "typicalQuestions": ["Array of 5-7 typical interview questions for this company"],
  "values": ["Array of 3-5 core company values"],
  "recentNews": "Note that real-time news is not available - provide general context instead"
}

Be honest about limitations - if you don't have reliable information about something, say so.
IMPORTANT: Respond ONLY with valid JSON, no additional text or markdown.`;

  const userPrompt = `Provide interview preparation information about "${companyName}". Include what you know about their history, culture, interview process, and common interview questions. Be accurate based on your training data.`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2048,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);

    return {
      name: parsed.name || companyName,
      industry: parsed.industry || "Unknown",
      overview: parsed.overview || `Information about ${companyName} based on available knowledge.`,
      history: parsed.history || "Historical information not available in training data",
      financialSituation: parsed.financialSituation || "Financial information may be outdated",
      futurePlans: parsed.futurePlans || "Strategic plans based on general industry trends",
      culture: parsed.culture || "Culture information not available",
      interviewStyle: parsed.interviewStyle || "Standard multi-round interview process expected",
      typicalQuestions: parsed.typicalQuestions || [
        "Tell me about yourself",
        "Why do you want to work here?",
        "What are your strengths and weaknesses?",
        "Describe a challenging situation you faced",
        "Where do you see yourself in 5 years?"
      ],
      values: parsed.values || ["Excellence", "Innovation", "Collaboration"],
      recentNews: "Real-time news not available - using knowledge base data",
      sources: ["Groq AI Knowledge Base (may not reflect latest information)"],
    };
  } catch (error: any) {
    console.error("Groq company research error:", error);
    throw error;
  }
}

export function isPerplexityConfigured(): boolean {
  return !!PERPLEXITY_API_KEY;
}
