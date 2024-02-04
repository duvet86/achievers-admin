import { calculateYearLevel } from "./utils";

describe("Utils", () => {
  beforeEach(() => {
    // tell vitest we use mocked time
    vi.useFakeTimers();
  });

  afterEach(() => {
    // restoring date after each test run
    vi.useRealTimers();
  });

  describe("calculateYearLevel", () => {
    it("should work", () => {
      const date = new Date(2024, 3, 4);
      vi.setSystemTime(date);

      const dateOfBirth = new Date(2018, 0, 1);

      const yearLevel = calculateYearLevel(dateOfBirth);

      expect(yearLevel).toBe(1);
    });
  });
});
