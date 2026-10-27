"use client";

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Wallet } from 'lucide-react';
import { format } from 'date-fns';

export default function PayoutRequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [notes, setNotes] = useState<Record<string, string>>({});

    const load = async () => {
        try {
            const response = await api.get('/admin/payout-requests');
            setRequests(response.data.requests || []);
        } catch {
            toast.error('Could not load payout requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const updateStatus = async (id: string, status: 'paid' | 'declined') => {
        setBusyId(id);
        try {
            await api.patch(`/admin/payout-requests/${id}`, { status, adminNote: notes[id] || '' });
            toast.success(status === 'paid' ? 'Payout marked as paid' : 'Request declined');
            await load();
        } catch (error: any) {
            toast.error(error?.response?.data?.error || 'Could not update request');
        } finally {
            setBusyId(null);
        }
    };

    return (
        <main className="mx-auto min-h-screen max-w-5xl space-y-6 p-4 pb-20 sm:p-6 md:p-10">
            <PageHeader title="Organizer Payout Requests" description="Review payout requests calculated from successful event payments." />
            {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-orange-500" /></div> : requests.length === 0 ? (
                <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">No payout requests yet.</CardContent></Card>
            ) : requests.map((request) => {
                const event = request.event || {};
                const organizer = request.organizer || {};
                return <Card key={request._id} className="rounded-sm">
                    <CardContent className="space-y-4 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div><p className="font-bold">{event.title || 'Sports event'}</p><p className="text-sm text-muted-foreground">{organizer.firstName} {organizer.lastName} · {organizer.email}</p><p className="text-xs text-muted-foreground">Submitted {format(new Date(request.createdAt), 'MMM d, yyyy h:mm a')}</p></div>
                            <span className="rounded-full border px-3 py-1 text-xs capitalize">{request.status}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                            <div><p className="text-muted-foreground">Gross at request</p><p className="font-semibold">₦{Number(request.grossRevenueAtRequest).toLocaleString('en-NG')}</p></div>
                            <div><p className="text-muted-foreground">20% commission</p><p className="font-semibold">₦{Number(request.commissionAtRequest).toLocaleString('en-NG')}</p></div>
                            <div><p className="text-muted-foreground">Requested payout</p><p className="font-semibold">₦{Number(request.requestedAmount).toLocaleString('en-NG')}</p></div>
                            <div><p className="text-muted-foreground">Status</p><p className="font-semibold capitalize">{request.status}</p></div>
                        </div>
                        <div className="rounded-sm bg-muted/50 p-3"><p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider"><Wallet size={14} /> Payout details</p><p className="whitespace-pre-wrap text-sm">{request.payoutDetails}</p></div>
                        {request.adminNote && <p className="text-sm text-muted-foreground">Admin note: {request.adminNote}</p>}
                        {request.status === 'pending' && <div className="space-y-2"><textarea value={notes[request._id] || ''} onChange={(event) => setNotes((current) => ({ ...current, [request._id]: event.target.value }))} maxLength={1000} rows={2} placeholder="Optional note for the organizer" className="w-full rounded-sm border border-border bg-background p-3 text-sm" /><div className="flex gap-2"><Button disabled={busyId === request._id} onClick={() => updateStatus(request._id, 'paid')} className="bg-emerald-600 text-white hover:bg-emerald-700">Mark paid</Button><Button disabled={busyId === request._id} onClick={() => updateStatus(request._id, 'declined')} variant="outline">Decline</Button></div></div>}
                    </CardContent>
                </Card>;
            })}
        </main>
    );
}
