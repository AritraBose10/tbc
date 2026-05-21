// ---------------------------------------------------------------------------
// POST /api/order
// ---------------------------------------------------------------------------
// Receives the cart from the frontend, maps it to a Petpooja Save Order
// payload, and relays it via the existing saveOrder() service.
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveOrder, type InputOrderItem, type InputTaxDetail } from '@/services/petpooja/save-order';
import { getAuthUserFromRequest } from '@/lib/auth';

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
  const authUser = await getAuthUserFromRequest(req);

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

  // ── Reject orders when store is closed ────────────────────────────────────
  const storeConfig = await prisma.petpoojaConfig.findUnique({ where: { key: 'storeOpen' } });
  if (storeConfig?.value !== '1') {
    return NextResponse.json(
      { success: false, error: 'Store is currently closed. Please try again later.' },
      { status: 400 },
    );
  }

  // ── Validate all item IDs exist in MenuItem OR MenuVariant ───────────────
  const inboundIds = body.items.map((i) => i.petpoojaId);
  const [knownItems, knownVariants] = await Promise.all([
    prisma.menuItem.findMany({
      where: { petpoojaId: { in: inboundIds } },
      select: { petpoojaId: true, name: true },
    }),
    prisma.menuVariant.findMany({
      where: { petpoojaId: { in: inboundIds } },
      select: { petpoojaId: true, variationId: true, name: true, itemPetpoojaId: true, price: true, item: { select: { name: true } } },
    }),
  ]);
  const knownIds = new Set([
    ...knownItems.map((r) => r.petpoojaId),
    ...knownVariants.map((r) => r.petpoojaId),
  ]);

  const itemNameMap = new Map(knownItems.map((r) => [r.petpoojaId, r.name]));
  // Map variantPetpoojaId → display name "ParentName - VariantName"
  const variantNameMap = new Map(
    knownVariants.map((r) => [r.petpoojaId, `${r.item.name} - ${r.name}`]),
  );
  // Map variantPetpoojaId → full variant record (for itemPetpoojaId + price)
  const variantMap = new Map(knownVariants.map((r) => [r.petpoojaId, r]));

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

  // ── Validate all addon IDs exist in MenuAddon ──────────────────────────────
  const allAddonIds = body.items.flatMap((i) => (i.addons ?? []).map((a) => a.petpoojaId));
  const knownAddons = allAddonIds.length > 0
    ? await prisma.menuAddon.findMany({
        where: { petpoojaId: { in: allAddonIds } },
        select: { petpoojaId: true, name: true, price: true, groupId: true, groupName: true },
      })
    : [];
  const addonDbMap = new Map(knownAddons.map((a) => [a.petpoojaId, a]));

  const unknownAddonIds = allAddonIds.filter((id) => !addonDbMap.has(id));
  if (unknownAddonIds.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error:
          'Your cart contains stale add-ons that are no longer available. ' +
          'Please clear your cart and re-add items from the menu.',
      },
      { status: 400 },
    );
  }

  // ── Fetch taxes from DB ────────────────────────────────────────────────────
  const taxRows = await prisma.taxConfig.findMany();
  const totalTaxRate = taxRows.reduce((s, t) => s + t.percentage, 0);

  // ── Phase 1: Build items at full price (no discount applied yet) ───────────
  const variantIdSet = new Set(knownVariants.map((r) => r.petpoojaId));

  interface RawItem {
    id: string;
    name: string;
    unitPrice: number;
    lineTotal: number;
    quantity: number;
    variationId?: string;
    variationName?: string;
    addons: Array<{ id: string; name: string; price: number; groupId: string; groupName: string }>;
  }

  const rawItems: RawItem[] = [];

  for (const item of body.items) {
    let itemId         = item.petpoojaId;
    let unitPrice      = item.price;
    let variationId: string | undefined;
    let variationName: string | undefined;

    // When the cart sends a variant's petpoojaId (= variation.id from Push Menu):
    //   • order item id   → variation.id      (variant.petpoojaId)
    //   • variation_id    → variation.variationid (variant.variationId)
    if (variantIdSet.has(item.petpoojaId)) {
      const variant = variantMap.get(item.petpoojaId);
      if (variant) {
        itemId        = variant.petpoojaId;                             // variation.id
        unitPrice     = variant.price;
        variationId   = variant.variationId || undefined;               // variation.variationid
        variationName = variant.name;
      }
    }

    const addonUnitTotal = (item.addons ?? []).reduce((s, a) => s + a.price, 0);
    const effectiveUnit  = unitPrice + addonUnitTotal;
    const lineTotal      = effectiveUnit * item.quantity;

    const dbName = variantIdSet.has(item.petpoojaId)
      ? (variantNameMap.get(item.petpoojaId) ?? item.name)
      : (itemNameMap.get(item.petpoojaId)    ?? item.name);

    rawItems.push({
      id:            itemId,
      name:          sanitizeName(dbName),
      unitPrice:     effectiveUnit,
      lineTotal,
      quantity:      item.quantity,
      variationId,
      variationName,
      addons: (item.addons ?? []).map((a) => {
        const dbAddon = addonDbMap.get(a.petpoojaId);
        return {
          id:        a.petpoojaId,
          name:      dbAddon?.name  ?? a.name,
          price:     dbAddon?.price ?? a.price,
          groupId:   dbAddon?.groupId   ?? '0',
          groupName: dbAddon?.groupName ?? 'Addons',
        };
      }),
    });
  }

  // ── Phase 2: Discount-aware tax calculation ────────────────────────────────
  // GST is applied to the discounted amount, not the gross subtotal.
  const subtotal       = rawItems.reduce((s, i) => s + i.lineTotal, 0);
  const discount       = body.discount      ?? 0;
  const packingCharges = body.packingCharges ?? 0;
  const taxableAmount  = subtotal - discount;

  const petpoojaItems: InputOrderItem[] = rawItems.map((raw) => {
    // Distribute the order-level flat discount proportionally across items.
    const itemDiscountAmt  = subtotal > 0 ? (raw.lineTotal / subtotal) * discount : 0;
    const itemTaxableBase  = raw.lineTotal - itemDiscountAmt;

    const itemTaxDetails = taxRows.map((tax) => ({
      id:    tax.petpoojaId,
      title: tax.title,
      type:  tax.type === 'flat' ? 'F' : 'P',
      price: tax.percentage,
      tax:                  parseFloat((itemTaxableBase * (tax.percentage / 100)).toFixed(2)),
      restaurant_liable_amt: parseFloat((itemTaxableBase * (tax.percentage / 100)).toFixed(2)),
    }));

    return {
      id:             raw.id,
      name:           raw.name,
      price:          raw.unitPrice,
      final_price:    raw.lineTotal,
      quantity:       raw.quantity,
      gst_liability:  'restaurant',
      item_tax:       itemTaxDetails,
      itemDiscount:   parseFloat(itemDiscountAmt.toFixed(2)),
      tax_inclusive:  0,
      tax_percentage: totalTaxRate,
      variationId:    raw.variationId,
      variationName:  raw.variationName,
      addons: raw.addons.map((a) => ({
        id:        a.id,
        name:      a.name,
        price:     a.price,
        groupId:   a.groupId,
        groupName: a.groupName,
      })),
    };
  });

  const taxTotal = parseFloat((taxableAmount * (totalTaxRate / 100)).toFixed(2));
  const total    = parseFloat((taxableAmount + taxTotal + packingCharges).toFixed(2));

  // ── Tax details (one row per tax config entry, on discounted amount) ───────
  const taxDetails: InputTaxDetail[] = taxRows.map((tax) => ({
    id:                    tax.petpoojaId,
    title:                 tax.title,
    type:                  tax.type === 'flat' ? 'F' : 'P',
    price:                 tax.percentage,
    tax:                   parseFloat((taxableAmount * (tax.percentage / 100)).toFixed(2)),
    restaurant_liable_amt: parseFloat((taxableAmount * (tax.percentage / 100)).toFixed(2)),
  }));

  const isTakeaway  = body.orderType === 'P';
  const tokenNumber = Math.floor(1000 + Math.random() * 9000).toString();
  const day         = new Date().getDate();
  const prefix      = isTakeaway ? `T${day}` : `D${day}`;
  const orderID     = `${prefix}-${tokenNumber}`;

  // ── Call saveOrder service ─────────────────────────────────────────────────
  const result = await saveOrder({
    orderID,
    orderType:       body.orderType,
    total,
    taxTotal:        parseFloat(taxTotal.toFixed(2)),
    discountTotal:   discount,
    discountType:    'F',
    packingCharges,
    deliveryCharges: 0,
    dcTaxPercentage: 0,
    pcTaxPercentage: 0,
    paymentType:     body.paymentType,
    enableDelivery:  body.orderType === 'H' ? 1 : 0,
    customer: {
      name:      body.customer.name,
      address:   body.customer.address,
      mobile:    body.customer.mobile,
      email:     body.customer.email     ?? '',
      latitude:  body.customer.latitude  ?? '',
      longitude: body.customer.longitude ?? '',
    },
    callbackUrl: (() => {
      const url = process.env.PETPOOJA_CALLBACK_URL
        ?? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL ?? 'order.thebiryanicanteen.com'}/api/petpooja/callback`;
      console.log('[order] callback_url sent to Petpooja:', url);
      return url;
    })(),
    items:       petpoojaItems,
    taxDetails,
  });

  if (!result.success) {
    console.error('[order] saveOrder failed:', result.error);
    return NextResponse.json(
      { success: false, error: result.error, detail: result.petpoojaBody },
      { status: 400 },
    );
  }

  const pp = result.response as Record<string, unknown>;
  const petpoojaOk = pp.status === '1' || pp.success === '1';
  if (!petpoojaOk) {
    console.error('[order] Petpooja rejected order:', pp);
    return NextResponse.json(
      { success: false, error: String(pp.message ?? 'Petpooja rejected the order'), detail: pp },
      { status: 400 },
    );
  }

  // ── Persist order only after Petpooja confirms ─────────────────────────────
  await prisma.order.create({
    data: {
      id:              orderID,
      customerName:    body.customer.name,
      customerPhone:   body.customer.mobile,
      customerAddress: body.customer.address,
      totalAmount:     total,
      orderType:       body.orderType,
      tokenNumber:     isTakeaway ? tokenNumber : null,
      userId:          authUser?.userId ?? null,
      items: {
        create: petpoojaItems.map((item) => ({
          name:     item.name,
          quantity: item.quantity,
          price:    item.price,
          addons:   JSON.stringify((item.addons ?? []).map((a) => ({ name: a.name, price: a.price }))),
        })),
      },
    },
  });

  return NextResponse.json({
    success:         true,
    orderId:         orderID,
    petpoojaOrderId: pp.orderID ?? null,
  });
}
