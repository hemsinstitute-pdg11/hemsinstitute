# Hem's Institute Official Website

Next.js App Router, TypeScript, Tailwind CSS, Supabase/PostgreSQL, and Zod.

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
