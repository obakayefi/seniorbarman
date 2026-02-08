import MatchTicket from "@/components/ui/match-ticket";

export default function RegularTicketView({ tickets }: { tickets: [] }) {
    return (
        <>
            {tickets.map((ticket: any, index) => (
                <MatchTicket key={ticket._id || index} ticket={ticket} />
            ))}
        </>
    )
}