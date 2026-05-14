import {headers} from 'next/headers'
import { redis } from '@/lib/redis'

export async function POST(req: Request) {
    const body = await req.json()
    const headersList = await headers()

    console.log({ hooks_body: body })
    
    const secret = headersList.get('x-webhook-secret')

    if (secret !== process.env.WEBHOOK_SECRET) {
        return new Response('Unauthorized', {status: 401})
    }

    // Attempt to parse out eventId, you'll need this from the webhook payload!
    const eventId = body.eventId || body.data?.eventId || "unknown_event_id"

    switch (body.type) {
        case "ticket.check_in":
            console.log("Checking in", body)
            
            // Format a payload specifically for the dashboard stream
            const checkInPayload = {
                type: "new_scan",
                eventId: eventId,
                scan: {
                    time: new Date().toLocaleTimeString(),
                    userName: body.data?.user?.firstName || body.user?.name || "Scanned User",
                    stand: body.data?.ticket?.stand || body.ticket?.stand || "General",
                    status: "IN",
                    success: true
                },
                // Include eventTicketStats here if your webhook sends them!
                // eventTicketStats: body.data?.eventTicketStats 
            }

            // Publish to Redis
            if (eventId !== "unknown_event_id") {
                await redis.publish(`event_update:${eventId}`, JSON.stringify(checkInPayload))
            }
            break;
            
        case "ticket.check_out":
            console.log("Checking out", body)
            
            const checkOutPayload = {
                type: "new_scan",
                eventId: eventId,
                scan: {
                    time: new Date().toLocaleTimeString(),
                    userName: body.data?.user?.firstName || body.user?.name || "Scanned User",
                    stand: body.data?.ticket?.stand || body.ticket?.stand || "General",
                    status: "OUT",
                    success: true
                }
            }

            // Publish to Redis
            if (eventId !== "unknown_event_id") {
                await redis.publish(`event_update:${eventId}`, JSON.stringify(checkOutPayload))
            }
            break
            
        default:
            console.log('Unknown type', body)
            break
    }

    return Response.json({received: true})
}