import app from "./app.js";
import prisma from "./lib/prisma.js";

const port = Number(process.env.PORT ?? 4000);

const start = async (): Promise<void> => {
  await prisma.$connect();

  const server = app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on port ${port}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

start().catch(async (error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", error);
  await prisma.$disconnect();
  process.exit(1);
});
