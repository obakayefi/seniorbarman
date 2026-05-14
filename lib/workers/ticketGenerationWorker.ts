import { Worker } from "bullmq";

export const ticketGenerationWorker = new Worker('ticket-generation', async (job) => {
    console.log({ worker: job.data })
}, {
    connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT || '6379'),
    }
})

ticketGenerationWorker.on('completed', (job) => {
    console.log({ completed: job.data })
})

ticketGenerationWorker.on('failed', (job, error) => {
    console.log({ failed: job?.data, error })
})