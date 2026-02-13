import { NextResponse } from "next/server";
import eventBus from "@/lib/eventbus";

export const dynamic = 'force-dynamic';

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        start(controller) {
            const listener = (data: any) => {
                controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
                );
            };

            eventBus.on(`event_update:${id}`, listener);

            // Send initial connection message
            controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "connected", eventId: id })}\n\n`)
            );

            // Cleanup on close
            req.signal.addEventListener("abort", () => {
                eventBus.off(`event_update:${id}`, listener);
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
