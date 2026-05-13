import crypto from "crypto";

// Low-cost scrypt params: fast enough for API routes (~2 ms),
// but makes brute-forcing all 1 M possible 6-digit OTPs take ~30 min.
const PARAMS = { N: 1024, r: 8, p: 1 };

export function hashOtp(otp: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(otp, salt, 32, PARAMS).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyOtp(candidate: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const computed = crypto.scryptSync(candidate, salt, 32, PARAMS).toString("hex");
  // Constant-time comparison prevents timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(computed, "hex"),
    Buffer.from(hash, "hex")
  );
}
