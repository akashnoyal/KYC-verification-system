"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import KYCFlow from "@/components/kyc/KYCFlow";

export default function Home() {
  const [started, setStarted] = useState(false);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <AnimatePresence mode="wait">
        {started ? (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <Hero onStart={() => setStarted(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="kyc-flow"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <KYCFlow />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}