import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getUserFromCookie } from "@/lib/auth";
import crypto from "crypto";
import mongoose from "mongoose";

import { recordAuditLog } from "@/lib/audit";
import { HunchoRoleChecker } from "@/lib/helpers";
import { ROLES, ROLE_GROUPS } from "@/lib/roles";
import Event from "@/models/Event";
import { hasManagerAccessToTeams } from "@/services/teamService";

export async function POST(req: Request) {
    try {
        await connectDB();

        const user = await getUserFromCookie();
        const canAccessResource = user && ROLE_GROUPS.CAN_CREATE_EVENT.includes(user.role as any);

        if (!canAccessResource) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userId, eventId, stand, price, quantity, holderName } = await req.json();

        if (!userId || !eventId || !quantity || price === undefined) {
            return NextResponse.json(
                { error: "Missing required fields: userId, eventId, quantity, price" },
                { status: 400 }
            );
        }

        if (user.role === ROLES.TEAM_MANAGER) {
            const event = await Event.findById(eventId).lean() as any;
            if (!event) {
                return NextResponse.json({ error: "Event not found" }, { status: 404 });
            }
            const isOwner = event.createdBy?.toString() === user.id;
            const isManager = await hasManagerAccessToTeams(user.id, [event.homeTeam?.toString(), event.awayTeam?.toString()]);
            if (!isOwner && !isManager) {
                return NextResponse.json({ error: "Forbidden: You are not authorized for this event" }, { status: 403 });
            }
        }

        const numQuantity = Number(quantity);
        if (isNaN(numQuantity) || numQuantity <= 0 || numQuantity > 100) {
            return NextResponse.json(
                { error: "Quantity must be between 1 and 100" },
                { status: 400 }
            );
        }

        const batchId = crypto.randomUUID();
        const _createdTickets = [];

        for (let i = 0; i < numQuantity; i++) {
            const ticketId = new mongoose.Types.ObjectId();
            const checkInToken = crypto.randomBytes(16).toString("hex");
            const uniqueSuffix = crypto.randomBytes(4).toString("hex").toUpperCase();

            _createdTickets.push({
                _id: ticketId,
                checkInToken,
                event: eventId,
                createdBy: userId,
                stand: stand || "Regular",
                price: Number(price),
                ticketNumber: `${eventId.toString().slice(-4)}-${Date.now().toString().slice(-6)}-${uniqueSuffix}`,
                payment: {
                    status: "success",
                    reference: `ADMIN-GRANT-${batchId}`,
                    authorizationUrl: "N/A",
                },
                holderName: holderName || "Guest",
                batchId,
                isInside: false,
                isPrinted: false,
            });
        }

        await Ticket.insertMany(_createdTickets);

        // Record Audit Log
        await recordAuditLog({
            adminId: user!.id,
            action: "GRANT_TICKETS",
            targetType: "TICKET_BATCH",
            targetId: batchId,
            details: {
                recipientUserId: userId,
                eventId,
                quantity: numQuantity,
                stand,
                totalPrice: numQuantity * Number(price)
            }
        });

        return NextResponse.json({
            success: true,
            message: `Successfully granted ${numQuantity} ticket(s)`,
            tickets: _createdTickets,
            batchId,
        }, { status: 201 });

    } catch (error: any) {
        console.error("Admin ticket grant error:", error);
        return NextResponse.json(
            { error: "Failed to grant tickets: " + error.message },
            { status: 500 }
        );
    }
}
