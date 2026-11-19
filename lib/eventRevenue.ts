import Ticket from '@/models/Ticket';
import TicketOrder from '@/models/TicketOrder';
import EventApplication from '@/models/EventApplication';
import Event from '@/models/Event';

function ticketOrderTotal(tickets: any): number {
    if (!tickets) return 0;
    const items = Array.isArray(tickets)
        ? tickets
        : Object.entries(tickets).map(([name, value]: [string, any]) => typeof value === 'number'
            ? { name, quantity: value, price: 0 }
            : { name, ...value });
    return items.reduce((total: number, item: any) => {
        const quantity = Number(item.quantity ?? item.qty ?? 0);
        const price = Number(item.price ?? 0);
        return total + (Number.isFinite(quantity * price) ? quantity * price : 0);
    }, 0);
}

export async function getEventRevenue(eventId: string) {
    const [allOrders, applications, event] = await Promise.all([
        TicketOrder.find({ event: eventId }).select('tickets paymentStatus reference').lean(),
        EventApplication.find({ event: eventId, paymentStatus: 'paid' }).select('amountPaid').lean(),
        Event.findById(eventId).select('applicationFee').lean(),
    ]);

    const successfulOrders = allOrders.filter((order: any) => order.paymentStatus === 'success');
    const ticketRevenueFromOrders = successfulOrders.reduce((sum: number, order: any) => sum + ticketOrderTotal(order.tickets), 0);
    const orderReferences = new Set(allOrders.map((order: any) => order.reference).filter(Boolean));
    const directSales = await Ticket.find({
        event: eventId,
        generatedBy: 'online-sale',
        'payment.status': 'success',
    }).select('ticketType.price payment.reference').lean();
    const directSalesRevenue = directSales.reduce((sum: number, ticket: any) => {
        if (ticket.payment?.reference && orderReferences.has(ticket.payment.reference)) return sum;
        return sum + (Number(ticket.ticketType?.price) || 0);
    }, 0);
    const ticketRevenue = ticketRevenueFromOrders + directSalesRevenue;

    const legacyApplicationFee = Number((event as any)?.applicationFee) || 0;
    const applicationRevenue = applications.reduce((sum: number, application: any) => {
        const actualAmount = Number(application.amountPaid) || 0;
        return sum + (actualAmount > 0 ? actualAmount : legacyApplicationFee);
    }, 0);

    const grossRevenue = ticketRevenue + applicationRevenue;
    const commission = Math.round(grossRevenue * 0.2);
    return {
        ticketRevenue,
        applicationRevenue,
        grossRevenue,
        commission,
        organizerShare: grossRevenue - commission,
        commissionRate: 0.2,
    };
}
