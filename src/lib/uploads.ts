import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const MAX_BYTES = 5 * 1024 * 1024;

const HEIC_TYPES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);

// Major brands used by iPhone HEIC/HEIF. AVIF shares the HEIF container but
// uses avif/avis, which sharp already decodes.
const HEIC_BRANDS = new Set(["heic", "heix", "hevc", "hevx", "mif1", "msf1"]);

function isHeic(file: File, bytes: Buffer) {
  if (bytes.length >= 12 && bytes.toString("ascii", 4, 8) === "ftyp") {
    const brand = bytes.toString("ascii", 8, 12).replaceAll("\0", "").trim();
    if (brand === "avif" || brand === "avis") return false;
    if (HEIC_BRANDS.has(brand)) return true;
  }

  const type = file.type.toLowerCase();
  if (HEIC_TYPES.has(type)) return true;
  const name = file.name.toLowerCase();
  return name.endsWith(".heic") || name.endsWith(".heif");
}

async function heicToPng(bytes: Buffer) {
  const { default: convert } = await import("heic-convert");
  const png = await convert({
    buffer: Uint8Array.from(bytes),
    format: "PNG",
  });
  return Buffer.from(png);
}

export async function saveImage(file: FormDataEntryValue | File | null) {
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > MAX_BYTES) {
    throw new Error("Each image must be 5MB or smaller.");
  }

  const original = Buffer.from(await file.arrayBuffer());
  const heic = isHeic(file, original);
  if (!heic && !file.type.startsWith("image/")) {
    throw new Error("Upload a PNG, JPG, WEBP, GIF, or HEIC image.");
  }

  let source = original;
  if (heic) {
    try {
      source = await heicToPng(original);
    } catch {
      throw new Error("That HEIC photo could not be converted. Export it as JPG and try again.");
    }
  }

  let optimized: Buffer;
  try {
    optimized = await sharp(source)
      .rotate()
      .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    throw new Error("That file could not be read as an image.");
  }

  const filename = `${Date.now()}-${randomBytes(4).toString("hex")}.webp`;
  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  await sharp(optimized).toFile(path.join(directory, filename));
  return `/uploads/${filename}`;
}

export async function removeUpload(url: string | null | undefined) {
  if (!url || !/^\/uploads\/[a-zA-Z0-9._-]+$/.test(url)) return;
  const full = path.join(process.cwd(), "public", url);
  await unlink(full).catch(() => undefined);
}
