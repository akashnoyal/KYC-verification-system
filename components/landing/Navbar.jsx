"use client";

import { motion } from "motion/react";

export default function Navbar() {
    return (
        <motion.header
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur"
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-center px-6">
                <h1 className="text-lg font-semibold text-slate-900">KYC Verify</h1>
            </div>
        </motion.header>
    );
}