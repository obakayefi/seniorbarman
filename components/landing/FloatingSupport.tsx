"use client";

import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";

export default function FloatingSupport() {
    const [open, setOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {/* Popup Card */}
            {open && (
                <div className="bg-zinc-900 border border-zinc-700 rounded-sm shadow-2xl p-5 w-64 animate-in slide-in-from-bottom-4 duration-200">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-white text-sm">Need help?</h4>
                        <button
                            onClick={() => setOpen(false)}
                            className="text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                        We're here to assist you with event bookings, tickets, and anything else.
                    </p>
                    <div className="flex flex-col gap-2">
                        <a
                            href="mailto:support@seniorbarman.com"
                            className="w-full text-center bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold uppercase tracking-wider py-2.5 rounded-sm transition-colors"
                        >
                            Email Support
                        </a>
                        <a
                            href="https://wa.me/?text=Hello,%20I%20need%20help%20with%20SeniorBarman"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full text-center bg-green-600 hover:bg-green-700 text-white text-xs font-extrabold uppercase tracking-wider py-2.5 rounded-sm transition-colors"
                        >
                            WhatsApp Us
                        </a>
                    </div>
                </div>
            )}

            {/* Trigger Button */}
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-sm shadow-lg shadow-orange-950/60 transition-all hover:scale-105 active:scale-95 font-extrabold text-xs uppercase tracking-wider"
                aria-label="Support"
            >
                <MessageCircle className="w-4 h-4" />
                <span>Support</span>
            </button>
        </div>
    );
}
