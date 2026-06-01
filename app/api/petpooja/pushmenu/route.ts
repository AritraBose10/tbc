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

    // Validate app_key against env secret
    const expectedKey = process.env.PETPOOJA_APP_KEY;
    if (expectedKey && body.app_key !== expectedKey) {
      console.warn('[pushmenu] Invalid app_key — request rejected');
      return NextResponse.json({ status: '0', message: 'Unauthorized' }, { status: 401 });
    }

    // STEP 1 — Store the restaurant ID from Petpooja's push menu payload.
    // Petpooja sends restaurantid in restaurants[0] — this is the value that
    // must be echoed back as restID in every Save Order call.
    const restaurantId = body.restaurants?.[0]?.restaurantid ?? '';
    await prisma.petpoojaConfig.upsert({
      where:  { key: 'restaurantId' },
      update: { value: restaurantId },
      create: { key: 'restaurantId', value: restaurantId },
    });
    console.log(`[pushmenu] restaurantId=${restaurantId}`);

    // STEP 2 — Build categoryId → categoryName map from restaurant payload
    const restaurant = body.restaurants?.[0] as Record<string, unknown> | undefined;
    const menuCategories = (restaurant?.menucategory as Array<{ categoryid: string; category_name: string }>) ?? [];
    
    // Fallback static category mapping for robust production sync
    const STATIC_CATEGORY_MAP: Record<string, string> = {
      '8814080': 'Hot Beverages',
      '8814081': 'Mocktails & Cold Drinks',
      '8814082': 'Milkshakes',
      '8814084': 'Sandwiches',
      '8814085': 'Kathi Rolls',
      '8814086': 'Noodles',
      '8814087': 'Momos',
      '8814088': 'Maggi Special',
      '8814089': 'Pizzas',
      '8814090': 'Burgers',
      '8814091': 'Pastas',
      '8814092': 'Wraps',
      '8814093': 'Veg Starters',
      '8814094': 'Non-Veg Starters',
      '8814095': 'Biryani Special',
      '8814096': 'Indian Breads',
      '8814097': 'Dal Corner',
      '8814098': 'Combos & Platters',
      '8814099': 'Main Course',
      '8814100': 'Royal Thalis',
      '9308816': 'Desserts',
    };

    const categoryNameMap = new Map<string, string>();
    for (const cat of menuCategories) {
      if (cat.categoryid && cat.category_name) {
        categoryNameMap.set(cat.categoryid, cat.category_name);
      }
    }

    // STEP 3 — Upsert items from body.items[]
    const items: PushMenuItem[] = body.items ?? [];
    let itemCount = 0;

    for (const item of items) {
      if (!item.itemid) {
        console.warn('[pushmenu] Skipping item with missing itemid', item);
        continue;
      }

      const hasVariants = item.itemallowvariation === '1';
      const rawCategoryId = item.item_categoryid ?? '';
      const categoryName = categoryNameMap.get(rawCategoryId) 
        || STATIC_CATEGORY_MAP[rawCategoryId] 
        || '';

      const cleanName = item.itemname.replace(/Puiao/g, "Pulao");

      await prisma.menuItem.upsert({
        where:  { petpoojaId: item.itemid },
        update: {
          name:         cleanName,
          price:        parseFloat(item.price) || 0,
          categoryId:   item.item_categoryid ?? '',
          categoryName,
          rawJson:      JSON.stringify(item),
          isAvailable:  true,
        },
        create: {
          petpoojaId:   item.itemid,
          name:         cleanName,
          price:        parseFloat(item.price) || 0,
          categoryId:   item.item_categoryid ?? '',
          categoryName,
          rawJson:      JSON.stringify(item),
        },
      });

      // Variants — only when itemallowvariation === "1"
      if (hasVariants) {
        for (const variation of item.variation ?? []) {
          if (!variation.id) continue;
          await prisma.menuVariant.upsert({
            where:  { petpoojaId: variation.id },
            update: {
              name:        variation.name,
              price:       parseFloat(variation.price) || 0,
              variationId: variation.variationid ?? '',
            },
            create: {
              petpoojaId:     variation.id,
              variationId:    variation.variationid ?? '',
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
        const group = addonGroups.find(g => g.addongroupid === addonRef.addon_group_id);
        const groupItems = group?.addongroupitems ?? [];
        const groupId   = addonRef.addon_group_id;
        const groupName = group?.addongroupname ?? '';
        for (const addonItem of groupItems) {
          if (!addonItem.addonitemid) continue;
          await prisma.menuAddon.upsert({
            where:  { petpoojaId: addonItem.addonitemid },
            update: {
              name:      addonItem.addonitem_name,
              price:     parseFloat(addonItem.addonitem_price) || 0,
              groupId,
              groupName,
            },
            create: {
              petpoojaId:     addonItem.addonitemid,
              name:           addonItem.addonitem_name,
              price:          parseFloat(addonItem.addonitem_price) || 0,
              groupId,
              groupName,
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

    // Mark items no longer present in the push as unavailable
    const incomingIds = items.map((i) => i.itemid).filter(Boolean);
    if (incomingIds.length > 0) {
      await prisma.menuItem.updateMany({
        where: { petpoojaId: { notIn: incomingIds } },
        data:  { isAvailable: false },
      });
    }

    console.log(`[pushmenu] items=${itemCount} taxes=${taxCount}`);
  } catch (err) {
    // Log but never return 4xx/5xx — Petpooja would retry indefinitely
    console.error('[pushmenu] Error processing payload:', err);
  }

  return NextResponse.json(SUCCESS);
}
