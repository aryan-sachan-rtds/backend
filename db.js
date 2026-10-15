import "dotenv/config";
import { PrismaClient } from "./prisma/schema/generated/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter_primary = new PrismaPg({ connectionString: process.env.PRIMARY_DATABASE_URL });
const adapter_replica = new PrismaPg({ connectionString: process.env.REPLICA_DATABASE_POOL_URL })

const prisma_primary = new PrismaClient({ adapter: adapter_primary });
const prisma_replica = new PrismaClient({ adapter: adapter_replica });

export { prisma_primary, prisma_replica };