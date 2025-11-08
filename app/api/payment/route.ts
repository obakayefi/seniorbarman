import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import axios from "axios"
import { verifyToken } from "@/lib/jwt";

const PAYSTACK_API_KEY = process.env.PAYSTACK_API_KEY as string;

// export async function POST(req: Request) {
//     try {
//         await connectDB();
//         const { amount } = await req.json()
//         const headers = {
//             "Authorization": "Bearer " + PAYSTACK_API
//         }
//         console.log({ amount })
//         const result = await axios.post("/https://api.paystack.co/transaction/initialize", amount, { headers })
//         console.log({ result })
//         return NextResponse.json({ success: true })
//     } catch (error: any) {
//         return NextResponse.json({ error: error.message }, { status: 500 })
//     }
// }

export async function POST(req: Request) {
    // const user = verifyToken(req)

    // if (!user)
    //     return NextResponse.json({ error: "Unauthorized, you need to log in" }, { status: 401 })

    const { email, amount } = await req.json();
    try {

        if (!email || !amount) {
            return NextResponse.json(
                { error: "Email and amount are required" },
                { status: 400 }
            )
        }

        const paystackPayload = {
            email,
            amount: amount * 100, // convert from KOBO to naira,
            callback_url: `https://seniorbar.com/payment/verify`
        }

        const headers = {
            "Authorization": "Bearer " + PAYSTACK_API_KEY,
            "Content-Type": "application/json"
        }

        const response = await axios.post("https://api.paystack.co/transaction/initialize", paystackPayload, { headers })


        console.log({ response: response.data })

        return NextResponse.json(
            { error: "Payment initialized successfully" },
            { status: 200 }
        )

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
    // console.log(body);
    // return NextResponse.json({ message: "Payment route working!" });
}

export async function GET() {
    return NextResponse.json({ status: "OK" });
}