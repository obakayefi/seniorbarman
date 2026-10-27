"use client"
import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useQRCode } from "next-qrcode";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { 
    MoveLeft, 
    Share2, 
    Download, 
    Check, 
    Copy, 
    Loader2, 
    AlertCircle, 
    CalendarDays, 
    MapPin, 
    Clock, 
    Ticket as TicketIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBaseUrl, formatEventTime, giveLogo } from "@/lib/utils";

import ComboDeckView from "../../ComboDeckView";

export default function ComboPackPage() {
    const params = useParams();
    const router = useRouter();
    const { id: eventId, comboGroupId } = params as { id: string; comboGroupId: string };

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ event: any; tickets: any[] } | null>(null);

    useEffect(() => {
        const fetchComboPack = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/tickets/combo/${comboGroupId}`);
                setData(res.data);
            } catch (err: any) {
                console.error("Failed to fetch combo pack:", err);
                toast.error(err.response?.data?.error || "Failed to load combo pack");
            } finally {
                setLoading(false);
            }
        };

        if (comboGroupId) {
            fetchComboPack();
        }
    }, [comboGroupId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Loading Combo Pack...</p>
            </div>
        );
    }

    if (!data || !data.tickets || data.tickets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-4">
                <AlertCircle className="w-12 h-12 text-muted-foreground" />
                <h2 className="text-xl font-black text-foreground">Combo Pack Not Found</h2>
                <p className="text-sm text-muted-foreground max-w-md">
                    This combo pack could not be located or you don't have permission to access it.
                </p>
                <Link href={`/u/tickets/${eventId}`}>
                    <Button variant="outline" className="border-border rounded-sm">
                        <MoveLeft size={14} className="mr-2" /> Back to My Tickets
                    </Button>
                </Link>
            </div>
        );
    }

    const { event, tickets } = data;
    const packTypeName = tickets[0]?.stand || tickets[0]?.ticketType?.name || "Combo Pass";
    const comboGroup = {
        groupId: comboGroupId,
        tickets,
        ticketType: packTypeName,
        price: tickets[0]?.price || 0,
        createdAt: tickets[0]?.createdAt
    };

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-8">
            {/* Top Navigation */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                <Link 
                    href={`/u/tickets/${eventId}`}
                    className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                    <MoveLeft size={16} /> Back to Event Tickets
                </Link>
            </div>

            {/* Integrated Combo Deck View */}
            <ComboDeckView
                comboGroup={comboGroup}
                eventInfo={event}
                packIndex={0}
                totalPacks={1}
            />
        </div>
    );
}
