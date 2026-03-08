import { NextRequest, NextResponse } from "next/server";
import { getPlanByPriceId } from "@/lib/plans";
import { cookies } from "next/headers";
import { Role } from "@/types";
import { requireVerifiedUser } from "@/lib/verificationGuards";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

interface InitializeRequest {
  email: string;
  planId: string;
  billingInterval: "monthly" | "yearly";
  userId: string;
  priceId: string;
  planCode: string;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;
    const role: Role = "admin";

    const verificationResult = await requireVerifiedUser(session, role);

    const { uid, isVerified } = verificationResult;

    if (!uid) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 },
      );
    }

    if (!isVerified) {
      return NextResponse.json(
        { error: "Forbidden. Account not verified." },
        { status: 403 },
      );
    }
    const body: InitializeRequest = await request.json();
    const { email, planId, billingInterval, userId, priceId, planCode } = body;

    if (
      !email ||
      !planId ||
      !billingInterval ||
      !userId ||
      !priceId ||
      !planCode
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Find plan (for validation and getting amount)
    const plan = getPlanByPriceId(priceId);

    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const amount = plan.pricing[billingInterval].price * 100; // Convert to kobo
    const title = plan.title;

    // Initialize Paystack transaction
    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount,
          plan: planCode,
          currency: "ZAR",
          metadata: {
            userId,
            planId,
            billingInterval,
            priceId: plan.pricing[billingInterval].priceId,
            planCode,
            name: title,
            custom_fields: [
              {
                display_name: "User ID",
                variable_name: "user_id",
                value: userId,
              },
              {
                display_name: "Plan ID",
                variable_name: "plan_id",
                value: planId,
              },
              {
                display_name: "Price ID",
                variable_name: "price_id",
                value: priceId,
              },
              {
                display_name: "Billing Interval",
                variable_name: "billing_interval",
                value: billingInterval,
              },
            ],
          },
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/verify`,
        }),
      },
    );

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json(
        { error: data.message || "Failed to initialize payment" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      reference: data.data.reference,
    });
  } catch (error) {
    console.error("Paystack initialization error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
