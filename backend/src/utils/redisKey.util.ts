export const redisKeys = {
  session: (userId: string, tokenHash: string) => `session:${userId}:${tokenHash}`,

  otp: (email: string) => `otp:${email}`,

  idRateLimit: (userId: string) => `idRate:${userId}`,
  
  emailRateLimit: (email: string) => `emailRate:${email}`,

  blacklist: (tokenHash: string) => `auth:blacklist:${tokenHash}`,
} as const;
