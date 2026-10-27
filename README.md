# KYC Verification System

A secure, multi-step Know Your Customer (KYC) identity verification web application built with Next.js. Users complete identity verification through a 3-step guided flow with live camera capture, and submissions are automatically routed to both a database and Telegram for review.

## Features

- **3-Step Verification Flow**
  1. **Personal Details** — Platform name, full legal name, ID type, and ID number, with per-ID-type format validation
  2. **Live Selfie** — Camera-only capture (no gallery upload) for liveness verification, with automatic brightness checks
  3. **ID Document Capture** — Live front and back capture of the ID card, with duplicate-frame detection and file size validation

- **Dual Delivery** — Every submission is stored in MongoDB and automatically forwarded to Telegram
- **Client + Server Validation** — Format and length checks run on both the frontend and the API route, so the endpoint never trusts client input alone
- **Resilient Submission** — Bounded retry on Telegram delivery, duplicate-submission guarding, and orphaned-upload tracking on partial failures
- **Polished UX** — Animated step transitions, toast notifications, and micro-interactions throughout (Framer Motion + Sonner)
- **Multi-language Ready** — Built with i18n support in mind, default language English

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion (`motion`)
- **Notifications:** Sonner
- **Camera:** react-webcam
- **Database:** MongoDB
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB connection string
- A Telegram bot token + chat ID for notifications

### Installation

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
MONGODB_URI=your_mongodb_connection_string
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

├── app/
│ ├── api/submit/route.js # Submission endpoint (validation, upload, DB, Telegram)
│ ├── success/page.js # Post-submission confirmation page
│ ├── layout.js
│ └── page.js
├── components/
│ ├── landing/
│ │ ├── Navbar.jsx
│ │ └── Hero.jsx
│ └── kyc/
│ ├── KYCFlow.jsx
│ ├── ProgressBar.jsx
│ ├── Step1.jsx # Personal details
│ ├── Step2.jsx # Live selfie
│ └── Step3.jsx # ID front/back capture
├── context/
│ └── KYCContext.js
└── lib/
├── mongodb.js
├── uploadImage.js
└── telegram.js
git init        
## Security Notes

- ID capture is camera-only — gallery uploads are explicitly disabled to enforce liveness
- Server-side validation mirrors all client-side rules and never trusts client-submitted data
- Image uploads are restricted to `image/jpeg`, `image/png`, and `image/webp` (no SVG, to avoid embedded-script risks)
- Detailed error internals are logged server-side only; API responses to the client stay generic

## License

Add your license here.