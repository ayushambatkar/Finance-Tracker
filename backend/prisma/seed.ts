import prisma from "../src/lib/prisma.js";

function randomTime(hourStart: number, hourEnd: number) {
  const date = new Date();
  const hour = Math.floor(Math.random() * (hourEnd - hourStart)) + hourStart;
  const minute = Math.floor(Math.random() * 60);
  date.setHours(hour, minute, 0, 0);
  return date;
}

async function main() {
  // Categories
  const categories = [
    "food",
    "snacks",
    "transport",
    "shopping",
    "personal",
  ];

  const categoryMap: Record<string, string> = {};

  for (const name of categories) {
    console.log(`Upserting category: ${name}`);
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log(`Category ID for ${name}: ${cat.id}`);
    categoryMap[name] = cat.id;
  }

  // Sample expenses
  const expenses = [
    // Breakfast
    { desc: "Idli dosa breakfast at Udupi", amt: 60, cat: "food", time: () => randomTime(7, 9) },
    { desc: "Breakfast at Rameshwaram Cafe", amt: 120, cat: "food", time: () => randomTime(7, 10) },

    // Lunch
    { desc: "Office lunch thali", amt: 120, cat: "food", time: () => randomTime(12, 14) },

    // Snacks / coffee
    { desc: "Evening chai", amt: 20, cat: "snacks", time: () => randomTime(16, 18) },
    { desc: "Coffee", amt: 40, cat: "snacks", time: () => randomTime(10, 17) },
    { desc: "Chocolate", amt: 50, cat: "snacks", time: () => randomTime(14, 20) },

    // Evening / night
    { desc: "Evening snacks", amt: 80, cat: "snacks", time: () => randomTime(17, 19) },
    { desc: "Ice cream post dinner", amt: 100, cat: "snacks", time: () => randomTime(21, 23) },

    // Daily items
    { desc: "Eggs tray", amt: 90, cat: "food", time: () => randomTime(9, 12) },
    { desc: "Pen purchase", amt: 20, cat: "shopping", time: () => randomTime(11, 18) },

    // Bigger spends
    { desc: "Perfume", amt: 800, cat: "shopping", time: () => randomTime(13, 20) },
    { desc: "T-shirt", amt: 500, cat: "shopping", time: () => randomTime(13, 20) },
    { desc: "Jeans", amt: 1200, cat: "shopping", time: () => randomTime(13, 20) },

    // Misc
    { desc: "Auto fare", amt: 70, cat: "transport", time: () => randomTime(9, 22) },
  ];

  const daysBack = 20;

  for (let i = 0; i < 60; i++) {
    const e = expenses[Math.floor(Math.random() * expenses.length)];

    const date = e.time();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));

    await prisma.expense.create({
      data: {
        amount: e.amt * 100, // store in paise
        description: e.desc,
        date,
        category: {
          connect: { id: categoryMap[e.cat] },
        },
        idempotencyKey: crypto.randomUUID(),
      },
    });
  }

  console.log("Seeded successfully");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());