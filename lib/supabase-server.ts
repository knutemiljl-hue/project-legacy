import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseAnonKey && !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase server key");
}

const supabaseServerKey = supabaseServiceRoleKey ?? supabaseAnonKey;

if (!supabaseServerKey) {
  throw new Error("Missing Supabase server key");
}

export const supabaseServer = createClient(
  supabaseUrl,
  supabaseServerKey,
  {
    auth: {
      persistSession: false,
    },
  }
);
