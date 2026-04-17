// Corrected category backfill — derived from actual item names in DB
// Run with: node scripts/backfill-categories.mjs

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORY_MAP = {
  'cat-001': 'Biryani & Rice',
  '72817':   'Bakery & Desserts',     // Dosa, Chocolate Pastry, Cookies
  '72818':   'Hot Coffee',            // Cafe Latte, Americano, Mocha
  '72819':   'Espresso',              // Espresso, Ristretto, Macchiato
  '72820':   'Hot Beverages',         // Tea, Hot Chocolate
  '72821':   'Smoothies',             // Coco Banana, Green Smoothie
  '72822':   'Iced Coffee',           // Iced Latte, Iced Mocha
  '72823':   'Shakes',                // Double Chocolate, Oreo Shake
  '72824':   'Mocktails',             // Virgin Mojito, Fresh Lime Soda
  '72825':   'Cold Coffee',           // Caramel Coffee, Hazelnut Coffee
  '72826':   'Health Add-ons',        // Chia Seed, Almonds, Whey Protein
  '72827':   'Veg Burgers',           // Aloo Tikki, Crunchy Corn, Chilly Lava
  '72828':   'Chicken Burger Combos', // Chicken Patty+fries+coke, Chicken Lava+fries+coke
  '72829':   'Veg Burger Meals',      // Veg Patty, Paneer Tikka, Aloo Patty
  '72830':   'Chicken Burgers',       // Italian Chicken, Chicken Tikka, Roasted Chicken
  '72831':   'Sides & Snacks',        // Maggie, Fries, Coke, Water Bottle
  '72832':   'Chicken Snacks',        // Chicken Popcorn, Chicken Nuggets
  '72833':   'Veg Burger Combos',     // Aloo Tikki+fries+coke
  '72834':   'Veg Burger Value Meals',// Veg Patty+fries+coke, Paneer Tikka+fries+coke
  '72835':   'Chicken Burger Meals',  // Chicken Tikka+fries+coke, Roasted Chicken+fries+coke
  '72836':   'Veg Pizza',             // Margherita, Veggie Delight, Extra Cheese
  '72837':   'Chicken Pizza',         // Chicken Tikka, Deluxe Chicken
  '72838':   'Veg Pasta',             // Red Sauce, White Sauce, Mix Sauce
  '72839':   'Chicken Pasta',         // Chicken Tandoori, Chicken Mix Sauce
  '72840':   'Pasta Combos',          // Veg Pasta+garlic Bread+coke
  '72841':   'Garlic Bread Combos',   // Cheese Garlic Bread+coke
  '72842':   'Garlic Bread',          // Veg Garlic Bread, Cheese Garlic Bread
  '72843':   'Rolls & Wraps',         // Chicken Veg, Chicken Cheese
  '72844':   'Veg Salads',            // Aloo Patty Salad, Paneer Salaad, Corn Peas Salad
  '72845':   'Sweets & Desserts',     // Vanilla Muffin, Blue Berry Muffin, Ice Cream Scoupe
  '72846':   'Veg Pita',              // Falafel Pita, Garden Pita, Fresh Paneer Pita
  '72847':   'Garden Salads',         // Fresh Paneer Salad, Garden Salad, Kathi Paneer Salad
  '72848':   'Chicken Pita',          // Bbq Chicken Pita, Chicken Tikka Pita, Roasted Chicken Pita
  '72849':   'Chicken Salads',        // Roasted Chicken Salad, Chicken Ham Salad
  '72850':   'Veg Rice Bowls',        // Fresh Paneer Bowl, Falafel Rice Bowl
  '72851':   'Chicken Rice Bowls',    // Roasted Chicken Rice Bowl, Pesto Chicken Rice Bowl
  '72852':   'Pita Pizzas',           // Sweet Corn Pizza In Pita, Roasted Pizza In Pita
};

async function main() {
  console.log('Resetting all categoryNames first...');
  await prisma.menuItem.updateMany({ data: { categoryName: '' } });

  console.log('Applying corrected categoryName backfill...');
  let updated = 0;

  for (const [categoryId, categoryName] of Object.entries(CATEGORY_MAP)) {
    const result = await prisma.menuItem.updateMany({
      where: { categoryId },
      data: { categoryName },
    });
    if (result.count > 0) {
      console.log(`  ${categoryId} → "${categoryName}" (${result.count} items)`);
      updated += result.count;
    }
  }

  console.log(`\nDone! Updated ${updated} items.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
