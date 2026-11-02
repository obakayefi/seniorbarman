import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireRole } from '@/lib/requireRole';
import Event from '@/models/Event';
import PayoutRequest from '@/models/PayoutRequest';
import { getEventRevenue } from '@/lib/eventRevenue';
import mongoose from 'mongoose';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await requireRole(['organizer']);
    if (user instanceof NextResponse) return user;
    try {
        await connectDB();
        const { id } = await params;
        const event = await Event.findById(id).select('createdBy');
        if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        if (event.createdBy?.toString() !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        const requests = await PayoutRequest.find({ event: id, organizer: user.id }).sort({ createdAt: -1 }).select('-payoutDetails');
        return NextResponse.json({ success: true, requests });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Could not load payout requests' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await requireRole(['organizer']);
    if (user instanceof NextResponse) return user;
    try {
        await connectDB();
        const { id } = await params;
        const event = await Event.findById(id).populate('createdBy', 'firstName lastName email');
        if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        if (event.createdBy?._id?.toString() !== user.id && event.createdBy?.toString() !== user.id) {
            return NextResponse.json({ error: 'You can only request payouts for events you created' }, { status: 403 });
        }

        const { payoutDetails } = await req.json();
        if (typeof payoutDetails !== 'string' || payoutDetails.trim().length < 5 || payoutDetails.length > 2000) {
            return NextResponse.json({ error: 'Add valid payout/contact details (5–2000 characters)' }, { status: 400 });
        }

        const pending = await PayoutRequest.findOne({ event: id, organizer: user.id, status: 'pending' });
        if (pending) return NextResponse.json({ error: 'A payout request for this event is already being reviewed' }, { status: 409 });

        const financials = await getEventRevenue(id);
        const paid = await PayoutRequest.aggregate([
            { $match: { event: event._id, organizer: new mongoose.Types.ObjectId(user.id), status: 'paid' } },
            { $group: { _id: null, total: { $sum: '$requestedAmount' } } },
        ]);
        const outstanding = Math.max(0, financials.organizerShare - (paid[0]?.total || 0));
        if (outstanding <= 0) return NextResponse.json({ error: 'There is no outstanding payout balance for this event' }, { status: 409 });

        const request = await PayoutRequest.create({
            event: event._id,
            organizer: user.id,
            grossRevenueAtRequest: financials.grossRevenue,
            commissionAtRequest: financials.commission,
            requestedAmount: outstanding,
            payoutDetails: payoutDetails.trim(),
        });
        const organizer = event.createdBy as any;
        let emailSent = false;
        try {
            const { notifyAdminOfPayoutRequest } = await import('@/lib/notifications');
            emailSent = await notifyAdminOfPayoutRequest({
                organizerName: `${organizer.firstName || ''} ${organizer.lastName || ''}`.trim() || organizer.email,
                organizerEmail: organizer.email,
                eventTitle: event.title || 'Sports event',
                grossRevenue: financials.grossRevenue,
                commission: financials.commission,
                payoutAmount: outstanding,
                payoutDetails: payoutDetails.trim(),
            });
        } catch (error) {
            console.error('Payout request was saved, but its email notification could not be sent:', error);
        }
        return NextResponse.json({ success: true, request: { ...request.toObject(), payoutDetails: undefined }, emailSent }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Could not submit payout request' }, { status: 500 });
    }
}
