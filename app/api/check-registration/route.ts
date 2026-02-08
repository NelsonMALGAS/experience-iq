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
      console.log("[check-registration] No session cookie found");
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
    console.log("[check-registration] Checking user:", uid);

    // Collections to check for user registration
    const collections: string[] = ["users"];

    for (const collection of collections) {
      const docRef = db.collection(collection).doc(uid);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        console.log(
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

      console.log("[check-registration] User data:", {
        uid,
        role: data?.role,
        isRegistered: data?.isRegistered,
        email: data?.email,
      });

      // ✅ CRITICAL: Check isRegistered field explicitly
      // If isRegistered is explicitly false, user is NOT registered
      if (data?.isRegistered === false) {
        console.log(
          "[check-registration] User authenticated but NOT registered (isRegistered: false)",
        );
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

      // ✅ If isRegistered is true (or undefined for backwards compatibility)
      console.log(
        "[check-registration] User registered (isRegistered:",
        data?.isRegistered,
        ")",
      );
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

    // Authenticated but user document doesn't exist at all
    console.log(
      "[check-registration] User authenticated but no document found",
    );
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
