import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireRole } from '@/lib/requireRole';
import PayoutRequest from '@/models/PayoutRequest';
import { recordAuditLog } from '@/lib/audit';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await requireRole(['admin', 'dev']);
    if (user instanceof NextResponse) return user;
    try {
        await connectDB();
        const { id } = await params;
        const { status, adminNote } = await req.json();
        if (!['paid', 'declined'].includes(status)) {
            return NextResponse.json({ error: "Status must be 'paid' or 'declined'" }, { status: 400 });
        }
        const request = await PayoutRequest.findOneAndUpdate(
            { _id: id, status: 'pending' },
            { $set: { status, adminNote: typeof adminNote === 'string' ? adminNote.trim().slice(0, 1000) : '', processedBy: user.id, processedAt: new Date() } },
            { new: true }
        );
        if (!request) return NextResponse.json({ error: 'Pending payout request not found' }, { status: 404 });
        await recordAuditLog({
            actorId: user.id,
            actorRole: user.role,
            action: status === 'paid' ? 'MARK_PAYOUT_PAID' : 'DECLINE_PAYOUT_REQUEST',
            targetType: 'PAYOUT_REQUEST',
            targetId: id,
            details: { eventId: String(request.event), organizerId: String(request.organizer), requestedAmount: request.requestedAmount, adminNote },
            req,
        });
        return NextResponse.json({ success: true, request });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Could not update payout request' }, { status: 500 });
    }
}
