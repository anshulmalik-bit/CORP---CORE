import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { useSession } from "@/lib/context";
import { motion, AnimatePresence } from "framer-motion";

const lines = [
  ">> Initializing corporate brain scanner...",
  ">> Checking for independent thoughts... FOUND. Deleting...",
  ">> Analyzing LinkedIn cringe tolerance...",
  ">> Measuring willingness to work for 'exposure'...",
  ">> Detecting impostor syndrome levels... OVER 9000",
  ">> Calibrating fake enthusiasm module...",
  ">> Downloading buzzword dictionary...",
  ">> Loading gaslighting protocols...",
  ">> SUCCESS: Subject is ready for exploitation. I mean, exploration."
];

const archetypes = [
  { 
    id: "BTech", 
    label: "TECH BRO ARC", 
    sub: "(B.Tech / Developer)", 
    color: "bg-cyan-200 hover:bg-cyan-400 border-cyan-400",
    emoji: "💻",
    vibe: "you probably mass apply on LinkedIn",
    trait: "Debugging skills: EXISTS. Social skills: 404"
  },
  { 
    id: "MBA", 
    label: "MANAGER FANTASY", 
    sub: "(MBA / Lead)", 
    color: "bg-purple-200 hover:bg-purple-400 border-purple-400",
    emoji: "📊",
    vibe: "PowerPoint is your love language",
    trait: "Leadership: SELF-PROCLAIMED. Experience: VIBES"
  },
  { 
    id: "Analyst", 
    label: "EXCEL WARRIOR", 
    sub: "(Analyst)", 
    color: "bg-green-200 hover:bg-green-400 border-green-400",
    emoji: "📈",
    vibe: "VLOOKUP haunts your dreams",
    trait: "Pivot tables: MASTERED. Touch grass: PENDING"
  }
];

export default function PreScreen() {
  const [_, setLocation] = useLocation();
  const { setArchetype } = useSession();
  const [log, setLog] = useState<string[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    let delay = 0;
    lines.forEach((line, index) => {
      delay += Math.random() * 600 + 300;
      setTimeout(() => {
        setLog((prev) => [...prev, line]);
        if (index === lines.length - 1) {
          setTimeout(() => setShowOptions(true), 500);
        }
      }, delay);
    });
  }, []);

  const handleSelect = (type: "MBA" | "BTech" | "Analyst") => {
    setArchetype(type);
    setLocation("/resume");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  return (
    <Layout>
      <motion.div 
        className="container mx-auto px-4 py-8 flex flex-col justify-center min-h-[80vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        
        <motion.div 
          className="flex items-center gap-2 mb-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex gap-1.5">
            <motion.div 
              className="w-3 h-3 rounded-full bg-destructive"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            />
            <motion.div 
              className="w-3 h-3 rounded-full bg-yellow-400"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            />
            <motion.div 
              className="w-3 h-3 rounded-full bg-accent"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
            />
          </div>
          <span className="font-mono text-xs text-gray-500">HR-9000 Terminal v6.9.420 — bash</span>
        </motion.div>
        
        <motion.div 
          className="bg-black text-green-400 font-mono p-4 md:p-6 border-4 border-green-500 shadow-[0_0_20px_rgba(0,255,0,0.3)] min-h-[280px] md:min-h-[320px] mb-8 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,0,0.1)_2px,rgba(0,255,0,0.1)_4px)]"></div>
          </div>
          <motion.div 
            className="absolute top-0 left-0 w-full h-1 bg-green-500 opacity-50"
            animate={{ y: [0, 280, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          
          <div className="relative z-10 text-xs md:text-sm">
            <AnimatePresence>
              {log.map((l, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`mb-2 ${l.includes('SUCCESS') ? 'text-accent font-bold' : ''} ${l.includes('ERROR') || l.includes('OVER 9000') ? 'text-destructive' : ''}`}
                >
                  {l}
                </motion.div>
              ))}
            </AnimatePresence>
            {!showOptions && (
              <motion.span 
                className="inline-block w-2 h-4 bg-green-400 ml-1"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >_</motion.span>
            )}
          </div>
          
          <motion.div 
            className="absolute bottom-2 right-2 text-[10px] text-green-600"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            CPU: 420% | RAM: YES | VIBES: IMMACULATE
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center mb-6"
            >
              <motion.h2 
                className="font-display text-2xl md:text-4xl uppercase mb-2"
                animate={{ 
                  textShadow: [
                    "0 0 0px transparent",
                    "0 0 10px rgba(255,0,255,0.3)",
                    "0 0 0px transparent"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                CHOOSE YOUR SUFFERING
              </motion.h2>
              <p className="font-mono text-xs text-gray-500">(all paths lead to the same burnout, bestie)</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showOptions && (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-3 gap-4 md:gap-6"
            >
              {archetypes.map((opt) => (
                <motion.button
                  key={opt.id}
                  variants={cardVariants}
                  onClick={() => handleSelect(opt.id as "MBA" | "BTech" | "Analyst")}
                  onMouseEnter={() => setHoveredCard(opt.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`${opt.color} p-4 md:p-6 border-4 border-black text-left font-mono shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all relative overflow-hidden group`}
                  data-testid={`button-archetype-${opt.id}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div 
                    className="absolute -right-4 -top-4 text-6xl md:text-8xl opacity-20 group-hover:opacity-40 transition-all"
                    animate={hoveredCard === opt.id ? { 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {opt.emoji}
                  </motion.div>
                  
                  <div className="relative z-10">
                    <motion.div 
                      className="text-4xl md:text-5xl mb-3"
                      animate={hoveredCard === opt.id ? { 
                        y: [0, -5, 0],
                        rotate: [0, 5, -5, 0]
                      } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      {opt.emoji}
                    </motion.div>
                    <h3 className="font-display text-lg md:text-xl mb-1">{opt.label}</h3>
                    <p className="text-xs text-gray-600 mb-3">{opt.sub}</p>
                    
                    <div className="border-t-2 border-black/20 pt-3 mt-3">
                      <p className="text-[10px] md:text-xs italic text-gray-700 mb-2">"{opt.vibe}"</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider">{opt.trait}</p>
                    </div>
                  </div>

                  <AnimatePresence>
                    {hoveredCard === opt.id && (
                      <motion.div 
                        className="absolute top-2 right-2 bg-black text-white text-[10px] px-2 py-0.5"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        CLICK ME PLS
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showOptions && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center mt-8 font-mono text-xs text-gray-400"
            >
              Pro tip: Your choice doesn't matter. Capitalism doesn't discriminate. 
              <span className="block mt-1">It exploits everyone equally.</span>
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </Layout>
  );
}
