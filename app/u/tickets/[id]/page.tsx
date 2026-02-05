import React from 'react'
import DetailsPreview from "@/app/u/tickets/preview/DetailsPreview";
import TicketView from "@/app/u/tickets/TicketView";
import TicketDetailView from "./TicketDetailView";

const TicketDetails = async ({ params }: { params: { id: string } }) => {
    const _params = await params

    return (
        <div className='p-10'>
            <TicketDetailView />
        </div>
    )
}

export default TicketDetails