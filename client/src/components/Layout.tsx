import React, { useState, useEffect } from "react";
import { Link } from "wouter";

const tickerMessages = [
  "WORK HARDER • SMILE MORE • SYNERGY LOADING... •",
  "POV: You're about to get gaslit by HR •",
  "CEO makes 300x your salary but you get pizza friday •",
  "Hustle culture is just Stockholm syndrome with LinkedIn •",
  "We're a family here (derogatory) •",
  "Your potential is unlimited (your salary isn't) •",
  "Circle back • Touch base • Low-hanging fruit •",
  "Quiet quitting? More like loud surviving •",
  "This meeting could've been an email •",
  "Corporate wants you to find the difference •",
];

const funFacts = [
  "MORALE: OPTIONAL",
  "VIBES: IMMACULATE",
  "RED FLAGS: IGNORED",
  "BOUNDARIES: WHAT'S THAT",
  "BURNOUT: SPEEDRUN",
  "GASLIGHTING: PROFESSIONAL",
  "TRAUMA: BONDING",
  "DREAMS: MONETIZED",
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [currentFact, setCurrentFact] = useState(0);
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitching(true);
      setTimeout(() => {
        setCurrentFact((prev) => (prev + 1) % funFacts.length);
        setGlitching(false);
      }, 150);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const randomMessage = tickerMessages[Math.floor(Math.random() * tickerMessages.length)];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-secondary selection:text-white flex flex-col">
      {/* TOP TICKER - More chaotic */}
      <div className="h-10 bg-black text-white overflow-hidden flex items-center border-b-4 border-secondary relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10"></div>
        <div className="whitespace-nowrap animate-[marquee_15s_linear_infinite] uppercase font-mono text-xs tracking-widest flex items-center gap-4">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="flex items-center gap-4">
              <span className="text-secondary">★</span>
              <span>{randomMessage}</span>
              <span className="text-accent">◆</span>
              <span>NO THOUGHTS JUST CORPORATE •</span>
              <span className="text-destructive animate-pulse">⚠️ LIVE LAUGH LAYOFF ⚠️</span>
              <span>• SLAY YOUR INTERVIEW (LITERALLY) •</span>
            </span>
          ))}
        </div>
      </div>

      {/* SECONDARY STATUS BAR */}
      <div className="h-8 bg-accent text-black border-b-2 border-black flex items-center justify-between px-4 text-xs font-mono uppercase">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-black rounded-full animate-pulse"></span>
            LIVE
          </span>
          <span className={`transition-all ${glitching ? 'opacity-0 translate-y-2' : 'opacity-100'}`}>
            {funFacts[currentFact]}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:block">GRINDSET: ACTIVATED</span>
          <span className="bg-black text-accent px-2 py-0.5">v6.9.420</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-grow flex flex-col relative">
        {children}
        
        {/* Floating chaos elements */}
        <div className="fixed bottom-20 right-4 text-4xl float-chaotic opacity-20 pointer-events-none hidden lg:block">
          💼
        </div>
        <div className="fixed top-32 left-4 text-3xl float-chaotic opacity-20 pointer-events-none hidden lg:block" style={{ animationDelay: '-2s' }}>
          📊
        </div>
      </main>

      {/* FOOTER - More Gen-Z */}
      <footer className="border-t-4 border-black bg-white p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_11px)]"></div>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs uppercase font-bold tracking-widest">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏢</span>
            <div>
              <div>© 2025 CORPORATE ENTITY INC.</div>
              <div className="text-[10px] font-normal text-gray-500">a subsidiary of dystopia llc</div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <Link href="/history">
              <button className="hover:text-secondary transition-colors skew-hover px-3 py-1 border border-black hover:bg-black hover:text-white">
                VIEW FAILURES 📂
              </button>
            </Link>
            <span className="hidden md:inline text-gray-400">|</span>
            <span className="bg-secondary text-white px-2 py-1">ID: 404-HUMAN</span>
            <span className="flex items-center gap-1 text-destructive">
              <span className="w-2 h-2 bg-destructive rounded-full animate-pulse"></span>
              REC
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-gray-400 text-[10px]">
            <span>not legal advice</span>
            <span>•</span>
            <span>not therapy</span>
            <span>•</span>
            <span>just vibes</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
