// The database function allocates the sequence atomically to prevent collisions.
export async function createRegistration(supabase: ReturnType<typeof import("@/lib/supabase-server").getSupabaseAdmin>, input: Record<string, unknown>) {
  return supabase.rpc("create_registration", { payload: input });
}
