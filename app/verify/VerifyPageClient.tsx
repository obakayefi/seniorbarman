"use client";

import { useEffect, useState } from "react";
import { useSearchParams, redirect } from "next/navigation";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { CircleCheckBig, CircleX, Hourglass } from "lucide-react";
import NButton from "@/components/native/NButton";
import {sitemap} from "@/lib/utils";

type VerifyStatus = "loading" | "success" | "pending" | "failed";

export default function VerifyPageClient() {
    const searchParams = useSearchParams();
    const reference = searchParams.get("reference");

    const [status, setStatus] = useState<VerifyStatus>("loading");
    const [ticketGen, setTicketGen] = useState<
        "pending" | "generating" | "done" | "failed"
    >("pending");

    const [errorMsg, setErrorMsg] = useState("");
    const [ticket, setTicket] = useState<any>(null);

    useEffect(() => {
        if (!reference) {
            setStatus("failed");
            return;
        }

        const verify = async () => {
            try {
                const v = await fetch(`/api/payment/verify?reference=${reference}`).then(
                    (r) => r.json()
                );

                if (v.status !== "success") {
                    setStatus(v.status);
                    return;
                }

                setStatus("success");
                setTicket(v.ticket);

                setTicketGen("generating");

                const order = await fetch(
                    `/api/ticket-order?reference=${reference}`
                ).then((r) => r.json());

                if (order.error || !order.createdTickets) {
                    setErrorMsg(order.error || "Could not generate tickets");
                    setTicketGen("failed");
                    return;
                }

                setTicketGen("done");
            } catch (err: any) {
                setStatus("failed");
                setTicketGen("failed");
                setErrorMsg(err.message || "Unknown error");
            }
        };

        verify();
    }, [reference]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
            {status === "loading" && (
                <div>
                    <Spinner />
                    <h2 className="mt-4 font-semibold">Verifying your payment…</h2>
                </div>
            )}

            {status === "success" && (
                <div className="bg-white shadow-md rounded-lg p-6 max-w-md w-full">
                    <CircleCheckBig className="text-green-400 mx-auto" size={80} />

                    <h2 className="mt-4 text-2xl font-bold text-green-600">
                        Payment Successful
                    </h2>

                    <p className="mt-2 text-gray-600">
                        Your payment for{" "}
                        <strong>{ticket?.event?.name || "event"}</strong> is confirmed.
                    </p>

                    <div className="border-t mt-4 pt-4">
                        {ticketGen === "pending" || ticketGen === "generating" ? (
                            <div className="flex items-center gap-2 justify-center">
                                <h3>Generating your tickets…</h3>
                                <Spinner />
                            </div>
                        ) : ticketGen === "done" ? (
                            <div>
                                <p className="mb-2">
                                    Your tickets have been generated and emailed to you.
                                </p>
                                <NButton onClick={() => redirect(sitemap.user.tickets)}>
                                    Go to Tickets
                                </NButton>
                            </div>
                        ) : (
                            <div>
                                <p className="text-gray-500">
                                    We couldn’t generate your tickets.
                                </p>
                                <span className="text-sm text-red-400">{errorMsg}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {status === "pending" && (
                <div>
                    <Hourglass className="text-orange-500 mx-auto" size={80} />
                    <h2 className="mt-4 text-xl text-yellow-600">Payment Pending</h2>
                    <p className="mt-2 text-gray-600">
                        Waiting for confirmation from Paystack.
                    </p>
                </div>
            )}

            {status === "failed" && (
                <div>
                    <CircleX className="text-red-600 mx-auto" size={80} />
                    <h2 className="mt-4 text-xl text-red-600">Payment Failed</h2>
                    <p className="mt-2 text-gray-600">We couldn’t verify your payment.</p>
                    <Link
                        href="/"
                        className="mt-4 inline-block bg-red-600 text-white px-5 py-2 rounded-md"
                    >
                        Go Home
                    </Link>
                </div>
            )}
        </div>
    );
}
