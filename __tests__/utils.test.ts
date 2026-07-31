import { describe, it, expect } from "vitest";
import { formatCurrency, cn } from "@/lib/utils";

describe("formatCurrency", () => {
  it("formats positive numbers", () => {
    const result = formatCurrency(1234.5);
    expect(result).toMatch(/1\.?234/);
    expect(result).toContain("50");
    expect(result).toContain("€");
  });

  it("formats zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
  });

  it("formats decimal values", () => {
    const result = formatCurrency(0.99);
    expect(result).toMatch(/0[,.]99/);
  });
});

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("filters falsy values", () => {
    expect(cn("foo", false, undefined, null, "bar")).toBe("foo bar");
  });

  it("returns empty string for no args", () => {
    expect(cn()).toBe("");
  });
});
