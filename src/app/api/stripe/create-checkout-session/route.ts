import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { pool } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationNumber, amount } = body;

    if (!applicationNumber || !amount) {
      return NextResponse.json({ error: "Missing applicationNumber or amount" }, { status: 400 });
    }

    // Retrieve user and check payment status
    const client = await pool.connect();
    let user;
    try {
      const result = await client.query(
        `SELECT "firstName", "lastName", "paymentStatus" FROM public.users WHERE "applicationNumber" = $1 LIMIT 1`,
        [applicationNumber]
      );
      user = result.rows[0];
    } finally {
      client.release();
    }

    if (!user) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (user.paymentStatus === "success") {
      return NextResponse.json({ error: "Application fee is already paid" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Admission Application Fee",
              description: `Application Fee for ${user.firstName} ${user.lastName} (${applicationNumber})`,
            },
            unit_amount: Math.round(Number(amount) * 100), // Convert to paise
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/payments?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payments?status=cancelled`,
      metadata: {
        applicationNumber: applicationNumber,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error creating Stripe checkout session:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
