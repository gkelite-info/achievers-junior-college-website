-- Run in the Supabase SQL Editor for the same project used by DBHOSTNAME.
-- Files are uploaded by the Next.js server with SUPABASE_SERVICE_ROLE_KEY.
-- Bucket: application-documents (PRIVATE), JPG/JPEG and PDF, 5 MB per file.
BEGIN;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('application-documents', 'application-documents', false, 5242880,
        ARRAY['image/jpeg', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Restrictive policies prevent existing broad policies on other buckets from
-- accidentally exposing these admission documents to direct browser requests.
-- The service_role used only on our server bypasses RLS. Signed download URLs
-- are issued by that server after application access has been verified.
DROP POLICY IF EXISTS "application_documents_private_select" ON storage.objects;
CREATE POLICY "application_documents_private_select" ON storage.objects
AS RESTRICTIVE FOR SELECT TO anon, authenticated
USING (bucket_id <> 'application-documents');

DROP POLICY IF EXISTS "application_documents_private_insert" ON storage.objects;
CREATE POLICY "application_documents_private_insert" ON storage.objects
AS RESTRICTIVE FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id <> 'application-documents');

DROP POLICY IF EXISTS "application_documents_private_update" ON storage.objects;
CREATE POLICY "application_documents_private_update" ON storage.objects
AS RESTRICTIVE FOR UPDATE TO anon, authenticated
USING (bucket_id <> 'application-documents')
WITH CHECK (bucket_id <> 'application-documents');

DROP POLICY IF EXISTS "application_documents_private_delete" ON storage.objects;
CREATE POLICY "application_documents_private_delete" ON storage.objects
AS RESTRICTIVE FOR DELETE TO anon, authenticated
USING (bucket_id <> 'application-documents');

-- Compatibility with the older deployed table. The supplied Sequelize model
-- already has this column. No ID conversion or data deletion is performed.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "registrationFee" numeric(10,2) NOT NULL DEFAULT 500.00;

COMMIT;
