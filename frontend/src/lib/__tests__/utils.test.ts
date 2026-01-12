import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("cn", () => {
  it("merges class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", true && "active", false && "hidden")).toBe("base active");
  });

  it("handles undefined and null values", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end");
  });

  it("handles empty strings", () => {
    expect(cn("base", "", "end")).toBe("base end");
  });

  it("handles arrays of classes", () => {
    expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
  });

  it("resolves tailwind conflicts - later class wins", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("resolves tailwind color conflicts", () => {
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  it("resolves tailwind spacing conflicts", () => {
    expect(cn("mt-2", "mt-4")).toBe("mt-4");
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("preserves non-conflicting tailwind classes", () => {
    expect(cn("px-2", "py-4")).toBe("px-2 py-4");
  });

  it("handles complex tailwind class combinations", () => {
    expect(cn("text-sm font-bold", "text-lg")).toBe("font-bold text-lg");
  });

  it("handles object syntax", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });

  it("returns empty string for no arguments", () => {
    expect(cn()).toBe("");
  });
});
