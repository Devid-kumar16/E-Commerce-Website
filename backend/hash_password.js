// hash_password.js
// Usage examples:
//   node hash_password.js --password "Password123!"
//   node hash_password.js password="Password123!"
//   node hash_password.js "Password123!"
// If no password provided, the script will prompt you (stdin).

import bcrypt from "bcryptjs";
import readline from "readline";

// simple arg parsing (supports --password, password=, or first positional)
function getPasswordFromArgs(argv) {
  for (let i = 2; i < argv.length; i++) {
    const t = argv[i];
    if (t.startsWith("--password=")) return t.slice("--password=".length);
    if (t === "--password" && argv[i + 1]) return argv[++i];
    if (t.includes("=")) {
      const [k, ...rest] = t.split("=");
      if (k === "password") return rest.join("=");
    }
    // first positional
    if (!t.startsWith("-")) return t;
  }
  return null;
}

async function promptPassword(promptText = "Enter password: ") {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(promptText, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 12);

  let password = getPasswordFromArgs(process.argv);
  if (!password) {
    // prompt (useful if you don't want password in shell history)
    password = await promptPassword();
    if (!password) {
      console.error("No password provided. Exiting.");
      process.exit(2);
    }
  }

  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    console.log("BCRYPT_HASH:", hash);
    // For safety, do NOT print the raw password by default.
    if (process.argv.includes("--show-password")) {
      console.log("PLAINTEXT_PASSWORD:", password);
    }
    process.exit(0);
  } catch (err) {
    console.error("Hashing error:", err && err.stack ? err.stack : err);
    process.exit(1);
  }
}

main();
