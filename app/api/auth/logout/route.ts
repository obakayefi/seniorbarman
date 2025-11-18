import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
      console.log("!Server aboutlogging user out...")
    // Create the response object
    const res = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    // Delete the cookie on the response
    res.cookies.set({
      name: "token",
      value: "",
      path: "/",
      maxAge: 0, // expires immediately
    });

    console.log("Server logging user out...")

    return res;
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
}