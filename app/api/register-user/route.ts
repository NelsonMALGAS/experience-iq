import { db, auth } from "@/db/server";
import { AppUser } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Extract token from cookie or header
    const cookieToken = request.cookies.get("_SESSION_")?.value;
    const headerToken = request.headers
      .get("authorization")
      ?.split("Bearer ")[1];
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token with Firebase Admin SDK (using verifySessionCookie)
    const decodedToken = await auth?.verifySessionCookie(token, true);

    const data = await request.json();
    const { uid, role, email, department } = data;

    if (!uid || !decodedToken || decodedToken.uid !== uid || !role) {
      return NextResponse.json(
        { error: "Invalid or missing fields" },
        { status: 400 },
      );
    }

    if (role === "admin" || role === "staff") {
      const existingUserSnap = await db
        ?.collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();

      if (!existingUserSnap || !existingUserSnap.empty) {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 409 },
        );
      }
    }

    const collectionName = "users";
    const userDocRef = db?.collection(collectionName).doc(uid);

    if (!userDocRef) {
      return NextResponse.json({ message: "No userDocRef" }, { status: 404 });
    }
    const docSnapshot = await userDocRef.get();

    if (docSnapshot.exists) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 200 },
      );
    }

    const now = new Date();
    const userDoc: AppUser = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    if (role === "admin" || role === "staff") {
      userDoc.isVerified = false;
    } else if (role === "guest") {
      userDoc.isVerified = true;
    }

    await userDocRef.set(userDoc);

    if (role === "admin" || role === "staff") {
      await auth?.setCustomUserClaims(uid, { role, department });
    }

    return NextResponse.json(
      { message: "User registration complete" },
      { status: 201 },
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// export async function PATCH(request: NextRequest) {
//   try {
//     const data = await request.json();
//     const { userId, fcmToken } = data;
//     if (!userId || !fcmToken) {
//       return NextResponse.json({ error: "Missing fields" }, { status: 400 });
//     }

//     const userDocRef = db.collection("doctors").doc(userId);
//     await userDocRef.update({ fcmToken, updatedAt: new Date() });

//     return NextResponse.json({ message: "FCM token updated" }, { status: 200 });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: "Failed to update FCM token" },
//       { status: 500 }
//     );
//   }
// }
