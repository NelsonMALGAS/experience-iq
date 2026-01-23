import { SEVEN_DAYS_MS } from "@/constants";
import { auth } from "@/db/server";
import { Role } from "@/types";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type SessionRequestBody = {
  token: string;
  role: Role;
  fcmToken?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body: SessionRequestBody = await req.json();
    const { token, role } = body;

    const cookieStore = await cookies();

    if (!token) {
      // Clear any old session
      cookieStore.set("_SESSION_", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 0,
      });
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const decodedToken = await auth?.verifyIdToken(token);

    if (!decodedToken || !decodedToken.exp) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const expirationTimeMs = Date.now() + SEVEN_DAYS_MS;
    const nowMs = Date.now();
    const expiresIn = expirationTimeMs - nowMs;

    if (expiresIn <= 0) {
      return NextResponse.json(
        { error: "Token already expired. Please sign in again" },
        { status: 401 }
      );
    }

    const sessionCookie = await auth?.createSessionCookie(token, { expiresIn });

    cookieStore.set("_SESSION_", sessionCookie ?? "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: Math.floor(expiresIn / 1000),
    });

    // Optional FCM and profile update
    const uid = decodedToken.uid;

    // 🔐 Ensure correct custom claims
    if (!decodedToken.role || decodedToken.role !== role) {
      await auth?.setCustomUserClaims(uid, {
        role: role || decodedToken?.role,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Session creation error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    // 🔑 Create response
    const res = NextResponse.json({ success: true });

    // 🔥 Expire the cookie
    res.cookies.set("_SESSION_", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    return res;
  } catch (err) {
    console.error("_SESSION_ deletion error:", err);

    // Even on error, return a response that clears the cookie
    const res = NextResponse.json({ error: "Cleanup done" }, { status: 200 });
    res.cookies.set("_SESSION_", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    return res;
  }
}
