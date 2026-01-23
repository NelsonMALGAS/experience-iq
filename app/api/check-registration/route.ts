import { auth, db } from "@/db/server";
import { NextRequest, NextResponse } from "next/server";
import { DecodedIdToken } from "firebase-admin/auth";

export async function GET(request: NextRequest) {
  try {
    if (!auth || !db) {
      console.error("Firebase admin not initialized");
      return NextResponse.json({ authenticated: false }, { status: 500 });
    }
    const sessionCookie = request.cookies.get("_SESSION_")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    // Verify session cookie
    const decoded: DecodedIdToken = await auth.verifySessionCookie(
      sessionCookie,
      true
    );

    const uid = decoded.uid;

    // Collections to check for user registration
    const collections: string[] = ["users"];

    for (const collection of collections) {
      const docRef = db.collection(collection).doc(uid);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        continue;
      }

      const data = docSnap.data() as { role?: string } | undefined;

      return NextResponse.json(
        {
          authenticated: true,
          registered: true,
          role: data?.role ?? collection.slice(0, -1),
          userId: uid,
        },
        { status: 200 }
      );
    }

    // Authenticated but not registered
    return NextResponse.json(
      {
        authenticated: true,
        registered: false,
        userId: uid,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Session verification error:", error);

    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
