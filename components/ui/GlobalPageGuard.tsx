"use client"
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import api from '@/lib/axios';

export default function GlobalPageGuard() {
    const pathname = usePathname();
    const [offline, setOffline] = useState(false);

    useEffect(() => {
        // Evaluate the active route against the massive configuration database
        const checkVisibility = async () => {
            try {
                const res = await api.get('/settings');
                if (res.data?.success) {
                    const settings = res.data.settings;
                    // If a specific URL (like '/tickets') has been dynamically killed by the admin
                    if (settings[`page_active_${pathname}`] === false) {
                        setOffline(true);
                    } else {
                        setOffline(false);
                    }
                }
            } catch (e) {
                console.error("Global hook failed to fetch configuration matrix", e);
            }
        };
        checkVisibility();
    }, [pathname]);

    // If perfectly safe, vanish seamlessly without affecting the layout
    if (!offline) return null;

    // Trigger universal full-screen architectural shield intercepting visibility
    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-3xl px-4 animate-in fade-in duration-300">
            <div className="relative z-20 flex flex-col items-center justify-center p-10 sm:p-16 rounded-[3rem] bg-zinc-900/40 border border-red-500/20 shadow-[0_0_80px_-20px_rgba(220,38,38,0.4)] max-w-2xl w-full">
                <div className="p-6 rounded-full bg-red-500/10 border border-red-500/30 mb-8 shadow-[inset_0_4px_20px_rgba(220,38,38,0.1)] animate-pulse">
                    <ShieldAlert size={64} className="text-red-500" />
                </div>
                <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tighter mb-4 text-center uppercase">
                    System Offline
                </h3>
                <p className="text-zinc-400 font-medium text-center leading-relaxed max-w-md mx-auto text-sm sm:text-base">
                    This page is currently offline. Please check back shortly!
                </p>
            </div>
        </div>
    );
}
