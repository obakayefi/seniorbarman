import api from "@/lib/axios";

export const OnPayNow = async (payload: {}, ticketsToPrint: any[], eventId: string) => {
    // setLoading(true)
    // try {
    const result = await api.post("/payment", payload, { withCredentials: true })
    // console.log({ result: result.data })
    const paymentUrl = result.data.redirectTo
    // console.log({ paymentUrl });
    const flattenedOrder = ticketsToPrint.filter(ticket => ticket.quantity > 0)
    const orderPayload = { tickets: flattenedOrder, eventId, reference: result.data.reference, isGenerated: false }
    const savedTicketOrder = await api.post('/ticket-order', orderPayload)
    // console.log({ orderPayload, response: savedTicketOrder })
    setTimeout(() => window.location.assign(paymentUrl), 1000)
}

export const OnFreeOrder = async (ticketsToPrint: any[], eventId: string) => {
    try {
        const flattenedOrder = ticketsToPrint.filter(ticket => ticket.quantity > 0)
        const reference = `FREE-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
        const orderPayload = { tickets: flattenedOrder, eventId, reference, isGenerated: false }

        // Create the ticket order first
        await api.post('/ticket-order', orderPayload)

        // Directly generate tickets using the existing POST /api/tickets endpoint
        // which seems to handle creation and insertion
        const ticketPayload = { ticketsToPurchase: flattenedOrder, eventId }
        await api.post('/tickets', ticketPayload)

        return { success: true, reference }
    } catch (error) {
        console.error("Error in OnFreeOrder:", error)
        throw error
    }
}

export const HunchoRoleChecker = (role?: string) => {
    if (!role) return false
    return role === 'dev' || role === 'admin'
}

export const OrganizerRoleChecker = (role?: string) => {
    if (!role) return false
    return role === 'organizer'
}

export const EventCreatorRoleChecker = (role?: string) => {
    if (!role) return false
    return role === 'dev' || role === 'admin' || role === 'organizer'
}