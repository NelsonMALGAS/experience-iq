/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/db/server";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

// Verify Paystack signature
function verifyPaystackSignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(body)
    .digest("hex");
  return hash === signature;
}

export async function POST(request: NextRequest) {
  if (!db) {
    return NextResponse.json(
      { error: "Database not initialized" },
      { status: 500 },
    );
  }

  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      console.error("Missing Paystack signature");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify signature
    if (!verifyPaystackSignature(body, signature)) {
      console.error("Invalid Paystack signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    switch (event.event) {
      /**
       * CHARGE SUCCESS - Initial payment
       */
      case "charge.success": {
        const { customer, metadata, reference, amount, status } = event.data;

        if (status !== "success") break;

        const email = customer?.email;
        const userId =
          metadata?.userId ||
          metadata?.custom_fields?.find(
            (f: any) => f.variable_name === "user_id",
          )?.value;

        const name = metadata?.name;

        if (!email || !userId) {
          return NextResponse.json(
            { error: "Unauthorized. Please sign in." },
            { status: 401 },
          );
        }

        // Find user
        const userQuery = await db
          .collection("users")
          .where("email", "==", email)
          .get();

        if (userQuery.empty) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 },
          );
        }

        const userDoc = userQuery.docs[0];

        // Update payment info
        await userDoc.ref.update({
          "subscription.lastPaymentReference": reference,
          "subscription.lastPaymentAmount": amount,
          "subscription.lastPaymentDate": new Date().toISOString(),
          "subscription.customerCode": customer?.customer_code || null,
          "subscription.hasAccess": true,
          "subscription.status": status,
          "subscription.priceId": metadata.priceId,
          "subscription.name": name,
          adminType: "main",
        });

        break;
      }

      /**
       * SUBSCRIPTION CREATE - Subscription activated
       */
      case "subscription.create": {
        const {
          customer,
          subscription_code,
          plan,
          status,
          next_payment_date,
          amount,
          email_token,
        } = event.data;

        const email = customer?.email;

        if (!email) {
          console.error("Missing email in subscription.create");
          return NextResponse.json(
            { error: "Missing email in subscription.create" },
            { status: 401 },
          );
        }

        const userQuery = await db
          .collection("users")
          .where("email", "==", email)
          .get();

        if (userQuery.empty) {
          console.error("User not found:", email);
          return NextResponse.json(
            { error: `User not found: ${email}` },
            { status: 404 },
          );
        }

        const userDoc = userQuery.docs[0];

        const hasAccess = status === "active";

        await userDoc.ref.update({
          "subscription.subscriptionId": subscription_code,
          "subscription.subscriptionCode": subscription_code,
          "subscription.customerCode": customer?.customer_code || null,
          "subscription.planCode": plan?.plan_code || null,
          "subscription.status": status,
          "subscription.amount": amount,
          "subscription.currentPeriodEnd": next_payment_date || null,
          "subscription.emailToken": email_token || null,
          "subscription.hasAccess": hasAccess,
          "subscription.cancelAtPeriodEnd": false,
          "subscription.createdAt": new Date().toISOString(),
          "subscription.cancelledAt": null,
          adminType: "main",
        });

        break;
      }

      /**
       * SUBSCRIPTION DISABLE - Subscription cancelled
       */
      case "subscription.not_renew": {
        const { subscription_code, customer } = event.data;

        const email = customer?.email;

        if (!email) {
          console.error("Missing email in subscription.disable");
          return NextResponse.json(
            { error: "Missing email in subscription.disable" },
            { status: 401 },
          );
        }

        const userQuery = await db
          .collection("users")
          .where("subscription.subscriptionCode", "==", subscription_code)
          .get();

        if (userQuery.empty) {
          console.error("Subscription not found:", subscription_code);
          return NextResponse.json(
            { error: `Subscription not found: ${subscription_code}` },
            { status: 404 },
          );
        }

        const userDoc = userQuery.docs[0];

        await userDoc.ref.update({
          "subscription.status": "cancelled",
          "subscription.hasAccess": false,
          "subscription.cancelledAt": new Date().toISOString(),
        });

        break;
      }

      /**
       * INVOICE CREATE - Recurring payment due
       */
      case "invoice.create": {
        const { customer, subscription, amount } = event.data;

        console.log(subscription, "SUBSCRIPTION");

        console.log("Invoice created for:", customer?.email, "Amount:", amount);
        break;
      }

      /**
       * INVOICE PAYMENT FAILED
       */
      case "invoice.payment_failed": {
        const { customer, subscription } = event.data;

        const email = customer?.email;
        const subscriptionCode = subscription?.subscription_code;

        if (!email || !subscriptionCode) break;

        const userQuery = await db
          .collection("users")
          .where("subscription.subscriptionCode", "==", subscriptionCode)
          .get();

        if (userQuery.empty) break;

        const userDoc = userQuery.docs[0];

        await userDoc.ref.update({
          "subscription.status": "non-renewing",
          "subscription.hasAccess": false,
          "subscription.lastPaymentFailed": new Date().toISOString(),
        });

        break;
      }

      default:
        console.log("Unhandled event:", event.event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 400 });
  }
}
