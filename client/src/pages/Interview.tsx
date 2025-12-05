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
  const { archetype, addTranscript } = useSession();
  const [actIndex, setActIndex] = useState(0);
  const [messages, setMessages] = useState<{role: 'hr'|'user', text: string}[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial Greeting
  useEffect(() => {
    setTimeout(() => {
      addMessage("hr", "Initializing HR-9000... Connectivity: UNSTABLE. Enthusiasm: MANDATORY.");
      setTimeout(() => {
        addMessage("hr", `Oh, hello! We are so excited to exploit— I mean, explore your potential as a ${archetype || "Human Resource"}. Tell me, why do you want to sacrifice your weekends for us?`);
      }, 1000);
    }, 500);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (role: 'hr'|'user', text: string) => {
    setMessages(prev => [...prev, { role, text }]);
    addTranscript(role, text);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    addMessage("user", inputValue);
    setInputValue("");
    setIsTyping(true);

    // Simulate HR response logic
    setTimeout(() => {
      setIsTyping(false);
      const response = getResponse(actIndex, messages.length);
      addMessage("hr", response.text);
      
      if (response.advanceAct) {
        if (actIndex < ACTS.length - 1) {
          setActIndex(prev => prev + 1);
        } else {
          setTimeout(() => setLocation("/verdict"), 2000);
        }
      }
    }, 1500);
  };

  // Simple mocked logic for the prototype
  const getResponse = (act: number, msgCount: number) => {
    const responses = [
      "That answer was a paragraph with no plot. Try being more... succinct.",
      "I hear you, but I don't feel the 'synergy' in your voice. Can you type with more smile?",
      "Interesting. My algorithm says that's a lie, but I'll allow it.",
      "Let's pivot. If you were an Excel sheet, which cell would you be? Don't say A1.",
      "Hold on, my coffee break timer just started... okay, I'm back.",
      "Wow, very 'thought leader' of you.",
      "We value transparency... except when we don't. Next question.",
    ];

    const next = Math.random() > 0.7; // 30% chance to advance act
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      advanceAct: next
    };
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto w-full border-x-4 border-black bg-gray-100 relative overflow-hidden">
        
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-5 pointer-events-none mix-blend-multiply"
           style={{ backgroundImage: `url(${noiseBg})` }}></div>

        {/* Act Indicator */}
        <div className="bg-black text-white p-2 text-center font-display tracking-widest border-b-4 border-black z-10 relative">
          {ACTS[actIndex].title}
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10" ref={scrollRef}>
          {messages.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx} 
              className={`flex ${msg.role === 'hr' ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`max-w-[80%] flex gap-4 ${msg.role === 'hr' ? 'flex-row' : 'flex-row-reverse'}`}>
                {msg.role === 'hr' && (
                  <div className="w-12 h-12 shrink-0 border-2 border-black overflow-hidden bg-green-200">
                    <img src={hrAvatar} alt="HR" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className={`p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                  msg.role === 'hr' 
                    ? 'bg-white text-black' 
                    : 'bg-secondary text-white'
                }`}>
                  <p className="font-mono text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs animate-pulse ml-16">
              HR-9000 is judging you...
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t-4 border-black">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your carefully crafted lie..."
              className="flex-1 bg-gray-100 border-2 border-black p-4 font-mono focus:outline-none focus:bg-white transition-colors placeholder:text-gray-400"
              autoFocus
            />
            <button 
              onClick={handleSend}
              className="bg-accent text-black font-bold px-8 border-2 border-black hover:bg-green-400 active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              SUBMIT
            </button>
          </div>
        </div>

      </div>
    </Layout>
  );
}
