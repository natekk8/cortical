import { writeFileSync } from "fs";

// Note: Replit secrets SUPABASE_URL and SUPABASE_ANON_KEY
// Check both possibilities since users sometimes mix them up
let supabaseUrl = process.env.SUPABASE_URL || "";
let supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

// Auto-detect swap: URL should start with https:// and contain .supabase.co
// AnonKey is a JWT (starts with eyJ)
if (supabaseUrl.startsWith("eyJ") && supabaseAnonKey.startsWith("https://")) {
  // They are swapped, fix it
  [supabaseUrl, supabaseAnonKey] = [supabaseAnonKey, supabaseUrl];
  console.log("ℹ️  Auto-corrected swapped SUPABASE_URL and SUPABASE_ANON_KEY");
}

const content = `VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseAnonKey}
`;

writeFileSync(new URL(".env.local", import.meta.url), content);
console.log(`✓ Generated .env.local — URL: ${supabaseUrl.substring(0, 30)}...`);
