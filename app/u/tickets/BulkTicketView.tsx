import NButton from "@/components/native/NButton";
import {redirect} from "next/navigation";

export default function BulkTicketView ({tickets, id}: {tickets: any[], id: string}) {
    return (
        <div>
            {/*<NButton className={'bg-orange-500'}>Bulk Print</NButton>*/}
            <NButton onClick={() => redirect(`/u/tickets/${id}/print-tickets`)} className={'bg-orange-500'}>Bulk Print Page</NButton>
            
        </div>
    )
}