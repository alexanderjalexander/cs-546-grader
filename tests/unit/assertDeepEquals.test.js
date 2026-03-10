import { describe, it } from "node:test";
import { ObjectId } from "mongodb";

import assert from "node:assert/strict";
import Grader from "../../Grader.js";

class TestGrader extends Grader {
  async testCases() {} // required override, intentionally empty
}

// Simple mismatches between different objects
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
    expected: undefined,
  },
];

// Deeper mismatches
const deep_mismatches = [
  {
    actual: {
      a: {
        b: {
          c: 1,
        },
      },
    },
    expected: {
      a: {
        b: {
          c: 2,
        },
      },
    },
  },
  {
    actual: { a: [1, 2, { x: 3 }] },
    expected: { a: [1, 2, { x: 4 }] },
  },
  {
    actual: [{ a: 1 }, { b: 2 }, { c: 3 }],
    expected: [{ a: 1 }, { b: 2 }, { c: 4 }],
  },
  {
    actual: { a: [{ b: [{ c: [{ d: [{ e: [{ f: 1 }] }] }] }] }] },
    expected: { a: [{ b: [{ c: [{ d: [{ e: [{ f: 2 }] }] }] }] }] },
  },
];

// Identical matches, these should be ok.
const matches = [
  {
    actual: { a: 1 },
    expected: { a: 1 },
  },
  {
    actual: [1, 2, 3],
    expected: [1, 2, 3],
  },
  {
    actual: "hello world",
    expected: "hello world",
  },
  {
    actual: { a: { b: { c: 1 } } },
    expected: { a: { b: { c: 1 } } },
  },
  {
    actual: [{ a: 1 }, { b: 2 }],
    expected: [{ a: 1 }, { b: 2 }],
  },
  {
    actual: null,
    expected: null,
  },
  {
    actual: undefined,
    expected: undefined,
  },
  {
    actual: {},
    expected: {},
  },
];

// Deeper matches
const deep_matches = [
  {
    actual: {
      a: {
        b: {
          c: 1,
        },
      },
    },
    expected: {
      a: {
        b: {
          c: 1,
        },
      },
    },
  },
  {
    actual: { a: [1, 2, { x: 3 }] },
    expected: { a: [1, 2, { x: 3 }] },
  },
  {
    actual: [{ a: 1 }, { b: 2 }, { c: 3 }],
    expected: [{ a: 1 }, { b: 2 }, { c: 3 }],
  },
  {
    actual: { a: [{ b: [{ c: [{ d: [{ e: [{ f: 1 }] }] }] }] }] },
    expected: { a: [{ b: [{ c: [{ d: [{ e: [{ f: 1 }] }] }] }] }] },
  },
];

// Each should be caught, properly deducted.
const throwing_cases = [
  {
    actual: () => {
      throw new Error("Generic error");
    },
    expected: true,
  },
  {
    actual: () => {
      throw new TypeError("Type error");
    },
    expected: true,
  },
  {
    actual: () => {
      throw new RangeError("Range error");
    },
    expected: true,
  },
  {
    actual: async () => {
      throw new Error("Async error");
    },
    expected: true,
  },
  {
    actual: () => {
      throw "raw string throw";
    },
    expected: true,
  },
];

// Ensure students who give back ObjectId's rather than strings get a notice back about it.
const object_id_mismatches = [
  {
    actual: { _id: new ObjectId(), name: "Alice" },
    expected: { _id: new ObjectId().toString(), name: "Alice" },
  },
  {
    actual: [
      { _id: new ObjectId() },
      { _id: new ObjectId().toString() },
    ],
    expected: [{ _id: new ObjectId().toString() }, { _id: new ObjectId().toString() }],
  },
];

describe("assertDeepEquals", () => {
  // Failure Cases: Obvious Mismatches
  for (let i = 0; i < mismatches.length; i++) {
    it(`Deducts on Mismatch ${(i + 1).toString().padStart(mismatches.length.toString.length, " ")}`, async () => {
      const grader = new TestGrader();
      await grader.assertDeepEquals(
        10,
        "Mismatch",
        () => mismatches[i].actual,
        mismatches[i].expected,
      );
      assert.notEqual(
        grader.score,
        100,
        "Grader did not deduct points for mismatch.",
      );
      assert.notEqual(
        grader.comments.length,
        0,
        "Grader did not add comments for mismatch.",
      );
    });
  }

  // Failure Cases: Deep Nests
  for (let i = 0; i < deep_mismatches.length; i++) {
    it(`Deducts on Deep Nest Mismatch ${(i + 1).toString().padStart(deep_mismatches.length.toString.length, " ")}`, async () => {
      const grader = new TestGrader();
      await grader.assertDeepEquals(
        10,
        "Mismatch",
        () => deep_mismatches[i].actual,
        deep_mismatches[i].expected,
      );
      assert.notEqual(
        grader.score,
        100,
        "Grader did not deduct points for mismatch.",
      );
      assert.notEqual(
        grader.comments.length,
        0,
        "Grader did not add deduction comments for mismatch.",
      );
    });
  }

  // Success Cases: Obvious Matches
  for (let i = 0; i < matches.length; i++) {
    it(`Does Not Deduct on Obvious Match ${(i + 1).toString().padStart(matches.length.toString.length, " ")}`, async () => {
      const grader = new TestGrader();
      await grader.assertDeepEquals(
        10,
        "Match",
        () => matches[i].actual,
        matches[i].expected,
      );
      assert.equal(grader.score, 100, "Grader deducted points for match.");
      assert.equal(
        grader.comments.length,
        0,
        "Grader added deduction comments for match.",
      );
    });
  }

  // Success Cases: Deep Nests
  for (let i = 0; i < deep_matches.length; i++) {
    it(`Does Not Deduct on Deep Nest Match ${(i + 1).toString().padStart(deep_matches.length.toString.length, " ")}`, async () => {
      const grader = new TestGrader();
      await grader.assertDeepEquals(
        10,
        "Match",
        () => deep_matches[i].actual,
        deep_matches[i].expected,
      );
      assert.equal(grader.score, 100, "Grader deducted points for match.");
      assert.equal(
        grader.comments.length,
        0,
        "Grader added deduction comments for match.",
      );
    });
  }

  // Throwing Cases
  for (let i = 0; i < throwing_cases.length; i++) {
    it(`Deducts on Thrown Error ${(i + 1).toString().padStart(throwing_cases.length.toString.length, " ")}`, async () => {
      const grader = new TestGrader();
      await grader.assertDeepEquals(
        10,
        "Throws",
        () => throwing_cases[i].actual,
        throwing_cases[i].expected,
      );
      assert.notEqual(
        grader.score,
        100,
        "Grader did not deduct points for throw.",
      );
      assert.notEqual(
        grader.comments.length,
        0,
        "Grader did not add deduction comments for throw.",
      );
    });
  }

  // ObjectId Cases
  for (let i = 0; i < object_id_mismatches.length; i++) {
    it(`Deducts on ObjectId Mismatch ${(i + 1).toString().padStart(object_id_mismatches.length.toString.length, " ")}`, async () => {
      const grader = new TestGrader();
      await grader.assertDeepEquals(
        10,
        "Mismatch",
        () => object_id_mismatches[i].actual,
        object_id_mismatches[i].expected,
      );
      assert.notEqual(
        grader.score,
        100,
        "Grader did not deduct points for ObjectId mismatch.",
      );
      assert.notEqual(
        grader.comments.length,
        0,
        "Grader did not add deduction comments for ObjectId mismatch.",
      );
      assert.ok(
        grader.comments[0].includes("ObjectId type found at the following key(s) instead of type string"),
        "Grader did not include ObjectId type notice in comments.",
      );
    });
  }
});
