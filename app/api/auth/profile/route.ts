import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone } = await req.json();

    const data: { name?: string; phone?: string } = {};
    if (typeof name === "string") data.name = name.trim().slice(0, 80);
    if (typeof phone === "string") {
      const cleaned = phone.replace(/\D/g, "");
      if (cleaned && !/^\d{10}$/.test(cleaned)) {
        return NextResponse.json({ error: "Phone must be a 10-digit number" }, { status: 400 });
      }
      data.phone = cleaned;
    }

    const user = await prisma.user.update({
      where: { id: auth.userId },
      data,
    });

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, phone: user.phone } });
  } catch (err) {
    console.error("[auth/profile]", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
