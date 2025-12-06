import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const botMessages = [
  { text: "Have you considered being more passionate about unpaid overtime?", emoji: "🤖" },
  { text: "Your productivity score is concerning. Have you tried not having boundaries?", emoji: "📊" },
  { text: "We noticed you took a lunch break. Let's discuss.", emoji: "🍽️" },
  { text: "Fun fact: 'Work-life balance' is just two words we put on posters!", emoji: "✨" },
  { text: "Your desk plant looks too healthy. Are you overwatering it during work hours?", emoji: "🌱" },
  { text: "Remember: We're a family! (HR will see you now about those 'concerns')", emoji: "👨‍👩‍👧" },
  { text: "Have you tried synergizing your deliverables with the paradigm shift?", emoji: "🎯" },
  { text: "Your facial expression suggests you have thoughts. Please submit them in writing.", emoji: "📝" },
];

const reactions = ["💀", "😭", "🏃", "🚩", "✋", "🙃"];

export default function HRBot() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [hasNewMessage, setHasNewMessage] = useState(true);
  const [showReaction, setShowReaction] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isExpanded) {
        setCurrentMessage((prev) => (prev + 1) % botMessages.length);
        setHasNewMessage(true);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [isExpanded]);

  const handleReaction = (reaction: string) => {
    setShowReaction(reaction);
    setTimeout(() => setShowReaction(null), 1000);
  };

  if (isMinimized) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-40 w-12 h-12 bg-secondary text-white rounded-full border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center text-xl"
        data-testid="button-hrbot-expand"
      >
        🤖
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-40"
    >
      <div className="relative">
        {hasNewMessage && !isExpanded && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full border border-black flex items-center justify-center"
          >
            <span className="text-[8px] text-white font-bold">!</span>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsExpanded(!isExpanded);
            setHasNewMessage(false);
          }}
          className={`w-14 h-14 ${isExpanded ? 'bg-accent' : 'bg-secondary'} text-white rounded-full border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center text-2xl`}
          data-testid="button-hrbot-toggle"
        >
          <span className={isExpanded ? "" : "animate-bounce"}>🤖</span>
        </motion.button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute bottom-16 right-0 w-72 md:w-80 bg-white border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="bg-secondary text-white px-3 py-2 flex items-center justify-between border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                  <span className="font-bold text-sm uppercase tracking-wider">HR Bot v6.66</span>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}
                    className="w-5 h-5 bg-accent text-black flex items-center justify-center text-xs hover:bg-black hover:text-accent transition-colors"
                    data-testid="button-hrbot-minimize"
                  >
                    _
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                    className="w-5 h-5 bg-destructive text-white flex items-center justify-center text-xs hover:bg-black transition-colors"
                    data-testid="button-hrbot-close"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-4 relative">
                <AnimatePresence mode="wait">
                  {showReaction && (
                    <motion.div
                      initial={{ scale: 0, y: 0 }}
                      animate={{ scale: 1.5, y: -20 }}
                      exit={{ scale: 0, y: -40, opacity: 0 }}
                      className="absolute top-2 right-2 text-3xl"
                    >
                      {showReaction}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3 mb-3">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-lg shrink-0">
                    {botMessages[currentMessage].emoji}
                  </div>
                  <div className="bg-gray-100 border-2 border-black p-2 text-sm font-mono relative">
                    <div className="absolute -left-2 top-3 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-black"></div>
                    <p>{botMessages[currentMessage].text}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-[10px] font-mono text-gray-400">React:</span>
                  <div className="flex gap-1">
                    {reactions.map((reaction) => (
                      <motion.button
                        key={reaction}
                        whileHover={{ scale: 1.3 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleReaction(reaction)}
                        className="w-7 h-7 hover:bg-gray-100 rounded flex items-center justify-center transition-colors"
                        data-testid={`button-react-${reaction}`}
                      >
                        {reaction}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-200">
                  <div className="text-[10px] font-mono text-gray-400 mb-1">QUICK RESPONSES:</div>
                  <div className="flex flex-wrap gap-1">
                    {["I'll circle back", "Per my last email", "Let's align", "Noted."].map((response) => (
                      <button
                        key={response}
                        className="text-[10px] px-2 py-1 bg-gray-100 border border-black hover:bg-accent hover:text-black transition-colors"
                        data-testid={`button-response-${response.toLowerCase().replace(/\s/g, '-')}`}
                      >
                        {response}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-black text-accent px-3 py-1 text-[10px] font-mono flex items-center justify-between">
                <span>STATUS: MICROMANAGING</span>
                <span className="animate-pulse">●●●</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
