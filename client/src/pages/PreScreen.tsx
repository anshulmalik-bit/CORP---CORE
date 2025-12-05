import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { useSession } from "@/lib/context";
import { motion } from "framer-motion";

const lines = [
  "Checking for corporate obedience...",
  "Analyzing buzzword density in brain...",
  "Detecting impostor syndrome levels...",
  "Calibrating fake smile...",
  "Optimizing for maximum burnout...",
  "SUCCESS: Subject is ready for exploitation."
];

export default function PreScreen() {
  const [_, setLocation] = useLocation();
  const { setArchetype } = useSession();
  const [log, setLog] = useState<string[]>([]);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    let delay = 0;
    lines.forEach((line, index) => {
      delay += Math.random() * 800 + 400;
      setTimeout(() => {
        setLog((prev) => [...prev, line]);
        if (index === lines.length - 1) {
          setShowOptions(true);
        }
      }, delay);
    });
  }, []);

  const handleSelect = (type: "MBA" | "BTech" | "Analyst") => {
    setArchetype(type);
    setLocation("/resume");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 flex flex-col justify-center min-h-[80vh]">
        
        <div className="bg-black text-green-500 font-mono p-6 border-4 border-gray-500 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.5)] min-h-[300px] mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500 opacity-20 animate-[scan_2s_linear_infinite]"></div>
          {log.map((l, i) => (
            <div key={i} className="mb-2">> {l}</div>
          ))}
          {!showOptions && <span className="animate-pulse">_</span>}
        </div>

        {showOptions && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              { id: "BTech", label: "ENGINEERING PRODUCTIVITY ASSET", sub: "(B.Tech / Dev)" },
              { id: "MBA", label: "MANAGERIAL POWER FANTASY", sub: "(MBA / Lead)" },
              { id: "Analyst", label: "DATA-DRIVEN EXCEL SOLDIER", sub: "(Analyst)" }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id as "MBA" | "BTech" | "Analyst")}
                className="bg-white border-4 border-black p-6 text-left hover:bg-accent hover:text-white transition-colors group relative overflow-hidden"
              >
                <div className="relative z-10">
                  <h3 className="font-display text-2xl mb-2 group-hover:translate-x-2 transition-transform">{opt.label}</h3>
                  <p className="font-mono text-sm opacity-70">{opt.sub}</p>
                </div>
                <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0 opacity-10"></div>
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
