"use client";

import {
    useRef,
    useState,
    useCallback,
} from "react";

import {
    motion,
    AnimatePresence,
} from "motion/react";

import { toast } from "sonner";

import Webcam from "react-webcam";

import {
    Camera,
    CameraOff,
    Info,
} from "lucide-react";

import { useKYC } from "@/context/KYCContext";

const BRIGHTNESS_BLOCK_THRESHOLD = 15;
const BRIGHTNESS_WARN_THRESHOLD = 55;

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

export default function Step2() {
    const webcamRef = useRef(null);

    const { kycData, updateKYC, nextStep, previousStep } = useKYC();

    const [preview, setPreview] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const [webcamKey, setWebcamKey] = useState(0);
    const [cameraLoading, setCameraLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [flash, setFlash] = useState(false);

    const handleCameraError = (err) => {
        setCameraLoading(false);

        if (
            err?.name === "NotAllowedError" ||
            err?.name === "PermissionDeniedError"
        ) {
            setCameraError("permission");
        } else {
            setCameraError("unavailable");
        }
    };

    const handleCameraReady = () => {
        setCameraLoading(false);
        setCameraError(null);
    };

    const retryCamera = () => {
        setCameraError(null);
        setCameraLoading(true);
        setWebcamKey((key) => key + 1);
    };

    const startLoadWatchdog = useCallback(() => {
        const timer = setTimeout(() => {
            setCameraLoading((loading) => {
                if (loading) {
                    setCameraError("unavailable");
                }
                return loading;
            });
        }, 8000);

        return () => clearTimeout(timer);
    }, []);

    const capture = async () => {
        if (cameraLoading) return;

        const image = webcamRef.current?.getScreenshot();

        if (!image) {
            toast.error(
                "Unable to capture selfie. Make sure camera access is allowed and try again."
            );
            return;
        }

        setFlash(true);
        setTimeout(() => setFlash(false), 200);

        try {
            const brightness = await getAverageBrightness(image);

            if (brightness < BRIGHTNESS_BLOCK_THRESHOLD) {
                toast.error(
                    "The photo is too dark to use. Check your lighting and try again."
                );
                return;
            }

            if (brightness < BRIGHTNESS_WARN_THRESHOLD) {
                toast.warning(
                    "This photo looks a bit dark — for best results, retake it in better lighting."
                );
            }
        } catch {
            // Fail open if brightness analysis fails.
        }

        setPreview(image);
    };

    const continueNext = async () => {
        if (!preview || submitting) return;

        if (!kycData.userId) {
            toast.error(
                "We couldn't identify your account. Please open the verification link again."
            );
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch(preview);

            if (!response.ok) {
                throw new Error("Failed to process selfie.");
            }

            const blob = await response.blob();

            const selfieFile = new File([blob], "selfie.jpg", {
                type: "image/jpeg",
            });

            updateKYC({ selfie: selfieFile });

            nextStep();
        } catch (error) {
            console.error("Selfie processing error:", error);

            toast.error(
                "Something went wrong processing your selfie. Please try again."
            );

            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-semibold text-slate-900">
                    Live Selfie Verification
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    Hold your ID card next to your face. Make sure both your
                    face and the entire ID card are clearly visible before
                    taking the photo.
                </p>
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
                        {cameraError === "permission"
                            ? "This step needs live camera access to confirm you're physically present — uploading a photo isn't accepted. Enable camera permissions for this site in your browser settings, then try again."
                            : "We couldn't find a usable camera on this device. Live selfie verification requires a working front-facing camera."}
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
            ) : !preview ? (
                <>
                    <div className="rounded-2xl border border-slate-200 bg-blue-50 p-4">
                        <div className="flex items-start gap-3">
                            <Info size={20} className="mt-0.5 text-blue-800" />

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-900">
                                    Before taking the photo
                                </p>

                                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                                    <li>Hold your ID beside your face.</li>
                                    <li>Keep your face fully visible.</li>
                                    <li>Ensure the ID is readable.</li>
                                    <li>Use good lighting.</li>
                                    <li>Do not cover your face.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

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

                        {cameraLoading && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
                                <span className="text-xs font-medium uppercase tracking-wide text-white/70">
                                    Starting camera...
                                </span>
                            </div>
                        )}

                        <Webcam
                            key={webcamKey}
                            ref={webcamRef}
                            audio={false}
                            mirrored
                            screenshotFormat="image/jpeg"
                            screenshotQuality={0.92}
                            className="w-full"
                            videoConstraints={{ facingMode: "user" }}
                            onUserMediaError={handleCameraError}
                            onUserMedia={handleCameraReady}
                        />

                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <div className="relative h-[330px] w-[240px] rounded-[36px] border-[3px] border-white/90" />
                        </div>

                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-5 py-2 text-xs font-medium uppercase tracking-wide text-white">
                            Hold your ID beside your face
                        </div>
                    </div>

                    <motion.button
                        type="button"
                        onClick={capture}
                        disabled={cameraLoading}
                        whileHover={{ scale: cameraLoading ? 1 : 1.02 }}
                        whileTap={{ scale: cameraLoading ? 1 : 0.96 }}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-800 py-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Camera size={20} />
                        Capture Selfie
                    </motion.button>
                </>
            ) : (
                <>
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-emerald-700 bg-emerald-50 p-5"
                    >
                        <h3 className="text-lg font-semibold text-emerald-700">
                            Review Your Selfie
                        </h3>

                        <p className="mt-2 text-sm text-emerald-700">
                            Before continuing, make sure:
                        </p>

                        <ul className="mt-3 space-y-2 text-sm text-emerald-700">
                            <li>✅ Your face is clearly visible.</li>
                            <li>✅ Your ID card is fully visible.</li>
                            <li>✅ The text on the ID is readable.</li>
                            <li>✅ The image is not blurry.</li>
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="overflow-hidden rounded-2xl border border-slate-200 shadow"
                    >
                        <img src={preview} alt="Selfie Preview" className="w-full" />
                    </motion.div>

                    <div className="grid grid-cols-2 gap-4">
                        <motion.button
                            type="button"
                            onClick={() => setPreview(null)}
                            disabled={submitting}
                            whileHover={{ scale: submitting ? 1 : 1.02 }}
                            whileTap={{ scale: submitting ? 1 : 0.98 }}
                            className="rounded-lg border border-slate-200 py-4 text-sm font-semibold text-slate-900 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Retake
                        </motion.button>

                        <motion.button
                            type="button"
                            onClick={continueNext}
                            disabled={submitting}
                            whileHover={{ scale: submitting ? 1 : 1.02 }}
                            whileTap={{ scale: submitting ? 1 : 0.98 }}
                            className="rounded-lg bg-blue-800 py-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? "Processing..." : "Continue"}
                        </motion.button>
                    </div>
                </>
            )}

            <button
                type="button"
                onClick={previousStep}
                disabled={submitting}
                className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
                ← Back
            </button>
        </div>
    );
}