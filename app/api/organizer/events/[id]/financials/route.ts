import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { requireRole } from '@/lib/requireRole';
import Event from '@/models/Event';
import PayoutRequest from '@/models/PayoutRequest';
import { getEventRevenue } from '@/lib/eventRevenue';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await requireRole(['organizer']);
    if (user instanceof NextResponse) return user;
    try {
        await connectDB();
        const { id } = await params;
        const event = await Event.findById(id).select('createdBy');
        if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        if (event.createdBy?.toString() !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        const financials = await getEventRevenue(id);
        const [paidOutRows, pendingPayoutRequest] = await Promise.all([
            PayoutRequest.aggregate([
                { $match: { event: event._id, organizer: new mongoose.Types.ObjectId(user.id), status: 'paid' } },
                { $group: { _id: null, total: { $sum: '$requestedAmount' } } },
            ]),
            PayoutRequest.findOne({ event: event._id, organizer: user.id, status: 'pending' }).select('_id requestedAmount createdAt'),
        ]);
        const paidOut = paidOutRows[0]?.total || 0;
        return NextResponse.json({
            success: true,
            financials: { ...financials, paidOut, outstanding: Math.max(0, financials.organizerShare - paidOut), pendingPayoutRequest },
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Could not load event financials' }, { status: 500 });
    }
}
