import { prisma } from '@/lib/prisma';

export async function fetchMenuItems() {
  const rows = await prisma.menuItem.findMany({
    where: { isVisible: true },
    include: { variants: true, addons: true },
    orderBy: [{ categoryName: 'asc' }, { name: 'asc' }],
  });

  return rows.map((row) => {
    let isVeg = false;
    try {
      const raw = JSON.parse(row.rawJson) as Record<string, unknown>;
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
      isAvailable:  row.isAvailable,
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
        groupId:    a.groupId,
        groupName:  a.groupName,
      })),
    };
  });
}

export async function getMenuLastUpdated(): Promise<Date> {
  const row = await prisma.menuItem.findFirst({
    orderBy: { updatedAt: 'desc' },
    select: { updatedAt: true },
  });
  return row?.updatedAt ?? new Date(0);
}
