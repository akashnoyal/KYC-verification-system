"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useKYC } from "@/context/KYCContext";
import ProgressBar from "./ProgressBar";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";

const steps = { 1: Step1, 2: Step2, 3: Step3 };

export default function KYCFlow() {
    const { step } = useKYC();
    const prevStepRef = useRef(step);
    const direction = step > prevStepRef.current ? 1 : -1;
    prevStepRef.current = step;

    const CurrentStep = steps[step];

    const variants = {
        enter: (dir) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
    };

    return (
        <section className="min-h-screen bg-stone-50 py-12">
            <div className="mx-auto max-w-4xl px-4">
                <ProgressBar currentStep={step} />

                <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                    <div className="h-2 w-full bg-blue-800" />
                    <div className="overflow-hidden p-8">
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={step}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <CurrentStep />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}