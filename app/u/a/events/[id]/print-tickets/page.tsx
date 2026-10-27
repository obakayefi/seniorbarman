import { PageHeader } from "@/components/ui/page-header"
import TicketGenerator from "@/components/features/admin/TicketGenerator"
import TicketBatchManager from "@/components/features/admin/TicketBatchManager"

export default async function PrintTicketsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <div className="md:p-10 p-6 w-full space-y-10 min-h-screen bg-card text-foreground">
            <div className="max-w-7xl mx-auto space-y-8">
                <PageHeader
                    title="Generate & Print Tickets"
                    description="Create new tickets for offline sales and download print-ready layouts."
                />

                <TicketGenerator eventId={id} />
                <TicketBatchManager eventId={id} />
            </div>
        </div>
    )
}
