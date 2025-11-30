import React from 'react'
import DetailsPreview from "@/app/u/tickets/preview/DetailsPreview";

const TicketDetails = async ({params}: { params: { id: string } }) => {
    const _params = await params
    console.log({_params})
    return (
        <div className='p-10'>
            <DetailsPreview/>
        </div>
    )
}

export default TicketDetails