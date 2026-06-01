import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email";
import { hashOtp } from "@/lib/otp";
import { checkRateLimit } from "@/lib/rate-limit";

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const ip = getClientIp(req);

    // IP rate limit: 10 requests per 15 minutes across all emails from same IP
    const ipCheck = await checkRateLimit(
      `otp:ip:${ip}`,
      10,
      15 * 60 * 1000
    );
    if (!ipCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests from this device. Please try again later." },
        { status: 429 }
      );
    }

    // Email rate limit: 3 OTPs per 15 minutes for this email address
    const emailCheck = await checkRateLimit(
      `otp:email:${normalizedEmail}`,
      3,
      15 * 60 * 1000
    );
    if (!emailCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests for this email. Please wait 15 minutes." },
        { status: 429 }
      );
    }

    // Cooldown after exhausting OTP attempts — blocks re-request for 5 minutes
    const cooldown = await prisma.rateLimit.findUnique({
      where: { key: `otp:cooldown:${normalizedEmail}` },
    });
    if (cooldown && cooldown.resetAt > new Date()) {
      const secsLeft = Math.ceil((cooldown.resetAt.getTime() - Date.now()) / 1000);
      const minsLeft = Math.ceil(secsLeft / 60);
      return NextResponse.json(
        { error: `Too many failed attempts. Please wait ${minsLeft} minute${minsLeft === 1 ? "" : "s"} before requesting a new OTP.` },
        { status: 429 }
      );
    }

    // Invalidate any existing OTP session for this email
    await prisma.otpSession.deleteMany({ where: { email: normalizedEmail } });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.otpSession.create({
      data: { email: normalizedEmail, otp: hashOtp(otp), expiresAt },
    });

    await sendOtpEmail(normalizedEmail, otp);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[send-otp]", err);
    return NextResponse.json({ error: "Failed to send OTP. Please try again." }, { status: 500 });
  }
}
