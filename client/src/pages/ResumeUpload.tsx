import React, { useState, useRef } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/context";
import { playSound } from "@/hooks/use-sound";
import type { ATSScore } from "@shared/schema";
import scannerImg from "@assets/generated_images/chaotic_resume_shredder_and_scanner.png";
import noiseBg from "@assets/generated_images/digital_noise_texture_for_background.png";
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function ResumeUpload() {
  const [_, setLocation] = useLocation();
  const { archetype, setResumeText, setResumeAnalysis, companyProfile, targetCompany } = useSession();
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Waiting for victim data...");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [analysis, setAnalysis] = useState<{
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    buzzwordScore: number;
    atsScore?: ATSScore;
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

  const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      return fullText.trim() || "PDF content could not be extracted. The document may be image-based.";
    } catch (error) {
      console.error("PDF extraction error:", error);
      return "PDF extraction failed. Please try uploading a text-based PDF or a TXT file.";
    }
  };

  const extractTextFromWord = async (file: File): Promise<string> => {
    try {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value.trim() || "Word document content could not be extracted.";
    } catch (error) {
      console.error("Word extraction error:", error);
      return "Word document extraction failed. Please try uploading a TXT file instead.";
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    const fileName = file.name.toLowerCase();

    // Handle PDF files with pdf.js
    if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
      return extractTextFromPdf(file);
    }

    // Handle Word documents with mammoth
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword' ||
      fileName.endsWith('.docx') ||
      fileName.endsWith('.doc')) {
      return extractTextFromWord(file);
    }

    // Handle text files and other formats
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        // Check if the text looks like binary/corrupted data
        if (text && (text.includes('%PDF') || text.includes('endobj'))) {
          resolve("This appears to be a PDF file. Please ensure you're uploading a valid PDF or try a TXT file.");
        }
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
      playSound('scan');
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
            archetype: archetype || "BTech",
            companyProfile: companyProfile || undefined
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
    playSound('click');
    setResumeText("");
    setResumeAnalysis(null);
    setLocation("/interview");
  };

  const handleProceed = () => {
    playSound('success');
    setLocation("/interview");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragOver) playSound('hover');
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    playSound('click');
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(files[0]);
      fileInputRef.current.files = dataTransfer.files;
      fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const }
    }
  };

  return (
    <Layout>
      <motion.div
        className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url(${noiseBg})` }}
        animate={{ opacity: [0.08, 0.12, 0.08] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <motion.div
        className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[80vh] relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h1
          className="text-4xl md:text-6xl font-display uppercase mb-12 text-center"
          variants={itemVariants}
        >
          SUBMIT YOUR <motion.span
            className="text-secondary bg-black px-2 inline-block"
            animate={{
              skewX: [-1, 1, -1],
              textShadow: [
                "2px 2px 0 rgba(255,0,255,0.3)",
                "-2px -2px 0 rgba(0,255,255,0.3)",
                "2px 2px 0 rgba(255,0,255,0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >LIES</motion.span>
        </motion.h1>

        <motion.div className="w-full max-w-xl relative" variants={itemVariants}>
          <motion.div
            className="absolute -inset-20 opacity-20 pointer-events-none mix-blend-multiply z-0"
            animate={{
              rotate: [0, 1, -1, 0],
              scale: [1, 1.02, 0.98, 1]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          >
            <img src={scannerImg} alt="" className="w-full h-full object-contain opacity-50 blur-sm" />
          </motion.div>

          <motion.div
            className="border-4 border-black bg-white p-8 md:p-12 text-center brutalist-shadow-lg relative z-10"
            whileHover={{ boxShadow: "12px 12px 0 0 #000" }}
            transition={{ duration: 0.2 }}
          >

            {!uploading && !showAnalysis ? (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  className={`border-2 border-dashed border-black p-12 bg-gray-50 cursor-pointer relative overflow-hidden transition-colors ${isDragOver ? 'bg-secondary/10 border-secondary' : 'hover:bg-gray-100'}`}
                  onClick={() => { playSound('click'); fileInputRef.current?.click(); }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  data-testid="upload-dropzone"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  animate={isDragOver ? {
                    borderColor: ["#ff00ff", "#00ffff", "#ff00ff"],
                    boxShadow: [
                      "0 0 20px rgba(255,0,255,0.3)",
                      "0 0 40px rgba(0,255,255,0.3)",
                      "0 0 20px rgba(255,0,255,0.3)"
                    ]
                  } : {}}
                  transition={isDragOver ? { duration: 0.5, repeat: Infinity } : { duration: 0.2 }}
                >
                  <AnimatePresence>
                    {isDragOver && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-secondary/20 via-accent/20 to-secondary/20"
                        initial={{ opacity: 0, x: "-100%" }}
                        animate={{ opacity: 1, x: "100%" }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    )}
                  </AnimatePresence>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={handleUpload}
                    className="hidden"
                    data-testid="input-resume"
                  />
                  <motion.p
                    className="font-mono text-xl relative z-10"
                    animate={isDragOver ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 0.3, repeat: Infinity }}
                  >
                    {isDragOver ? "RELEASE TO SUBMIT" : "DROP RESUME HERE"}
                  </motion.p>
                  <p className="text-xs mt-2 text-muted-foreground relative z-10">(TXT files work best for AI analysis)</p>

                  <motion.div
                    className="absolute bottom-2 left-2 right-2 flex justify-center gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                  >
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 h-1 bg-black rounded-full"
                        animate={{
                          y: [0, -3, 0],
                          opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.1
                        }}
                      />
                    ))}
                  </motion.div>
                </motion.div>
                <motion.p
                  className="font-weird text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  *By uploading, you agree that your data is now our property forever.
                </motion.p>
                <motion.button
                  onClick={handleSkip}
                  onMouseEnter={() => playSound('hover')}
                  className="text-sm font-mono text-gray-500 hover:text-black underline transition-colors"
                  data-testid="button-skip-resume"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Skip and face judgment without evidence
                </motion.button>
              </motion.div>
            ) : showAnalysis && analysis ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 text-left"
              >
                <motion.div
                  className="text-center mb-6"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.h2
                    className="font-display text-2xl uppercase mb-2"
                    animate={{
                      textShadow: [
                        "0 0 0px transparent",
                        "0 0 10px rgba(255,0,255,0.5)",
                        "0 0 0px transparent"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ATS ANALYSIS REPORT
                  </motion.h2>

                  {analysis.atsScore && (
                    <motion.div
                      className="inline-block bg-black text-white border-4 border-secondary px-6 py-4 mt-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
                    >
                      <span className="font-mono text-sm block">OVERALL ATS SCORE</span>
                      <motion.span
                        className="font-display text-5xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        data-testid="text-ats-score"
                      >
                        {analysis.atsScore.overall}
                      </motion.span>
                      <span className="font-display text-2xl text-gray-400">/100</span>
                    </motion.div>
                  )}
                </motion.div>

                {analysis.atsScore && (
                  <motion.div
                    className="bg-gray-50 border-2 border-black p-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="font-display text-sm uppercase mb-3 border-b border-black pb-2">Section Breakdown</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'experience', label: 'Experience', color: 'bg-blue-500' },
                        { key: 'skills', label: 'Skills', color: 'bg-purple-500' },
                        { key: 'keywords', label: 'Keywords', color: 'bg-secondary' },
                        { key: 'formatting', label: 'Formatting', color: 'bg-cyan-500' },
                        { key: 'education', label: 'Education', color: 'bg-green-500' },
                      ].map((section, i) => {
                        const score = analysis.atsScore?.sections[section.key as keyof typeof analysis.atsScore.sections] || 0;
                        return (
                          <motion.div
                            key={section.key}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            data-testid={`section-${section.key}`}
                          >
                            <div className="flex justify-between text-xs font-mono mb-1">
                              <span>{section.label}</span>
                              <span className="font-bold">{score}/100</span>
                            </div>
                            <div className="h-3 bg-gray-200 border border-black overflow-hidden">
                              <motion.div
                                className={`h-full ${section.color}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${score}%` }}
                                transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                <motion.div
                  className="bg-gray-100 border-2 border-black p-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="font-mono text-sm leading-relaxed" data-testid="text-resume-feedback">{analysis.feedback}</p>
                </motion.div>

                {analysis.atsScore && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <motion.div
                      className="border-2 border-black p-4 bg-green-50"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <h3 className="font-display text-sm mb-3 border-b-2 border-black pb-2">MATCHED KEYWORDS</h3>
                      <div className="flex flex-wrap gap-1">
                        {analysis.atsScore.matchedKeywords.slice(0, 10).map((kw, i) => (
                          <motion.span
                            key={i}
                            className="bg-green-200 border border-black px-2 py-0.5 text-[10px] font-mono uppercase"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.7 + i * 0.05 }}
                            data-testid={`keyword-matched-${i}`}
                          >
                            {kw}
                          </motion.span>
                        ))}
                        {analysis.atsScore.matchedKeywords.length === 0 && (
                          <span className="text-xs text-gray-500 font-mono">No keywords detected</span>
                        )}
                      </div>
                    </motion.div>
                    <motion.div
                      className="border-2 border-black p-4 bg-red-50"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <h3 className="font-display text-sm mb-3 border-b-2 border-black pb-2">MISSING KEYWORDS</h3>
                      <div className="flex flex-wrap gap-1">
                        {analysis.atsScore.missingKeywords.slice(0, 10).map((kw, i) => (
                          <motion.span
                            key={i}
                            className="bg-red-200 border border-black px-2 py-0.5 text-[10px] font-mono uppercase"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.7 + i * 0.05 }}
                            data-testid={`keyword-missing-${i}`}
                          >
                            {kw}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <motion.div
                    className="border-2 border-black p-4 bg-cyan-50"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <h3 className="font-display text-sm mb-3 border-b-2 border-black pb-2">STRENGTHS</h3>
                    <ul className="space-y-2">
                      {analysis.strengths.map((s, i) => (
                        <motion.li
                          key={i}
                          className="font-mono text-xs flex items-start gap-2"
                          data-testid={`text-strength-${i}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + i * 0.1 }}
                        >
                          <span className="text-green-600">+</span> {s}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                  <motion.div
                    className="border-2 border-black p-4 bg-orange-50"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <h3 className="font-display text-sm mb-3 border-b-2 border-black pb-2">AREAS TO IMPROVE</h3>
                    <ul className="space-y-2">
                      {analysis.weaknesses.map((w, i) => (
                        <motion.li
                          key={i}
                          className="font-mono text-xs flex items-start gap-2"
                          data-testid={`text-weakness-${i}`}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + i * 0.1 }}
                        >
                          <span className="text-orange-600">!</span> {w}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </div>

                {analysis.atsScore && analysis.atsScore.recommendations.length > 0 && (
                  <motion.div
                    className="border-2 border-black p-4 bg-yellow-50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <h3 className="font-display text-sm mb-3 border-b-2 border-black pb-2">HR-9000 RECOMMENDATIONS</h3>
                    <ul className="space-y-2">
                      {analysis.atsScore.recommendations.map((rec, i) => (
                        <motion.li
                          key={i}
                          className="font-mono text-xs flex items-start gap-2"
                          data-testid={`recommendation-${i}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.0 + i * 0.1 }}
                        >
                          <span className="text-yellow-600 font-bold">{i + 1}.</span> {rec}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                <motion.button
                  onClick={handleProceed}
                  onMouseEnter={() => playSound('hover')}
                  className="w-full bg-secondary text-white font-display text-xl py-4 border-4 border-black hover:bg-black transition-colors uppercase brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                  data-testid="button-proceed-interview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  PROCEED TO INTERROGATION
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="h-8 border-4 border-black bg-gray-200 relative overflow-hidden">
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-secondary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div
                    className="absolute top-0 left-0 h-full w-full"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                      width: "30%"
                    }}
                    animate={{ x: ["-100%", "400%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xs mix-blend-difference text-white">
                    {Math.round(progress)}%
                  </div>
                </div>

                <motion.p
                  className="font-mono text-lg"
                  data-testid="text-upload-status"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  {status}
                </motion.p>

                {analyzing && (
                  <motion.div
                    className="flex items-center justify-center gap-2 text-sm font-mono text-gray-600"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <motion.div
                      className="flex gap-1"
                    >
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-3 h-3 bg-secondary"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [1, 0.5, 1],
                            rotate: [0, 180, 360]
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                        />
                      ))}
                    </motion.div>
                    <span>HR-9000 is analyzing your career choices...</span>
                  </motion.div>
                )}

                <motion.div
                  className="grid grid-cols-4 gap-2 mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: analyzing ? 1 : 0.3 }}
                >
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="h-2 bg-gray-300"
                      animate={analyzing ? {
                        scaleX: [0, 1, 0],
                        backgroundColor: ["#e5e5e5", "#ff00ff", "#e5e5e5"]
                      } : {}}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.1
                      }}
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            className="absolute -top-4 -right-4 bg-accent border-2 border-black p-2 font-mono text-xs rotate-12 z-20"
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{ opacity: 1, scale: 1, rotate: 12 }}
            transition={{ delay: 0.5, type: "spring" }}
            whileHover={{ scale: 1.1, rotate: 15 }}
          >
            ATS FRIENDLY!
          </motion.div>
          <motion.div
            className="absolute -bottom-6 -left-6 bg-destructive text-white border-2 border-black p-2 font-mono text-xs -rotate-6 z-20"
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{ opacity: 1, scale: 1, rotate: -6 }}
            transition={{ delay: 0.7, type: "spring" }}
            whileHover={{ scale: 1.1, rotate: -10 }}
          >
            NO REFUNDS
          </motion.div>
        </motion.div>
      </motion.div>
    </Layout>
  );
}
