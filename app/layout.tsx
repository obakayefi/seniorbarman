import type { Metadata } from "next";
import { Gabarito } from "next/font/google";
import "./globals.css";
import Footer from "@/components/ui/Footer";
import { Toaster } from "sonner";
import { AppProvider } from "@/context/AppContext";
import NativeNavbar from "@/components/ui/navbar";
import GlobalPageGuard from "@/components/ui/GlobalPageGuard";
import { CloudOff } from "lucide-react";

// Force rebuild to pick up new page routes and component changes
const gabaritoFonts = Gabarito({
    variable: "--font-gabarito",
    subsets: ["latin"]
})

import { connectDB } from "@/lib/mongodb";
import Setting from "@/models/Setting";

export async function generateMetadata(): Promise<Metadata> {
    let title = "Senior Barman";
    let description = "Learn about Enugu's top rated entertainment and hospitality expert";

    try {
        await connectDB();
        const settingsList = await Setting.find({
            key: { $in: ['global_seo_title', 'global_seo_description'] }
        }).lean();

        const settings: Record<string, string> = {};
        settingsList.forEach((s: any) => settings[s.key] = s.value);

        if (settings.global_seo_title) title = settings.global_seo_title;
        if (settings.global_seo_description) description = settings.global_seo_description;
    } catch (e) {
        console.error("Failed to load global SEO settings", e);
    }

    return {
        title,
        description,
    };
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const subscribed = process.env.SUBSCRIBED !== 'false';
    return (
        <html lang="en">
            <body
                className={`${gabaritoFonts.variable} antialiased`}
            >
                <GlobalPageGuard />
                {!subscribed ? (
                    <div className="flex flex-col min-h-screen bg-white dark:bg-[#202124] text-[#202124] dark:text-[#e8eaed] p-10 font-sans sm:px-16 pt-24 transition-colors">
                        <div className="max-w-[600px] w-full">
                            <div className="mb-6 text-[#5f6368] dark:text-[#9aa0a6]">
                                <CloudOff className="w-[72px] h-[72px]" strokeWidth={1.5} />
                            </div>
                            
                            <h1 className="text-2xl font-normal mb-4 text-[#202124] dark:text-[#e8eaed]">Hmmm... can't reach this page</h1>
                            
                            <p className="mb-4 text-[15px] leading-6 text-[#5f6368] dark:text-[#9aa0a6]">
                                It looks like <strong className="text-[#202124] dark:text-[#e8eaed] font-medium">seniorbarman.com</strong> closed the connection
                            </p>

                            <div className="mb-8 text-[15px] leading-6 text-[#5f6368] dark:text-[#9aa0a6]">
                                <p className="mb-2">Try:</p>
                                <ul className="list-disc pl-10 space-y-1 mb-6">
                                    <li>Checking the connection</li>
                                    <li>Checking the proxy and the firewall</li>
                                </ul>
                                
                                <div className="text-[12px] text-[#5f6368] dark:text-[#9aa0a6] mb-6 tracking-wide">
                                    ERR_CONNECTION_CLOSED
                                </div>
                                
                                <button className="bg-[#1a73e8] dark:bg-[#8ab4f8] hover:bg-[#1557b0] dark:hover:bg-[#9bbef9] text-white dark:text-[#202124] px-6 py-2 rounded-md font-medium text-sm transition-colors focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-[#202124] focus:ring-[#1a73e8] dark:focus:ring-[#8ab4f8] outline-none">
                                    Reload
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <AppProvider>
                            <NativeNavbar />
                            {children}
                        </AppProvider>
                        <Toaster />
                        <Footer />
                    </>
                )}
            </body>
        </html>
    );
}
