
import { createClient } from "@supabase/supabase-js";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const officials = [
  "nabeelbaiju5566@gmail.com",
  "nabeelbs5566@gmail.com",
];

const rl = createInterface({ input: stdin, output: stdout });

try {
  if (
    !process.env.SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error("Missing Supabase admin environment variables.");
  }

  const password = await rl.question(
    "Enter a new temporary password (minimum 8 characters): "
  );

  if (password.length < 8) {
    throw new Error("Password must contain at least 8 characters.");
  }

  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) throw error;

  for (const email of officials) {
    const user = data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      console.log(`Account not found: ${email}`);
      continue;
    }

    const { error: updateError } =
      await supabase.auth.admin.updateUserById(user.id, {
        password,
      });

    if (updateError) {
      console.log(`Failed: ${email} — ${updateError.message}`);
    } else {
      console.log(`Password updated successfully: ${email}`);
    }
  }
} catch (error) {
  console.error("Error:", error.message);
} finally {
  rl.close();
}
