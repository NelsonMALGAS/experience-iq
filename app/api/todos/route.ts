import { NextResponse } from "next/server";
import { db } from "@/db/server";

export const GET = async () => {
  try {
    if (!db) {
      return NextResponse.json(
        { message: "Firestore not initialized" },
        { status: 500 }
      );
    }

    const snapshot = await db.collection("todos").get();

    const todos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ data: todos }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch todos:", error);

    return NextResponse.json(
      { message: "Failed to fetch todos" },
      { status: 500 }
    );
  }
};
