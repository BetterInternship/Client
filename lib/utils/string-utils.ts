import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const generateMemberId = () =>
  `MEM-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

export const titleCase = (s: string) => 
  s.split(" ").map(s => `${s.charAt(0).toUpperCase()}${s.slice(1)}`).join(" ")

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toSafeString = (s?: string | null, def: string = "") => {
  if (typeof s === "string" && s.trim().length > 0) return s;
  return def;
};

export const isValidUUID = (uuid: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    uuid
  );
};

export const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Production URL
    process?.env?.NEXT_PUBLIC_PREVIEW_URL ?? // Development URL
    process?.env?.NEXT_PUBLIC_VERCEL_BRANCH_URL ?? //Branch URL
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Generated URL
    "http://localhost:3080/"; // Local Development URL
  url = url.includes("http") ? url : `https://${url}`;
  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
  return url;
};

export const getInitials = (name?: string) => {
  if (!name) return "HR";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "H";
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export const isPathNameSame = (path1: string, path2: string) => {
  const path1Parts = path1.split("/");
  const path2Parts = path2.split("/");
  if (path1Parts.length !== path2Parts.length) return false;
  // check last path name if same
  const lastPath1 = path1Parts[path1Parts.length - 1];
  const lastPath2 = path2Parts[path2Parts.length - 1];
  return lastPath1 === lastPath2;
};

export function isValidPHNumber(phone_num?: string | null) {
  if (!phone_num) return false;
  return (
    /^9\d{9}$/.test(phone_num) ||
    /^09\d{9}$/.test(phone_num) ||
    /^639\d{9}$/.test(phone_num) ||
    /^\+639\d{9}$/.test(phone_num) ||
    /^\(\+63\)\s?\d{3}\s?\d{3}\s?\d{4}$/.test(phone_num) ||
    /^(\+63|0)9\d{9}$/.test(phone_num)
  );
}

export function isValidEmail(email?: string | null) {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

export const normalizePhoneNumber = (
  phoneNumber: string | null | undefined
): string | null => {
  if (!phoneNumber) {
    return null;
  }

  let cleanedNumber = phoneNumber.replace(/[-\s]/g, "");

  if (cleanedNumber.startsWith("+639") && cleanedNumber.length === 13) {
    if (/^\+639\d{9}$/.test(cleanedNumber)) {
      return cleanedNumber.trim();
    }
  } else if (cleanedNumber.startsWith("639") && cleanedNumber.length === 12) {
    if (/^639\d{9}$/.test(cleanedNumber)) {
      return "+".concat(cleanedNumber).trim();
    }
  } else if (cleanedNumber.startsWith("09") && cleanedNumber.length === 11) {
    if (/^09\d{9}$/.test(cleanedNumber)) {
      return "+63".concat(cleanedNumber.substring(1)).trim();
    }
  } else if (cleanedNumber.startsWith("9") && cleanedNumber.length === 10) {
    if (/^9\d{9}$/.test(cleanedNumber)) {
      return "+63".concat(cleanedNumber).trim();
    }
  }
  console.warn(
    `Could not normalize phone number: "${phoneNumber}" to a valid PH mobile format.`
  );
  return null;
};

export const isPhoneNumberSame = (
  num1: string | null | undefined,
  num2: string | null | undefined
): boolean => {
  if (!num1 || !num2) return false;
  const normalizedNum1 = normalizePhoneNumber(num1);
  const normalizedNum2 = normalizePhoneNumber(num2);
  return normalizedNum1 === normalizedNum2;
};

export const createSearchFilterString = (
  columns: string[],
  searchTerm: string
): string => {
  if (!searchTerm || searchTerm.trim() === "") {
    return "";
  }

  const searchTerms = searchTerm
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 0);

  if (searchTerms.length === 0) {
    return "";
  }

  return columns.map((col) => `${col}.ilike.%${searchTerm}%`).join(",");
};

export const getSanitizedFilterValue = (value?: string): string => {
  if (!value || value === "all") return "";
  return value.replace(/[^a-z0-9_]/gi, "_").toLowerCase();
};

export const hashStringToInt = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Keep it 32-bit signed
  }
  return hash >>> 0; // Convert to unsigned
};
