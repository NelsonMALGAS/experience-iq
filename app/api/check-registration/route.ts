import { auth, db } from "@/db/server";
import { NextRequest, NextResponse } from "next/server";
import { DecodedIdToken } from "firebase-admin/auth";

export async function GET(request: NextRequest) {
  try {
    if (!auth || !db) {
      console.error("Firebase admin not initialized");
      return NextResponse.json(
        { authenticated: false },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        },
      );
    }

    const sessionCookie = request.cookies.get("_SESSION_")?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { authenticated: false },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        },
      );
    }

    // Verify session cookie
    const decoded: DecodedIdToken = await auth.verifySessionCookie(
      sessionCookie,
      true,
    );

    const uid = decoded.uid;

    // Collections to check for user registration
    const collections: string[] = ["users"];

    for (const collection of collections) {
      const docRef = db.collection(collection).doc(uid);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        console.error(
          `[check-registration] User ${uid} not found in ${collection}`,
        );
        continue;
      }

      const data = docSnap.data() as
        | {
            role?: string;
            isRegistered?: boolean;
            email?: string;
          }
        | undefined;

      // ✅ CRITICAL: Check isRegistered field explicitly
      // If isRegistered is explicitly false, user is NOT registered
      if (data?.isRegistered === false) {
        return NextResponse.json(
          {
            authenticated: true,
            registered: false, // ✅ NOT registered
            role: data?.role,
            userId: uid,
          },
          {
            status: 200,
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          },
        );
      }

      return NextResponse.json(
        {
          authenticated: true,
          registered: true,
          role: data?.role ?? collection.slice(0, -1),
          userId: uid,
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        },
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        registered: false,
        userId: uid,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  } catch (error) {
    console.error("Session verification error:", error);

    return NextResponse.json(
      { authenticated: false },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  }
}
