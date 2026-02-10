import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getUserFromCookie } from "@/lib/auth";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const user = await getUserFromCookie();

        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
        }

        const { id: ticketId } = await params;
        const deletedTicket = await Ticket.findByIdAndDelete(ticketId);

        if (!deletedTicket) {
            return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
        }

        return NextResponse.json({ message: "Ticket deleted successfully." }, { status: 200 });
    } catch (error: any) {
        console.error("Error deleting ticket:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
