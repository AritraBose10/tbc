import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const rows = await prisma.menuItem.findMany({
    where: { isAvailable: true },
    include: { variants: true, addons: true },
    orderBy: [{ categoryName: 'asc' }, { name: 'asc' }],
  });

  const items = rows.map((row) => {
    let isVeg = false;
    try {
      const raw = JSON.parse(row.rawJson) as Record<string, unknown>;
      // Petpooja uses item_vegtype: "1" = veg, "2" = non-veg
      isVeg = raw.item_vegtype === '1' || raw.item_type === '1';
    } catch {
      // malformed rawJson — default to non-veg
    }

    return {
      petpoojaId:   row.petpoojaId,
      name:         row.name,
      price:        row.price,
      categoryId:   row.categoryId,
      categoryName: row.categoryName,
      isVeg,
      variants: row.variants.map((v) => ({
        petpoojaId: v.petpoojaId,
        name:       v.name,
        price:      v.price,
      })),
      addons: row.addons.map((a) => ({
        petpoojaId: a.petpoojaId,
        name:       a.name,
        price:      a.price,
      })),
    };
  });

  return NextResponse.json(items, {
    headers: {
      // Cache at the edge for 5 min; serve stale for up to 1 min while revalidating
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
    },
  });
}
