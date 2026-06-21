# SeniorBarman

**SeniorBarman** is a modern, full-stack event management and ticketing platform designed to simplify the creation, management, and distribution of event tickets. It features robust payment processing, real-time QR code generation and scanning for ticket validation, and automated email communications for attendees.

## 🌟 Key Features

- **Event Discovery & Management**: Create events, manage capacities, and track ticket sales.
- **Secure Ticketing**: Auto-generated QR codes for each ticket.
- **On-site Validation**: Built-in QR scanner to validate tickets at the door.
- **Seamless Payments**: Integrated with Paystack for secure online transactions in multiple environments (Test/Production).
- **Automated Emails**: Order confirmations, tickets, and reminders sent reliably.
- **Performance & Observability**: High performance with caching, background jobs, and complete error tracking/telemetry.

## 💻 Tech Stack

SeniorBarman is built with modern, scalable web technologies:

### Framework & UI
- **[Next.js](https://nextjs.org/)** (v16) - React framework for server-rendered UI and API routes.
- **[React](https://react.dev/)** (v19) - Component-based user interfaces.
- **[Tailwind CSS](https://tailwindcss.com/)** (v4) - Utility-first styling.
- **[HeroUI](https://heroui.com/) & [Radix UI](https://www.radix-ui.com/)** - Accessible and customizable UI components.
- **[Framer Motion](https://www.framer.com/motion/)** - Fluid animations and transitions.

### Data & State Management
- **[MongoDB](https://www.mongodb.com/)** (via Mongoose) - Primary NoSQL database for events, users, and ticket records.
- **[Upstash Redis](https://upstash.com/)** - Serverless Redis for caching, rate-limiting, and managing queues.
- **[TanStack Query & Form](https://tanstack.com/)** - Advanced state management and robust form handling with **[Zod](https://zod.dev/)** validation.

### Integrations & Background Processing
- **[Paystack](https://paystack.com/)** - Payment gateway integration for handling ticket purchases.
- **[Resend](https://resend.com/) & [React Email](https://react.email/)** - Reliable and beautifully designed email delivery.
- **[Cloudinary](https://cloudinary.com/)** - Cloud-based image and media asset management.
- **[BullMQ](https://docs.bullmq.io/)** - Reliable background job processing (e.g., sending emails asynchronously).

### Utilities & Observability
- **QR Codes**: `react-qr-scanner`, `qrcode`, and `html5-qrcode` for ticket generation and check-in.
- **Observability**: **[Sentry](https://sentry.io/)** for error tracking, and **[OpenTelemetry](https://opentelemetry.io/)** for tracing and monitoring.
- **Security**: JWT for authentication and `bcryptjs` for password hashing.

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- MongoDB connection string
- Paystack Account (Test & Live keys)
- Resend API key
- Cloudinary credentials
- Upstash Redis credentials

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd seniorbarman
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Duplicate `.env.example` to `.env.local` and fill in your keys:
   ```bash
   cp .env.example .env.local
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the App:**
   Visit [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](#) if you want to contribute.

## 📄 License
This project is proprietary and confidential.
