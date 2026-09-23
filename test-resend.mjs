import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  console.log("Attempting to send email via Resend...");
  try {
    const { data, error } = await resend.emails.send({
      from: 'Achievers Junior College <info@gkeliteinfo.com>', 
      to: 'kourwarsaisaraswathi@gmail.com',
      subject: "Test Email from Script (Verified Domain)",
      html: "<p>Test</p>"
    });

    if (error) {
      console.error("Resend error:", error);
    } else {
      console.log("Success:", data);
    }
  } catch(e) {
    console.error("Catch block:", e);
  }
}

testEmail();
