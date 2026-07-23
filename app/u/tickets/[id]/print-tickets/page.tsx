"use client";

import React, { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import Ticket from "@/app/u/tickets/Ticket";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { sitemap } from "@/lib/utils";
import { CalendarPlus } from "lucide-react";
import api from "@/lib/axios";
import JSZip from "jszip";

function chunkArray(arr: any[], size: number) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}

export default function PrintTicketsPage({ params }: { params: any }) {
    const router = useRouter();
    const _params: any = React.use(params);
    const ref = useRef(null);

    const [tickets, setTickets] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[][]>([]);
    const [currentBatch, setCurrentBatch] = useState(0);

    // Fetch tickets for this event
    useEffect(() => {
        async function loadTickets() {
            // console.log({ tickets })
            const { data } = await api.get(`/tickets/${_params.id}`)
            // console.log({ data, tickets: data.response.tickets })
            setTickets(data.response.tickets.tickets);
        }

        loadTickets();
    }, [_params.id]);

    // Prepare batches when tickets load
    useEffect(() => {
        if (tickets.length > 0) {
            const uniqueStands = Array.from(new Set(tickets.map((t: any) => t.stand || "Regular")));
            const grouped: { stand: string; tickets: any[] }[] = [];

            for (const stand of uniqueStands) {
                const standTickets = tickets.filter((t: any) => (t.stand || "Regular") === stand);
                const chunks = chunkArray(standTickets, 14);
                chunks.forEach(chunk => {
                    grouped.push({ stand, tickets: chunk });
                });
            }
            setBatches(grouped);
        }
    }, [tickets]);

    const downloadAllBatches = async () => {
        const zip = new JSZip();
        const standPageCounters: Record<string, number> = {};

        for (let i = 0; i < batches.length; i++) {
            setCurrentBatch(i);
            const batchObj = batches[i];
            const stand = batchObj?.stand || "Regular";
            standPageCounters[stand] = (standPageCounters[stand] || 0) + 1;

            // Wait for the DOM to finish rendering
            await new Promise(res => setTimeout(res, 300));

            if (!ref.current) continue;

            const dataUrl = await toPng(ref.current, { cacheBust: true })
            const blob = await (await fetch(dataUrl)).blob()

            const standFolder = zip.folder(stand);
            standFolder?.file(`tickets_batch_${standPageCounters[stand]}.png`, blob);
        }
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(zipBlob);
        link.download = "all_ticket_batches.zip";
        link.click();
    };

    let isAdmin = false;

    const currentTicketsToRender = Array.isArray(batches[currentBatch])
        ? batches[currentBatch]
        : batches[currentBatch]?.tickets || [];

    return (
        <div className='md:p-10 p-2 w-full'>
            <PageHeader title='Print Tickets'>
                <div className='flex items-center gap-1'>
                    {isAdmin ? (
                        <Button onClick={() => router.push(sitemap.admin.createEvent)} title='Create Event'
                            className='px-6 bg-orange-500 py-5 active:translate-x-2 duration-200'>
                            Create Event <CalendarPlus />
                        </Button>
                    ) : null}
                </div>
            </PageHeader>

            <div className={'py-4'}>
                <section className={'flex items-center gap-5'}>
                    <h3>Current Batch</h3>
                    <span>{currentBatch + 1}</span>
                </section>

                <section className={'flex items-center gap-5'}>
                    <h3>Group Batches</h3>
                    <span>{batches.length}</span>
                </section>

                <section className={'flex items-center gap-5'}>
                    <h3>Total Tickets</h3>
                    <span>{tickets.length.toLocaleString()}</span>
                </section>
            </div>

            <div className="">
                <button
                    onClick={downloadAllBatches}
                    className="bg-orange-600 text-white px-4 py-2 rounded"
                >
                    Download All PNG Tickets
                </button>

                <div ref={ref} className="grid grid-cols-7 grid-rows-2 gap-1 mb-4 mt-10 py-5 place-items-start">
                    {currentTicketsToRender.map((ticket: any) => (
                        <Ticket toPrint key={ticket._id} ticket={ticket} />
                    ))}
                </div>
            </div>
        </div>
    );
}
