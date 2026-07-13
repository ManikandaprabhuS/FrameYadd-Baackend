import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY!;

const getJwtPayload = (token: string) => {
  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return {};
    }
    const decoded = Buffer.from(payload, "base64url").toString("utf8");
    return JSON.parse(decoded) as { role?: string };
  } catch {
    return {};
  }
};

const supabaseKeyRole = getJwtPayload(supabaseServiceRoleKey).role;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error("SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are required");
}

if (supabaseKeyRole !== "service_role") {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY must be the Supabase service_role key. The anon key cannot upload product media because Supabase Storage RLS rejects it."
  );
}

const clientOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
};

export const supabaseAuth = createClient(
  supabaseUrl,
  supabaseAnonKey,
  clientOptions
);

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  clientOptions
);

export const supabase = supabaseAdmin;
