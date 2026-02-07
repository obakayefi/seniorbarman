"use client";
import NButton from "@/components/native/NButton";
import { useRouter } from "next/navigation";

export default function BulkTicketView({ tickets, id }: { tickets: any[], id: string }) {
    const router = useRouter();
    return (
        <div>
            {/*<NButton className={'bg-orange-500'}>Bulk Print</NButton>*/}
            <NButton onClick={() => router.push(`/u/tickets/${id}/print-tickets`)} className={'bg-orange-500'}>Bulk Print Page</NButton>

        </div>
    )
}