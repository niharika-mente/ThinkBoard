import dotenv from "dotenv";
import { Redis } from "@upstash/redis";

dotenv.config();


const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const connectRedis = async () => {
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return null;
    }
    await redisClient.ping();
    return redisClient;
  } catch (error) {
    console.log("Redis connection failed:", error.message);
    return null;
  }
};

export default redisClient;