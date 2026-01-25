import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
    try {
        return NextResponse.json({ message: "Found admins" })
    } catch (error: any) {
        return NextResponse.json({ error: `Error getting admin` }, { status: 400 })
    }
}

export async function POST(req: Request) {
    await connectDB()
    try {
        const { firstName, lastName, email, role } = await req.json()
        const newAdmin = { firstName, lastName, email, role, password: 'password' }
        const hashedPassword = await bcrypt.hash(newAdmin.password, 10)
        newAdmin.password = hashedPassword
        const createdAdmin = await User.create(newAdmin)
        // console.log({ createdAdmin, newAdmin });

        return NextResponse.json({ message: "Admin created", admin: { name: `${createdAdmin.firstName} ${createdAdmin.lastName}`, email: createdAdmin.email, role: createdAdmin.role } }, { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ error: `Error getting admin` }, { status: 400 })
    }
}



// export async function POST(req: Request) {
//    try {
//         return NextResponse.json({ message: "Found admins" })
//     } catch (error: any) {
//         return NextResponse.json({ error: `Error getting admin` }, { status: 400 })
//     }
// }



// export async function POST(req: Request) {
//    try {
//         return NextResponse.json({ message: "Found admins" })
//     } catch (error: any) {
//         return NextResponse.json({ error: `Error getting admin` }, { status: 400 })
//     }
// }


// export async function POST(req: Request) {
//    try {
//         return NextResponse.json({ message: "Found admins" })
//     } catch (error: any) {
//         return NextResponse.json({ error: `Error getting admin` }, { status: 400 })
//     }
// }
