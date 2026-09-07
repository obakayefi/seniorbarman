"use client";

import React, { useEffect, useState, useCallback } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function ConnectivityListener() {
    const [isOffline, setIsOffline] = useState(false);
    const [checking, setChecking] = useState(false);

    // Verify connectivity by fetching a static asset (favicon) with zero backend/DB load
    const verifyConnectivity = useCallback(async (): Promise<boolean> => {
        if (typeof window === "undefined") return true;

        if (!navigator.onLine) {
            return false;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            // HEAD request to static favicon.ico - served instantly by CDN/static server (0 DB/API cost)
            const res = await fetch(`/favicon.ico?_=${Date.now()}`, {
                method: "HEAD",
                cache: "no-store",
                signal: controller.signal,
            }).catch(() => null);

            clearTimeout(timeoutId);
            return Boolean(res && (res.ok || res.status < 500));
        } catch {
            return false;
        }
    }, []);

    const checkAndSetStatus = useCallback(async () => {
        const online = await verifyConnectivity();
        setIsOffline((prev) => {
            if (prev && online) {
                toast.success("Internet connection restored!", {
                    id: "online-status-toast",
                    duration: 4000,
                });
            } else if (!prev && !online) {
                toast.error("Internet connection lost.", {
                    id: "offline-status-toast",
                    duration: 5000,
                });
            }
            return !online;
        });
    }, [verifyConnectivity]);

    useEffect(() => {
        // Initial state check
        if (typeof window !== "undefined" && !navigator.onLine) {
            setIsOffline(true);
        }

        const handleOffline = () => {
            setIsOffline(true);
            toast.error("Internet connection lost.", {
                id: "offline-status-toast",
                duration: 5000,
            });
        };

        const handleOnline = () => {
            checkAndSetStatus();
        };

        const handleAppOffline = () => {
            setIsOffline(true);
        };

        // Instant check whenever user clicks ANYWHERE on the screen
        const handleClick = () => {
            if (typeof window !== "undefined" && !navigator.onLine) {
                setIsOffline(true);
            }
        };

        // Catch unhandled network fetch failures globally
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            if (event.reason && (
                event.reason.name === "TypeError" ||
                String(event.reason).includes("Failed to fetch") ||
                String(event.reason).includes("NetworkError")
            )) {
                if (!navigator.onLine) {
                    setIsOffline(true);
                }
            }
        };

        window.addEventListener("offline", handleOffline);
        window.addEventListener("online", handleOnline);
        window.addEventListener("app:offline", handleAppOffline);
        window.addEventListener("unhandledrejection", handleUnhandledRejection);
        document.addEventListener("click", handleClick, true);
        document.addEventListener("pointerdown", handleClick, true);

        return () => {
            window.removeEventListener("offline", handleOffline);
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("app:offline", handleAppOffline);
            window.removeEventListener("unhandledrejection", handleUnhandledRejection);
            document.removeEventListener("click", handleClick, true);
            document.removeEventListener("pointerdown", handleClick, true);
        };
    }, [checkAndSetStatus]);

    // Intercept window.fetch to trigger offline screen if fetch fails while offline
    useEffect(() => {
        if (typeof window === "undefined") return;

        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                return await originalFetch(...args);
            } catch (err) {
                if (!navigator.onLine) {
                    window.dispatchEvent(new Event("app:offline"));
                }
                throw err;
            }
        };

        return () => {
            window.fetch = originalFetch;
        };
    }, []);

    // ONLY poll for recovery when ALREADY offline (every 8s), zero polling when online
    useEffect(() => {
        if (!isOffline) return;

        const intervalId = setInterval(() => {
            checkAndSetStatus();
        }, 8000);

        return () => clearInterval(intervalId);
    }, [isOffline, checkAndSetStatus]);

    const handleRetry = async () => {
        setChecking(true);
        await checkAndSetStatus();
        setChecking(false);
    };

    if (!isOffline) return null;

    return (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-background/95 backdrop-blur-md transition-all duration-300">
            <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 shadow-2xl flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-inner">
                    <WifiOff className="w-10 h-10 animate-pulse" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-black tracking-tight text-foreground uppercase">
                        No Internet Connection
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        It looks like your device is currently offline. Please check your Wi-Fi or mobile network settings.
                    </p>
                </div>

                <div className="w-full pt-2 flex flex-col gap-3">
                    <button
                        onClick={handleRetry}
                        disabled={checking}
                        className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-md font-extrabold text-xs uppercase tracking-wider bg-orange-500 text-white hover:bg-orange-600 active:scale-95 transition-all shadow-md shadow-orange-950/30 disabled:opacity-50 cursor-pointer"
                    >
                        <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
                        {checking ? "Checking..." : "Retry Connection"}
                    </button>
                    <p className="text-[11px] text-muted-foreground font-medium">
                        This screen will automatically close once internet is restored.
                    </p>
                </div>
            </div>
        </div>
    );
}
