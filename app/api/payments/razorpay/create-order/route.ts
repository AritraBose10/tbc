import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";
import { getAuthUserFromRequest } from "@/lib/auth";

interface InboundAddon {
  petpoojaId: string;
  name: string;
  price: number;
}

interface InboundItem {
  petpoojaId: string;
  name: string;
  price: number;
  quantity: number;
  variantId?: string;
  addons?: InboundAddon[];
}

interface CreateOrderRequest {
  items: InboundItem[];
  discount?: number;
  packingCharges?: number;
}

export async function POST(req: NextRequest) {
  const authUser = await getAuthUserFromRequest(req);
  if (!authUser) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateOrderRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.items?.length) {
    return NextResponse.json({ success: false, error: "items is required" }, { status: 400 });
  }

  // Order cap check: max 3 items
  const totalQty = body.items.reduce((s, i) => s + i.quantity, 0);
  if (totalQty > 3) {
    return NextResponse.json(
      { success: false, error: "Orders are limited to 3 items per person." },
      { status: 400 }
    );
  }

  // Store open check
  const storeConfig = await prisma.petpoojaConfig.findUnique({ where: { key: "storeOpen" } });
  if (storeConfig?.value !== "1") {
    return NextResponse.json(
      { success: false, error: "Store is currently closed. Please try again later." },
      { status: 400 }
    );
  }

  // 1. Fetch item prices and details
  const inboundIds = body.items.map((i) => i.petpoojaId);
  const [knownItems, knownVariants] = await Promise.all([
    prisma.menuItem.findMany({
      where: { petpoojaId: { in: inboundIds } },
      select: { petpoojaId: true, price: true },
    }),
    prisma.menuVariant.findMany({
      where: { petpoojaId: { in: inboundIds } },
      select: { petpoojaId: true, variationId: true, price: true, itemPetpoojaId: true },
    }),
  ]);

  const knownIds = new Set([
    ...knownItems.map((r) => r.petpoojaId),
    ...knownVariants.map((r) => r.petpoojaId),
  ]);

  const unknownIds = inboundIds.filter((id) => !knownIds.has(id));
  if (unknownIds.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error: "Your cart contains stale items that are no longer in the menu. Please clear your cart.",
      },
      { status: 400 }
    );
  }

  const itemPriceMap = new Map(knownItems.map((r) => [r.petpoojaId, r.price]));
  const variantMap = new Map(knownVariants.map((r) => [r.petpoojaId, r]));
  const variantIdSet = new Set(knownVariants.map((r) => r.petpoojaId));

  // 2. Fetch addon prices and details
  const allAddonIds = body.items.flatMap((i) => (i.addons ?? []).map((a) => a.petpoojaId));
  const knownAddons = allAddonIds.length > 0
    ? await prisma.menuAddon.findMany({
        where: { petpoojaId: { in: allAddonIds } },
        select: { petpoojaId: true, price: true },
      })
    : [];
  const addonDbMap = new Map(knownAddons.map((a) => [a.petpoojaId, a]));

  const unknownAddonIds = allAddonIds.filter((id) => !addonDbMap.has(id));
  if (unknownAddonIds.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error: "Your cart contains stale add-ons that are no longer available. Please clear your cart.",
      },
      { status: 400 }
    );
  }

  // 3. Fetch tax configurations
  const taxRows = await prisma.taxConfig.findMany();
  const totalTaxRate = taxRows.reduce((s, t) => s + t.percentage, 0);

  // 4. Calculate prices
  let subtotal = 0;
  for (const item of body.items) {
    let unitPrice = itemPriceMap.get(item.petpoojaId) ?? item.price;
    if (variantIdSet.has(item.petpoojaId)) {
      const variant = variantMap.get(item.petpoojaId);
      if (variant) {
        unitPrice = variant.price;
      }
    }

    const addonUnitTotal = (item.addons ?? []).reduce((s, a) => {
      const dbAddon = addonDbMap.get(a.petpoojaId);
      return s + (dbAddon?.price ?? a.price);
    }, 0);

    const effectiveUnit = unitPrice + addonUnitTotal;
    const lineTotal = effectiveUnit * item.quantity;
    subtotal += lineTotal;
  }

  const discount = body.discount ?? 0;
  const packingCharges = body.packingCharges ?? 0;
  const taxableAmount = subtotal - discount;

  const taxTotal = parseFloat((taxableAmount * (totalTaxRate / 100)).toFixed(2));
  const total = parseFloat((taxableAmount + taxTotal + packingCharges).toFixed(2));

  // 5. Initialize Razorpay and create order
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error("Razorpay credentials not configured properly in server environment.");
    return NextResponse.json(
      { success: false, error: "Payment gateway configuration error on the server" },
      { status: 500 }
    );
  }

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  const amountInPaise = Math.round(total * 100);

  try {
    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    return NextResponse.json({
      success: true,
      razorpayOrderId: rzpOrder.id,
      amount: amountInPaise,
      currency: "INR",
    });
  } catch (error) {
    const rzpErr = error as { statusCode?: number; error?: { code?: string; description?: string; reason?: string } };
    console.error("Razorpay order creation failed:", JSON.stringify({
      statusCode: rzpErr?.statusCode,
      code: rzpErr?.error?.code,
      description: rzpErr?.error?.description,
      reason: rzpErr?.error?.reason,
      raw: String(error),
    }));
    return NextResponse.json(
      { success: false, error: "Failed to create payment gateway order" },
      { status: 500 }
    );
  }
}
