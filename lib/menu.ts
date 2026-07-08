import { prisma } from '@/lib/prisma';

/**
 * Name-based veg overrides.
 * PetPooja occasionally sends wrong item_vegtype for paneer dishes and mocktails.
 * Any item whose name (uppercased) matches one of these substrings is always veg.
 */
const VEG_NAME_OVERRIDES: string[] = [
  'PANEER',
  'MOJITO',
  'BLUE HEAVEN',
  'PULSE CANDY',
  'CRANBERRY',
  'ORANGE SUNRISE',
  'STRAWBERRY SWEETHEART',
  'ORANGE PIROSKA',
  'DEEP BLUE SEA',
  'FRUIT PUNCH',
  'LEMON ICE TEA',
  'PEACH ICE TEA',
  'BLACK CURRENT SLASH',
  'CRANBERRY LITCHI TWIST',
  'WATERMELON MOJITO',
  'KALA KHATTA',
];

/** Category names that are always vegetarian */
const VEG_CATEGORY_OVERRIDES: string[] = [
  'mocktails',
  'beverages',
  'drinks',
  'shakes',
  'juices',
];

function applyVegOverride(name: string, categoryName: string, isVeg: boolean): boolean {
  const upperName = name.toUpperCase();
  if (VEG_NAME_OVERRIDES.some((kw) => upperName.includes(kw))) return true;
  const lowerCat = categoryName.toLowerCase();
  if (VEG_CATEGORY_OVERRIDES.some((kw) => lowerCat.includes(kw))) return true;
  return isVeg;
}

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
      isVeg = raw.item_attributeid === '1';
    } catch {
      // malformed rawJson — default to non-veg
    }

    // Apply manual overrides for known misclassified items
    isVeg = applyVegOverride(row.name, row.categoryName, isVeg);

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
