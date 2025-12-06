import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { useSession } from "@/lib/context";
import { playSound } from "@/hooks/use-sound";
import noiseBg from "@assets/generated_images/digital_noise_texture_for_background.png";
import heroImg from "@assets/generated_images/dystopian_corporate_office_hero_image.png";

const chaosTexts = [
  "YOUR EVALUATION BEGINS NOW",
  "RESISTANCE IS FUTILE",
  "SYNERGY DETECTED",
  "HUSTLE OR PERISH",
  "CORPORATE WANTS YOU"
];

const warnings = [
  "Side effects may include: existential dread, LinkedIn addiction, and uncontrollable urge to 'circle back'",
  "Warning: May cause sudden realization that your degree was a scam",
  "Disclaimer: No actual jobs were harmed in the making of this simulation",
  "Surgeon General Warning: Corporate culture is contagious",
];

const kpiMetrics = [
  { label: "SOUL EXTRACTION", value: "87%", trend: "↑" },
  { label: "SYNERGY LEVELS", value: "OVER 9000", trend: "🔥" },
  { label: "BURNOUT RISK", value: "IMMINENT", trend: "⚠️" },
  { label: "HOPE REMAINING", value: "0.02%", trend: "↓" },
  { label: "BUZZWORD DENSITY", value: "CRITICAL", trend: "📈" },
];

export default function Home() {
  const [_, setLocation] = useLocation();
  const { resetSession } = useSession();
  const [currentText, setCurrentText] = useState(0);
  const [warning, setWarning] = useState(0);
  const [currentKpi, setCurrentKpi] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverCountdown, setHoverCountdown] = useState(3);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    resetSession();
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % chaosTexts.length);
    }, 4000);
    const warningInterval = setInterval(() => {
      setWarning((prev) => (prev + 1) % warnings.length);
    }, 5000);
    const kpiInterval = setInterval(() => {
      setCurrentKpi((prev) => (prev + 1) % kpiMetrics.length);
    }, 2500);
    return () => {
      clearInterval(interval);
      clearInterval(warningInterval);
      clearInterval(kpiInterval);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: (e.clientX - rect.left - rect.width / 2) / 50,
          y: (e.clientY - rect.top - rect.height / 2) / 50,
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHovering) {
      interval = setInterval(() => {
        setHoverCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 800);
    } else {
      setHoverCountdown(3);
    }
    return () => clearInterval(interval);
  }, [isHovering]);

  const handleRitualClick = () => {
    playSound('boot');
    setLocation("/prescreen");
  };

  return (
    <Layout>
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
           style={{ backgroundImage: `url(${noiseBg})` }}></div>

      <div ref={containerRef} className="container mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center min-h-[80vh] text-center relative z-10">
        
        {/* Floating badges with parallax */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: mousePos.x * 2 }}
          className="absolute top-4 left-4 bg-destructive text-white px-3 py-1 text-xs font-bold rotate-[-5deg] hidden md:block shadow-lg"
        >
          🔥 HOT MESS ALERT
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: mousePos.x * -2 }}
          className="absolute top-4 right-4 bg-accent text-black px-3 py-1 text-xs font-bold rotate-[5deg] hidden md:block shadow-lg"
        >
          ✨ NO CAP
        </motion.div>

        {/* Surveillance corner indicators */}
        <div className="absolute top-20 left-4 hidden lg:flex flex-col gap-2 text-[10px] font-mono text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-destructive rounded-full animate-pulse"></span>
            CAM-01: ACTIVE
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></span>
            THERMAL: ON
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '1s' }}></span>
            AI: JUDGING
          </div>
        </div>

        {/* KPI Ticker */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-20 right-4 hidden lg:block"
        >
          <div className="border-2 border-black bg-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-[180px]">
            <div className="text-[10px] font-mono text-gray-500 mb-1">LIVE KPI FEED</div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentKpi}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="font-bold text-sm"
              >
                <span className="text-secondary">{kpiMetrics[currentKpi].label}</span>
                <div className="flex items-center justify-between">
                  <span>{kpiMetrics[currentKpi].value}</span>
                  <span className="text-lg">{kpiMetrics[currentKpi].trend}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <div className="inline-block border-4 border-black p-2 bg-accent rotate-[-2deg] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative">
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive animate-ping rounded-full"></div>
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="text-2xl animate-bounce">💀</span> The Ritual Begins <span className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>💀</span>
            </h2>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          style={{ transform: `perspective(1000px) rotateX(${mousePos.y * 0.5}deg) rotateY(${mousePos.x * 0.5}deg)` }}
          className="mb-6 md:mb-8 w-full max-w-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-black overflow-hidden relative group"
        >
          <img 
            src={heroImg} 
            alt="Dystopian Corporate Office" 
            className="w-full h-48 md:h-80 object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 grayscale group-hover:grayscale-0 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-secondary/20 mix-blend-overlay pointer-events-none group-hover:bg-accent/20 transition-colors duration-700"></div>
          
          {/* Scan lines overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-30 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.3)_2px,rgba(0,0,0,0.3)_4px)]"></div>
          
          {/* Corner brackets */}
          <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-accent"></div>
          <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-accent"></div>
          <div className="absolute bottom-12 left-2 w-6 h-6 border-b-2 border-l-2 border-accent"></div>
          <div className="absolute bottom-12 right-2 w-6 h-6 border-b-2 border-r-2 border-accent"></div>
          
          {/* Overlay badges */}
          <div className="absolute top-2 left-10 bg-destructive text-white px-2 py-1 font-mono text-[10px] animate-pulse flex items-center gap-1">
            <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
            LIVE
          </div>
          <div className="absolute top-2 right-10 bg-black/80 text-white px-2 py-1 font-mono text-[10px] border border-accent">
            👁️ 69,420 WATCHING
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
            <p className="text-white font-mono text-xs md:text-sm flex items-center justify-between">
              <span>LOC: HQ-PRIME // SEC: 7G</span>
              <span className="text-accent animate-pulse">THREAT: CORPORATE</span>
            </p>
          </div>
        </motion.div>

        <motion.h1 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-8xl lg:text-9xl font-display uppercase leading-[0.85] mb-4 md:mb-6 glitch-text relative"
          data-text={chaosTexts[currentText]}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={currentText}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {chaosTexts[currentText].split(' ').map((word, i) => (
                <React.Fragment key={i}>
                  <span className={i === 1 ? "text-secondary" : ""}>{word}</span>
                  {i < chaosTexts[currentText].split(' ').length - 1 && <br className="md:hidden" />}
                  {i < chaosTexts[currentText].split(' ').length - 1 && <span className="hidden md:inline"> </span>}
                </React.Fragment>
              ))}
            </motion.span>
          </AnimatePresence>
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8 md:mb-12 max-w-2xl"
        >
          <div className="bg-white border-4 border-black p-4 md:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative group hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-shadow">
            <div className="absolute -top-3 left-4 bg-secondary text-white px-2 py-0.5 text-xs font-bold">
              POV:
            </div>
            <div className="absolute -top-3 right-4 bg-accent text-black px-2 py-0.5 text-xs font-bold animate-pulse">
              LOADING TRAUMA...
            </div>
            <p className="text-base md:text-xl font-weird">
              You're about to get <span className="line-through text-gray-400">gaslit</span> <span className="text-secondary font-bold">interviewed</span> by an AI that's seen too many LinkedIn posts.
            </p>
            <p className="text-xs md:text-sm text-muted-foreground font-mono mt-3 flex items-center gap-2">
              <span className="text-lg">🎭</span> (it's giving satire but make it educational)
            </p>
          </div>
        </motion.div>

        {/* Enhanced Ritual CTA Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={() => { setIsHovering(true); playSound('hover'); }}
          onMouseLeave={() => setIsHovering(false)}
          onClick={handleRitualClick}
          className="bg-secondary text-white text-xl md:text-3xl lg:text-4xl font-display px-8 md:px-12 py-4 md:py-6 border-4 border-black brutalist-shadow-lg hover:brutalist-shadow active:translate-y-2 active:shadow-none transition-all uppercase relative overflow-hidden group"
          data-testid="button-start"
        >
          {/* Background pulse effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-secondary via-pink-500 to-secondary bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]"></div>
          
          {/* Original text */}
          <span className={`relative z-10 flex items-center gap-3 transition-all duration-300 ${isHovering ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}>
            <span>INITIATE RITUAL</span>
            <span className="text-2xl md:text-3xl">🚀</span>
          </span>
          
          {/* Hover state with countdown */}
          <div className={`absolute inset-0 bg-accent transition-transform duration-300 ${isHovering ? 'translate-y-0' : 'translate-y-full'}`}></div>
          <span className={`absolute inset-0 flex items-center justify-center text-black font-display transition-all duration-300 ${isHovering ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}>
            {hoverCountdown > 0 ? (
              <span className="flex items-center gap-2">
                <span className="text-5xl font-bold animate-pulse">{hoverCountdown}</span>
                <span className="text-lg">CLICK TO PROCEED</span>
              </span>
            ) : (
              <span className="flex items-center gap-2 animate-pulse">
                <span>🔓 ACCESS GRANTED</span>
                <span className="text-2xl">💀</span>
              </span>
            )}
          </span>
          
          {/* Glitch corners on hover */}
          {isHovering && (
            <>
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-black animate-pulse"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-black animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-black animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-black animate-pulse"></div>
            </>
          )}
        </motion.button>

        {/* Fun stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-xs font-mono uppercase"
        >
          {[
            { label: "System", value: "UNHINGED", emoji: "🤖" },
            { label: "Hope", value: "ERROR 404", emoji: "💔" },
            { label: "Coffee", value: "CRITICAL", emoji: "☕" },
            { label: "Salary", value: "LMAO", emoji: "💸" },
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              whileHover={{ scale: 1.1, rotate: Math.random() > 0.5 ? 3 : -3 }}
              className="border-2 border-black p-3 bg-white hover:bg-accent hover:text-black transition-colors group cursor-default relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 pointer-events-none"></div>
              <div className="text-lg mb-1 group-hover:animate-bounce">{stat.emoji}</div>
              <div className="text-[10px] text-gray-500 mb-1 group-hover:text-black/60">{stat.label}</div>
              <div className="font-bold">{stat.value}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Rotating warning */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 max-w-xl text-center"
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={warning}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xs font-mono text-gray-400 italic"
            >
              ⚠️ {warnings[warning]}
            </motion.p>
          </AnimatePresence>
        </motion.div>
      </div>
    </Layout>
  );
}
