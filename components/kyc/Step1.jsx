"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useKYC } from "@/context/KYCContext";
import {
    UserRound,
    IdCard,
    Hash,
} from "lucide-react";

const idTypes = [
    "National ID",
    "Passport",
    "Driver's License",
];

const idPatterns = {
    "National ID": {
        regex: /^[A-Z0-9]{6,12}$/i,
        hint: "6–12 letters/numbers",
    },

    Passport: {
        regex: /^[A-Z0-9]{6,9}$/i,
        hint: "6–9 letters/numbers",
    },

    "Driver's License": {
        regex: /^[A-Z0-9-]{5,15}$/i,
        hint: "5–15 letters/numbers",
    },
};

const nameRegex = /^[a-zA-Z\s.'-]{2,60}$/;

function Field({
    label,
    icon: Icon,
    error,
    children,
}) {
    return (
        <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-900">
                <Icon size={13} strokeWidth={2.2} />
                {label}
            </label>

            <motion.div
                animate={
                    error
                        ? { x: [0, -6, 6, -4, 4, 0] }
                        : { x: 0 }
                }
                transition={{ duration: 0.35 }}
            >
                {children}
            </motion.div>

            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 text-xs font-medium text-red-700"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
}

export default function Step1() {
    const { kycData, updateKYC, nextStep } = useKYC();

    const [form, setForm] = useState({
        fullName: kycData.fullName || "",
        idType: kycData.idType || "",
        idNumber: kycData.idNumber || "",
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: null,
            }));
        }
    };

    const validate = () => {
        const next = {};

        const fullName = form.fullName.trim();
        const idNumber = form.idNumber.trim();

        if (!fullName) {
            next.fullName = "Enter your full name as it appears on your ID.";
        } else if (!nameRegex.test(fullName)) {
            next.fullName = "Use letters only, as printed on your ID.";
        }

        if (!form.idType) {
            next.idType = "Select an ID type.";
        }

        if (!idNumber) {
            next.idNumber = "Enter your ID number.";
        } else if (form.idType && idPatterns[form.idType]) {
            const { regex, hint } = idPatterns[form.idType];
            if (!regex.test(idNumber)) {
                next.idNumber = `Doesn't look like a valid ${form.idType} number (${hint}).`;
            }
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (submitting) return;

        if (!kycData.userId) {
            toast.error(
                "We couldn't identify your account. Please open the verification link again."
            );
            return;
        }

        if (!kycData.platformName) {
            toast.error(
                "Missing platform information. Please open the verification link again."
            );
            return;
        }

        if (!validate()) {
            toast.error("Please fix the highlighted fields.");
            return;
        }

        setSubmitting(true);

        updateKYC({
            fullName: form.fullName.trim(),
            idType: form.idType,
            idNumber: form.idNumber.trim().toUpperCase(),
        });

        nextStep();
    };

    const inputBase =
        "w-full rounded-lg border bg-white p-3.5 text-sm outline-none transition-colors focus:ring-2";

    const inputClass = (hasError) =>
        `${inputBase} ${hasError
            ? "border-red-700 focus:ring-red-100"
            : "border-slate-200 focus:ring-blue-100"
        }`;

    return (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
                <h2 className="text-3xl font-semibold text-slate-900">
                    Personal Information
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    This is matched against your ID in the next steps, so enter
                    it exactly as printed.
                </p>
            </div>

            {/* {kycData.platformName && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Verifying for <span className="font-semibold text-slate-900">{kycData.platformName}</span>
                    {kycData.username && (
                        <> — <span className="font-semibold text-slate-900">{kycData.username}</span></>
                    )}
                </div>
            )} */}

            <Field label="Full Name (as per ID)" icon={UserRound} error={errors.fullName}>
                <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Jordan A. Rivera"
                    maxLength={60}
                    className={inputClass(errors.fullName)}
                />
            </Field>

            <Field label="ID Type" icon={IdCard} error={errors.idType}>
                <select
                    name="idType"
                    value={form.idType}
                    onChange={handleChange}
                    className={inputClass(errors.idType)}
                >
                    <option value="">Select ID type</option>

                    {idTypes.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
            </Field>

            <Field label="ID Number" icon={Hash} error={errors.idNumber}>
                <input
                    name="idNumber"
                    value={form.idNumber}
                    onChange={handleChange}
                    placeholder="e.g. X1234567"
                    className={`${inputClass(errors.idNumber)} font-mono tracking-wider`}
                />
            </Field>

            <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: submitting ? 1 : 1.02 }}
                whileTap={{ scale: submitting ? 1 : 0.98 }}
                className="w-full rounded-lg bg-blue-800 py-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {submitting ? "Continuing..." : "Continue"}
            </motion.button>
        </form>
    );
}