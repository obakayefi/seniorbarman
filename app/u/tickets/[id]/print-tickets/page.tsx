"use client";

import React, {useEffect, useRef, useState} from "react";
import {toPng} from "html-to-image";
import Ticket from "@/app/u/tickets/Ticket";
import {PageHeader} from "@/components/ui/page-header";
import {Button} from "@/components/ui/button";
import {redirect} from "next/navigation";
import {sitemap} from "@/lib/utils";
import {CalendarPlus} from "lucide-react";
import api from "@/lib/axios";
import JSZip from "jszip";

function chunkArray(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}

export default function PrintTicketsPage({params}) {
    const _params = React.use(params);
    const ref = useRef(null);

    const [tickets, setTickets] = useState([]);
    const [batches, setBatches] = useState([]);
    const [currentBatch, setCurrentBatch] = useState(0);

    // Fetch tickets for this event
    useEffect(() => {
        async function loadTickets() {
            console.log({_params})
            const {data} = await api.get(`/tickets/${_params.id}`)
            console.log({data, tickets: data.response.tickets})
            setTickets(data.response.tickets.tickets);
        }

        loadTickets();
    }, [_params.id]);

    // Prepare batches when tickets load
    useEffect(() => {
        console.log('Preparing Batches', tickets.length);
        if (tickets.length > 0) {
            console.log('Tickets Gotten', tickets.length)
            const grouped = chunkArray(tickets, 14);
            console.log({grouped})
            setBatches(grouped);
        }
    }, [tickets]);

    const downloadAllBatches = async () => {
        const zip = new JSZip();

        for (let i = 0; i < batches.length; i++) {
            setCurrentBatch(i);

            // Wait for the DOM to finish rendering
            await new Promise(res => setTimeout(res, 300));

            if (!ref.current) continue;

            const dataUrl = await toPng(ref.current, {cacheBust: true})

            const blob = await (await fetch(dataUrl)).blob()

            zip.file(`tickets_batch_${i + 1}.png`, blob);
        }
        const zipBlob = await zip.generateAsync({type: "blob"});
        const link = document.createElement("a");
        link.href = URL.createObjectURL(zipBlob);
        link.download = "all_ticket_batches.zip";
        link.click();
        // const dataUrl = await toPng(ref.current, {cacheBust: true});
        // const link = document.createElement("a");
        // link.download = `tickets_batch_${i + 1}.png`;
        // link.href = dataUrl;
        // link.click();
    };

    let isAdmin = false;

    return (
        <div className='md:p-10 p-2 w-full'>
            <PageHeader title='Print Tickets'>
                <div className='flex items-center gap-1'>
                    {isAdmin ? (
                        <Button onClick={() => redirect(sitemap.admin.createEvent)} title='Create Event'
                                className='px-6 bg-orange-500 py-5 active:translate-x-2 duration-200'>
                            Create Event <CalendarPlus/>
                        </Button>
                    ) : null}
                </div>
            </PageHeader>

            <div className={'py-4'}>
                <section className={'flex items-center gap-5'}>
                    <h3>Current Batch</h3>
                    <span>{currentBatch}</span>
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
                    {batches[currentBatch]?.map((ticket: any) => (
                        <Ticket toPrint key={ticket._id} ticket={ticket}/>
                    ))}
                </div>
            </div>
        </div>
    );
}
