import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TicketOrder from "@/models/TicketOrder";
import Event from "@/models/Event";
import Team from "@/models/Team";
import { getUserFromCookie } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { hasManagerAccessToTeams } from "@/services/teamService";
import { populateTeamsForEvents } from "@/lib/populateEventTeams";

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await connectDB();
        Team.init();
        Event.init();

        const user = await getUserFromCookie();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const event = await Event.findById(id).lean();
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Check permissions for organizer and team_manager
        if (user.role === ROLES.ORGANIZER && event.createdBy?.toString() !== user.id) {
            return NextResponse.json(
                { error: "Forbidden: You can only view orders for events you created" },
                { status: 403 }
            );
        }

        if (user.role === ROLES.TEAM_MANAGER) {
            const isCreator = event.createdBy?.toString() === user.id;
            const isManagerOfTeams = await hasManagerAccessToTeams(user.id, [
                event.homeTeam?.toString(),
                event.awayTeam?.toString()
            ]);
            if (!isCreator && !isManagerOfTeams) {
                return NextResponse.json(
                    { error: "Forbidden: You can only view orders for your managed teams" },
                    { status: 403 }
                );
            }
        }

        await populateTeamsForEvents([event]);

        // Fetch all ticket orders for this event
        const orders = await TicketOrder.find({ event: id })
            .populate("user", "firstName lastName email")
            .sort({ createdAt: -1 })
            .lean();

        // Calculate Metrics and Revenue Breakdown
        let totalOrders = orders.length;
        let successfulOrders = 0;
        let pendingOrders = 0;
        let failedOrders = 0;
        let totalTicketsSold = 0;
        let totalPaidRevenue = 0;

        const tierMap: Record<string, { name: string; qtySold: number; unitPrice: number; totalRevenue: number }> = {};

        // Helper to extract tickets list from flexible ticket object format
        const parseTickets = (ticketsData: any) => {
            if (!ticketsData) return [];
            if (Array.isArray(ticketsData)) return ticketsData;

            return Object.entries(ticketsData).map(([key, val]: [string, any]) => {
                if (typeof val === "number") {
                    return { name: key, quantity: val, price: 0 };
                }
                return {
                    name: val?.name || key,
                    quantity: Number(val?.quantity || val?.qty || 1),
                    price: Number(val?.price || 0)
                };
            });
        };

        orders.forEach((order: any) => {
            const status = order.paymentStatus || "pending";
            if (status === "success") {
                successfulOrders++;
            } else if (status === "failed") {
                failedOrders++;
            } else {
                pendingOrders++;
            }

            const items = parseTickets(order.tickets);

            // Calculate revenue and ticket counts only for SUCCESSFUL orders
            let orderCalculatedTotal = 0;

            items.forEach((item: any) => {
                const qty = Number(item.quantity) || 0;
                const price = Number(item.price) || 0;
                const itemTotal = qty * price;
                orderCalculatedTotal += itemTotal;

                if (status === "success") {
                    totalTicketsSold += qty;
                    totalPaidRevenue += itemTotal;

                    const tierName = item.name || "Regular";
                    if (!tierMap[tierName]) {
                        tierMap[tierName] = {
                            name: tierName,
                            qtySold: 0,
                            unitPrice: price,
                            totalRevenue: 0
                        };
                    }
                    tierMap[tierName].qtySold += qty;
                    tierMap[tierName].totalRevenue += itemTotal;
                    if (price > 0 && tierMap[tierName].unitPrice === 0) {
                        tierMap[tierName].unitPrice = price;
                    }
                }
            });

            // Attach parsed items and total order amount to response
            order.parsedTickets = items;
            order.totalAmount = orderCalculatedTotal;
        });

        const tierBreakdown = Object.values(tierMap);

        return NextResponse.json({
            success: true,
            event,
            summary: {
                totalOrders,
                successfulOrders,
                pendingOrders,
                failedOrders,
                totalTicketsSold,
                totalPaidRevenue,
                tierBreakdown
            },
            orders
        }, { status: 200 });

    } catch (error: any) {
        console.error("Fetch event orders error:", error);
        return NextResponse.json(
            { error: "Failed to fetch event ticket orders", details: error.message },
            { status: 500 }
        );
    }
}
