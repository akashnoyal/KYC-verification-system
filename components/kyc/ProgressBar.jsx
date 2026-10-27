"use client";

import { motion, AnimatePresence } from "motion/react";
import { Check, User, Camera, CreditCard } from "lucide-react";

const steps = [
    { label: "Personal", icon: User },
    { label: "Selfie", icon: Camera },
    { label: "Documents", icon: CreditCard },
];

export default function ProgressBar({ currentStep }) {
    return (
        <div className="mb-10">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const stepNumber = index + 1;
                    const completed = currentStep > stepNumber;
                    const active = currentStep === stepNumber;

                    return (
                        <div key={step.label} className="relative flex flex-1 flex-col items-center">
                            {index !== steps.length - 1 && (
                                <div className="absolute left-1/2 top-5 h-[2px] w-full bg-slate-200">
                                    <motion.div
                                        className="h-full bg-blue-800"
                                        initial={{ width: "0%" }}
                                        animate={{ width: completed ? "100%" : "0%" }}
                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                    />
                                </div>
                            )}

                            <motion.div
                                animate={{ scale: active ? 1.1 : 1 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-300 ${completed
                                        ? "border-blue-800 bg-blue-800 text-white"
                                        : active
                                            ? "border-blue-800 bg-white text-blue-800"
                                            : "border-slate-200 bg-white text-slate-400"
                                    }`}
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    {completed ? (
                                        <motion.span
                                            key="check"
                                            initial={{ scale: 0, rotate: -45, opacity: 0 }}
                                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                            transition={{ duration: 0.3, ease: "backOut" }}
                                        >
                                            <Check size={18} />
                                        </motion.span>
                                    ) : (
                                        <motion.span
                                            key="icon"
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Icon size={18} />
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            <span
                                className={`mt-3 text-[11px] font-medium uppercase tracking-wide transition-colors duration-300 ${active ? "text-blue-800" : completed ? "text-slate-900" : "text-slate-400"
                                    }`}
                            >
                                {String(stepNumber).padStart(2, "0")} · {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}