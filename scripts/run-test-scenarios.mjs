/**
 * Runs all 5 Petpooja integration test scenarios and prints order IDs.
 * Usage: node scripts/run-test-scenarios.mjs
 *
 * Scenarios:
 *   1. Items + Tax
 *   2. Item with Addons + Tax
 *   3. Item with Variation + Tax
 *   4. Item with Discount + Tax
 *   5. Item with Addon and Variation + Tax
 */

const SERVER = 'https://tbc-liart.vercel.app';

const CUSTOMER = {
  name: 'TBC Test',
  address: 'The Biryani Canteen, Kolkata',
  mobile: '9000000000',
  email: 'test@thebiryanicanteen.com',
};

async function post(path, body) {
  const url = `${SERVER}${path}`;
  console.log(`\n→ POST ${url}`);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  console.log(`  ← HTTP ${res.status}`, JSON.stringify(data, null, 2));
  return { status: res.status, data };
}

async function placeOrder(scenario, body) {
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`SCENARIO ${scenario}`);
  console.log('═'.repeat(50));
  const { status, data } = await post('/api/order', body);
  if (status === 200 && data.success) {
    console.log(`  ✓ Order placed — orderId: ${data.orderId}  petpoojaOrderId: ${data.petpoojaOrderId}`);
    return { orderId: data.orderId, petpoojaOrderId: data.petpoojaOrderId };
  } else {
    console.error(`  ✗ Failed:`, data.error ?? data);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Seed a test item with BOTH variant and addon for Scenario 5
// (No real menu item has both — we inject one via pushmenu)
// ---------------------------------------------------------------------------
async function seedScenario5Item() {
  console.log('\n── Seeding test item for Scenario 5 (addon + variation) ──');
  const { data } = await post('/api/petpooja/pushmenu', {
    app_key: 'cjx3hasvuzwe2n4prmg7y19ofkit8005',
    app_secret: 'f3f03bb0535013caa22aa529488074bf5fd60de4',
    access_token: 'b115795cb3bb425e9065dcda2fe3ff10cc91f2c6',
    restaurants: [{ restaurantid: 'A409632R', restaurantname: 'The Biryani Canteen' }],
    items: [
      {
        itemid: 'test-combo-001',
        itemname: 'Test Biryani Combo',
        price: '0',
        item_categoryid: 'test-cat',
        itemallowvariation: '1',
        itemallowaddon: '1',
        variation: [
          { id: 'test-variant-half', name: 'Half Plate', price: '199' },
          { id: 'test-variant-full', name: 'Full Plate', price: '349' },
        ],
        addon: [{ addon_group_id: 'test-addongrp-001' }],
      },
    ],
    addongroups: [
      {
        addongroupid: 'test-addongrp-001',
        addongroupitems: [
          { addonitemid: 'test-addon-raita', addonitem_name: 'Extra Raita', addonitem_price: '30' },
          { addonitemid: 'test-addon-papad', addonitem_name: 'Extra Papad', addonitem_price: '15' },
        ],
      },
    ],
    taxes: [],
  });
  if (data.status === '1') {
    console.log('  ✓ Test item seeded');
    return true;
  }
  console.error('  ✗ Seed failed:', data);
  return false;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
(async () => {
  const results = {};

  // Scenario 1: Plain item + Tax
  // Dosa — petpoojaId: 10468343, price: ₹80, tax: 5% → total ₹84
  results[1] = await placeOrder('1: Items + Tax', {
    customer: CUSTOMER,
    items: [{ petpoojaId: '10468343', name: 'Dosa', price: 80, quantity: 1 }],
    paymentType: 'COD',
    orderType: 'P',
  });

  // Scenario 2: Item with Addon + Tax
  // Veg Pasta (10468430, ₹250) + Red Sauce addon (32839, ₹0), tax: 5% → total ₹262.50
  results[2] = await placeOrder('2: Item with Addons + Tax', {
    customer: CUSTOMER,
    items: [
      {
        petpoojaId: '10468430',
        name: 'Veg Pasta+garlic Bread+coke',
        price: 250,
        quantity: 1,
        addons: [{ petpoojaId: '32839', name: 'Red Sauce', price: 0 }],
      },
    ],
    paymentType: 'COD',
    orderType: 'P',
  });

  // Scenario 3: Item with Variation + Tax
  // Americano Small — variant petpoojaId: 10468507, price: ₹120, tax: 5% → total ₹126
  results[3] = await placeOrder('3: Item with Variation + Tax', {
    customer: CUSTOMER,
    items: [{ petpoojaId: '10468507', name: 'Americano - Small', price: 120, quantity: 1 }],
    paymentType: 'COD',
    orderType: 'P',
  });

  // Scenario 4: Item with Discount + Tax
  // Dosa (10468343, ₹80) + 5% tax - ₹10 discount → total ₹74
  results[4] = await placeOrder('4: Item with Discount + Tax', {
    customer: CUSTOMER,
    items: [{ petpoojaId: '10468343', name: 'Dosa', price: 80, quantity: 1 }],
    paymentType: 'COD',
    orderType: 'P',
    discount: 10,
  });

  // Scenario 5: Item with Addon + Variation + Tax
  // Seed a test item first (no real item has both), then order
  const seeded = await seedScenario5Item();
  if (seeded) {
    // Test Biryani Combo — Full Plate (test-variant-full, ₹349) + Extra Raita (test-addon-raita, ₹30)
    // tax: 5% → total ₹398.45
    results[5] = await placeOrder('5: Item with Addon and Variation + Tax', {
      customer: CUSTOMER,
      items: [
        {
          petpoojaId: 'test-variant-full',
          name: 'Test Biryani Combo - Full Plate',
          price: 349,
          quantity: 1,
          addons: [{ petpoojaId: 'test-addon-raita', name: 'Extra Raita', price: 30 }],
        },
      ],
      paymentType: 'COD',
      orderType: 'P',
    });
  }

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log(`\n${'═'.repeat(50)}`);
  console.log('RESULTS SUMMARY');
  console.log('═'.repeat(50));
  for (const [num, result] of Object.entries(results)) {
    if (result) {
      console.log(`Scenario ${num}: orderId=${result.orderId}  petpoojaOrderId=${result.petpoojaOrderId}`);
    } else {
      console.log(`Scenario ${num}: FAILED`);
    }
  }
})();
