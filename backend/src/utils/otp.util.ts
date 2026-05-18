import crypto from "crypto";

export const generateOTP = (length = 6): string => {
  const digits = "0123456789";
  let otp = "";

  while (otp.length < length) {
    const byte = crypto.randomBytes(1)[0] % digits.length;
    otp += digits[byte];
  }

  return otp;
};
