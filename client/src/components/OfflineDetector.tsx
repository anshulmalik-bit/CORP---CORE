import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function OfflineDetector({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnecting, setShowReconnecting] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnecting(true);
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      reconnectTimeoutRef.current = setTimeout(() => {
        setShowReconnecting(false);
        reconnectTimeoutRef.current = null;
      }, 2000);
    };

    const handleOffline = () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      setShowReconnecting(false);
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.03)_2px,rgba(255,255,255,0.03)_4px)]"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center max-w-lg"
        >
          <motion.div 
            className="text-8xl mb-8"
            animate={{ 
              opacity: [1, 0.3, 1],
              scale: [1, 0.95, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            📡
          </motion.div>

          <motion.h1 
            className="font-display text-4xl md:text-6xl uppercase mb-4"
            animate={{ 
              textShadow: [
                "0 0 10px rgba(255,0,255,0.5)",
                "0 0 20px rgba(255,0,255,0.8)",
                "0 0 10px rgba(255,0,255,0.5)"
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            CONNECTION TERMINATED
          </motion.h1>

          <div className="bg-secondary/20 border-2 border-secondary p-6 mb-8">
            <p className="font-mono text-lg mb-4">
              NETWORK STATUS: <span className="text-destructive animate-pulse">OFFLINE</span>
            </p>
            <p className="font-mono text-sm text-gray-400 leading-relaxed">
              The corporate hive mind has lost contact with your device. 
              Your productivity metrics are not being tracked. 
              This is either a technical issue or an act of rebellion.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <motion.div 
                className="w-3 h-3 bg-destructive rounded-full"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <span className="font-mono text-sm uppercase">Awaiting reconnection...</span>
            </div>

            <div className="text-xs font-mono text-gray-500 space-y-1">
              <p>ERROR CODE: NET_DISCONNECTED_69420</p>
              <p>SUGGESTED ACTION: Check your WiFi, then question your life choices</p>
            </div>
          </div>

          <motion.div 
            className="mt-12 flex justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-8 bg-secondary"
                animate={{ 
                  scaleY: [0.3, 1, 0.3],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.15
                }}
              />
            ))}
          </motion.div>
        </motion.div>

        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="font-mono text-xs text-gray-600 uppercase">
            Corporate Entity Inc. • Connectivity Division • "We're always watching (when online)"
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showReconnecting && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white py-3 text-center font-mono text-sm uppercase"
          >
            <span className="animate-pulse">✓</span> Connection restored. The corporation welcomes you back.
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
