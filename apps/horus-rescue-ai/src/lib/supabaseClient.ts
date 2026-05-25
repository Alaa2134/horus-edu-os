// ===================================================================
// Horus Rescue AI — Supabase-ready client (OPTIONAL)
// -------------------------------------------------------------------
// The app runs fully offline using an in-memory mock store. If you add
// the @supabase/supabase-js package and provide the env vars below, you
// can swap the mock service for real persistence without touching the
// UI layer — the service interface in mockApi.ts is the contract.
//
//   VITE_SUPABASE_URL=...
//   VITE_SUPABASE_ANON_KEY=...
//
// Schema lives in /supabase/schema.sql.
// ===================================================================

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as
  | string
  | undefined;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY,
);

/**
 * Lazily create a Supabase client only if the optional dependency is
 * installed AND env vars are present. Returns null otherwise so the app
 * transparently falls back to the offline mock store.
 */
export async function getSupabaseClient(): Promise<unknown | null> {
  if (!isSupabaseConfigured) return null;
  try {
    // Variable specifier keeps the optional dependency out of the type graph
    // and out of Vite's bundle until it is actually installed.
    const pkg = "@supabase/supabase-js";
    const mod: { createClient?: (url: string, key: string) => unknown } | null =
      await import(/* @vite-ignore */ pkg).catch(() => null);
    if (!mod?.createClient) return null;
    return mod.createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string);
  } catch {
    return null;
  }
}
