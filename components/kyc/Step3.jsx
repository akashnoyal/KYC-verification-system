"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
    motion,
    AnimatePresence,
} from "motion/react";
import { toast } from "sonner";
import Webcam from "react-webcam";
import {
    Camera,
    CreditCard,
    CheckCircle2,
    Info,
    CameraOff,
} from "lucide-react";
import { useKYC } from "@/context/KYCContext";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const BRIGHTNESS_BLOCK_THRESHOLD = 15;

function getAverageBrightness(imageSrc) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                canvas.width = 64;
                canvas.height = 64;

                const ctx = canvas.getContext("2d");

                if (!ctx) {
                    reject(new Error("Unable to create canvas context."));
                    return;
                }

                ctx.drawImage(img, 0, 0, 64, 64);

                const { data } = ctx.getImageData(0, 0, 64, 64);

                let total = 0;

                for (let i = 0; i < data.length; i += 4) {
                    total +=
                        data[i] * 0.299 +
                        data[i + 1] * 0.587 +
                        data[i + 2] * 0.114;
                }

                resolve(total / (data.length / 4));
            } catch (error) {
                reject(error);
            }
        };

        img.onerror = reject;
        img.src = imageSrc;
    });
}

export default function Step3() {
    const router = useRouter();
    const webcamRef = useRef(null);

    const { kycData, updateKYC, previousStep } = useKYC();

    const [captureType, setCaptureType] = useState("front");
    const [frontPreview, setFrontPreview] = useState(null);
    const [backPreview, setBackPreview] = useState(null);
    const [capturing, setCapturing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cameraError, setCameraError] = useState(false);
    const [webcamKey, setWebcamKey] = useState(0);
    const [flash, setFlash] = useState(false);

    const handleCameraError = () => {
        setCameraError(true);
    };

    const retryCamera = () => {
        setCameraError(false);
        setWebcamKey((key) => key + 1);
    };

    const captureID = async () => {
        if (capturing || loading) return;

        const image = webcamRef.current?.getScreenshot();

        if (!image) {
            toast.error(
                "Unable to capture image. Make sure camera access is allowed and try again."
            );
            return;
        }

        if (captureType === "back" && image === frontPreview) {
            toast.error(
                "This looks identical to your front photo. Flip the card over and capture the back."
            );
            return;
        }

        setFlash(true);
        setTimeout(() => setFlash(false), 200);

        setCapturing(true);

        try {
            const brightness = await getAverageBrightness(image).catch(() => null);

            if (brightness !== null && brightness < BRIGHTNESS_BLOCK_THRESHOLD) {
                toast.error(
                    "The photo is too dark to read. Check your lighting and try again."
                );
                return;
            }

            const response = await fetch(image);

            if (!response.ok) {
                throw new Error("Unable to process captured image.");
            }

            const blob = await response.blob();

            if (blob.size > MAX_FILE_SIZE) {
                toast.error("Image is too large. Please try capturing again.");
                return;
            }

            const file = new File([blob], `id-${captureType}.jpg`, {
                type: "image/jpeg",
            });

            if (captureType === "front") {
                setFrontPreview(image);

                updateKYC({ idFront: file });

                setCaptureType("back");

                toast.success("Front captured — now flip to the back.");

                return;
            }

            setBackPreview(image);

            updateKYC({ idBack: file });

            toast.success("Back captured.");
        } catch (error) {
            console.error("ID capture error:", error);

            toast.error(
                "Something went wrong processing that image. Please try again."
            );
        } finally {
            setCapturing(false);
        }
    };

    const submit = async () => {
        if (loading) return;

        if (!frontPreview || !backPreview) {
            toast.error("Capture both sides of your ID before submitting.");
            return;
        }

        if (
            !kycData.platformName ||
            !kycData.fullName ||
            !kycData.idType ||
            !kycData.idNumber ||
            !kycData.selfie
        ) {
            toast.error(
                "Some information is missing. Redirecting you back to the start..."
            );

            setTimeout(() => previousStep(), 1500);

            return;
        }

        if (!kycData.userId) {
            toast.error(
                "We couldn't identify your account. Please refresh and try again."
            );
            return;
        }

        if (
            !(kycData.selfie instanceof File) ||
            !(kycData.idFront instanceof File) ||
            !(kycData.idBack instanceof File)
        ) {
            toast.error(
                "Your camera captures are missing. Please recapture your documents."
            );
            return;
        }

        try {
            setLoading(true);

            const form = new FormData();

            form.append("userId", String(kycData.userId));
            form.append("username", kycData.username || "");
            form.append("platformName", kycData.platformName);
            form.append("fullName", kycData.fullName);
            form.append("idType", kycData.idType);
            form.append("idNumber", kycData.idNumber);
            form.append("selfie", kycData.selfie);
            form.append("idFront", kycData.idFront);
            form.append("idBack", kycData.idBack);

            const response = await fetch("/api/submit", {
                method: "POST",
                body: form,
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Submission failed. Please try again."
                );
            }

            toast.success("Verification submitted successfully.");

            router.push("/success");
        } catch (error) {
            console.error("KYC submission error:", error);

            toast.error(
                error?.name === "TypeError"
                    ? "Network error — check your connection and try again."
                    : error?.message || "Something went wrong. Please try submitting again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-semibold text-slate-900">
                    Verify Your ID Card
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    Capture clear photos of the front and back of your ID.
                </p>
            </div>

            <div className="flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                    <AnimatePresence mode="wait" initial={false}>
                        {frontPreview ? (
                            <motion.span
                                key="front-done"
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ duration: 0.3, ease: "backOut" }}
                            >
                                <CheckCircle2 className="text-emerald-700" size={20} />
                            </motion.span>
                        ) : (
                            <motion.div
                                key="front-pending"
                                className="h-5 w-5 rounded-full border-2 border-blue-800"
                            />
                        )}
                    </AnimatePresence>

                    <span className="text-xs font-medium uppercase tracking-wide text-slate-900">
                        Front
                    </span>
                </div>

                <div className="h-px w-12 bg-slate-200" />

                <div className="flex items-center gap-2">
                    <AnimatePresence mode="wait" initial={false}>
                        {backPreview ? (
                            <motion.span
                                key="back-done"
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ duration: 0.3, ease: "backOut" }}
                            >
                                <CheckCircle2 className="text-emerald-700" size={20} />
                            </motion.span>
                        ) : (
                            <motion.div
                                key="back-pending"
                                className="h-5 w-5 rounded-full border-2 border-slate-200"
                            />
                        )}
                    </AnimatePresence>

                    <span className="text-xs font-medium uppercase tracking-wide text-slate-900">
                        Back
                    </span>
                </div>
            </div>

            {!frontPreview || !backPreview ? (
                <>
                    <div className="rounded-2xl border border-slate-200 bg-blue-50 p-4">
                        <div className="flex gap-3">
                            <Info className="mt-1 text-blue-800" size={20} />

                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-900">
                                    Capture the {captureType} of your ID
                                </h3>

                                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                                    <li>Entire card must be visible.</li>
                                    <li>Keep all four corners inside the frame.</li>
                                    <li>Avoid glare and shadows.</li>
                                    <li>Keep the camera steady.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {cameraError ? (
                        <div className="rounded-2xl border border-red-700 bg-red-50 p-8 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white">
                                <CameraOff size={26} className="text-red-700" />
                            </div>

                            <h3 className="mt-4 text-lg font-semibold text-slate-900">
                                Camera access is required
                            </h3>

                            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">
                                ID capture must be done live through your camera —
                                uploading a photo isn't accepted. Enable camera
                                permissions for this site in your browser settings,
                                then try again.
                            </p>

                            <motion.button
                                type="button"
                                onClick={retryCamera}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="mt-5 rounded-lg bg-blue-800 px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                            >
                                Try Again
                            </motion.button>
                        </div>
                    ) : (
                        <>
                            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-black">
                                <AnimatePresence>
                                    {flash && (
                                        <motion.div
                                            initial={{ opacity: 0.9 }}
                                            animate={{ opacity: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute inset-0 z-20 bg-white"
                                        />
                                    )}
                                </AnimatePresence>

                                <Webcam
                                    key={webcamKey}
                                    ref={webcamRef}
                                    audio={false}
                                    screenshotFormat="image/jpeg"
                                    screenshotQuality={0.92}
                                    className="w-full"
                                    videoConstraints={{ facingMode: "environment" }}
                                    onUserMediaError={handleCameraError}
                                />

                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
                                    <div className="relative aspect-[1.6/1] w-full max-w-md rounded-2xl border-[3px] border-dashed border-white/90 sm:max-w-lg">
                                        <CreditCard
                                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/60"
                                            size={60}
                                        />
                                    </div>
                                </div>

                                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-5 py-2 text-xs text-white">
                                    Capture ID {captureType}
                                </div>
                            </div>

                            <motion.button
                                type="button"
                                onClick={captureID}
                                disabled={capturing || loading}
                                whileHover={{ scale: capturing || loading ? 1 : 1.02 }}
                                whileTap={{ scale: capturing || loading ? 1 : 0.96 }}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-800 py-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Camera size={20} />
                                {capturing
                                    ? "Processing..."
                                    : `Capture ${captureType === "front" ? "Front" : "Back"}`}
                            </motion.button>
                        </>
                    )}
                </>
            ) : (
                <>
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-emerald-700 bg-emerald-50 p-5"
                    >
                        <h3 className="text-lg font-semibold text-emerald-700">
                            Review Your ID Photos
                        </h3>

                        <p className="mt-2 text-sm text-emerald-700">
                            Make sure both images are sharp, readable, and all four
                            corners of the ID card are visible before submitting.
                        </p>
                    </motion.div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                        >
                            <img src={frontPreview} alt="ID Front" className="h-56 w-full object-cover" />

                            <div className="space-y-3 p-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-900">
                                        ID Front
                                    </h4>

                                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                                        Captured
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() => {
                                        setFrontPreview(null);
                                        updateKYC({ idFront: null });
                                        setCaptureType("front");
                                    }}
                                    className="w-full rounded-lg border border-slate-200 py-3 text-sm font-medium text-slate-900 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Retake Front
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                        >
                            <img src={backPreview} alt="ID Back" className="h-56 w-full object-cover" />

                            <div className="space-y-3 p-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-900">
                                        ID Back
                                    </h4>

                                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                                        Captured
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() => {
                                        setBackPreview(null);
                                        updateKYC({ idBack: null });
                                        setCaptureType("back");
                                    }}
                                    className="w-full rounded-lg border border-slate-200 py-3 text-sm font-medium text-slate-900 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Retake Back
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}

            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={previousStep}
                    disabled={loading}
                    className="flex-1 rounded-lg border border-slate-200 py-3 text-sm font-semibold text-slate-900 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Back
                </button>

                <motion.button
                    type="button"
                    onClick={submit}
                    disabled={loading || capturing || !frontPreview || !backPreview}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="flex-1 rounded-lg bg-blue-800 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? "Submitting..." : "Submit Verification"}
                </motion.button>
            </div>
        </div>
    );
}