/**
 * PRE-REQUISITE before running this script:
 * 1. Go to https://developerapi.petpooja.com
 * 2. Menu Management → Menu List → click "Menu Trigger"
 * 3. Confirm server received POST to /api/petpooja/pushmenu
 * 4. Verify DB has rows: npx prisma studio
 * Then run: npm run sandbox:test
 */

// ---------------------------------------------------------------------------
// Petpooja Sandbox Test Script  (Task 4)
// ---------------------------------------------------------------------------
// Exercises the full integration flow against the local dev server.
//
// Usage:
//   npx tsx --env-file=.env.sandbox scripts/sandbox-test.ts
//
// Prerequisites:
//   1. npm run dev is running on port 3000
//   2. Database is migrated: npx prisma db push
//   3. .env.sandbox is populated with sandbox credentials
//   4. Push Menu has been triggered from developerapi.petpooja.com
//      (so real Petpooja item IDs are in the DB)
//
// Requires Node.js >= 20.6.0 (for --env-file flag).
// ---------------------------------------------------------------------------

import { PrismaClient } from '@prisma/client';
import path from 'path';

// Resolve the DB path explicitly so it matches lib/prisma.ts — avoids the
// SQLite relative-path ambiguity when DATABASE_URL is already in process.env.
const prisma = new PrismaClient({
  datasources: { db: { url: `file:${path.join(process.cwd(), 'prisma', 'petpooja.db')}` } },
});

// Since next.config.ts sets basePath: "/order", all routes live under /order
const SERVER = 'http://localhost:3000';

// Petpooja sandbox base URL — used for the outbound Save Order calls in Steps 2 & 5
const PETPOOJA_URL =
  process.env.PETPOOJA_API_BASE ??
  'https://qle1yy2ydc.execute-api.ap-southeast-1.amazonaws.com/V1';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function post(url: string, body: unknown): Promise<Record<string, unknown>> {
  console.log(`\n→ POST ${url}`);

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch {
    parsed = { _raw: text };
  }

  console.log(`  ← HTTP ${res.status}`, JSON.stringify(parsed, null, 2));
  return parsed;
}

function pass(msg: string) {
  console.log(`  ✓ ${msg}`);
}

function fail(msg: string): never {
  console.error(`  ✗ FAIL: ${msg}`);
  process.exit(1);
}

function assert(condition: boolean, msg: string) {
  condition ? pass(msg) : fail(msg);
}

// ---------------------------------------------------------------------------
// Auth block — used in all simulated inbound (Petpooja → us) webhook payloads.
// In real operation Petpooja will include these; in the test we supply them.
// ---------------------------------------------------------------------------
const auth = {
  app_key: process.env.PETPOOJA_APP_KEY ?? '',
  app_secret: process.env.PETPOOJA_APP_SECRET ?? '',
  access_token: process.env.PETPOOJA_ACCESS_TOKEN ?? '',
};

if (!auth.app_key || !auth.app_secret || !auth.access_token) {
  console.error(
    'ERROR: PETPOOJA_APP_KEY / PETPOOJA_APP_SECRET / PETPOOJA_ACCESS_TOKEN not set.\n' +
      'Run: npx tsx --env-file=.env.sandbox scripts/sandbox-test.ts',
  );
  process.exit(1);
}

const SANDBOX_REST_ID = process.env.PETPOOJA_REST_ID ?? 'sandbox-rest-001';
const SANDBOX_REST_MAP_ID = process.env.PETPOOJA_REST_MAP_ID ?? 'sikue9cb';
// Unique per run so repeated runs don't collide in the DB
const TEST_ORDER_ID = `tbc-sandbox-${Date.now()}`;

// ---------------------------------------------------------------------------
// Step 1 — Push Menu → verify restID stored
// ---------------------------------------------------------------------------
async function step1_pushMenu() {
  console.log('\n══════════════════════════════════════');
  console.log('STEP 1: Push Menu → verify restID stored');
  console.log('══════════════════════════════════════');

  // Payload structure matches the actual Petpooja Push Menu wire format:
  //   • items[]        — flat array at top level (not nested under restaurants)
  //   • itemallowvariation / variation[]  — correct variant field names
  //   • addongroups[]  — top-level addon groups; items reference via addon[].addon_group_id
  //   • taxes[]        — top-level tax array with taxid/taxname/tax fields
  const payload = {
    ...auth,
    restaurants: [{ restaurantid: SANDBOX_REST_ID, restaurantname: 'The Biryani Canteen (Sandbox)' }],
    items: [
      {
        itemid: 'item-test-001',
        itemname: 'Chicken Biryani',
        price: '180.00',
        item_categoryid: 'cat-001',
        itemallowvariation: '0',
        itemallowaddon: '0',
        variation: [],
        addon: [],
      },
      {
        itemid: 'item-test-002',
        itemname: 'Veg Biryani',
        price: '150.00',
        item_categoryid: 'cat-001',
        itemallowvariation: '0',
        itemallowaddon: '0',
        variation: [],
        addon: [],
      },
      // Rich item — used in Step 5 (variant + addon + tax)
      {
        itemid: 'item-test-003',
        itemname: 'Special Biryani',
        price: '200.00',
        item_categoryid: 'cat-001',
        itemallowvariation: '1',
        itemallowaddon: '1',
        variation: [
          { id: 'variant-test-001', name: 'Full Plate', price: '200' },
          { id: 'variant-test-002', name: 'Half Plate', price: '120' },
        ],
        addon: [{ addon_group_id: 'addongrp-001' }],
      },
    ],
    addongroups: [
      {
        addongroupid: 'addongrp-001',
        addongroupitems: [
          { addonitemid: 'addon-test-001', addonitem_name: 'Extra Raita',  addonitem_price: '30' },
          { addonitemid: 'addon-test-002', addonitem_name: 'Extra Papad',  addonitem_price: '15' },
        ],
      },
    ],
    taxes: [
      { taxid: 'tax-test-001', taxname: 'GST', tax: '9.00' },
    ],
  };

  const res = await post(`${SERVER}/api/petpooja/pushmenu`, payload);
  assert(res.status === '1', `Push Menu responds status=1 (got ${res.status})`);
  console.log(`  restID "${SANDBOX_REST_ID}" and items should now be in DB`);
}

// ---------------------------------------------------------------------------
// Step 2 — Save Order (plain item + tax) → log Petpooja's sandbox response
// ---------------------------------------------------------------------------
async function step2_saveOrder(
  item: { petpoojaId: string; name: string; price: number },
  taxPct: number,
) {
  console.log('\n══════════════════════════════════════');
  console.log('STEP 2: Save Order (plain item + tax) → call Petpooja sandbox directly');
  console.log('══════════════════════════════════════');
  console.log(`  item: ${item.petpoojaId}  price: ${item.price}  tax: ${taxPct}%`);

  const CALLBACK_URL =
    process.env.PETPOOJA_CALLBACK_URL ?? `${SERVER}/api/petpooja/callback`;

  const taxAmount  = parseFloat((item.price * taxPct / 100).toFixed(2));
  const orderTotal = parseFloat((item.price + taxAmount).toFixed(2));

  const payload = {
    ...auth,
    details: {
      restID: SANDBOX_REST_ID,
      restMapID: SANDBOX_REST_MAP_ID,
      orderID: TEST_ORDER_ID,
      preorder_date: '',
      preorder_time: '',
      advanced_order: 'N',
      order_type: 'H',
      total: orderTotal,
      tax_total: taxAmount,
      discount_total: 0,
      discount_type: '1',
      created_on: Math.floor(Date.now() / 1000),
      dc_tax_percentage: 0,
      pc_tax_percentage: 5,
      payment_type: 'COD',
      enable_delivery: 0,
      name: 'Test Customer',
      address: '1st Floor, Block A, The Biryani Canteen HQ',
      mobile: '9000000000',
      email: 'sandbox@tbc.com',
      latitude: '',
      longitude: '',
      callback_url: CALLBACK_URL,
      items: [
        {
          id: item.petpoojaId,
          name: item.name,
          price: item.price,
          final_price: item.price,
          quantity: 1,
          gst_liability: 'restaurant',
          item_tax: taxAmount,
          tax_inclusive: 0,
          tax_percentage: taxPct,
          addons: [],
        },
      ],
      tax_details: [
        {
          id: '1',
          title: 'GST',
          type: 'percentage',
          price: taxPct,
          tax: taxAmount,
          restaurant_liable_amt: taxAmount,
        },
      ],
    },
  };

  // This call goes directly to Petpooja — it exercises the outbound flow.
  // We don't hard-assert success because sandbox credentials may be unprovisioned;
  // check the printed response manually.
  await post(`${PETPOOJA_URL}/save_order`, payload);
  console.log(
    '  ↑ Review Petpooja response above. Non-zero status is expected until real credentials are provisioned.',
  );
}

// ---------------------------------------------------------------------------
// Step 3 — Order status callback → verify DB record written
// ---------------------------------------------------------------------------
async function step3_callback() {
  console.log('\n══════════════════════════════════════');
  console.log('STEP 3: Order Callback (status=accepted)');
  console.log('══════════════════════════════════════');

  const payload = {
    ...auth,
    restaurant_id: SANDBOX_REST_ID,
    order_id: TEST_ORDER_ID,
    callback_order_status: '1', // "1" = accepted
  };

  const res = await post(`${SERVER}/api/petpooja/callback`, payload);
  assert(res.status === '1', `Callback responds status=1 (got ${res.status})`);
  console.log(`  OrderCallback row for order_id="${TEST_ORDER_ID}" should be in DB`);
}

// ---------------------------------------------------------------------------
// Step 4 — Item toggle off then on → verify isAvailable flips
// ---------------------------------------------------------------------------
async function step4_itemToggle(petpoojaId: string) {
  console.log('\n══════════════════════════════════════');
  console.log('STEP 4: Item Toggle (off → on)');
  console.log('══════════════════════════════════════');
  console.log(`  item: ${petpoojaId}`);

  // Turn item OFF
  const offRes = await post(`${SERVER}/api/petpooja/item-status`, {
    ...auth,
    restaurant_id: SANDBOX_REST_ID,
    item_id: petpoojaId,
    active: '0',
  });
  assert(offRes.status === '1', `Item turn-off responds status=1 (got ${offRes.status})`);

  // Turn item ON
  const onRes = await post(`${SERVER}/api/petpooja/item-status`, {
    ...auth,
    restaurant_id: SANDBOX_REST_ID,
    item_id: petpoojaId,
    active: '1',
  });
  assert(onRes.status === '1', `Item turn-on responds status=1 (got ${onRes.status})`);

  console.log(`  MenuItem "${petpoojaId}" isAvailable should now be true`);
}

// ---------------------------------------------------------------------------
// Step 5 — Item with Addon + Variation + Tax → Save Order to Petpooja sandbox
// ---------------------------------------------------------------------------
async function step5_addonVariantTax(
  item: {
    petpoojaId: string;
    name: string;
    variants: { petpoojaId: string; name: string; price: number }[];
    addons:   { petpoojaId: string; name: string; price: number }[];
  },
  tax: { petpoojaId: string; title: string; type: string; percentage: number } | null,
) {
  console.log('\n══════════════════════════════════════');
  console.log('STEP 5: Item with Addon + Variation + Tax');
  console.log('══════════════════════════════════════');

  const variant = item.variants[0];
  const addon   = item.addons[0];
  const taxPct  = tax?.percentage ?? 9;

  console.log(`  item: ${item.petpoojaId}  variant: ${variant.petpoojaId}  addon: ${addon.petpoojaId}  tax: ${taxPct}%`);

  const itemTotal  = variant.price + addon.price;
  const taxAmount  = parseFloat((itemTotal * taxPct / 100).toFixed(2));
  const orderTotal = parseFloat((itemTotal + taxAmount).toFixed(2));

  const CALLBACK_URL =
    process.env.PETPOOJA_CALLBACK_URL ?? `${SERVER}/api/petpooja/callback`;

  const step5OrderId = `${TEST_ORDER_ID}-step5`;

  const payload = {
    ...auth,
    details: {
      restID: SANDBOX_REST_ID,
      restMapID: SANDBOX_REST_MAP_ID,
      orderID: step5OrderId,
      preorder_date: '',
      preorder_time: '',
      advanced_order: 'N',
      order_type: 'H',
      total: orderTotal,
      tax_total: taxAmount,
      discount_total: 0,
      discount_type: '1',
      created_on: Math.floor(Date.now() / 1000),
      dc_tax_percentage: 0,
      pc_tax_percentage: 5,
      payment_type: 'COD',
      enable_delivery: 0,
      name: 'Test Customer',
      address: '1st Floor, Block A, The Biryani Canteen HQ',
      mobile: '9000000000',
      email: 'sandbox@tbc.com',
      latitude: '',
      longitude: '',
      callback_url: CALLBACK_URL,
      items: [
        {
          // Variant ID is sent as the item ID — Petpooja requirement
          id: variant.petpoojaId,
          name: `${item.name} — ${variant.name}`,
          price: itemTotal,
          final_price: itemTotal,
          quantity: 1,
          gst_liability: 'restaurant',
          item_tax: taxAmount,
          tax_inclusive: 0,
          tax_percentage: taxPct,
          addons: [
            { id: addon.petpoojaId, name: addon.name, price: addon.price },
          ],
        },
      ],
      tax_details: [
        {
          id: tax?.petpoojaId ?? '1',
          title: tax?.title ?? 'GST',
          type: tax?.type ?? 'percentage',
          price: taxPct,
          tax: taxAmount,
          restaurant_liable_amt: taxAmount,
        },
      ],
    },
  };

  await post(`${PETPOOJA_URL}/save_order`, payload);
  console.log(
    '  ↑ Review Petpooja response above (variant.id as item.id, addon included, tax applied).',
  );
  console.log(`  variant_price=${variant.price}  addon_price=${addon.price}  tax=${taxAmount}  total=${orderTotal}`);
}

// ---------------------------------------------------------------------------
// Run all steps
// ---------------------------------------------------------------------------
(async () => {
  console.log('Petpooja Sandbox Test — starting');
  console.log(`  app_key     : ${auth.app_key.slice(0, 4)}****`);
  console.log(`  access_token: ${auth.access_token.slice(0, 4)}****`);
  console.log(`  server      : ${SERVER}`);
  console.log(`  petpooja    : ${PETPOOJA_URL}`);
  console.log(`  order_id    : ${TEST_ORDER_ID}`);

  // ── Step 1: Push Menu (seeds local DB with test items) ───────────────────
  // step1_pushMenu POSTs synthetic items to our local route, which writes them
  // to the DB.  We run this first so subsequent steps always have items to work
  // with regardless of whether the Petpooja portal webhook has been triggered
  // (that fires to the production URL, not to localhost).
  await step1_pushMenu();

  // ── Query DB for real item IDs ────────────────────────────────────────────
  // Use items that are now in DB (from the real Push Menu trigger or Step 1).
  const plainItem = await prisma.menuItem.findFirst({
    where: { isAvailable: true },
  });

  const itemWithBoth = await prisma.menuItem.findFirst({
    where: { isAvailable: true, addons: { some: {} }, variants: { some: {} } },
    include: { addons: true, variants: true },
  });

  const taxConfig = await prisma.taxConfig.findFirst();
  const taxPct    = taxConfig?.percentage ?? 9;

  if (!plainItem) fail('No available MenuItem found in DB after Step 1');

  await step2_saveOrder(plainItem, taxPct);
  await step3_callback();
  await step4_itemToggle(plainItem.petpoojaId);

  if (!itemWithBoth || itemWithBoth.variants.length === 0 || itemWithBoth.addons.length === 0) {
    console.warn('\n⚠️  No item with both variants AND addons found in DB — skipping Step 5.');
    console.warn('   Trigger the real Push Menu to populate items with variants and addons.');
  } else {
    await step5_addonVariantTax(itemWithBoth, taxConfig);
  }

  await prisma.$disconnect();

  console.log('\n══════════════════════════════════════');
  console.log('All steps complete.');
  console.log('══════════════════════════════════════');
})();
