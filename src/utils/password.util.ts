// src/utils/password.util.ts
import argon2 from 'argon2';

/**
 * 🔒 แฮชรหัสผ่านด้วย Argon2 (OWASP Recommended)
 */
export const hashPassword = async (plainPassword: string): Promise<string> => {
  return await argon2.hash(plainPassword);
};

/**
 * 🔑 ตรวจสอบรหัสผ่านว่าตรงกับ Hash หรือไม่
 */
export const verifyPassword = async (hashedPassword: string, plainPassword: string): Promise<boolean> => {
  try {
    return await argon2.verify(hashedPassword, plainPassword);
  } catch {
    return false;
  }
};