import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { processStripePayment } from "@/lib/helpers/processStripePayment";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature found" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set in environment variables");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await processStripePayment(event);
    } else {
      console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error handling webhook event:", error);
    return NextResponse.json({ error: "Error processing webhook" }, { status: 500 });
  }
}
