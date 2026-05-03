export const redisKeys = {
  session: (userId: string, tokenHash: string) =>
    `session:${userId}:${tokenHash}`,

  otp: (email: string) => `otp:${email}`,

  rateLimit: (userId: string) => `rate:${userId}`,

  blacklist: (tokenHash: string) => `auth:blacklist:${tokenHash}`,
};
