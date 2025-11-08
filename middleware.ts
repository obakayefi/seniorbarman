import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/jwt";

export function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value
    const pathname = req.nextUrl.pathname

    console.log({token, pathname})

    const publicPaths = ['/login', '/register', '/api/auth/login', '/api/auth/register']
    if (publicPaths.includes(pathname)) return NextResponse.next()
    
    if (!token) {
        return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    const decoded = verifyToken(token)
    console.log({decoded})
    // if (!decoded) {
    //     const res = NextResponse.redirect(new URL("/auth/login", req.url))
    //     res.cookies.delete("token");
    //     return res;
    // }

    NextResponse.next()
}

export const config = {
    matcher: ["/dashboard/:path*", "/api/payment/:path*", "/user/:path*"]
}