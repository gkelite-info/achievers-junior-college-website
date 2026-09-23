import nextEnv from "@next/env";
import pg from "pg";

// Load the same local environment files as `next dev`, without logging values.
nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });

const required = ["DBHOSTNAME", "DBPORT", "DBNAME", "DBUSERNAME", "DBPASSWORD"];
const missing = required.filter((key) => !process.env[key]);
const port = Number(process.env.DBPORT);

if (missing.length) {
  console.error(`[DB] Connection failed: missing ${missing.join(", ")} in .env.local.`);
  process.exitCode = 1;
} else if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error("[DB] Connection failed: DBPORT must be a valid port number.");
  process.exitCode = 1;
} else {
  const client = new pg.Client({
    host: process.env.DBHOSTNAME,
    port,
    database: process.env.DBNAME,
    user: process.env.DBUSERNAME,
    password: process.env.DBPASSWORD,
    connectionTimeoutMillis: 10000,
    query_timeout: 10000,
    ...(process.env.DBSSL === "true" ? { ssl: { rejectUnauthorized: true } } : {}),
  });

  console.log("[DB] Checking PostgreSQL connection...");
  try {
    await client.connect();
    await client.query("SELECT 1 AS connection_check");
    console.log("[DB] Connected successfully. Database query passed.");
  } catch (error) {
    // Never print raw driver errors: they can contain server/credential details.
    const hints = {
      "28P01": "Authentication failed. Check DBUSERNAME and DBPASSWORD.",
      "28000": "Access rejected. Check database authentication and SSL requirements.",
      "3D000": "Database not found. Check DBNAME.",
      ECONNREFUSED: "Connection refused. Check that PostgreSQL is running and DBHOSTNAME/DBPORT are correct.",
      ENOTFOUND: "Database hostname could not be resolved. Check DBHOSTNAME.",
      EAI_AGAIN: "Hostname lookup failed temporarily. Check your network and retry.",
      EACCES: "Network access was blocked by the operating system or execution permissions.",
      EPERM: "Network access was blocked by the operating system or execution permissions.",
      ETIMEDOUT: "Connection timed out. Check the database firewall, network, and allowed IP addresses.",
      DEPTH_ZERO_SELF_SIGNED_CERT: "The database SSL certificate is not trusted. Configure a trusted certificate.",
      SELF_SIGNED_CERT_IN_CHAIN: "The database SSL certificate chain is not trusted. Configure a trusted certificate.",
    };
    const code = error && typeof error === "object" ? error.code : undefined;
    console.error(`[DB] Connection failed. ${hints[code] || "Check your database settings, network access, and server SSL requirements."}`);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}
