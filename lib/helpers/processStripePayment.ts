import { pool } from "@/lib/db";
import Stripe from "stripe";
import { sendPaymentSuccessEmail } from "@/lib/helpers/emailService";

export async function recordSessionPayment(session: Stripe.Checkout.Session) {
  const gatewayTransactionId =
    (typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id) || session.id;
  const applicationNumber = session.metadata?.applicationNumber;
  const amount = session.amount_total ? session.amount_total / 100 : 0; // Convert from paise to INR
  const currency = session.currency || "inr";

  if (!applicationNumber || !gatewayTransactionId) {
    console.error("Missing applicationNumber or gatewayTransactionId in Stripe session", session.id);
    return false;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Step 1: Idempotency Check
    const existingTx = await client.query(
      `SELECT "transactionId" FROM public.application_transactions WHERE "gatewayTransactionId" = $1 LIMIT 1`,
      [gatewayTransactionId]
    );

    if (existingTx.rows.length > 0) {
      console.log(`Payment intent ${gatewayTransactionId} already processed. Skipping.`);
      await client.query("ROLLBACK");
      return true; // Already processed
    }

    // Step 2: Transaction Creation & Ledger Entry
    await client.query(
      `INSERT INTO public.application_transactions 
       ("applicationNumber", "gatewayTransactionId", "amount", "currency", "status", "gatewayResponse", "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        applicationNumber,
        gatewayTransactionId,
        amount,
        currency,
        "success",
        JSON.stringify(session),
      ]
    );

    // Step 3: Application Status Update
    await client.query(
      `UPDATE public.users SET "paymentStatus" = 'success' WHERE "applicationNumber" = $1`,
      [applicationNumber]
    );

    // Fetch user details for the email receipt
    const userRes = await client.query(
      `SELECT "firstName", "lastName", "email", "course" FROM public.users WHERE "applicationNumber" = $1 LIMIT 1`,
      [applicationNumber]
    );

    await client.query("COMMIT");
    console.log(`Successfully processed payment for application ${applicationNumber} (Tx: ${gatewayTransactionId})`);

    // Step 4: Send Payment Confirmation Email
    if (userRes.rows[0]?.email) {
      const user = userRes.rows[0];
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Applicant";
      sendPaymentSuccessEmail({
        email: user.email,
        name: fullName,
        applicationNumber,
        amount,
        transactionId: gatewayTransactionId,
        course: user.course || "Intermediate",
      }).catch((err) => {
        console.error("Error sending payment confirmation email:", err);
      });
    }

    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error processing Stripe payment:", error);
    throw error;
  } finally {
    client.release();
  }
}

export async function processStripePayment(event: Stripe.CheckoutSessionCompletedEvent) {
  const session = event.data.object as Stripe.Checkout.Session;
  return recordSessionPayment(session);
}
