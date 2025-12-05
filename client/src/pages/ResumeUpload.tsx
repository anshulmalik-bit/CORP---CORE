import React, { useState, useRef } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { useSession } from "@/lib/context";
import scannerImg from "@assets/generated_images/chaotic_resume_shredder_and_scanner.png";
import noiseBg from "@assets/generated_images/digital_noise_texture_for_background.png";

export default function ResumeUpload() {
  const [_, setLocation] = useLocation();
  const { archetype, setResumeText, setResumeAnalysis } = useSession();
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Waiting for victim data...");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState<{
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    buzzwordScore: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const statusMessages = [
    "Extracting lies...",
    "Measuring enthusiasm inflation...",
    "Detecting mandatory resume exaggeration...",
    "Ignoring GPA...",
    "Judging font choices...",
    "Converting dreams to deliverables...",
    "Analyzing buzzword density...",
    "Calibrating disappointment levels..."
  ];

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text || "Resume content could not be extracted. Candidate appears to be a mystery.");
      };
      reader.onerror = () => {
        resolve("Resume upload failed. The system interprets this as lack of commitment.");
      };
      reader.readAsText(file);
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];
      setUploading(true);
      
      let prog = 0;
      const interval = setInterval(() => {
        prog += Math.random() * 8;
        if (prog >= 100) {
          prog = 100;
          clearInterval(interval);
        }
        setProgress(prog);
        setStatus(statusMessages[Math.floor((prog / 100) * statusMessages.length)] || "Finalizing judgment...");
      }, 200);

      const resumeContent = await extractTextFromFile(file);
      setResumeText(resumeContent);

      clearInterval(interval);
      setProgress(100);
      setStatus("Resume consumed. Initiating AI judgment protocol...");
      setAnalyzing(true);

      try {
        const response = await fetch("/api/resume/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeText: resumeContent,
            archetype: archetype || "BTech"
          })
        });

        if (response.ok) {
          const analysisData = await response.json();
          setAnalysis(analysisData);
          setResumeAnalysis(analysisData);
          setShowAnalysis(true);
          setAnalyzing(false);
        } else {
          setAnalyzing(false);
          setLocation("/interview");
        }
      } catch (error) {
        console.error("Analysis failed:", error);
        setAnalyzing(false);
        setLocation("/interview");
      }
    }
  };

  const handleSkip = () => {
    setResumeText("");
    setResumeAnalysis(null);
    setLocation("/interview");
  };

  const handleProceed = () => {
    setLocation("/interview");
  };

  return (
    <Layout>
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
           style={{ backgroundImage: `url(${noiseBg})` }}></div>

      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[80vh] relative z-10">
        <h1 className="text-4xl md:text-6xl font-display uppercase mb-12 text-center">
          SUBMIT YOUR <span className="text-secondary bg-black px-2">LIES</span>
        </h1>

        <div className="w-full max-w-xl relative">
          <div className="absolute -inset-20 opacity-20 pointer-events-none mix-blend-multiply z-0">
             <img src={scannerImg} alt="" className="w-full h-full object-contain opacity-50 blur-sm" />
          </div>

          <div className="border-4 border-black bg-white p-8 md:p-12 text-center brutalist-shadow-lg relative z-10">
            
            {!uploading && !showAnalysis ? (
              <div className="space-y-6">
                <div 
                  className="border-2 border-dashed border-black p-12 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="upload-dropzone"
                >
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={handleUpload}
                    className="hidden"
                    data-testid="input-resume"
                  />
                  <p className="font-mono text-xl">DROP RESUME HERE</p>
                  <p className="text-xs mt-2 text-muted-foreground">(TXT files work best for AI analysis)</p>
                </div>
                <p className="font-weird text-sm">
                  *By uploading, you agree that your data is now our property forever.
                </p>
                <button
                  onClick={handleSkip}
                  className="text-sm font-mono text-gray-500 hover:text-black underline transition-colors"
                  data-testid="button-skip-resume"
                >
                  Skip and face judgment without evidence
                </button>
              </div>
            ) : showAnalysis && analysis ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 text-left"
              >
                <div className="text-center mb-6">
                  <h2 className="font-display text-2xl uppercase mb-2">RESUME VERDICT</h2>
                  <div className="inline-block bg-accent border-2 border-black px-4 py-2">
                    <span className="font-mono text-sm">BUZZWORD SCORE: </span>
                    <span className="font-bold text-xl">{analysis.buzzwordScore}/100</span>
                  </div>
                </div>

                <div className="bg-gray-100 border-2 border-black p-4">
                  <p className="font-mono text-sm leading-relaxed" data-testid="text-resume-feedback">{analysis.feedback}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-2 border-black p-4 bg-green-50">
                    <h3 className="font-display text-lg mb-3 border-b-2 border-black pb-2">DETECTED STRENGTHS</h3>
                    <ul className="space-y-2">
                      {analysis.strengths.map((s, i) => (
                        <li key={i} className="font-mono text-xs flex items-start gap-2" data-testid={`text-strength-${i}`}>
                          <span className="text-green-600">+</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="border-2 border-black p-4 bg-red-50">
                    <h3 className="font-display text-lg mb-3 border-b-2 border-black pb-2">AREAS OF CONCERN</h3>
                    <ul className="space-y-2">
                      {analysis.weaknesses.map((w, i) => (
                        <li key={i} className="font-mono text-xs flex items-start gap-2" data-testid={`text-weakness-${i}`}>
                          <span className="text-red-600">!</span> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={handleProceed}
                  className="w-full bg-secondary text-white font-display text-xl py-4 border-4 border-black hover:bg-black transition-colors uppercase brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                  data-testid="button-proceed-interview"
                >
                  PROCEED TO INTERROGATION
                </button>
              </motion.div>
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
                <p className="font-mono animate-pulse text-lg" data-testid="text-upload-status">{status}</p>
                {analyzing && (
                  <div className="flex items-center justify-center gap-2 text-sm font-mono text-gray-600">
                    <div className="w-3 h-3 bg-secondary animate-pulse"></div>
                    HR-9000 is analyzing your career choices...
                  </div>
                )}
              </div>
            )}
          </div>
          
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
