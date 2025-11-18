import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";
import User from "@/models/User";

export async function GET() {
    try {
            await connectDB()
            await verifyAuth()
    
            const users = await User.find({})
            
            return NextResponse.json({  users }, { status: 201 })
    
        } catch (error: any) {
            return NextResponse.json({
                error: "Can't get profile info"
            },
                {
                    status: 401
                }
            )
        }
}