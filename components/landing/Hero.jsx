"use client";

import { motion } from "motion/react";

const container = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
};

const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function Hero({ onStart }) {
    return (
        <section className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-stone-50 px-6">
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="mx-auto max-w-3xl text-center"
            >
                <motion.div
                    variants={item}
                    className="mb-6 inline-flex rounded-full border border-slate-200 bg-blue-50 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-blue-800"
                >
                    Secure · Fast · Trusted
                </motion.div>

                <motion.h1
                    variants={item}
                    className="text-5xl font-semibold leading-tight text-slate-900 md:text-6xl"
                >
                    Complete Your
                    <span className="block text-blue-800">KYC Verification</span>
                </motion.h1>

                <motion.p
                    variants={item}
                    className="mx-auto mt-6 max-w-xl text-lg text-slate-600"
                >
                    Verify your identity in just a few minutes. Your information is encrypted, securely
                    processed, and submitted for review.
                </motion.p>

                <motion.button
                    variants={item}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onStart}
                    className="mt-10 rounded-lg bg-blue-800 px-8 py-4 text-lg font-semibold text-white transition duration-300 hover:opacity-90 hover:shadow-xl"
                >
                    Start Verification
                </motion.button>
            </motion.div>
        </section>
    );
}