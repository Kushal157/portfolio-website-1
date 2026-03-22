const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log("Testing auth...");
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'port2026@admin.com',
      password: 'Resume2026',
    });
    console.log("Sign in result:", { data, error });
  } catch (e) {
    console.log("Sign in exception:", e.message);
  }
}

testAuth();