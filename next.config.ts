import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/order",
  // Prevent Next.js/Turbopack from bundling Prisma. Without this, process.cwd()
  // inside bundled code resolves to an unexpected path and SQLite can't open the DB.
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
