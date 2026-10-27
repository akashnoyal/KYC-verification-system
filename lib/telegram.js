const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
    throw new Error(
        "Telegram environment variables are missing."
    );
}

const BASE_URL =
    `https://api.telegram.org/bot${BOT_TOKEN}`;

export async function sendTelegramMediaGroup({
    userId,
    username,
    platformName,
    fullName,
    idType,
    idNumber,
    selfieUrl,
    idFrontUrl,
    idBackUrl,
}) {

    const infoText =
        `🆕 New KYC Submission

User ID: ${userId}
Username: ${username || "N/A"}
Platform: ${platformName}

ID Name: ${fullName}

ID Type: ${idType}

ID Number: ${idNumber}

📸 Selfie
🪪 ID Front
🪪 ID Back`;

    const media = [
        {
            type: "photo",
            media: selfieUrl,
        },

        {
            type: "photo",
            media: idFrontUrl,
        },

        {
            type: "photo",
            media: idBackUrl,

            // Caption on the LAST item — Telegram renders it
            // below that photo, which appears below the whole
            // stacked album.
            caption: infoText,
        },
    ];

    const response = await fetch(
        `${BASE_URL}/sendMediaGroup`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body: JSON.stringify({
                chat_id: CHAT_ID,
                media,
            }),
        }
    );

    const data =
        await response.json();

    console.log(
        "Telegram Response:",
        data
    );

    if (!data.ok) {
        throw new Error(
            data.description ||
            "Telegram failed"
        );
    }

    return data;
}