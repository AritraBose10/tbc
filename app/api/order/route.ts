// ---------------------------------------------------------------------------
// POST /api/order
// ---------------------------------------------------------------------------
// Receives the cart from the frontend, maps it to a Petpooja Save Order
// payload, and relays it via the existing saveOrder() service.
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveOrder, type InputOrderItem, type InputTaxDetail } from '@/services/petpooja/save-order';

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

interface OrderRequest {
  customer: {
    name: string;
    address: string;
    mobile: string;
    email?: string;
    latitude?: string;
    longitude?: string;
  };
  items: InboundItem[];
  paymentType: 'COD' | 'CARD' | 'ONLINE';
  orderType: 'H' | 'P' | 'D';
  discount?: number;
  packingCharges?: number;
}

export async function POST(req: NextRequest) {
  let body: OrderRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.customer?.name || !body.customer?.mobile || !body.items?.length) {
    return NextResponse.json(
      { success: false, error: 'customer.name, customer.mobile, and at least one item are required' },
      { status: 400 },
    );
  }

  // ── Validate all item IDs exist in MenuItem OR MenuVariant ───────────────
  // Variant-only items are added to the cart using the variant's petpoojaId
  // (not the parent item ID), so we must check both tables.
  // We also fetch names here so the Petpooja payload uses DB-authoritative names
  // rather than client-supplied names (which may include suffixes like "(Small)"
  // or special characters like double-quotes that trip Petpooja's parser).
  const inboundIds = body.items.map((i) => i.petpoojaId);
  const [knownItems, knownVariants] = await Promise.all([
    prisma.menuItem.findMany({
      where: { petpoojaId: { in: inboundIds } },
      select: { petpoojaId: true, name: true },
    }),
    prisma.menuVariant.findMany({
      where: { petpoojaId: { in: inboundIds } },
      select: { petpoojaId: true, name: true, item: { select: { name: true } } },
    }),
  ]);
  const knownIds = new Set([
    ...knownItems.map((r) => r.petpoojaId),
    ...knownVariants.map((r) => r.petpoojaId),
  ]);

  // Name lookup maps — keys are petpoojaId values
  const itemNameMap    = new Map(knownItems.map((r) => [r.petpoojaId, r.name]));
  // For variant items send "ParentName - VariantName" (e.g. "Americano - Small")
  const variantNameMap = new Map(
    knownVariants.map((r) => [r.petpoojaId, `${r.item.name} - ${r.name}`]),
  );

  // Remove characters that can break Petpooja's JSON parser
  const sanitizeName = (s: string) => s.replace(/['"\\]/g, '').trim();
  const unknownIds = inboundIds.filter((id) => !knownIds.has(id));
  if (unknownIds.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error:
          'Your cart contains stale items that are no longer in the menu. ' +
          'Please clear your cart and re-add items from the menu.',
      },
      { status: 400 },
    );
  }

  // ── Fetch taxes from DB ────────────────────────────────────────────────────
  const taxRows = await prisma.taxConfig.findMany();
  // Sum all tax percentages (SGST 2.5% + CGST 2.5% = 5%)
  const totalTaxRate = taxRows.reduce((s, t) => s + t.percentage, 0);

  // ── Build Petpooja items ───────────────────────────────────────────────────
  const petpoojaItems: InputOrderItem[] = [];

  // Build a set of variant IDs for O(1) lookup below
  const variantIdSet = new Set(knownVariants.map((r) => r.petpoojaId));

  for (const item of body.items) {
    let itemId    = item.petpoojaId;
    let unitPrice = item.price;

    // If the cart item's id is already a variant petpoojaId (variant-only items
    // added via the size picker), look up the variant's canonical price from DB
    // so the payload is authoritative even if the client sent the wrong price.
    if (variantIdSet.has(item.petpoojaId)) {
      const variant = await prisma.menuVariant.findUnique({
        where: { petpoojaId: item.petpoojaId },
      });
      if (variant) {
        itemId    = variant.petpoojaId;
        unitPrice = variant.price;
      }
    }

    // Addons add to the unit price
    const addonUnitTotal = (item.addons ?? []).reduce((s, a) => s + a.price, 0);
    const effectiveUnit  = unitPrice + addonUnitTotal;
    const lineTotal      = effectiveUnit * item.quantity;
    const itemTax        = parseFloat((lineTotal * (totalTaxRate / 100)).toFixed(2));

    const dbName = variantIdSet.has(item.petpoojaId)
      ? (variantNameMap.get(item.petpoojaId) ?? item.name)
      : (itemNameMap.get(item.petpoojaId)    ?? item.name);

    const itemTaxDetails = taxRows.map((tax) => ({
      id: tax.petpoojaId,
      title: tax.title,
      type: tax.type === 'flat' ? 'F' : 'P',
      price: tax.percentage,
      tax: parseFloat((lineTotal * (tax.percentage / 100)).toFixed(2)),
      restaurant_liable_amt: parseFloat((lineTotal * (tax.percentage / 100)).toFixed(2)),
    }));

    petpoojaItems.push({
      id:             itemId,
      name:           sanitizeName(dbName),
      price:          effectiveUnit,
      final_price:    lineTotal,
      quantity:       item.quantity,
      gst_liability:  'restaurant',
      item_tax:       itemTaxDetails,
      tax_inclusive:  0,
      tax_percentage: totalTaxRate,
      addons: (item.addons ?? []).map((a) => ({
        id:    a.petpoojaId,
        name:  a.name,
        price: a.price,
      })),
    });
  }

  // ── Totals ─────────────────────────────────────────────────────────────────
  const subtotal       = petpoojaItems.reduce((s, i) => s + i.final_price, 0);
  const discount       = body.discount       ?? 0;
  const packingCharges = body.packingCharges  ?? 0;
  const taxTotal       = petpoojaItems.reduce((s, i) => s + i.item_tax.reduce((ts: number, td: any) => ts + td.tax, 0), 0);
  // Petpooja total = subtotal + GST (restaurant-liable) + packing − discount
  // ⚠️ Do NOT include delivery charges
  const total = parseFloat((subtotal + taxTotal - discount + packingCharges).toFixed(2));

  // ── Tax details (one row per tax config entry) ────────────────────────────
  const taxDetails: InputTaxDetail[] = taxRows.map((tax) => ({
    id:                  tax.petpoojaId,
    title:               tax.title,
    type:                tax.type === 'flat' ? 'F' : 'P',
    price:               tax.percentage,
    tax:                 parseFloat((subtotal * (tax.percentage / 100)).toFixed(2)),
    restaurant_liable_amt: parseFloat((subtotal * (tax.percentage / 100)).toFixed(2)),
  }));

  const isTakeaway = body.orderType === 'P';
  
  // Generate a 4-digit token
  const tokenNumber = Math.floor(1000 + Math.random() * 9000).toString();
  
  // Create a short, daily-unique order ID (e.g., T17-4829 or D17-4829)
  const day = new Date().getDate();
  const prefix = isTakeaway ? `T${day}` : `D${day}`;
  const orderID = `${prefix}-${tokenNumber}`;

  // Persist order in our local database first
  await prisma.order.create({
    data: {
      id: orderID,
      customerName: body.customer.name,
      customerPhone: body.customer.mobile,
      customerAddress: body.customer.address,
      totalAmount: total,
      orderType: body.orderType,
      tokenNumber: isTakeaway ? tokenNumber : null,
      items: {
        create: petpoojaItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
  });

  // ── Call saveOrder service ─────────────────────────────────────────────────
  const result = await saveOrder({
    orderID,
    orderType:      body.orderType,
    total,
    taxTotal:       parseFloat(taxTotal.toFixed(2)),
    discountTotal:  discount,
    discountType:   'F',
    packingCharges:  packingCharges,
    deliveryCharges: 0,
    dcTaxPercentage: 0,
    pcTaxPercentage: 0,
    paymentType:    body.paymentType,
    enableDelivery: 0,   // third-party (us) manages delivery
    customer: {
      name:      body.customer.name,
      address:   body.customer.address,
      mobile:    body.customer.mobile,
      email:     body.customer.email     ?? '',
      latitude:  body.customer.latitude  ?? '',
      longitude: body.customer.longitude ?? '',
    },
    callbackUrl: process.env.PETPOOJA_CALLBACK_URL ?? '',
    items:       petpoojaItems,
    taxDetails,
  });

  // HTTP-level failure (network error, 4xx/5xx from Petpooja)
  if (!result.success) {
    console.error('[order] saveOrder failed:', result.error);
    return NextResponse.json(
      { success: false, error: result.error, detail: result.petpoojaBody },
      { status: 400 },
    );
  }

  // Petpooja-level failure: HTTP 200 but success !== "1"
  // Petpooja uses "status" in some responses and "success" in others
  const pp = result.response as Record<string, unknown>;
  const petpoojaOk = pp.status === '1' || pp.success === '1';
  if (!petpoojaOk) {
    console.error('[order] Petpooja rejected order:', pp);
    return NextResponse.json(
      { success: false, error: String(pp.message ?? 'Petpooja rejected the order'), detail: pp },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    orderId: orderID,
    petpoojaOrderId: pp.orderID ?? null,
  });
}
