"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const REDIRECT_URL = process.env.NEXT_PUBLIC_PLATFORM_URL
  ? `${process.env.NEXT_PUBLIC_PLATFORM_URL}/dashboard/kyc`
  : "/";
const REDIRECT_DELAY = 5;

export default function SuccessPage() {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_DELAY);

  useEffect(() => {
    if (secondsLeft <= 0) {
      window.location.href = REDIRECT_URL;
      return;
    }

    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="h-2 w-full bg-emerald-700" />

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="p-10 text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease: "backOut", delay: 0.15 }}
            className="mb-6 flex justify-center"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <CheckCircle2 size={36} className="text-emerald-700" />
              </motion.div>
            </div>
          </motion.div>

          <motion.h1 variants={item} className="text-3xl font-semibold text-slate-900">
            KYC Verification Submitted
          </motion.h1>

          <motion.p variants={item} className="mt-4 text-sm text-slate-600">
            Your verification request has been received successfully. Our team will review your
            documents shortly.
          </motion.p>

          <motion.p variants={item} className="mt-2 text-xs text-slate-400">
            Redirecting you back in {secondsLeft}s...
          </motion.p>

          <motion.div variants={item}>
            <Link href={REDIRECT_URL} className="mt-6 inline-flex w-full">
              <motion.span
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 inline-flex w-full justify-center rounded-lg bg-blue-800 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Back to Platform Now
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </main>
  );
}