import api from "@/lib/axios";

export const OnPayNow = async (payload: {}, ticketsToPrint: any[], eventId: string) => {
    // setLoading(true)
    // try {
    const result = await api.post("/payment", payload, { withCredentials: true })
    console.log({ result: result.data })
    const paymentUrl = result.data.redirectTo
    console.log({ paymentUrl });
    const flattenedOrder = ticketsToPrint.filter(ticket => ticket.quantity > 0)
    const orderPayload = { tickets: flattenedOrder, eventId, reference: result.data.reference, isGenerated: false }
    const savedTicketOrder = await api.post('/ticket-order', orderPayload)
    console.log({ orderPayload, response: savedTicketOrder })
    setTimeout(() => window.location.assign(paymentUrl), 1000)
}