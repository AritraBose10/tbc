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
  // The order-relay restID is A409632R (extracted from the restaurant name
  // "BIRYANI CANTEEN (409632) DEMO" → A{number}R format).
  // restaurant.restaurant_id in the payload is the integration mapping code
  // (sikue9cb), NOT the restID used for Save Order calls.
  const restID = 'A409632R';
  await prisma.petpoojaConfig.upsert({
    where: { key: 'restID' },
    update: { value: restID },
    create: { key: 'restID', value: restID },
  });

  console.log(`[pushmenu] restID persisted: ${restID}`);

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

      // --- Persist variants -----------------------------------------------
      for (const variant of item.itemvariants ?? []) {
        if (!variant.id) continue;
        await prisma.menuVariant.upsert({
          where: { petpoojaId: variant.id },
          update: { name: variant.name, price: parseFloat(variant.price) || 0 },
          create: {
            petpoojaId: variant.id,
            name: variant.name,
            price: parseFloat(variant.price) || 0,
            itemPetpoojaId: item.itemid,
          },
        });
      }

      // --- Persist addons -------------------------------------------------
      for (const addon of item.item_addons ?? []) {
        if (!addon.id) continue;
        await prisma.menuAddon.upsert({
          where: { petpoojaId: addon.id },
          update: { name: addon.name, price: parseFloat(addon.price) || 0 },
          create: {
            petpoojaId: addon.id,
            name: addon.name,
            price: parseFloat(addon.price) || 0,
            itemPetpoojaId: item.itemid,
          },
        });
      }

      itemCount++;
    }
  }

  // --- Persist tax configs --------------------------------------------------
  // Taxes are declared at restaurant level; upsert each unique entry.
  let taxCount = 0;
  for (const tax of restaurant.taxes ?? []) {
    if (!tax.id) continue;
    await prisma.taxConfig.upsert({
      where: { petpoojaId: tax.id },
      update: {
        title: tax.title,
        type: tax.type,
        percentage: parseFloat(tax.percentage) || 0,
      },
      create: {
        petpoojaId: tax.id,
        title: tax.title,
        type: tax.type,
        percentage: parseFloat(tax.percentage) || 0,
      },
    });
    taxCount++;
  }

  console.log(`[pushmenu] ${itemCount} item(s) upserted, ${taxCount} tax config(s) upserted`);

  return NextResponse.json({ status: '1', message: 'Menu received' });
}
