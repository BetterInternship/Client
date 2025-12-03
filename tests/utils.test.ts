/// <reference types="jest" />

import {
  toSafeString,
  isValidUUID,
  getURL,
  isValidPHNumber,
  isValidEmail,
  normalizePhoneNumber,
  isPhoneNumberSame,
  createSearchFilterString,
  hashStringToInt,
} from "@/lib/utils";

describe("Utility Functions", () => {
  // Test toSafeString
  describe("toSafeString", () => {
    it("should return the string if it's valid", () => {
      expect(toSafeString("Test String")).toBe("Test String");
    });

    it("should return the default value for null input", () => {
      expect(toSafeString(null, "default")).toBe("default");
    });

    it("should return the default value for undefined input", () => {
      expect(toSafeString(undefined, "default")).toBe("default");
    });

    it("should return the default value for empty string input", () => {
      expect(toSafeString("", "default")).toBe("default");
    });

    it("should return the default value for whitespace string input", () => {
      expect(toSafeString("  ", "default")).toBe("default");
    });

    it("should use an empty string as default when not provided", () => {
      expect(toSafeString(null)).toBe("");
      expect(toSafeString(" ")).toBe("");
    });
  });

  // Test isValidUUID
  describe("isValidUUID", () => {
    it("should return true for a valid UUID v4", () => {
      expect(isValidUUID("f47ac10b-58cc-4372-a567-0e02b2c3d479")).toBe(true);
    });

    it("should return true for a valid UUID v4 with uppercase letters", () => {
      expect(isValidUUID("F47AC10B-58CC-4372-A567-0E02B2C3D479")).toBe(true);
    });

    it("should return false for an invalid format", () => {
      expect(isValidUUID("f47ac10b-58cc-4372-a567-0e02b2c3d47")).toBe(false);
    });

    it("should return false for a UUID with wrong version (must be 4)", () => {
      expect(isValidUUID("f47ac10b-58cc-1372-a567-0e02b2c3d479")).toBe(false);
    });

    it("should return false for a UUID with wrong variant (must be 8, 9, a, or b)", () => {
      expect(isValidUUID("f47ac10b-58cc-4372-c567-0e02b2c3d479")).toBe(false);
    });
  });

  // Test getURL
  describe("getURL", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
      delete process.env.NEXT_PUBLIC_SITE_URL;
      delete process.env.NEXT_PUBLIC_PREVIEW_URL;
      delete process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL;
      delete process.env.NEXT_PUBLIC_VERCEL_URL;
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it("should return NEXT_PUBLIC_SITE_URL if set, and ensure https and trailing slash", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "mysite.com";
      expect(getURL()).toBe("https://mysite.com/");
    });

    it("should fall back to NEXT_PUBLIC_VERCEL_URL, and ensure https and trailing slash", () => {
      process.env.NEXT_PUBLIC_VERCEL_URL = "myvercel.app";
      expect(getURL()).toBe("https://myvercel.app/");
    });

    it("should prioritize existing protocol (http)", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "http://mydev.com";
      expect(getURL()).toBe("http://mydev.com/");
    });

    it("should add a trailing slash if missing", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://mysite.com";
      expect(getURL()).toBe("https://mysite.com/");
    });

    it("should use localhost default if no environment variables are set", () => {
      expect(getURL()).toBe("http://localhost:3080/");
    });
  });

  // Test isValidPHNumber
  describe("isValidPHNumber", () => {
    it("should return false for null or undefined input", () => {
      expect(isValidPHNumber(null)).toBe(false);
      expect(isValidPHNumber(undefined)).toBe(false);
    });

    it("should return true for valid 10-digit format (9xxxxxxxxx)", () => {
      expect(isValidPHNumber("9171234567")).toBe(true);
    });

    it("should return true for valid 11-digit format (09xxxxxxxxx)", () => {
      expect(isValidPHNumber("09171234567")).toBe(true);
    });

    it("should return true for valid 12-digit format (639xxxxxxxxx)", () => {
      expect(isValidPHNumber("639171234567")).toBe(true);
    });

    it("should return true for valid +63 format (+639xxxxxxxxx)", () => {
      expect(isValidPHNumber("+639171234567")).toBe(true);
    });

    it("should return true for valid grouped format ((+63) 9xx xxx xxxx)", () => {
      expect(isValidPHNumber("(+63) 917 123 4567")).toBe(true);
    });

    it("should return false for an invalid number of digits", () => {
      expect(isValidPHNumber("917123456")).toBe(false);
    });
  });

  // Test isValidEmail
  describe("isValidEmail", () => {
    it("should return true for a standard valid email", () => {
      expect(isValidEmail("test.user@example.com")).toBe(true);
    });

    it("should return true for an email with numbers and underscores", () => {
      expect(isValidEmail("user_123@sub.domain-name.co")).toBe(true);
    });

    it("should return false for null or undefined input", () => {
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
    });

    it("should return false for an email missing @ symbol", () => {
      expect(isValidEmail("test.user.example.com")).toBe(false);
    });

    it("should return false for an email with missing domain extension", () => {
      expect(isValidEmail("test.user@example")).toBe(false);
    });
  });

  // Test normalizePhoneNumber
  describe("normalizePhoneNumber", () => {
    it("should return null for null, undefined, or empty string input", () => {
      expect(normalizePhoneNumber(null)).toBe(null);
      expect(normalizePhoneNumber(undefined)).toBe(null);
      expect(normalizePhoneNumber("")).toBe(null);
    });

    it("should normalize 10-digit number (9xxxxxxxxx) to +639xxxxxxxxx", () => {
      expect(normalizePhoneNumber("9171234567")).toBe("+639171234567");
    });

    it("should normalize 11-digit number (09xxxxxxxxx) to +639xxxxxxxxx", () => {
      expect(normalizePhoneNumber("09171234567")).toBe("+639171234567");
    });

    it("should normalize 12-digit number (639xxxxxxxxx) to +639xxxxxxxxx", () => {
      expect(normalizePhoneNumber("639171234567")).toBe("+639171234567");
    });

    it("should return a valid +63 number (+639xxxxxxxxx) as is", () => {
      expect(normalizePhoneNumber("+639171234567")).toBe("+639171234567");
    });

    it("should handle numbers with spaces and hyphens by removing them", () => {
      expect(normalizePhoneNumber("0917-123-4567")).toBe("+639171234567");
      expect(normalizePhoneNumber("917 123 4567")).toBe("+639171234567");
    });

    it("should return null for non-PH-mobile-formatted numbers", () => {
      expect(normalizePhoneNumber("1234567890")).toBe(null);
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });

  // Test isPhoneNumberSame
  describe("isPhoneNumberSame", () => {
    it("should return false if either number is null or undefined", () => {
      expect(isPhoneNumberSame("09171234567", null)).toBe(false);
      expect(isPhoneNumberSame(undefined, "09171234567")).toBe(false);
      expect(isPhoneNumberSame(null, null)).toBe(false);
    });

    it("should return true for different formats of the same number", () => {
      expect(isPhoneNumberSame("09171234567", "+639171234567")).toBe(true);
      expect(isPhoneNumberSame("9171234567", "639171234567")).toBe(true);
    });

    it("should return false for different valid phone numbers", () => {
      expect(isPhoneNumberSame("09171234567", "09181234567")).toBe(false);
    });

    it("should return false if normalization fails for either number", () => {
      expect(isPhoneNumberSame("09171234567", "12345")).toBe(false);
      expect(isPhoneNumberSame("12345", "09171234567")).toBe(false);
    });
  });

  // Test createSearchFilterString
  describe("createSearchFilterString", () => {
    const columns = ["first_name", "last_name", "email"];

    it("should return an empty string if searchTerm is null or empty", () => {
      expect(createSearchFilterString(columns, "")).toBe("");
      expect(createSearchFilterString(columns, " ")).toBe("");
    });

    it("should correctly create the filter string for a single term", () => {
      const expected =
        "first_name.ilike.%john%,last_name.ilike.%john%,email.ilike.%john%";
      expect(createSearchFilterString(columns, "john")).toBe(expected);
    });

    it("should treat multiple words in searchTerm as a single search term", () => {
      const searchTerm = "John Doe";
      const expected =
        "first_name.ilike.%John Doe%,last_name.ilike.%John Doe%,email.ilike.%John Doe%";
      expect(createSearchFilterString(columns, searchTerm)).toBe(expected);
    });

    it("should handle columns with special characters (if they were valid SQL columns)", () => {
      const cols = ["id", "data_value"];
      const expected = "id.ilike.%test%,data_value.ilike.%test%";
      expect(createSearchFilterString(cols, "test")).toBe(expected);
    });
  });

  // Test hashStringToInt
  describe("hashStringToInt", () => {
    it("should return 0 for an empty string", () => {
      expect(hashStringToInt("")).toBe(0);
    });

    it("should return a consistent hash for the same string", () => {
      const hash = hashStringToInt("hello world");
      expect(hash).toBe(hashStringToInt("hello world"));
      expect(typeof hash).toBe("number");
    });

    it("should return different hashes for different strings", () => {
      const hash1 = hashStringToInt("apple");
      const hash2 = hashStringToInt("orange");
      expect(hash1).not.toBe(hash2);
    });

    it("should return an unsigned 32-bit integer", () => {
      const hash = hashStringToInt(
        "A very long string that should result in a large hash value",
      );
      expect(hash).toBeGreaterThanOrEqual(0);
      expect(hash).toBeLessThanOrEqual(4294967295);
    });

    it("should return different hashes for strings that only differ by case", () => {
      const hash1 = hashStringToInt("Test");
      const hash2 = hashStringToInt("test");
      expect(hash1).not.toBe(hash2);
    });
  });
});
