import React, { useState } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";

export default function ResumeUpload() {
  const [_, setLocation] = useLocation();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Waiting for victim data...");

  const statusMessages = [
    "Extracting lies...",
    "Measuring enthusiasm inflation...",
    "Detecting mandatory resume exaggeration...",
    "Ignoring GPA...",
    "Judging font choices...",
    "Converting dreams to deliverables..."
  ];

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setUploading(true);
      
      // Fake progress simulation
      let prog = 0;
      const interval = setInterval(() => {
        prog += Math.random() * 10;
        if (prog >= 100) {
          prog = 100;
          clearInterval(interval);
          setTimeout(() => setLocation("/interview"), 1000);
        }
        setProgress(prog);
        setStatus(statusMessages[Math.floor((prog / 100) * statusMessages.length)] || "Finalizing judgment...");
      }, 300);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[80vh]">
        <h1 className="text-4xl md:text-6xl font-display uppercase mb-12 text-center">
          SUBMIT YOUR <span className="text-secondary bg-black px-2">LIES</span>
        </h1>

        <div className="w-full max-w-xl relative">
          <div className="border-4 border-black bg-white p-12 text-center brutalist-shadow-lg relative z-10">
            
            {!uploading ? (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-black p-12 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    onChange={handleUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <p className="font-mono text-xl">DROP RESUME HERE</p>
                  <p className="text-xs mt-2 text-muted-foreground">(PDF, DOCX, or Blood Sample)</p>
                </div>
                <p className="font-weird text-sm">
                  *By uploading, you agree that your data is now our property forever.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="h-8 border-4 border-black bg-gray-200 relative overflow-hidden">
                  <motion.div 
                    className="absolute top-0 left-0 h-full bg-secondary"
                    style={{ width: `${progress}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xs mix-blend-difference text-white">
                    {Math.round(progress)}%
                  </div>
                </div>
                <p className="font-mono animate-pulse text-lg">{status}</p>
              </div>
            )}
          </div>
          
          {/* Decor elements */}
          <div className="absolute -top-4 -right-4 bg-accent border-2 border-black p-2 font-mono text-xs rotate-12 z-20">
            ATS FRIENDLY!
          </div>
          <div className="absolute -bottom-6 -left-6 bg-destructive text-white border-2 border-black p-2 font-mono text-xs -rotate-6 z-20">
            NO REFUNDS
          </div>
        </div>
      </div>
    </Layout>
  );
}
