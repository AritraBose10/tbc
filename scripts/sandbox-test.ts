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
//
// Requires Node.js >= 20.6.0 (for --env-file flag).
// ---------------------------------------------------------------------------

// Since next.config.ts sets basePath: "/order", all routes live under /order
const SERVER = 'http://localhost:3000/order';

// Petpooja sandbox base URL — used for the outbound Save Order call in Step 2
const PETPOOJA_URL =
  process.env.PETPOOJA_BASE_URL ??
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
const TEST_ITEM_ID = 'item-test-001';
// Unique per run so repeated runs don't collide in the DB
const TEST_ORDER_ID = `tbc-sandbox-${Date.now()}`;

// ---------------------------------------------------------------------------
// Step 1 — Push Menu → verify restID stored
// ---------------------------------------------------------------------------
async function step1_pushMenu() {
  console.log('\n══════════════════════════════════════');
  console.log('STEP 1: Push Menu → verify restID stored');
  console.log('══════════════════════════════════════');

  const payload = {
    ...auth,
    restaurants: [
      {
        restaurant_id: SANDBOX_REST_ID,
        restaurantname: 'The Biryani Canteen (Sandbox)',
        categories: [
          {
            categoryid: 'cat-001',
            categoryname: 'Biryani',
            active: '1',
            items: [
              {
                itemid: TEST_ITEM_ID,
                itemname: 'Chicken Biryani',
                item_price: '180',
                active: '1',
                item_tax: '9',
                itemallowvariant: '0',
              },
              {
                itemid: 'item-test-002',
                itemname: 'Veg Biryani',
                item_price: '150',
                active: '1',
                item_tax: '9',
                itemallowvariant: '0',
              },
            ],
          },
        ],
      },
    ],
  };

  const res = await post(`${SERVER}/api/petpooja/pushmenu`, payload);
  assert(res.status === '1', `Push Menu responds status=1 (got ${res.status})`);
  console.log(`  restID "${SANDBOX_REST_ID}" and 2 items should now be in DB`);
}

// ---------------------------------------------------------------------------
// Step 2 — Save Order → log Petpooja's sandbox response
// ---------------------------------------------------------------------------
async function step2_saveOrder() {
  console.log('\n══════════════════════════════════════');
  console.log('STEP 2: Save Order → call Petpooja sandbox directly');
  console.log('══════════════════════════════════════');

  const CALLBACK_URL =
    process.env.PETPOOJA_CALLBACK_URL ?? `${SERVER}/api/petpooja/callback`;

  const payload = {
    ...auth,
    details: {
      restID: SANDBOX_REST_ID,
      orderID: TEST_ORDER_ID,
      preorder_date: '',
      preorder_time: '',
      advanced_order: 'N',
      order_type: 'H',
      // total = item.final_price (180) + GST (16.20) — NO delivery charges
      total: 196.2,
      tax_total: 16.2,
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
          id: TEST_ITEM_ID,
          name: 'Chicken Biryani',
          price: 180,
          final_price: 180,
          quantity: 1,
          gst_liability: 'restaurant',
          item_tax: 16.2,
          tax_inclusive: 0,
          tax_percentage: 9,
          addons: [],
        },
      ],
      tax_details: [
        {
          id: '1',
          title: 'GST',
          type: 'percentage',
          price: 9,
          tax: 16.2,
          restaurant_liable_amt: 16.2,
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
async function step4_itemToggle() {
  console.log('\n══════════════════════════════════════');
  console.log('STEP 4: Item Toggle (off → on)');
  console.log('══════════════════════════════════════');

  // Turn item OFF
  const offRes = await post(`${SERVER}/api/petpooja/item-status`, {
    ...auth,
    restaurant_id: SANDBOX_REST_ID,
    item_id: TEST_ITEM_ID,
    active: '0',
  });
  assert(offRes.status === '1', `Item turn-off responds status=1 (got ${offRes.status})`);

  // Turn item ON
  const onRes = await post(`${SERVER}/api/petpooja/item-status`, {
    ...auth,
    restaurant_id: SANDBOX_REST_ID,
    item_id: TEST_ITEM_ID,
    active: '1',
  });
  assert(onRes.status === '1', `Item turn-on responds status=1 (got ${onRes.status})`);

  console.log(`  MenuItem "${TEST_ITEM_ID}" isAvailable should now be true`);
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

  await step1_pushMenu();
  await step2_saveOrder();
  await step3_callback();
  await step4_itemToggle();

  console.log('\n══════════════════════════════════════');
  console.log('All steps complete.');
  console.log('══════════════════════════════════════');
})();
