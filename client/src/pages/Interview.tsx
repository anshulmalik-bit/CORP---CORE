import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { useSession } from "@/lib/context";
import { motion, AnimatePresence } from "framer-motion";
import hrAvatar from "@assets/generated_images/glitchy_3d_mannequin_head_for_hr_bot.png";
import noiseBg from "@assets/generated_images/digital_noise_texture_for_background.png";

const ACTS = [
  { id: 1, title: "ACT I: THE ICEBREAKER" },
  { id: 2, title: "ACT II: BEHAVIORAL DEEP DIVE" },
  { id: 3, title: "ACT III: CHAOS MODE" },
  { id: 4, title: "ACT IV: ROLE TRIAL" },
  { id: 5, title: "ACT V: FINAL JUDGMENT" }
];

export default function Interview() {
  const [_, setLocation] = useLocation();
  const { archetype, resumeText, resumeAnalysis, addTranscript, transcript } = useSession();
  const [actIndex, setActIndex] = useState(0);
  const [messages, setMessages] = useState<{role: 'hr'|'user', text: string}[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initInterview = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/interview/greeting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            archetype: archetype || "BTech",
            resumeSummary: resumeAnalysis?.feedback || (resumeText ? "Resume submitted but not analyzed" : null)
          })
        });

        if (response.ok) {
          const { greeting } = await response.json();
          addMessage("hr", greeting);
        } else {
          addMessage("hr", `Initializing HR-9000... Connectivity: UNSTABLE. Enthusiasm: MANDATORY.\n\nOh, hello! We are so excited to exploit— I mean, explore your potential as a ${archetype || "Human Resource"}. Tell me, why do you want to sacrifice your weekends for us?`);
        }
      } catch (error) {
        addMessage("hr", `Initializing HR-9000... Connectivity: UNSTABLE. Enthusiasm: MANDATORY.\n\nOh, hello! We are so excited to exploit— I mean, explore your potential as a ${archetype || "Human Resource"}. Tell me, why do you want to sacrifice your weekends for us?`);
      }
      setIsLoading(false);
    };

    initInterview();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!isTyping && !isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isTyping, isLoading]);

  const addMessage = (role: 'hr'|'user', text: string) => {
    setMessages(prev => [...prev, { role, text }]);
    addTranscript(role, text);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;
    
    const userMessage = inputValue.trim();
    addMessage("user", userMessage);
    setInputValue("");
    setIsTyping(true);

    try {
      const conversationHistory = [...messages, { role: "user" as const, text: userMessage }];
      
      const response = await fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          archetype: archetype || "BTech",
          currentAct: actIndex,
          conversationHistory,
          resumeSummary: resumeAnalysis?.feedback
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsTyping(false);
        addMessage("hr", data.response);
        
        if (data.shouldAdvanceAct) {
          if (actIndex < ACTS.length - 1) {
            setActIndex(prev => prev + 1);
          } else {
            setTimeout(() => setLocation("/verdict"), 2000);
          }
        }
      } else {
        throw new Error("API error");
      }
    } catch (error) {
      console.error("Chat error:", error);
      setIsTyping(false);
      
      const messagesInAct = messages.filter(m => m.role === 'user').length;
      const shouldAdvance = messagesInAct >= 2;
      
      const fallbackResponses = [
        "System glitch detected... much like your career trajectory. Let's continue.",
        "My algorithms are processing... processing... Interesting answer.",
        "The corporate hive mind has noted your response. Proceed.",
        "Connectivity unstable. Your answer has been... stored somewhere.",
        "Processing... The algorithm is judging you silently.",
      ];
      
      if (shouldAdvance) {
        if (actIndex < ACTS.length - 1) {
          addMessage("hr", `${fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]}\n\n*Static crackle* Moving to ${ACTS[actIndex + 1].title}...`);
          setActIndex(prev => prev + 1);
        } else {
          addMessage("hr", "The evaluation is complete. Your fate has been sealed. Proceed to receive your verdict.");
          setTimeout(() => setLocation("/verdict"), 2000);
        }
      } else {
        addMessage("hr", fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto w-full border-x-4 border-black bg-gray-100 relative overflow-hidden">
        
        <div className="absolute inset-0 opacity-5 pointer-events-none mix-blend-multiply"
           style={{ backgroundImage: `url(${noiseBg})` }}></div>

        <div className="bg-black text-white p-2 text-center font-display tracking-widest border-b-4 border-black z-10 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={actIndex}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              {ACTS[actIndex].title}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10" ref={scrollRef}>
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm animate-pulse">
              <div className="w-3 h-3 bg-secondary animate-bounce"></div>
              HR-9000 is booting up...
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx} 
              className={`flex ${msg.role === 'hr' ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`max-w-[85%] flex gap-3 ${msg.role === 'hr' ? 'flex-row' : 'flex-row-reverse'}`}>
                {msg.role === 'hr' && (
                  <div className="w-12 h-12 shrink-0 border-2 border-black overflow-hidden bg-green-200">
                    <img src={hrAvatar} alt="HR-9000" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className={`p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                  msg.role === 'hr' 
                    ? 'bg-white text-black' 
                    : 'bg-secondary text-white'
                }`}>
                  {msg.role === 'hr' && (
                    <p className="font-display text-xs mb-2 opacity-60">HR-9000</p>
                  )}
                  <p className="font-mono text-sm md:text-base leading-relaxed whitespace-pre-wrap" data-testid={`message-${msg.role}-${idx}`}>
                    {msg.text}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 ml-16"
            >
              <div className="bg-white border-2 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
              <span className="text-muted-foreground font-mono text-xs">HR-9000 is judging you...</span>
            </motion.div>
          )}
        </div>

        <div className="p-4 bg-white border-t-4 border-black relative z-10">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your carefully crafted response..."
              className="flex-1 bg-gray-100 border-2 border-black p-4 font-mono focus:outline-none focus:bg-white transition-colors placeholder:text-gray-400"
              disabled={isTyping || isLoading}
              data-testid="input-chat"
            />
            <button 
              onClick={handleSend}
              disabled={isTyping || isLoading || !inputValue.trim()}
              className="bg-accent text-black font-bold px-8 border-2 border-black hover:bg-green-400 active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-send"
            >
              SUBMIT
            </button>
          </div>
          <p className="text-xs font-mono text-gray-400 mt-2 text-center">
            Act {actIndex + 1} of 5 • {archetype || "Unknown"} Track • Press Enter to send
          </p>
        </div>

      </div>
    </Layout>
  );
}
