import MatchTicket from "@/components/ui/match-ticket";

export default function RegularTicketView({tickets}: {tickets: []}) {
    return (
        <>
            {tickets.map((ticket, index) => (
                <MatchTicket ticket={ticket}/>
            ))}
        </>
    )
}