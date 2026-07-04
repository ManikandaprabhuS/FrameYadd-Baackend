import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
//const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log("SUPABASE_URL =", process.env.SUPABASE_URL);

console.log(
  "SERVICE KEY EXISTS:",
  !!process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
);