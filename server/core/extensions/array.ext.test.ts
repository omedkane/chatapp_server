import "ts-jest";
import { ArrayExt } from "./array.ext";

test("ArrayExt IncludesAny Method Test", () => {
  const a = [12, 13, 14, 15];

  expect(ArrayExt.includesAny(a, [65, 98, 65, 21, 45, 68])).toBe(false);
  expect(ArrayExt.includesAny(a, [65, 98, 65, 12, 45, 68])).toBe(true);
  expect(ArrayExt.includesAny(a, [65, 12, 65, 45, 12])).toBe(true);
  expect(ArrayExt.includesAny(a, [12, 13, 14, 15])).toBe(true);
});

test("ArrayExt IncludesAll Method Test", () => {
  const a = [12, 13, 21, 31, 14, 25];

  expect(ArrayExt.includesAll(a, [12, 13, 21])).toBe(true);
  expect(ArrayExt.includesAll(a, [12, 13, 21, 31, 25, 14])).toBe(true);
  expect(ArrayExt.includesAll(a, [12, 13, 21, 31, 15, 14])).toBe(false);
  expect(ArrayExt.includesAll(a, [12, 13, 21, 31, 14, 25, 98])).toBe(false);
});
