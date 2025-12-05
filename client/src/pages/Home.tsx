import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { useSession } from "@/lib/context";
import noiseBg from "@assets/generated_images/digital_noise_texture_for_background.png";
import heroImg from "@assets/generated_images/dystopian_corporate_office_hero_image.png";

export default function Home() {
  const [_, setLocation] = useLocation();
  const { resetSession } = useSession();

  useEffect(() => {
    resetSession();
  }, []);

  return (
    <Layout>
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
           style={{ backgroundImage: `url(${noiseBg})` }}></div>

      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[80vh] text-center relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 border-4 border-black p-2 bg-accent rotate-[-2deg]"
        >
          <h2 className="text-xl font-bold uppercase tracking-widest">The Ritual Begins</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8 w-full max-w-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-black overflow-hidden relative group"
        >
          <img 
            src={heroImg} 
            alt="Dystopian Corporate Office" 
            className="w-full h-64 md:h-80 object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 grayscale group-hover:grayscale-0"
          />
          <div className="absolute inset-0 bg-green-500/20 mix-blend-overlay pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 bg-black text-white px-2 py-1 font-mono text-xs">
            LOC: HQ-PRIME // SEC: 7G
          </div>
        </motion.div>

        <motion.h1 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-6xl md:text-9xl font-display uppercase leading-[0.85] mb-6 glitch-text"
          data-text="YOUR EVALUATION BEGINS NOW"
        >
          YOUR<br/>EVALUATION<br/>BEGINS NOW
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-2xl font-weird mb-12 max-w-2xl bg-white border-2 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
          A satirical HR interrogation disguised as interview preparation.
          <br/>
          <span className="text-sm text-muted-foreground font-mono mt-2 block">(relax bro, it's just practice)</span>
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.05, rotate: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setLocation("/prescreen")}
          className="bg-secondary text-white text-2xl md:text-4xl font-display px-12 py-6 border-4 border-black brutalist-shadow-lg hover:brutalist-shadow active:translate-y-2 active:shadow-none transition-all uppercase"
        >
          INITIATE RITUAL
        </motion.button>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono uppercase opacity-60">
          <div className="border border-black p-2">System: ONLINE</div>
          <div className="border border-black p-2">Hope: OFFLINE</div>
          <div className="border border-black p-2">Coffee: STALE</div>
          <div className="border border-black p-2">Salary: TBD</div>
        </div>

      </div>
    </Layout>
  );
}
