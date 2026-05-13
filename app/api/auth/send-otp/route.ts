import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email";

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Rate limit: max 3 OTP requests per 15 minutes
    const since = new Date(Date.now() - 15 * 60 * 1000);
    const recentCount = await prisma.otpSession.count({
      where: { email: normalizedEmail, createdAt: { gte: since } },
    });
    if (recentCount >= 3) {
      return NextResponse.json(
        { error: "Too many requests. Please wait 15 minutes before trying again." },
        { status: 429 }
      );
    }

    // Delete old OTP sessions for this email
    await prisma.otpSession.deleteMany({ where: { email: normalizedEmail } });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.otpSession.create({
      data: { email: normalizedEmail, otp, expiresAt },
    });

    await sendOtpEmail(normalizedEmail, otp);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[send-otp]", err);
    return NextResponse.json({ error: "Failed to send OTP. Please try again." }, { status: 500 });
  }
}
