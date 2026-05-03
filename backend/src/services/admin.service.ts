import { redisClient } from "../lib/redis";

export const banIp = async (ip: string, ttl = 3600) => {
  await redisClient.setEx(`ban:ip:${ip}`, ttl, "1");
};

export const unbanIp = async (ip: string) => {
  await redisClient.del(`ban:ip:${ip}`);
};

export const isIpBanned = async (ip: string) => {
  const result = await redisClient.get(`ban:ip:${ip}`);

  return !!result;
};
