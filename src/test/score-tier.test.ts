import { describe, it, expect } from "vitest";
import { scoreTier } from "@/lib/resume-export";
describe("scoreTier", () => {
  it("75+ is high", () => { expect(scoreTier(75)).toBe("high"); });
  it("50-74 is mid", () => { expect(scoreTier(50)).toBe("mid"); expect(scoreTier(74)).toBe("mid"); });
  it("below 50 is low", () => { expect(scoreTier(49)).toBe("low"); });
});
