import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import EmbeddedPostgres from "embedded-postgres";

const databaseDir = path.join(process.cwd(), "data", "pg");
const pg = new EmbeddedPostgres({
  databaseDir,
  user: "postgres",
  password: "nexora",
  port: 5432,
  persistent: true,
  onLog: () => {},
  onError: (message) => {
    const text = String(message ?? "").trim();
    if (text) console.error(`[postgres] ${text}`);
  },
});

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", shell: true, env: process.env });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

async function ensureDatabase() {
  if (!fs.existsSync(path.join(databaseDir, "PG_VERSION"))) {
    console.log("Initializing a local PostgreSQL data directory...");
    await pg.initialise();
  }
  console.log("Starting PostgreSQL on 127.0.0.1:5432...");
  try {
    await pg.start();
  } catch (error) {
    const message = String(error);
    if (!/already running|already started/i.test(message)) throw error;
  }
  try {
    await pg.createDatabase("nexora");
    console.log("Created the nexora database.");
  } catch (error) {
    const message = String(error);
    if (!/already exists/i.test(message)) throw error;
  }
}

async function shutdown(code = 0) {
  await pg.stop().catch(() => undefined);
  process.exit(code);
}

await ensureDatabase();
await run("npx", ["prisma", "generate"]);
await run("npx", ["prisma", "migrate", "deploy"]);
await run("npx", ["tsx", "prisma/seed.ts"]);

const next = spawn("npx", ["next", "dev"], { stdio: "inherit", shell: true, env: process.env });
next.on("exit", (code) => {
  shutdown(code ?? 0);
});

process.on("SIGINT", () => {
  next.kill();
});
process.on("SIGTERM", () => {
  next.kill();
});
