import React from "react";
import { Link } from "wouter";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-secondary selection:text-white flex flex-col">
      {/* TOP TICKER */}
      <div className="h-8 bg-primary text-primary-foreground overflow-hidden flex items-center border-b-4 border-black">
        <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite] uppercase font-mono text-sm tracking-widest">
          System Status: WATCHING • Productivity: MANDATORY • Smile: REQUIRED • HR is your friend • HR is your family • Submit to the process • 
          System Status: WATCHING • Productivity: MANDATORY • Smile: REQUIRED • HR is your friend • HR is your family • Submit to the process •
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-grow flex flex-col relative">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="border-t-4 border-black bg-white p-4 flex justify-between items-center text-xs uppercase font-bold tracking-widest">
        <div>© 2025 CORPORATE ENTITY INC.</div>
        <div className="flex gap-4">
          <span>ID: 994-21-X</span>
          <span className="text-destructive animate-pulse">RECORDING...</span>
        </div>
      </footer>
    </div>
  );
}
