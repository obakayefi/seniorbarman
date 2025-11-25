import api from "@/lib/axios";

export async function getUpcomingEvents() {
    try {
        return await api.get('/events?upcoming=true/')
    } catch (error: any) {
        console.error(error)
    }
}