import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://owktquehybemngkwhzzz.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93a3RxdWVoeWJlbW5na3doenp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4MTQzNTIsImV4cCI6MjEwMjM5MDM1Mn0.nlqb28A9BHukIMkLZdEcHrEPzGWEBX4Tbo2nWgOyHaY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
