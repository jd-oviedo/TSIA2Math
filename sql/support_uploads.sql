-- Storage bucket for support screenshots.
--
-- Used by app/api/support/route.ts. The project had no buckets before this, so
-- this creates the first one.
--
-- Private on purpose. The route uploads with the service-role key and emails
-- support a signed URL that expires in 30 days, so an object is never readable
-- from a guessable public URL. That is also why there are no anon/authenticated
-- policies below: nothing but the service role ever touches this bucket, and
-- the service role bypasses RLS.
--
-- Until this runs, the Help modal still sends -- the upload fails, is logged,
-- and the response reports image_uploaded:false.

-- 1. Bucket. 5MB ceiling matches the limit enforced in the route and the modal.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'support-uploads',
  'support-uploads',
  false,
  5242880,
  array['image/png', 'image/jpeg', 'image/gif', 'image/webp']
)
on conflict (id) do nothing;

-- 2. Verify.
select id, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'support-uploads';
