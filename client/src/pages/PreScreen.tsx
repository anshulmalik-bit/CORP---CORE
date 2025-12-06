import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { useSession } from "@/lib/context";
import { motion, AnimatePresence } from "framer-motion";
import type { CompanyProfile } from "@shared/schema";

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
  const { setArchetype, setTargetCompany, setCompanyProfile } = useSession();
  const [log, setLog] = useState<string[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [selectedArchetype, setSelectedArchetype] = useState<"MBA" | "BTech" | "Analyst" | null>(null);
  const [showCompanyInput, setShowCompanyInput] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [isResearching, setIsResearching] = useState(false);
  const [researchStatus, setResearchStatus] = useState("");

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
    setSelectedArchetype(type);
    setArchetype(type);
    setShowOptions(false);
    setTimeout(() => setShowCompanyInput(true), 300);
  };

  const handleCompanySubmit = async () => {
    const trimmedName = companyName.trim();
    
    if (!trimmedName) {
      setTargetCompany("");
      setCompanyProfile(null);
      setLocation("/resume");
      return;
    }
    
    setIsResearching(true);
    setResearchStatus("Initiating corporate espionage... I mean, research...");
    setTargetCompany(trimmedName);
    
    try {
      const response = await fetch("/api/company/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: trimmedName })
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompanyProfile(data.profile);
        setResearchStatus("Intel acquired. Target identified. Proceeding...");
      } else {
        const data = await response.json();
        if (data.fallback && data.profile) {
          setCompanyProfile(data.profile);
          setResearchStatus("Research limited. Proceeding with generic intel...");
        } else {
          setResearchStatus("Research failed. Proceeding without company data...");
        }
      }
    } catch (error) {
      console.error("Company research error:", error);
      setResearchStatus("Network error. Proceeding without company intel...");
    }
    
    setTimeout(() => {
      setLocation("/resume");
    }, 1500);
  };

  const handleSkipCompany = () => {
    setTargetCompany("");
    setCompanyProfile(null);
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
        type: "spring" as const,
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

        <AnimatePresence>
          {showCompanyInput && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="max-w-xl mx-auto"
            >
              <motion.div 
                className="bg-white border-4 border-black p-6 md:p-8 brutalist-shadow-lg relative"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" as const, stiffness: 300, damping: 20 }}
              >
                <motion.div 
                  className="absolute -top-3 -left-3 bg-secondary text-white border-2 border-black px-3 py-1 font-mono text-xs rotate-[-3deg]"
                  initial={{ opacity: 0, rotate: 0 }}
                  animate={{ opacity: 1, rotate: -3 }}
                  transition={{ delay: 0.3 }}
                >
                  STEP 2: INTEL GATHERING
                </motion.div>

                <motion.h2 
                  className="font-display text-2xl md:text-3xl uppercase text-center mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  TARGET COMPANY?
                </motion.h2>
                
                <motion.p 
                  className="text-center font-mono text-xs text-gray-500 mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  (Optional: We'll research your target for customized interrogation)
                </motion.p>

                {!isResearching ? (
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="relative">
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g., Google, Amazon, Netflix..."
                        className="w-full p-4 border-4 border-black font-mono text-lg focus:outline-none focus:ring-4 focus:ring-secondary/50 placeholder:text-gray-400"
                        data-testid="input-company-name"
                        onKeyDown={(e) => e.key === 'Enter' && handleCompanySubmit()}
                      />
                      <motion.div 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        🎯
                      </motion.div>
                    </div>

                    <div className="flex gap-3">
                      <motion.button
                        onClick={handleCompanySubmit}
                        className="flex-1 bg-secondary text-white font-display text-lg py-3 border-4 border-black hover:bg-black transition-colors uppercase brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                        data-testid="button-research-company"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {companyName.trim() ? "RESEARCH TARGET" : "PROCEED WITHOUT TARGET"}
                      </motion.button>
                    </div>

                    <motion.button
                      onClick={handleSkipCompany}
                      className="w-full text-sm font-mono text-gray-500 hover:text-black underline transition-colors"
                      data-testid="button-skip-company"
                      whileHover={{ scale: 1.02 }}
                    >
                      Skip — I'm applying everywhere anyway
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="text-center py-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div 
                      className="flex justify-center gap-2 mb-4"
                    >
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-4 h-4 bg-secondary"
                          animate={{ 
                            scale: [1, 1.5, 1],
                            rotate: [0, 180, 360],
                            borderRadius: ["0%", "50%", "0%"]
                          }}
                          transition={{ 
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                        />
                      ))}
                    </motion.div>
                    <motion.p 
                      className="font-mono text-sm"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {researchStatus}
                    </motion.p>
                    <p className="font-mono text-xs text-gray-400 mt-2">
                      Scanning corporate databases...
                    </p>
                  </motion.div>
                )}

                {selectedArchetype && (
                  <motion.div 
                    className="absolute -bottom-3 -right-3 bg-accent border-2 border-black px-3 py-1 font-mono text-xs rotate-[3deg]"
                    initial={{ opacity: 0, rotate: 0 }}
                    animate={{ opacity: 1, rotate: 3 }}
                    transition={{ delay: 0.5 }}
                  >
                    TRACK: {archetypes.find(a => a.id === selectedArchetype)?.label}
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Layout>
  );
}
