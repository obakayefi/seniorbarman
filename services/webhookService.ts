import axios from 'axios'

export function emitWebhook(type: string, data: any) {
    if (!process.env.WEBHOOK_SECRET || !process.env.WEBHOOK_URL) return

    // console.log({type, data: data})

    axios.post(
        process.env.WEBHOOK_URL,
        {
            type,
            timestamp: new Date().toISOString(),
            data
        },
        {
            headers: {
                'x-webhook-secret': process.env.WEBHOOK_SECRET
            }
        }
    ).catch(err => {
        console.error('Webhook failed', err.message)
    })
}