import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signToken, verifyToken } from "@/lib/jwt";
import { requireRole } from "@/lib/requireRole";
import { recordAuditLog } from "@/lib/audit";
import { cookies } from "next/headers";

/**
 * POST /api/admin/impersonate
 * Request Body: { userId: string }
 * Restricted to dev/admin roles.
 * Stores original dev token in `original_dev_token` cookie and issues target user token in `token`.
 */
export async function POST(req: Request) {
  const authResult = await requireRole(["dev"]);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Target userId is required" }, { status: 400 });
    }

    await connectDB();
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return NextResponse.json({ error: "User to impersonate not found" }, { status: 404 });
    }

    const currentToken = (await cookies()).get("token")?.value;

    const jwtPayload = {
      id: targetUser._id.toString(),
      firstName: targetUser.firstName,
      lastName: targetUser.lastName,
      email: targetUser.email,
      role: targetUser.role,
      name: `${targetUser.firstName} ${targetUser.lastName}`,
      isImpersonating: true,
      impersonatorId: authResult.id
    };

    const impersonatedToken = signToken(jwtPayload);

    // Audit log entry
    await recordAuditLog({
      actorId: authResult.id,
      actorRole: authResult.role,
      action: "USER_IMPERSONATED",
      targetType: "USER",
      targetId: targetUser._id.toString(),
      details: {
        impersonatedEmail: targetUser.email,
        impersonatedRole: targetUser.role
      },
      req
    });

    const res = NextResponse.json({
      success: true,
      message: `Now impersonating ${targetUser.firstName} ${targetUser.lastName}`,
      user: jwtPayload
    });

    // Save dev's original token in backup cookie
    if (currentToken) {
      res.cookies.set("original_dev_token", currentToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 86400
      });
    }

    // Set impersonated target user token
    res.cookies.set("token", impersonatedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 86400
    });

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Impersonation failed", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/impersonate
 * Restores original dev session from `original_dev_token`.
 */
export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const originalToken = cookieStore.get("original_dev_token")?.value;

    if (!originalToken) {
      return NextResponse.json(
        { error: "No original dev session found to restore" },
        { status: 400 }
      );
    }

    const decoded = verifyToken(originalToken);
    if (!decoded || typeof decoded === "string") {
      return NextResponse.json(
        { error: "Invalid or expired original session" },
        { status: 401 }
      );
    }

    const res = NextResponse.json({
      success: true,
      message: "Restored dev session successfully"
    });

    // Restore dev token
    res.cookies.set("token", originalToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 86400
    });

    // Clear backup token
    res.cookies.set("original_dev_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0
    });

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to exit impersonation", details: error.message },
      { status: 500 }
    );
  }
}
