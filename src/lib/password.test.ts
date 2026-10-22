import { describe, expect, it } from "vitest";
import { isStrongPassword } from "./password";

describe("password rule", () => {
  it("rejects 10 characters even if mixed", () => expect(isStrongPassword("Abcdefgh!1")).toBe(false));
  it("accepts 11+ chars with upper, lower and special", () => expect(isStrongPassword("Abcdefghi!j")).toBe(true));
  it("requires an uppercase letter", () => expect(isStrongPassword("abcdefghi!jk")).toBe(false));
  it("requires a lowercase letter", () => expect(isStrongPassword("ABCDEFGHI!JK")).toBe(false));
  it("requires a special character", () => expect(isStrongPassword("Abcdefghijkl")).toBe(false));
});
