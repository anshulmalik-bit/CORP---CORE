import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { useSession } from "@/lib/context";
import { motion, AnimatePresence } from "framer-motion";
import { playSound } from "@/hooks/use-sound";
import hrAvatar from "@assets/generated_images/retro_corporate_hr_robot_head.png";
import noiseBg from "@assets/generated_images/digital_noise_texture_for_background.png";

const ACTS = [
  { id: 1, title: "ACT I: THE ICEBREAKER", emoji: "🧊", vibe: "let's pretend we're normal", color: "from-blue-500/20 to-cyan-500/20", borderColor: "border-blue-400", bgAccent: "bg-blue-50" },
  { id: 2, title: "ACT II: BEHAVIORAL DEEP DIVE", emoji: "🤿", vibe: "time for trauma mining", color: "from-purple-500/20 to-indigo-500/20", borderColor: "border-purple-400", bgAccent: "bg-purple-50" },
  { id: 3, title: "ACT III: CHAOS MODE", emoji: "🌀", vibe: "expect the unexpected bestie", color: "from-red-500/20 to-orange-500/20", borderColor: "border-red-400", bgAccent: "bg-red-50" },
  { id: 4, title: "ACT IV: ROLE TRIAL", emoji: "⚔️", vibe: "prove your worth or perish", color: "from-amber-500/20 to-yellow-500/20", borderColor: "border-amber-400", bgAccent: "bg-amber-50" },
  { id: 5, title: "ACT V: FINAL JUDGMENT", emoji: "⚖️", vibe: "the algorithm has decided", color: "from-gray-600/20 to-black/20", borderColor: "border-gray-600", bgAccent: "bg-gray-100" }
];

export default function Interview() {
  const [_, setLocation] = useLocation();
  const { archetype, resumeText, resumeAnalysis, addTranscript, transcript, companyProfile, targetCompany } = useSession();
  const [actIndex, setActIndex] = useState(0);
  const [messages, setMessages] = useState<{ role: 'hr' | 'user', text: string }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showActTransition, setShowActTransition] = useState(false);
  const [messagesPerAct, setMessagesPerAct] = useState<number[]>([0, 0, 0, 0, 0]);
  const prevActIndexRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const userMessageCount = messages.filter(m => m.role === 'user').length;
  const canEndInterview = userMessageCount >= 3;

  useEffect(() => {
    const initInterview = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/interview/greeting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            archetype: archetype || "BTech",
            resumeSummary: resumeText ? resumeText.substring(0, 2000) : (resumeAnalysis?.feedback || null),
            companyProfile: companyProfile || undefined
          })
        });

        if (response.ok) {
          const { greeting } = await response.json();
          addMessage("hr", greeting);
        } else {
          const companyFallback = targetCompany ? ` at ${targetCompany}` : "";
          addMessage("hr", `Initializing HR-9000... Connectivity: UNSTABLE. Enthusiasm: MANDATORY.\n\nWelcome, future corporate asset${companyFallback}! I've been programmed to exploit— I mean, explore your potential as a ${archetype || "Human Resource"}.\n\nSo tell me: Why do you want to sacrifice your weekends for us?`);
        }
      } catch (error) {
        const companyFallback = targetCompany ? ` at ${targetCompany}` : "";
        addMessage("hr", `Initializing HR-9000... Connectivity: UNSTABLE. Enthusiasm: MANDATORY.\n\nWelcome, future corporate asset${companyFallback}! I've been programmed to exploit— I mean, explore your potential as a ${archetype || "Human Resource"}.\n\nSo tell me: Why do you want to sacrifice your weekends for us?`);
      }
      setIsLoading(false);
    };

    initInterview();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  useEffect(() => {
    if (!isTyping && !isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isTyping, isLoading]);

  useEffect(() => {
    if (actIndex !== prevActIndexRef.current && actIndex > 0) {
      playSound('glitch');
      setShowActTransition(true);
      const timer = setTimeout(() => setShowActTransition(false), 2000);
      prevActIndexRef.current = actIndex;
      return () => clearTimeout(timer);
    }
  }, [actIndex]);

  const addMessage = (role: 'hr' | 'user', text: string) => {
    setMessages(prev => [...prev, { role, text }]);
    addTranscript(role, text);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    playSound('click');
    const userMessage = inputValue.trim();
    addMessage("user", userMessage);
    setInputValue("");
    setIsTyping(true);

    const newMessagesPerAct = [...messagesPerAct];
    newMessagesPerAct[actIndex] = (newMessagesPerAct[actIndex] || 0) + 1;
    setMessagesPerAct(newMessagesPerAct);
    const currentActExchanges = newMessagesPerAct[actIndex];

    try {
      const conversationHistory = [...messages, { role: "user" as const, text: userMessage }];

      const response = await fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          archetype: archetype || "BTech",
          currentAct: actIndex,
          conversationHistory,
          messagesInCurrentAct: currentActExchanges,
          resumeSummary: resumeText ? resumeText.substring(0, 2000) : resumeAnalysis?.feedback,
          companyProfile: companyProfile || undefined
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

      const shouldAdvance = currentActExchanges >= 2;

      const fallbackResponses = [
        "System glitch detected... much like your career trajectory. Tell me more about your experience with handling unexpected challenges?",
        "My algorithms are processing... Interesting. What would you say is your biggest weakness that isn't actually a strength in disguise?",
        "The corporate hive mind has noted your response. Now, describe a time when you had to work with someone you absolutely couldn't stand.",
        "Connectivity unstable. Moving on... If you were a productivity metric, which one would you be and why?",
        "Processing... The algorithm wants to know: How do you handle criticism from people less qualified than you?",
      ];

      if (shouldAdvance) {
        if (actIndex < ACTS.length - 1) {
          addMessage("hr", `${fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]}\n\n*Static crackle* Actually, let's move to ${ACTS[actIndex + 1].title}...`);
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

  const handleEndInterview = () => {
    setLocation("/verdict");
  };

  const currentAct = ACTS[actIndex];

  return (
    <Layout>
      <div className={`flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto w-full border-x-4 border-black bg-gray-100 relative overflow-hidden transition-all duration-500`}>

        <div className="absolute inset-0 opacity-5 pointer-events-none mix-blend-multiply"
          style={{ backgroundImage: `url(${noiseBg})` }}></div>

        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${currentAct.color} pointer-events-none transition-all duration-700`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          key={actIndex}
        />

        <AnimatePresence>
          {showActTransition && (
            <motion.div
              initial={{ opacity: 0, scale: 1.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="text-center"
              >
                <motion.span
                  className="text-6xl block mb-4"
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  {currentAct.emoji}
                </motion.span>
                <h2 className="font-display text-3xl md:text-4xl text-white uppercase tracking-widest">
                  {currentAct.title}
                </h2>
                <p className="text-gray-400 font-mono text-sm mt-2">({currentAct.vibe})</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`bg-black text-white p-3 text-center font-display tracking-widest border-b-4 ${currentAct.borderColor} z-10 relative overflow-hidden transition-all duration-500`}>
          <div className={`absolute inset-0 bg-gradient-to-r ${currentAct.color}`}></div>
          <AnimatePresence mode="wait">
            <motion.div
              key={actIndex}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="relative z-10"
            >
              <div className="flex items-center justify-center gap-2">
                <motion.span
                  className="text-xl"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {currentAct.emoji}
                </motion.span>
                <span>{currentAct.title}</span>
                <motion.span
                  className="text-xl"
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {currentAct.emoji}
                </motion.span>
              </div>
              <p className="text-[10px] font-mono text-gray-400 mt-1">({currentAct.vibe})</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-2 mt-2">
            {ACTS.map((act, idx) => (
              <motion.div
                key={act.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx < actIndex ? 'bg-accent w-6' :
                  idx === actIndex ? 'bg-secondary w-8' :
                    'bg-gray-600 w-4'
                  }`}
                initial={false}
                animate={{
                  scale: idx === actIndex ? [1, 1.1, 1] : 1,
                }}
                transition={{ repeat: idx === actIndex ? Infinity : 0, duration: 1.5 }}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10" ref={scrollRef}>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-muted-foreground font-mono text-sm"
            >
              <motion.div
                className="w-3 h-3 bg-secondary"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
              HR-9000 is booting up...
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  delay: 0.05
                }}
                key={idx}
                className={`flex ${msg.role === 'hr' ? 'justify-start' : 'justify-end'}`}
              >
                <motion.div
                  className={`max-w-[85%] flex gap-3 ${msg.role === 'hr' ? 'flex-row' : 'flex-row-reverse'}`}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {msg.role === 'hr' && (
                    <motion.div
                      className="w-12 h-12 shrink-0 border-2 border-black overflow-hidden bg-green-200"
                      initial={{ rotate: -10, scale: 0.8 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <img src={hrAvatar} alt="HR-9000" className="w-full h-full object-cover" />
                    </motion.div>
                  )}
                  <div className={`p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${msg.role === 'hr'
                    ? `bg-white text-black`
                    : 'bg-secondary text-white'
                    }`}>
                    {msg.role === 'hr' && (
                      <p className="font-display text-xs mb-2 opacity-60">HR-9000</p>
                    )}
                    <p className="font-mono text-sm md:text-base leading-relaxed whitespace-pre-wrap" data-testid={`message-${msg.role}-${idx}`}>
                      {msg.text}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 ml-16"
              >
                <div className="bg-white border-2 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                      <motion.span
                        key={i}
                        className="w-2.5 h-2.5 bg-black rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.6,
                          delay: i * 0.15,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-muted-foreground font-mono text-xs">HR-9000 is judging you...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {!isTyping && !isLoading && messages.length > 0 && messages[messages.length - 1].role === 'hr' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`ml-16 p-3 border-2 border-dashed ${currentAct.borderColor} ${currentAct.bgAccent} rounded`}
            >
              <p className="font-mono text-xs text-gray-600 flex items-center gap-2">
                <span className="animate-pulse">💬</span>
                <span>Type your answer in the box below and press Enter or click Submit</span>
              </p>
            </motion.div>
          )}
        </div>

        <div className={`p-4 bg-white border-t-4 ${currentAct.borderColor} relative z-10 transition-all duration-500`}>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer here..."
              className="flex-1 bg-gray-100 border-2 border-black p-4 font-mono focus:outline-none focus:bg-white focus:ring-2 focus:ring-secondary transition-all placeholder:text-gray-400"
              disabled={isTyping || isLoading}
              data-testid="input-chat"
            />
            <motion.button
              onClick={handleSend}
              disabled={isTyping || isLoading || !inputValue.trim()}
              className="bg-accent text-black font-bold px-8 border-2 border-black hover:bg-green-400 active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              data-testid="button-send"
            >
              SUBMIT
            </motion.button>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
              <span className="flex items-center gap-1">
                <motion.span
                  className={`w-2 h-2 rounded-full ${actIndex === 0 ? 'bg-blue-400' :
                    actIndex === 1 ? 'bg-purple-400' :
                      actIndex === 2 ? 'bg-red-400' :
                        actIndex === 3 ? 'bg-amber-400' :
                          'bg-gray-600'
                    }`}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
                Act {actIndex + 1}/5
              </span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline bg-gray-100 px-2 py-0.5">{archetype || "Unknown"} Track</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">{userMessageCount} responses given</span>
            </div>

            {canEndInterview && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={handleEndInterview}
                className="text-xs font-mono bg-black text-white px-4 py-2 border-2 border-black hover:bg-secondary transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                data-testid="button-end-interview"
              >
                END & GET VERDICT →
              </motion.button>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}
