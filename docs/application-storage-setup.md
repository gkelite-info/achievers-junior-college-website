# Application form database and uploads

## Setup

1. Run `supabase/application-storage.sql` in your Supabase SQL Editor. It creates or configures the **private** `application-documents` bucket, restricts direct browser access, and adds the missing `registrationFee` column to older tables. The SQL is safe to run again.
2. Add these **server-only** values to `.env.local`, using the same Supabase project as your database connection:

   ```dotenv
   SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
   ```

   Keep the existing `DBHOSTNAME`, `DBPORT`, `DBNAME`, `DBUSERNAME`, `DBPASSWORD`, and SSL configuration. Never prefix the service-role key with `NEXT_PUBLIC_` or include it in browser code. No browser Supabase key is needed for this application flow.
3. Restart `npm run dev`.
4. On `/apply`, complete the fields, select a JPG/JPEG photo and PDF certificate (maximum 5 MB each), then choose **Save and Next**.

## Files and integration

- `lib/helpers/applicationsAPI.ts`: the only application helper file. Contains CRUD functions, React Query hooks, query keys, TypeScript types, and form-data mapping. The UI imports directly from this file.
- `src/app/api/applications/route.ts`: server endpoint containing the database transaction, private bucket uploads, file validation, and application access checks. Credentials stay on the server. The client helper calls GET/POST/PUT/DELETE here; verified lookup uses POST with `?action=lookup`.

Storage paths are saved in `users.profileImageRef` and `user_education.certificateRef`, for example `AJC-2026-0001/profileImage-....jpg`. Expiring signed URLs are only used for previews; they are not persisted as file references. `registrationFee` is set to 500 on the server. Payment completion and email sending are not implemented by this helper; `submissionTime` remains null until a real submission/payment workflow sets it.

Create uses POST; read uses GET; update uses PUT; delete uses DELETE at `/api/applications`. Delete is a soft deletion of both linked records (`is_deleted = true`, `isActive = false`, `deletedAt` set), consistent with the supplied models. It preserves private bucket files for recovery; existing signed links can remain valid until their one-hour expiry. Deleted records are excluded from reads and lookups. `useDeleteApplication` exposes the delete mutation and clears cached application queries on success. The existing form calls create/update through `useSubmitApplication`; no delete button has been added to the public admissions form.

**Save as Draft** continues to save incomplete text locally in the browser. The supplied tables require completed fields and both documents, so final database saving happens on **Save and Next**.

## Access policies

This public form has no Supabase user login. Uploads therefore go through the Next.js server; its service-role key bypasses Storage RLS. The included policies intentionally deny direct `anon`/`authenticated` access to this bucket. Do not add public read/write policies for student photos and certificates.

The save response sets a signed HttpOnly cookie for later reads/edits. On another browser, or when that cookie expires, use `/payments` and enter the application number, mobile number, and date of birth to verify access. Application number alone cannot read or overwrite an existing application. Deployments should rate-limit the public save and lookup routes through their hosting gateway.

Supabase reference: https://supabase.com/docs/guides/storage/security/access-control

## Verification after setup

- Save an application; confirm one linked row in each table and two objects in the bucket.
- Reload and open `/apply?application=YOUR_APPLICATION_NUMBER`; verify the saved data loads.
- Replace a document and save; confirm the same user/education IDs remain and the old object is removed.
- Try an invalid file or interrupt saving; the form must show an error and remain available for retry.
- Use `/payments` in another browser with the three matching details; confirm both the saved form and document previews load.

Each file can be 5 MB, so the host must accept multipart requests of approximately 11 MB. If your hosting provider has a smaller request limit, lower the file limits or move uploads to a signed direct-upload flow before deployment.
