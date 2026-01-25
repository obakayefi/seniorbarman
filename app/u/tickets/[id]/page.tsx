import React from 'react'
import DetailsPreview from "@/app/u/tickets/preview/DetailsPreview";
import TicketView from "@/app/u/tickets/TicketView";
import TicketCard from "@/app/u/tickets/[id]/ticket-card";

const TicketDetails = async ({params}: { params: { id: string } }) => {
    const _params = await params
    
    return (
        <div className='p-10'>
            <TicketCard/>
        </div>
    )
}

export default TicketDetails