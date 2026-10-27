import connectDB from "@/lib/mongodb";
import KYC from "@/models/KYC";
import { User } from "@/models/User";
import { uploadImage } from "@/lib/uploadImage";
import { sendTelegramMediaGroup } from "@/lib/telegram";

const MAX_SIZE = 5 * 1024 * 1024;

function validateImage(file) {
    return (
        file instanceof File &&
        file.size <= MAX_SIZE &&
        file.type.startsWith("image/")
    );
}

export async function POST(request) {

    try {

        await connectDB();

        const formData = await request.formData();

        const platformName = formData.get("platformName");
        const fullName = formData.get("fullName");
        const idType = formData.get("idType");
        const idNumber = formData.get("idNumber");
        const userId = formData.get("userId");
        const username = formData.get("username");

        const selfie = formData.get("selfie");
        const idFront = formData.get("idFront");
        const idBack = formData.get("idBack");

        if (
            !platformName ||
            !fullName ||
            !idType ||
            !idNumber ||
            !userId ||
            !validateImage(selfie) ||
            !validateImage(idFront) ||
            !validateImage(idBack)
        ) {
            return Response.json(
                {
                    success: false,
                    message: "Invalid or missing data."
                },
                {
                    status: 400
                }
            );
        }

        // Confirm the user actually exists before accepting the submission
        const user = await User.findOne({ id: Number(userId) });

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found."
                },
                {
                    status: 404
                }
            );
        }

        /*
            Upload Images
        */

        const selfieUrl = await uploadImage(selfie);
        const idFrontUrl = await uploadImage(idFront);
        const idBackUrl = await uploadImage(idBack);

        /*
            Save Database
        */

        const record = await KYC.create({
            userId: Number(userId),
            username,
            platformName,
            fullName,
            idType,
            idNumber,
            selfieUrl,
            idFrontUrl,
            idBackUrl,
        });

        /*
            Update user's KYC status
        */

        await User.updateOne(
            { id: Number(userId) },
            { $set: { kyc_status: "pending" } }
        );

        /*
            Send Telegram
        */

        try {

            await sendTelegramMediaGroup({
                userId: Number(userId),
                username,
                platformName,
                fullName,
                idType,
                idNumber,
                selfieUrl,
                idFrontUrl,
                idBackUrl,
            });

            console.log("Telegram sent successfully");

        }
        catch (error) {
            console.error("Telegram Error:", error);
        }

        return Response.json({
            success: true,
            id: record._id,
        });

    }
    catch (error) {

        console.error("Submit Error:", error);

        return Response.json(
            {
                success: false,
                message: error.message
            },
            {
                status: 500
            }
        );

    }

}