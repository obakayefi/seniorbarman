import { PageHeader } from "@/components/ui/page-header"
import TicketGenerator from "@/components/features/admin/TicketGenerator"
import TicketBatchManager from "@/components/features/admin/TicketBatchManager"

export default function PrintTicketsPage({ params }: { params: { id: string } }) {
    return (
        <div className="md:p-10 p-6 w-full space-y-10 min-h-screen bg-zinc-950">
            <div className="max-w-7xl mx-auto space-y-8">
                <PageHeader
                    title="Generate & Print Tickets"
                    description="Create new tickets for offline sales and download print-ready layouts."
                />

                <TicketGenerator eventId={params.id} />
                <TicketBatchManager eventId={params.id} />
            </div>
        </div>
    )
}
