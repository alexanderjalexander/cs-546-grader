import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Grader from "../../Grader.js";

class TestGrader extends Grader {
  async testCases() {} // required override, intentionally empty
}

const mismatches = [
  {
    actual: {
      a: 1,
    },
    expected: {
      a: 2,
    },
  },
  {
    actual: {
      a: 1,
    },
    expected: {
      a: 1,
      b: 2,
    },
  },
  {
    actual: [1, 2, 3],
    expected: [1, 2, 3, 4],
  },
  {
    actual: [1, 2, 3],
    expected: [1, 3, 2],
  },
  {
    actual: "hello world",
    expected: "   HELLO    WORLD   ",
  },
  {
    actual: null,
    expected: {},
  },
  {
    actual: undefined,
    expected: {},
  },
  {
    actual: null,
    expected: {},
  },
];

describe("assertDeepEquals", () => {
  for (let i = 0; i < mismatches.length; i++) {
    it(`Deducts on Mismatch ${(i+1).toString().padStart(mismatches.length.toString.length, ' ')}`, async () => {
      const grader = new TestGrader();
      await grader.assertDeepEquals(10, "Mismatch", () => (mismatches[i].actual), mismatches[i].expected);
      assert.notEqual(grader.score, 100);
      assert.notEqual(grader.comments.length, 0);
    });
  }
});
