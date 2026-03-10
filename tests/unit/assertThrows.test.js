import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Grader from "../../Grader.js";

class TestGrader extends Grader {
  async testCases() {}
}

// Cases where the function does NOT throw — should always deduct
const no_throw_cases = [
  { actual: () => true, expected: true },
  { actual: () => "hello", expected: "hello" },
  { actual: () => null, expected: null },
  { actual: async () => ({ result: 1 }), expected: { result: 1 } },
];

// Cases where the function throws with no message/type check — should never deduct
const basic_throw_cases = [
  {
    actual: () => {
      throw new Error("Generic error");
    },
  },
  {
    actual: () => {
      throw new TypeError("Type error");
    },
  },
  {
    actual: () => {
      throw new RangeError("Range error");
    },
  },
  {
    actual: async () => {
      throw new Error("Async error");
    },
  },
  {
    actual: () => {
      throw "raw string throw";
    },
  },
];

// Cases where the message matches — should not deduct messagePoints
const correct_message_cases = [
  {
    actual: () => {
      throw new Error("Expected message");
    },
    expected_message: "Expected message",
  },
  {
    actual: () => {
      throw new Error("  padded  ");
    },
    expected_message: "  padded  ",
  },
  {
    actual: () => {
      throw "raw string";
    },
    expected_message: "raw string",
  },
];

// Cases where the message does NOT match — should deduct messagePoints
const wrong_message_cases = [
  {
    actual: () => {
      throw new Error("Wrong message");
    },
    expected_message: "Expected message",
  },
  {
    actual: () => {
      throw new Error("");
    },
    expected_message: "Expected message",
  },
  {
    actual: () => {
      throw "raw string";
    },
    expected_message: "different string",
  },
];

// Cases where the type matches — should not deduct typePoints
const correct_type_cases = [
  {
    actual: () => {
      throw new TypeError("oops");
    },
    expected_type: TypeError,
  },
  {
    actual: () => {
      throw new RangeError("oops");
    },
    expected_type: RangeError,
  },
  {
    actual: () => {
      throw new Error("oops");
    },
    expected_type: Error,
  },
];

// Cases where the type does NOT match — should deduct typePoints
const wrong_type_cases = [
  {
    actual: () => {
      throw new TypeError("oops");
    },
    expected_type: RangeError,
  },
  {
    actual: () => {
      throw new Error("oops");
    },
    expected_type: TypeError,
  },
  {
    actual: () => {
      throw "raw string";
    },
    expected_type: Error,
  },
];

describe("assertThrows", () => {
  // Failure Cases: No Throws
  for (let i = 0; i < no_throw_cases.length; i++) {
    it(`Deducts on No Throw ${(i + 1).toString().padStart(no_throw_cases.length.toString().length, " ")}`, async () => {
      const grader = new TestGrader();
      await grader.assertThrows(10, "No Throw", no_throw_cases[i].actual);
      assert.notEqual(
        grader.score,
        100,
        "Grader did not deduct points when no error was thrown.",
      );
      assert.notEqual(
        grader.comments.length,
        0,
        "Grader did not add comments when no error was thrown.",
      );
    });
  }

  // Success Cases: Basic Throws
  for (let i = 0; i < basic_throw_cases.length; i++) {
    it(`Does Not Deduct on Basic Throw ${(i + 1).toString().padStart(basic_throw_cases.length.toString().length, " ")}`, async () => {
      const grader = new TestGrader();
      await grader.assertThrows(10, "Basic Throw", basic_throw_cases[i]);
      assert.equal(
        grader.score,
        100,
        "Grader incorrectly deducted points for a correctly thrown error.",
      );
      assert.equal(
        grader.comments.length,
        0,
        "Grader incorrectly added comments for a correctly thrown error.",
      );
    });
  }

  // Success Cases: Correct Error Message
  for (let i = 0; i < correct_message_cases.length; i++) {
    it(`Does Not Deduct on Correct Message ${(i + 1).toString().padStart(correct_message_cases.length.toString().length, " ")}`, async () => {
      const grader = new TestGrader();
      const { actual, expected_message } = correct_message_cases[i];
      await grader.assertThrows(
        10,
        "Correct Message",
        actual,
        expected_message,
        5,
      );
      assert.equal(
        grader.score,
        100,
        "Grader incorrectly deducted points for a matching error message.",
      );
      assert.equal(
        grader.comments.length,
        0,
        "Grader incorrectly added comments for a matching error message.",
      );
    });
  }

  // Failure Cases: Wrong Error Message
  for (let i = 0; i < wrong_message_cases.length; i++) {
    it(`Deducts on Wrong Message ${(i + 1).toString().padStart(wrong_message_cases.length.toString().length, " ")}`, async () => {
      const grader = new TestGrader();
      const { actual, expected_message } = wrong_message_cases[i];
      await grader.assertThrows(
        10,
        "Wrong Message",
        actual,
        expected_message,
        5,
      );
      assert.notEqual(
        grader.score,
        100,
        "Grader did not deduct points for wrong error message.",
      );
      assert.notEqual(
        grader.comments.length,
        0,
        "Grader did not add comments for wrong error message.",
      );
    });
  }

  // Success Cases: Correct Error Type
  for (let i = 0; i < correct_type_cases.length; i++) {
    it(`Does Not Deduct on Correct Type ${(i + 1).toString().padStart(correct_type_cases.length.toString().length, " ")}`, async () => {
      const grader = new TestGrader();
      const { actual, expected_type } = correct_type_cases[i];
      await grader.assertThrows(
        10,
        "Correct Type",
        actual,
        undefined,
        undefined,
        expected_type,
        5,
      );
      assert.equal(
        grader.score,
        100,
        "Grader incorrectly deducted points for a matching error type.",
      );
      assert.equal(
        grader.comments.length,
        0,
        "Grader incorrectly added comments for a matching error type.",
      );
    });
  }

  // Failure Cases: Wrong Error Type
  for (let i = 0; i < wrong_type_cases.length; i++) {
    it(`Deducts on Wrong Type ${(i + 1).toString().padStart(wrong_type_cases.length.toString().length, " ")}`, async () => {
      const grader = new TestGrader();
      const { actual, expected_type } = wrong_type_cases[i];
      await grader.assertThrows(
        10,
        "Wrong Type",
        actual,
        undefined,
        undefined,
        expected_type,
        5,
      );
      assert.notEqual(
        grader.score,
        100,
        "Grader did not deduct points for wrong error type.",
      );
      assert.notEqual(
        grader.comments.length,
        0,
        "Grader did not add comments for wrong error type.",
      );
    });
  }

  // Make sure messagePoints is given with expectedMessage
  it("Throws When Given Expected Message W/O Message Points", async () => {
    const grader = new TestGrader();
    await assert.rejects(
      () =>
        grader.assertThrows(
          10,
          "Bad Config",
          () => {
            throw new Error("x");
          },
          "expected message",
        ),
      TypeError,
    );
  });

  // Make sure typePoints is given with expectedType
  it("Throws When Given Expected Type W/O Type Points", async () => {
    const grader = new TestGrader();
    await assert.rejects(
      () =>
        grader.assertThrows(
          10,
          "Bad Config",
          () => {
            throw new Error("x");
          },
          undefined,
          undefined,
          Error,
        ),
      TypeError,
    );
  });
});
