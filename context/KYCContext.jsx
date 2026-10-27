"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
} from "react";

const KYCContext = createContext();

const STORAGE_KEY = "kyc-progress";

const initialKYCData = {
    // User
    userId: null,
    username: "",

    // Step 1
    platformName: "",
    fullName: "",
    idType: "",
    idNumber: "",

    // Step 2
    selfie: null,

    // Step 3
    idFront: null,
    idBack: null,
};

export function KYCProvider({ children }) {
    const [step, setStep] = useState(1);
    const [hydrated, setHydrated] = useState(false);

    const [kycData, setKycData] = useState(initialKYCData);

    /*
     * Restore saved KYC progress
     */
    useEffect(() => {
        try {
            const saved = sessionStorage.getItem(STORAGE_KEY);

            if (saved) {
                const parsed = JSON.parse(saved);

                setKycData((prev) => ({
                    ...prev,

                    userId: parsed.userId || null,
                    username: parsed.username || "",

                    platformName:
                        parsed.platformName || "",

                    fullName:
                        parsed.fullName || "",

                    idType:
                        parsed.idType || "",

                    idNumber:
                        parsed.idNumber || "",
                }));

                /*
                 * Files cannot be stored in sessionStorage.
                 *
                 * If the previous session was past Step 1,
                 * restart from Step 1 so the user can capture
                 * the camera images again.
                 */
                if (parsed.step > 1) {
                    setStep(1);
                }
            }
        } catch {
            // Corrupted or inaccessible storage.
            // Start fresh.
        } finally {
            setHydrated(true);
        }
    }, []);

    /*
     * Get userId, username, and platformName from URL
     *
     * Example:
     * http://localhost:3000/?userId=6&username=itdemo&platformName=Visit%20Europe
     */
    useEffect(() => {
        if (!hydrated) return;

        try {
            const params = new URLSearchParams(
                window.location.search
            );

            const userIdParam = params.get("userId");
            const usernameParam = params.get("username");
            const platformNameParam = params.get("platformName");

            const updates = {};

            if (userIdParam) {
                const userId = Number(userIdParam);

                /*
                 * Make sure userId is a valid positive integer.
                 */
                if (!Number.isInteger(userId) || userId <= 0) {
                    console.error(
                        "Invalid userId:",
                        userIdParam
                    );
                } else {
                    updates.userId = userId;
                }
            }

            if (usernameParam) {
                updates.username = usernameParam;
            }

            if (platformNameParam) {
                updates.platformName = platformNameParam;
            }

            if (Object.keys(updates).length > 0) {
                setKycData((prev) => ({
                    ...prev,
                    ...updates,
                }));
            }
        } catch {
            console.error(
                "Unable to read KYC params from URL."
            );
        }
    }, [hydrated]);

    /*
     * Persist KYC data that can safely be stored
     * in sessionStorage.
     *
     * Images are Files and therefore are NOT stored.
     */
    useEffect(() => {
        if (!hydrated) return;

        try {
            sessionStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    step,

                    userId:
                        kycData.userId,

                    username:
                        kycData.username,

                    platformName:
                        kycData.platformName,

                    fullName:
                        kycData.fullName,

                    idType:
                        kycData.idType,

                    idNumber:
                        kycData.idNumber,
                })
            );
        } catch {
            // Storage unavailable/full.
            // Not critical.
        }
    }, [
        step,
        kycData.userId,
        kycData.username,
        kycData.platformName,
        kycData.fullName,
        kycData.idType,
        kycData.idNumber,
        hydrated,
    ]);

    /*
     * Update KYC data
     */
    const updateKYC = (data) => {
        setKycData((prev) => ({
            ...prev,
            ...data,
        }));
    };

    /*
     * Go to next step
     */
    const nextStep = () => {
        setStep((prev) => prev + 1);
    };

    /*
     * Go to previous step
     */
    const previousStep = () => {
        setStep((prev) => Math.max(1, prev - 1));
    };

    /*
     * Clear all KYC progress
     */
    const clearProgress = () => {
        try {
            sessionStorage.removeItem(STORAGE_KEY);
        } catch {
            // Ignore storage errors.
        }

        setKycData(initialKYCData);
        setStep(1);
    };

    return (
        <KYCContext.Provider
            value={{
                step,
                setStep,
                nextStep,
                previousStep,
                kycData,
                updateKYC,
                clearProgress,
            }}
        >
            {children}
        </KYCContext.Provider>
    );
}

export function useKYC() {
    const context = useContext(KYCContext);

    if (!context) {
        throw new Error(
            "useKYC must be used inside KYCProvider"
        );
    }

    return context;
}