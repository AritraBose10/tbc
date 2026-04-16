// ---------------------------------------------------------------------------
// Webhook: POST /api/petpooja/pushmenu  (Task 2a)
// ---------------------------------------------------------------------------
// Petpooja calls this whenever the restaurant saves their POS menu.
// We must:
//   1. Persist restID + restaurantId — required for every subsequent Save Order call
//   2. Upsert all items, variants, addons, and taxes from the flat payload
//
// Petpooja retries if we respond with anything other than HTTP 200 +
// { "status": "1" }, so we ALWAYS return that shape — even on errors.
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type {
  PushMenuPayload,
  PushMenuItem,
  PushMenuAddonGroup,
} from '@/services/petpooja/types';

const SUCCESS = { status: '1', message: 'success' } as const;

export async function POST(req: NextRequest) {
  try {
    // Petpooja sends Push Menu as application/x-www-form-urlencoded where
    // the entire JSON payload is URL-encoded inside a "data" field.
    // Fall back to raw JSON for local testing.
    let body: PushMenuPayload;
    const contentType = req.headers.get('content-type') ?? '';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await req.text();
      const params = new URLSearchParams(text);
      const dataParam = params.get('data');
      if (!dataParam) throw new Error('[pushmenu] form body missing "data" field');
      body = JSON.parse(dataParam);
    } else {
      body = await req.json();
    }

    // STEP 1 — Store restID (hardcoded, confirmed by Petpooja) and restaurantId
    const restaurantId = body.restaurants?.[0]?.restaurantid ?? '';
    await Promise.all([
      prisma.petpoojaConfig.upsert({
        where:  { key: 'restID' },
        update: { value: 'A409632R' },
        create: { key: 'restID', value: 'A409632R' },
      }),
      prisma.petpoojaConfig.upsert({
        where:  { key: 'restaurantId' },
        update: { value: restaurantId },
        create: { key: 'restaurantId', value: restaurantId },
      }),
    ]);
    console.log(`[pushmenu] restID=A409632R restaurantId=${restaurantId}`);

    // STEP 2 — Upsert items from body.items[]
    const items: PushMenuItem[] = body.items ?? [];
    let itemCount = 0;

    for (const item of items) {
      if (!item.itemid) {
        console.warn('[pushmenu] Skipping item with missing itemid', item);
        continue;
      }

      const hasVariants = item.itemallowvariation === '1';

      await prisma.menuItem.upsert({
        where:  { petpoojaId: item.itemid },
        update: {
          name:       item.itemname,
          price:      parseFloat(item.price) || 0,
          categoryId: item.item_categoryid ?? '',
          rawJson:    JSON.stringify(item),
        },
        create: {
          petpoojaId:  item.itemid,
          name:        item.itemname,
          price:       parseFloat(item.price) || 0,
          categoryId:  item.item_categoryid ?? '',
          rawJson:     JSON.stringify(item),
        },
      });

      // Variants — only when itemallowvariation === "1"
      if (hasVariants) {
        for (const variation of item.variation ?? []) {
          if (!variation.id) continue;
          await prisma.menuVariant.upsert({
            where:  { petpoojaId: variation.id },
            update: { name: variation.name, price: parseFloat(variation.price) || 0 },
            create: {
              petpoojaId:     variation.id,
              name:           variation.name,
              price:          parseFloat(variation.price) || 0,
              itemPetpoojaId: item.itemid,
            },
          });
        }
      }

      itemCount++;
    }

    // STEP 3 — Upsert addons from body.addongroups[], linked via item.addon[].addon_group_id
    const addonGroups: PushMenuAddonGroup[] = body.addongroups ?? [];

    // Build groupid → addonitems map for O(1) lookup
    const groupMap = new Map<string, PushMenuAddonGroup['addongroupitems']>();
    for (const group of addonGroups) {
      groupMap.set(group.addongroupid, group.addongroupitems ?? []);
    }

    for (const item of items) {
      if (!item.itemid || item.itemallowaddon !== '1') continue;
      for (const addonRef of item.addon ?? []) {
        const groupItems = groupMap.get(addonRef.addon_group_id) ?? [];
        for (const addonItem of groupItems) {
          if (!addonItem.addonitemid) continue;
          await prisma.menuAddon.upsert({
            where:  { petpoojaId: addonItem.addonitemid },
            update: {
              name:  addonItem.addonitem_name,
              price: parseFloat(addonItem.addonitem_price) || 0,
            },
            create: {
              petpoojaId:     addonItem.addonitemid,
              name:           addonItem.addonitem_name,
              price:          parseFloat(addonItem.addonitem_price) || 0,
              itemPetpoojaId: item.itemid,
            },
          });
        }
      }
    }

    // STEP 4 — Upsert taxes from body.taxes[]
    let taxCount = 0;
    for (const tax of body.taxes ?? []) {
      if (!tax.taxid) continue;
      await prisma.taxConfig.upsert({
        where:  { petpoojaId: tax.taxid },
        update: {
          title:      tax.taxname,
          percentage: parseFloat(tax.tax) || 0,
        },
        create: {
          petpoojaId:  tax.taxid,
          title:       tax.taxname,
          type:        '',
          percentage:  parseFloat(tax.tax) || 0,
        },
      });
      taxCount++;
    }

    console.log(`[pushmenu] items=${itemCount} taxes=${taxCount}`);
  } catch (err) {
    // STEP 5 — Log but never return 4xx/5xx; Petpooja would retry indefinitely
    console.error('[pushmenu] Error processing payload:', err);
  }

  return NextResponse.json(SUCCESS);
}
