import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function globalSetup(): Promise<void> {
  const backendRoot = path.resolve(__dirname, "..");
  const testDbPath = path.join(backendRoot, "prisma", "test.db");

  if (fs.existsSync(testDbPath)) {
    fs.rmSync(testDbPath, { force: true });
  }

  execSync("npx prisma db push --force-reset", {
    cwd: backendRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: "file:./prisma/test.db",
    },
  });
}
