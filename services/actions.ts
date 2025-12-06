import api from "@/lib/axios";

export async function getUpcomingEvents() {
    try {
        return await api.get('/events?upcoming=true/')
    } catch (error: any) {
        console.error(error)
    }
}

export async function fetchEventStats(id: string) {
    try {
        const {data} = await api.get(`/events/${id}/stats`);
        console.log({data})
        return data
    } catch (e) {
        console.error(e)
    }
}