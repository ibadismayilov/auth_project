import argon2 from "argon2";

export const hashPassword = async (password: string): Promise<string> => {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
  });
};

export const comparePassword = async (
  hash: string,
  plain: string,
): Promise<Boolean> => {
  try {
    return await argon2.verify(hash, plain);
  } catch (error) {
    return false;
  }
};
