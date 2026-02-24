import { db } from "@/db/server";
import { NextRequest, NextResponse } from "next/server";
import { PRICE_PLANS } from "@/constants";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const POST = async (request: NextRequest) => {
  if (!db) throw new Error("Firestore not initialized");

  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { message: "Missing Stripe signature" },
        { status: 400 },
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret,
    );

    switch (event.type) {
      /**
       * ---------------------------------------------------------
       * CHECKOUT COMPLETED
       * ---------------------------------------------------------
       */
      case "checkout.session.completed": {
        const sessionObj = event.data.object as Stripe.Checkout.Session;

        const session = await stripe.checkout.sessions.retrieve(sessionObj.id, {
          expand: ["line_items", "subscription"],
        });

        // ✅ Proper email retrieval
        let email: string | null = session.customer_email ?? null;

        if (!email) {
          const customerId =
            typeof session.customer === "string"
              ? session.customer
              : session.customer?.id;

          if (customerId) {
            const customer = await stripe.customers.retrieve(customerId);
            if ("email" in customer && customer.email) {
              email = customer.email;
            }
          }
        }

        if (!email) break;

        const priceId = session.line_items?.data[0]?.price?.id ?? null;
        if (!priceId) break;

        const plan = PRICE_PLANS.find(
          (p) =>
            p.pricing.monthly.priceId === priceId ||
            p.pricing.yearly.priceId === priceId,
        );

        if (!plan) break;

        const subscription = session.subscription as Stripe.Subscription;

        const querySnapshot = await db
          .collection("users")
          .where("email", "==", email)
          .get();

        if (querySnapshot.empty) {
          console.log("User not found for email:", email);
          break;
        }

        const userDoc = querySnapshot.docs[0];

        const hasAccess =
          subscription.status === "active" ||
          subscription.status === "trialing";

        await userDoc.ref.update({
          "subscription.subscriptionId": subscription?.id ?? null,
          "subscription.customerId":
            typeof session.customer === "string" ? session.customer : null,
          "subscription.priceId": priceId,
          "subscription.status": subscription?.status ?? null,
          "subscription.currentPeriodStart": subscription?.start_date ?? null,
          "subscription.currentPeriodEnd": subscription?.ended_at ?? null,
          "subscription.cancelAtPeriodEnd":
            subscription?.cancel_at_period_end ?? false,
          "subscription.hasAccess": hasAccess,
        });

        break;
      }

      /**
       * ---------------------------------------------------------
       * SUBSCRIPTION UPDATED
       * ---------------------------------------------------------
       */
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const querySnapshot = await db
          .collection("users")
          .where("subscription.subscriptionId", "==", subscription.id)
          .get();

        if (querySnapshot.empty) break;

        const userDoc = querySnapshot.docs[0];

        const hasAccess =
          subscription.status === "active" ||
          subscription.status === "trialing";

        await userDoc.ref.update({
          "subscription.status": subscription.status,
          "subscription.priceId": subscription.items.data[0]?.price?.id ?? null,
          "subscription.currentPeriodStart": subscription?.start_date ?? null,
          "subscription.currentPeriodEnd": subscription?.ended_at ?? null,
          "subscription.cancelAtPeriodEnd":
            subscription.cancel_at_period_end ?? false,
          "subscription.hasAccess": hasAccess,
        });

        break;
      }

      /**
       * ---------------------------------------------------------
       * SUBSCRIPTION DELETED
       * ---------------------------------------------------------
       */
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const querySnapshot = await db
          .collection("users")
          .where("subscription.subscriptionId", "==", subscription.id)
          .get();

        if (querySnapshot.empty) break;

        const userDoc = querySnapshot.docs[0];

        await userDoc.ref.update({
          "subscription.status": "canceled",
          "subscription.hasAccess": false,
        });

        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Stripe webhook error:", error.message);
    } else {
      console.error("Stripe webhook error:", "Something went wrong");
    }

    return NextResponse.json({ message: "Webhook error" }, { status: 400 });
  }
};
