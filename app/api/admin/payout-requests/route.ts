import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireRole } from '@/lib/requireRole';
import PayoutRequest from '@/models/PayoutRequest';

export async function GET() {
    const user = await requireRole(['admin', 'dev']);
    if (user instanceof NextResponse) return user;
    try {
        await connectDB();
        const requests = await PayoutRequest.find().populate('event', 'title type date').populate('organizer', 'firstName lastName email').sort({ createdAt: -1 }).lean();
        return NextResponse.json({ success: true, requests });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Could not load payout requests' }, { status: 500 });
    }
}
