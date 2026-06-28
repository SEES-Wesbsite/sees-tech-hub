import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');

const env: Record<string, string> = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing env vars NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function reset() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx tsx dev-utils/reset-onboarding.ts <user-email>");
    process.exit(1);
  }

  console.log(`Locating user with email: ${email}`);

  // Need to get user id from auth.users, but we only have public.users via standard select. 
  // Let's just find them by email in auth.users if we use the admin API
  const { data: users, error: uError } = await supabase.auth.admin.listUsers();
  if (uError) {
    console.error("Failed to list users:", uError);
    return;
  }

  const user = users.users.find(u => u.email === email);
  if (!user) {
    console.error(`User with email ${email} not found.`);
    return;
  }

  console.log(`Found User ID: ${user.id}. Resetting Onboarding Status...`);

  // 1. Wipe their quiz sessions
  await supabase.from('quiz_sessions').delete().eq('user_id', user.id);

  // 2. Wipe their point transactions from placement
  await supabase.from('point_transactions').delete().eq('user_id', user.id).eq('reason', 'Onboarding Placement Bonus');

  // 3. Reset onboarding status
  const { error } = await supabase.from('users').update({ onboarding_status: 'pending' }).eq('id', user.id);

  if (error) {
    console.error("Failed to reset onboarding status:", error);
  } else {
    console.log("SUCCESS! Your onboarding trial has been fully reset. You can now refresh your browser and start from the Persona Setup again.");
  }
}

reset();
