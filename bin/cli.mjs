#!/usr/bin/env node

import { spawn } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync, mkdirSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const port = process.env.PORT || 3000;

// Ensure data directory exists for SQLite
const dataDir = resolve(root, "data");
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

console.log(`
  ╔═══════════════════════════════════════════╗
  ║            SysAgent v0.1.0                ║
  ║    AI System Design Interview Coach       ║
  ║                                           ║
  ║  Bring your own API key. Practice free.   ║
  ╚═══════════════════════════════════════════╝
`);

console.log("  Starting server...");
console.log(`  Dashboard: http://localhost:${port}`);
console.log(`  Settings:  http://localhost:${port}/settings`);
console.log("");

const child = spawn("npx", ["next", "dev", "--port", String(port)], {
  cwd: root,
  stdio: "inherit",
  shell: true,
  env: { ...process.env },
});

// Open browser after server is likely ready
setTimeout(async () => {
  try {
    const open = await import("open");
    await open.default(`http://localhost:${port}`);
  } catch {
    console.log(`  Open http://localhost:${port} in your browser\n`);
  }
}, 3500);

process.on("SIGINT", () => {
  child.kill("SIGINT");
  process.exit(0);
});

process.on("SIGTERM", () => {
  child.kill("SIGTERM");
  process.exit(0);
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
