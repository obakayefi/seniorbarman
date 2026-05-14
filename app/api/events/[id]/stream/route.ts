import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const dynamic = 'force-dynamic';

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            // Create a dedicated Redis subscriber connection for this stream
            const subscriber = redis.duplicate();
            
            // Prevent Upstash idle connection drops from crashing the Node process
            subscriber.on('error', (err) => {
                console.error('[Redis Subscriber Error]', err.message);
            });
            
            // Connect and subscribe to the specific event's channel
            await subscriber.subscribe(`event_update:${id}`);

            subscriber.on("message", (channel, message) => {
                if (channel === `event_update:${id}`) {
                    // message is already a JSON string broadcasted by the webhook
                    controller.enqueue(
                        encoder.encode(`data: ${message}\n\n`)
                    );
                }
            });

            // Send initial connection message
            controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "connected", eventId: id })}\n\n`)
            );

            // Cleanup on close
            req.signal.addEventListener("abort", () => {
                subscriber.unsubscribe(`event_update:${id}`);
                subscriber.quit();
                controller.close();
            });
        },
    });

    return new NextResponse(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}
