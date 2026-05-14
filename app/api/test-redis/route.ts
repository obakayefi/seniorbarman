import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Test 1: Basic Ping / Key Setup
        await redis.set('connection_test', 'Upstash Redis is fully operational!');
        const testValue = await redis.get('connection_test');

        // Test 2: The SSE Pub/Sub Stream
        // We will simulate a ticket scan for an event ID named "test-123"
        const payload = {
            type: "new_scan",
            eventId: "test-123",
            scan: {
               time: new Date().toLocaleTimeString(),
               userName: "Redis Test Agent 🤖",
               stand: "Server Room",
               status: "IN",
               success: true
            }
        };

        // Publish to "test-123"
        const clientsReceived = await redis.publish(`event_update:test-123`, JSON.stringify(payload));

        return NextResponse.json({
            status: "SUCCESS",
            message: "Redis connection is 100% working!",
            testValue: testValue,
            pubSubDelivery: {
                message: `The test scan payload was successfully published to Redis.`,
                listeningBrowsersHandedOffTo: clientsReceived 
            }
        });
    } catch (error: any) {
        console.error("Redis Connection Test Failed:", error);
        return NextResponse.json({ 
            status: "FAILED", 
            error: error.message 
        }, { status: 500 });
    }
}
