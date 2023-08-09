import Redis from "ioredis";
import { config } from "dotenv";
config();
export const redis = new Redis({
  host: process.env.REDIS_HOST ?? "localhost",
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  password: process.env.REDIS_PASSWORD ?? "",
});
redis.on("error", () => {
  return Error("Redis error");
});
