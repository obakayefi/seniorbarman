import TicketsPageView from "@/app/u/tickets/TicketView";
import {getUserFromCookie} from "@/lib/auth";
import {redirect} from "next/navigation";

const Tickets = async () => {
    const user = await getUserFromCookie()
    if (!user?.role) redirect('/auth/login')
    return (
        <TicketsPageView/>
    )
}

export default Tickets