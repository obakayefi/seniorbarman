import api from "@/lib/axios";

export async function getUpcomingEvents(forScanner: boolean = false, eventType?: string) {
    try {
        const typeParam = eventType ? `&type=${eventType}` : '';
        return await api.get(`/events/?forScanner=${forScanner}${typeParam}`)
    } catch (error: any) {
        console.error(error)
    }
}

export async function fetchEventStats(id: string) {
    try {
        const { data } = await api.get(`/events/${id}/stats`);
        console.log({ data })
        return data
    } catch (e) {
        console.error(e)
    }
}