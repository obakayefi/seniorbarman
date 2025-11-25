import {NextResponse} from "next/server";
import {connectDB} from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import {TicketPayload} from "@/types/data";
import {cookies} from "next/headers";
import jwt, {JwtPayload} from "jsonwebtoken";

type Params = {
    params: Promise<{ hashToken: string }>;
};


function HandleTicketCheckIn(ticket: TicketPayload) {
    // pass the ticket details in
    // console.log({eventCheckIn: ticket})
    let _gateAction = {
        time: new Date(),
        action: "entry",
        method: "QR Code",
        location: "Gate 1"
    }


    if (ticket.checkInLogs.length === 0)
        _gateAction = {
            ..._gateAction,
            action: "entry",
        }

    if (ticket.checkInLogs.length) {
        const lastAction = ticket.checkInLogs[ticket.checkInLogs.length - 1];
        console.log({lastAction})

        if (lastAction?.action === "entry") {
            _gateAction = {
                ..._gateAction,
                action: "exit",
            }
        } else if (lastAction?.action === "exit") {
            _gateAction = {
                ..._gateAction,
                action: "entry",
            }
        }
    }
    // look at the checkInLogs[]
    // if log is empty user has not checked in, so check them in
    // if the log has an entry, pull the last entry and check what action was done
    // if last action was entry then the user wants to check out of the stadium -> check them out
    // if the last action was "exit" then check the user back in
    // add this last action to the checkInLogs

    // returns the action a user needs to add to the check in logs

    return _gateAction;
}

export async function POST(req: Request, {params}: Params) {
    try {
        await connectDB();
        const {hashToken} = await params;
       

        if (!hashToken) {
            return NextResponse.json(
                {error: "Invalid action"},
                {status: 400}
            );
        }
        let ticket = await Ticket.findOne({checkInToken: hashToken}).populate("event");

        //console.log({ticket})

        if (!ticket) {
            return NextResponse.json(
                {error: "Ticket not found"},
                {status: 404}
            );
        }

        const gateAction = HandleTicketCheckIn(ticket)

        console.log({gateAction})

        // Let's create a method that handles the check in algo
        // 

        // if (ticket.status === "Checked In") {
        //     return NextResponse.json(
        //         { error: "Ticket has already been checked in" },
        //         { status: 400 }
        //     );
        // }

        // update and return updated document
        // const updatedTicket = await Ticket.findByIdAndUpdate(ticketNumber,
        //     { status: "Checked In" },
        //     { new: true }
        // ).populate("event");
        // console.log({ updatedTicket });
        //
        ticket.checkInLogs.push(gateAction)

        await ticket.save()
        let updatedTicket = await Ticket.findOne({checkInToken: hashToken}).populate("event");

        return NextResponse.json({
            message: "Ticket successfully checked in",
            // ticket: ticket.toObject({ virtuals: true }),
            ticket,
            updatedTicket,
            gateAction
        });
    } catch (error) {
        console.error("Error checking in ticket:", error);
        return NextResponse.json(
            {error: "Internal server error"},
            {status: 500}
        );
    }
}
