import { Request } from "express";
import "ts-jest";
import { hasParams } from "./shared.functions";

test("Testing hasParams", () => {
  const request = {
    body: {
      userId: 6546,
      listOfIds: { ml: 12, lk: 13, po: 35 },
    },
  } as Request;

  const request2 = {
    body: {
      userId: { po: 987 },
      listOfIds: ["po", "po"],
    },
  } as Request;

  expect(
    hasParams(request, {
      userId: "string",
      listOfIds: "literal",
    })
  ).toBe(false);

  expect(
    hasParams(request, {
      userId: "number",
      listOfIds: "literal",
    })
  ).toBe(true);

  expect(
    hasParams(request, {
      userId: "string",
      listOfIds: "literal",
    })
  ).toBe(false);
  
  // - Request 2 Test
  expect(
    hasParams(request2, {
      userId: "literal",
      listOfIds: "array",
    })
  ).toBe(true);
  
  expect(
    hasParams(request2, {
      userId: "array",
      listOfIds: "literal",
    })
  ).toBe(false);
  
});
