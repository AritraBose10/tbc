// ---------------------------------------------------------------------------
// Webhook: POST /api/petpooja/pushmenu  (Task 2a)
// ---------------------------------------------------------------------------
// Petpooja calls this whenever the restaurant saves their POS menu.
// We must:
//   1. Extract and persist restID — required for every subsequent Save Order call
//   2. Upsert all item IDs and prices — Save Order items must use Petpooja IDs,
//      not our internal catalogue IDs
//
// Petpooja retries if we respond with anything other than HTTP 200 +
// { "status": "1" }, so we validate before writing and always return that shape.
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { PushMenuPayload } from '@/services/petpooja/types';

export async function POST(req: NextRequest) {
  let body: PushMenuPayload;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { status: '0', message: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  if (
    !body.restaurants ||
    !Array.isArray(body.restaurants) ||
    body.restaurants.length === 0
  ) {
    return NextResponse.json(
      { status: '0', message: 'Missing or empty restaurants array' },
      { status: 400 },
    );
  }

  // Petpooja sends one restaurant per Push Menu call in practice
  const restaurant = body.restaurants[0];

  if (!restaurant.restaurant_id) {
    return NextResponse.json(
      { status: '0', message: 'Missing restaurant_id' },
      { status: 400 },
    );
  }

  // --- Persist restID -------------------------------------------------------
  // This is the single most critical piece of data from this webhook.
  // All Save Order calls require the exact value Petpooja gives us here.
  await prisma.petpoojaConfig.upsert({
    where: { key: 'restID' },
    update: { value: restaurant.restaurant_id },
    create: { key: 'restID', value: restaurant.restaurant_id },
  });

  console.log(`[pushmenu] restID persisted: ${restaurant.restaurant_id}`);

  // --- Persist menu items ---------------------------------------------------
  // Flatten categories → items and upsert each one.
  // We keep the full rawJson so nothing is silently discarded when the
  // Petpooja schema adds fields in future.
  let itemCount = 0;

  for (const category of restaurant.categories ?? []) {
    for (const item of category.items ?? []) {
      // Skip malformed entries rather than aborting the entire webhook
      if (!item.itemid) {
        console.warn('[pushmenu] Skipping item with missing itemid', item);
        continue;
      }

      await prisma.menuItem.upsert({
        where: { petpoojaId: item.itemid },
        update: {
          name: item.itemname,
          price: parseFloat(item.item_price) || 0,
          isAvailable: item.active !== '0',
          categoryId: category.categoryid,
          categoryName: category.categoryname,
          rawJson: JSON.stringify(item),
        },
        create: {
          petpoojaId: item.itemid,
          name: item.itemname,
          price: parseFloat(item.item_price) || 0,
          isAvailable: item.active !== '0',
          categoryId: category.categoryid,
          categoryName: category.categoryname,
          rawJson: JSON.stringify(item),
        },
      });

      itemCount++;
    }
  }

  console.log(`[pushmenu] ${itemCount} item(s) upserted`);

  return NextResponse.json({ status: '1', message: 'Menu received' });
}
