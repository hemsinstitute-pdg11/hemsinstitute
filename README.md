# Hem's Institute Official Website

Starter implementation based on the supplied project specification. Built with Next.js App Router, TypeScript, Tailwind CSS, Supabase/PostgreSQL, and Zod.

## Included in this Phase 1 scaffold
- Responsive institutional homepage and profile pages.
- Program catalog and dynamic program detail pages backed by Supabase.
- Online registration form and server-side validation.
- Atomic registration-code generation: `HI-REG-YYYY-00001`.
- Registration success page and WhatsApp Click-to-Chat handoff.
- PostgreSQL migration with relational tables, indexes, constraints, RLS enabled, and a transaction-safe registration function.
- Placeholder states instead of invented institutional information.

## Requirements before launch
1. Node.js 20.9+ and a Supabase project.
2. Copy `.env.example` to `.env.local`. The Supabase project URL and publishable key are prefilled; add the server-only Supabase Secret key, WhatsApp number, and site URL.
3. Run the SQL migration in `supabase/migrations/001_initial_schema.sql` in the Supabase SQL editor.
4. Seed verified program categories and course records. Keep `is_active=false` until details are checked.
5. Add verified institution address, contact details, approved photos, instructor profiles, testimonials, and legal credentials before publishing those sections.
6. Install dependencies with `npm install`; run `npm run dev`; verify with `npm run build`.

## Security notes
- `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`) is server-only. Never prefix it with `NEXT_PUBLIC_`.
- Public registration writes happen through a server route and a `SECURITY DEFINER` database function granted only to `service_role`.
- Participant tables have RLS enabled and no public policies. Do not add broad public SELECT policies.
- Add production rate limiting/CAPTCHA at the hosting edge before opening registration publicly. Configure backups and review the privacy notice/consent language with the institution.
- WhatsApp Click-to-Chat opens a prefilled message; the participant must press Send. It does not send automatically.

## Important implementation notes / follow-up hardening
- The first form iteration collects core participant and guardian details. Schedule selection is nullable until the institution seeds and publishes schedules; extend the form to load schedule options before enabling schedule-required courses.
- The registration API validates program and optional schedule status server-side. Add rate limiting, anti-bot verification, duplicate-submission idempotency, and audit monitoring before production.
- The supplied brief lists several pages (news, gallery, instructors); these currently use honest content placeholders rather than fabricated records.
- Add privacy policy, terms, contact channel details, sitemap/robots, analytics, and structured data once official details and consent requirements are confirmed.

## Deploy
Deploy the repository to Vercel or another Node-compatible host. Set the same environment variables in production, configure the domain and HTTPS, then test the complete registration flow using a non-public test program before opening public registration.


## Basic Super Admin dashboard (feature/admin-dashboard)

Admin pages added in this branch:
- `/admin/login` — Supabase Auth email/password login.
- `/admin` — registration and program overview.
- `/admin/registrations` — latest 200 registrations (read-only).
- `/admin/programs` — program catalog overview (read-only).

### Enable the first Super Admin
1. Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and the server-only `SUPABASE_SECRET_KEY` in the deployment environment. Use the values in `.env.example` for the first two; obtain the Secret key from Supabase Project Settings > API Keys.
2. In Supabase Authentication, create the administrator user with email/password.
3. In the Supabase SQL Editor, assign the role to that exact Auth user (replace the email):
   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"super_admin"}'::jsonb
   where email = 'admin@yourdomain.com';
   ```
4. Deploy this branch, then visit `/admin/login`. The session cookie is HTTP-only, Secure in production, SameSite=Lax, and limited to one hour. Sign in again after expiry.
5. Keep the Secret/service-role key server-only. Never expose it in browser code or commit its value to Git.

The dashboard checks the authenticated user's server-side Supabase `app_metadata.role` before rendering protected pages. Registration and program tables are queried server-side using the existing service-role client. This first iteration is intentionally read-only for registrations and programs; no destructive CRUD or status mutations are exposed yet.


## Online Attendance (Teacher & Admin)

Routes:
- /teacher/login — teacher email/password sign-in.
- /teacher/attendance — check-in and check-out with GPS geofencing.
- /admin/attendance — attendance dashboard and latest records.
- /admin/teachers — create teacher accounts and manage teacher identities.
- /admin/attendance/settings — capture and verify the institution geofence center.

Database migration: supabase/migrations/002_online_attendance.sql.

### Activate attendance

1. Apply supabase/migrations/002_online_attendance.sql to the Supabase project configured in .env.local.
2. Confirm deployment has NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, and server-only SUPABASE_SECRET_KEY.
3. Sign in to /admin using a Super Admin account.
4. Open /admin/attendance/settings while physically at the current Hem's Institute workplace. Allow browser location and select "Ambil dan Simpan Lokasi Saat Ini". The system only enables check-in after this location has been verified.
5. Open /admin/teachers to create a teacher account. Share the teacher login details securely.
6. Teachers sign in at /teacher/login and allow location access when checking in or out.

The geofence radius is 50 meters. GPS readings with accuracy worse than 50 meters are rejected. Each teacher can check in once and check out once per local date (Asia/Jakarta). Timestamps are generated on the server.

### Security

- Teacher roles are stored in Supabase app_metadata, not user-editable user_metadata.
- Attendance tables have RLS enabled and revoke direct anon/authenticated table grants. The application accesses them only through authenticated server routes using the server-only Supabase Secret key.
- The Secret/service-role key must never be exposed to browser code or committed.
- GPS geofencing validates browser-provided coordinates and accuracy; it is not tamper-proof against device location spoofing. Use it as an attendance control, not as cryptographic proof of physical presence.
- Location is requested only when a user presses an attendance button; the app does not continuously track teachers.
