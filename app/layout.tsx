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

export const metadata: Metadata = {
    title: "Senior Barman",
    description: "Learn about Enugu's top rated entertainment and hospitality expert",
};

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
