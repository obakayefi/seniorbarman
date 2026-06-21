import type {Metadata} from "next";
import {Gabarito} from "next/font/google";
import "./globals.css";
import Footer from "@/components/ui/Footer";
import {Toaster} from "sonner";
import {AppProvider} from "@/context/AppContext";
import NativeNavbar from "@/components/ui/navbar";
import GlobalPageGuard from "@/components/ui/GlobalPageGuard";

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
    return (
        <html lang="en">
        <body
            className={`${gabaritoFonts.variable} antialiased`}
        >
        <GlobalPageGuard />
        <AppProvider>
            <NativeNavbar/>
            {children}
        </AppProvider>
        <Toaster/>
        <Footer/>
        </body>
        </html>
    );
}
