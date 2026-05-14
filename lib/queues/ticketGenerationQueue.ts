import { Queue } from "bullmq";
import { redis } from '@/lib/redis'

export const ticketGenerationQueue = new Queue('ticket-generation', {
    connection:
    {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT || '6379'),
    }
})



