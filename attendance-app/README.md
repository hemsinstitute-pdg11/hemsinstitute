# Hem's Institute Online Attendance — Standalone App

Standalone Next.js app deployed independently from the public Hem's Institute website. It reuses the existing Hem's Institute Supabase project and the existing attendance_teachers, attendance_settings, and attendance_records tables.

## Routes
- / — portal selector
- /teacher/login — teacher sign-in
- /teacher — teacher attendance dashboard
- /admin/login — administrator sign-in
- /admin — admin dashboard, teacher management, attendance history, geofence setup

## Database
Apply supabase/migrations/003_attendance_admins.sql to the Hem's Institute Supabase project.

## Environment variables
Set in Vercel:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SECRET_KEY (server-only)
- ATTENDANCE_BOOTSTRAP_SECRET (one-time admin setup secret)

## First admin
After deploying and applying migration, create a long random bootstrap secret in Vercel environment variables. Send one POST request to /api/admin/bootstrap with header x-bootstrap-secret and JSON body containing fullName, email, and password (minimum 12 characters). This endpoint refuses to create another initial admin once an admin profile exists. Remove ATTENDANCE_BOOTSTRAP_SECRET from the Vercel project after creating the first admin, then redeploy.

## Setup
1. Apply migration 003.
2. Configure all environment variables in the standalone Vercel project.
3. Create the first admin using the one-time bootstrap endpoint.
4. Sign in at /admin/login.
5. While physically at the institution, capture and verify the location in the admin dashboard. GPS accuracy must be 50m or better.
6. Create teacher accounts and distribute credentials securely.
7. Teachers sign in at /teacher/login. Check-in/out require GPS within 50m of the saved center and GPS accuracy of 50m or better.

Timestamps are generated server-side. Work dates use Asia/Jakarta. Location is requested only when a user performs a location-dependent action; there is no continuous location tracking.

## Geofence limitation
Browser GPS coordinates can be spoofed on compromised devices. Geofencing is a location-based attendance control, not cryptographic proof of physical presence.
