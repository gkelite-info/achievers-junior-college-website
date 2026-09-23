import fs from "fs";
import http from "http";

const payload = {
  templateType: "congratulate",
  recipients: [
    {
      applicationId: "test-id-1",
      emailId: "test@example.com",
      firstName: "Test",
      lastName: "User",
      applicationNumber: "AJC-2026-TEST",
      course: "MPC",
    }
  ]
};

const req = http.request(
  {
    hostname: "localhost",
    port: 3000,
    path: "/api/emails/send-admissions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  },
  (res) => {
    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });
    res.on("end", () => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Response: ${data}`);
    });
  }
);

req.on("error", (error) => {
  console.error("Error calling API:", error);
});

req.write(JSON.stringify(payload));
req.end();
