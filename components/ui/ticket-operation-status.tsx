import {Spinner} from "@/components/ui/spinner";
import {TicketOperationType} from "@/app/u/a/scanner/page";

export const TicketOperationStatus = ({ticketOperation}: { ticketOperation: TicketOperationType }) => {
    return (
        <>
            {
                ticketOperation === 'check-in' ? (
                    <section className={'flex items-center gap-2'}>
                        <p className={'text-green-500'}>Checking user in</p>
                        <span><Spinner/></span>
                    </section>
                ) : ticketOperation === 'check-out' ? (
                    <section className={'flex items-center gap-2'}>
                        <p className={'text-rose-500'}>Checking user out</p>
                        <span><Spinner/></span>
                    </section>
                ) : null
            }
        </>
    )
}