import {NextResponse} from 'next/server'
import { sendTestWebhook } from '@/lib/sendTestWebhook'

export async function POST() {
    await sendTestWebhook()
    return NextResponse.json({ message: "Webhook sent" })
}