import {NextResponse} from "next/server"
import {connectDB} from "@/lib/mongodb";
import {verifyAuth} from "@/lib/auth";

// export async function GET() {
//     try {
//         await connectDB()
//         await verifyAuth()
//
//         const token = () 
//     } catch (error: any) {
//
//     }
// }