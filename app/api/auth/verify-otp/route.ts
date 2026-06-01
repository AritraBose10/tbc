import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, AUTH_COOKIE } from "@/lib/auth";
import { verifyOtp } from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const session = await prisma.otpSession.findFirst({
      where: { email: normalizedEmail },
      orderBy: { createdAt: "desc" },
    });

    if (!session) {
      return NextResponse.json({ error: "No OTP found. Please request a new one." }, { status: 400 });
    }

    if (new Date() > session.expiresAt) {
      await prisma.otpSession.delete({ where: { id: session.id } });
      return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    if (session.attempts >= 3) {
      await prisma.otpSession.delete({ where: { id: session.id } });
      // Block new OTP requests for 5 minutes after exhausting attempts
      const cooldownEnds = new Date(Date.now() + 5 * 60 * 1000);
      await prisma.rateLimit.upsert({
        where:  { key: `otp:cooldown:${normalizedEmail}` },
        create: { key: `otp:cooldown:${normalizedEmail}`, count: 1, resetAt: cooldownEnds },
        update: { count: 1, resetAt: cooldownEnds },
      });
      return NextResponse.json({ error: "Too many incorrect attempts. Please wait 5 minutes before requesting a new OTP." }, { status: 429 });
    }

    if (!verifyOtp(otp.trim(), session.otp)) {
      await prisma.otpSession.update({
        where: { id: session.id },
        data: { attempts: session.attempts + 1 },
      });
      const remaining = 3 - (session.attempts + 1);
      if (remaining === 0) {
        await prisma.otpSession.delete({ where: { id: session.id } });
        const cooldownEnds = new Date(Date.now() + 5 * 60 * 1000);
        await prisma.rateLimit.upsert({
          where:  { key: `otp:cooldown:${normalizedEmail}` },
          create: { key: `otp:cooldown:${normalizedEmail}`, count: 1, resetAt: cooldownEnds },
          update: { count: 1, resetAt: cooldownEnds },
        });
        return NextResponse.json(
          { error: "Too many incorrect attempts. Please wait 5 minutes before requesting a new OTP." },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: `Incorrect OTP. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.` },
        { status: 400 }
      );
    }

    // OTP is valid — clean up session
    await prisma.otpSession.delete({ where: { id: session.id } });

    // Upsert user
    const user = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {},
      create: { email: normalizedEmail },
    });

    const token = await signToken({ userId: user.id, email: user.email });

    const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, phone: user.phone } });
    res.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return res;
  } catch (err) {
    console.error("[verify-otp]", err);
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
  }
}
