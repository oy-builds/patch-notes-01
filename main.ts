// Real-Life Patch Notes — entry writer (program/v1).
// Writes the one-line patch note to /output/entry.txt (or $MAKEFUN_OUTPUT_DIR).

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Fallback copy of the entry, used only if entry.txt is missing at runtime.
const FALLBACK_ENTRY =
  "v2.2.0: Fixed an off-by-one error where the bladder reported 'empty' at departure and 'urgent' nine minutes into every car ride.";

function loadEntry(): string {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  try {
    const fromFile = readFileSync(join(scriptDir, "entry.txt"), "utf8").trim();
    return fromFile.length > 0 ? fromFile : FALLBACK_ENTRY;
  } catch {
    return FALLBACK_ENTRY;
  }
}

// The gate accepts a single line of 1..160 characters, not only whitespace.
// Fail loudly here instead of writing an entry that can never be judged.
function assertGateValid(text: string): void {
  if (text.length < 1 || text.length > 160) {
    throw new Error(`entry must be 1..160 characters, got ${text.length}`);
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
}

const entry = loadEntry();
assertGateValid(entry);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, entry, "utf8");

// Read back what actually landed on disk; a silent partial write would
// otherwise surface only as a failed gate in the grader's sandbox.
const onDisk = readFileSync(outPath, "utf8");
if (onDisk !== entry) {
  throw new Error(`write verification failed: ${outPath} does not match the entry`);
}
