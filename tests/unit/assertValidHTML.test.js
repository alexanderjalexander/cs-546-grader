import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Grader from "../../Grader.js";

// Valid HTML cases - these should NOT deduct points
const valid_html = [
  {
    html: '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Test</title></head><body><h1>Hello</h1></body></html>',
    name: "Basic valid HTML with required meta tags",
  },
  {
    html: '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Page</title></head><body><p>Content</p></body></html>',
    name: "HTML with meta charset",
  },
  {
    html: '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Lists</title></head><body><ul><li>Item 1</li><li>Item 2</li></ul></body></html>',
    name: "HTML with list elements",
  },
  {
    html: '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Form</title></head><body><form><label for="field">Text:</label><input id="field" type="text" name="field"><button type="submit">Submit</button></form></body></html>',
    name: "HTML with properly labeled form elements",
  },
  {
    html: '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Semantic</title></head><body><header><nav><a href="#">Link</a></nav></header><main><article><h1>Article</h1><p>Content</p></article></main><footer>Footer</footer></body></html>',
    name: "HTML with semantic elements",
  },
  {
    html: '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Table</title></head><body><table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Cell</td></tr></tbody></table></body></html>',
    name: "HTML with valid table structure",
  },
  {
    html: '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Links</title></head><body><a href="page.html">Link</a><img src="image.jpg" alt="Image Description"></body></html>',
    name: "HTML with links and images with alt text",
  },
  {
    html: '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Headings</title></head><body><h1>Main Title</h1><h2>Section Title</h2><p>Paragraph text</p></body></html>',
    name: "HTML with proper heading hierarchy",
  },
];

// Invalid HTML cases - these SHOULD deduct points
const invalid_html = [
  {
    html: "<html><head><title>Unclosed Div</title></head><body><div>Content</body></html>",
    name: "Unclosed div tag",
  },
  {
    html: "<!DOCTYPE html><html><head><title>Mismatched Tags</title></head><body><p>Text</div></body></html>",
    name: "Mismatched paragraph and div closing tags",
  },
  {
    html: '<!DOCTYPE html><html><head><title>Duplicate ID</title></head><body><div id="main">First</div><div id="main">Second</div></body></html>',
    name: "Duplicate IDs",
  },
  {
    html: '<!DOCTYPE html><html><head><title>Duplicate ID</title></head><body><p id="main">First</p><p id="main">Second</p></body></html>',
    name: "Duplicate id's for <p> elements.",
  },
  {
    html: '<!DOCTYPE html>\n<html>\n<head><title>Test</title></head>\n<body>\n<img src="image.jpg">\n</body>\n</html>',
    name: "Image missing alt attribute",
  },
  {
    html: "<!DOCTYPE html><html><head><title>Test</title></head><body><a>Link with no href<p>Text</a></p></body></html>",
    name: "Link without href attribute.",
  },
  {
    html: '<!DOCTYPE html><html><head><title>Test</title></head><body><div><input type="text"></body></html>',
    name: "Unclosed elements inside <body> element.",
  },
  {
    html: "<html><head></head><body><h1>Skipped heading level</h1><h3>Jump to h3</h3></body></html>",
    name: "Skipped heading hierarchy",
  },
];

describe("assertValidHTML", () => {
  // Success Cases: Valid HTML
  for (let i = 0; i < valid_html.length; i++) {
    it(`Does Not Deduct on Valid HTML ${(i + 1).toString().padStart(valid_html.length.toString().length, " ")} - ${valid_html[i].name}`, async () => {
      const grader = new Grader();
      await grader.assertValidHTML(10, valid_html[i].html, "/home");
      assert.equal(
        grader.score,
        100,
        "Grader deducted points for valid HTML.",
      );
      assert.equal(
        grader.comments.length,
        0,
        "Grader added deduction comments for valid HTML.",
      );
    });
  }

  // Failure Cases: Invalid HTML
  for (let i = 0; i < invalid_html.length; i++) {
    it(`Deducts on Invalid HTML ${(i + 1).toString().padStart(invalid_html.length.toString().length, " ")} - ${invalid_html[i].name}`, async () => {
      const grader = new Grader();
      await grader.assertValidHTML(
        10,
        invalid_html[i].html,
        "/home",
      );
      assert.notEqual(
        grader.score,
        100,
        "Grader did not deduct points for invalid HTML.",
      );
      assert.notEqual(
        grader.comments.length,
        0,
        "Grader did not add deduction comments for invalid HTML.",
      );
      assert.ok(
        grader.comments[0].includes("HTML validation errors"),
        "Grader comment does not mention HTML validation errors.",
      );
    });
  }

  // Test with custom page names
  it("Includes custom page name in comments", async () => {
    const grader = new Grader();
    const customPageName = "/home";
    await grader.assertValidHTML(
      10,
      invalid_html[0].html,
      customPageName,
    );
    assert.ok(
      grader.comments[0].includes(customPageName),
      "Grader comments do not include custom page name.",
    );
  });

  // Test that multiple errors only deduct once per call
  it("Deducts Once on Multiple Errors", async () => {
    const grader = new Grader();
    const multiErrorHtml =
      "<!DOCTYPE html><html><head><title>Multiple Errors</title></head><body>" +
      '<img src="image.jpg">' +
      "<a>No href</a>" +
      "<h3>Skipped h2</h3>" +
      "</body></html>";

    await grader.assertValidHTML(10, multiErrorHtml, "/home");
    assert.notEqual(grader.score, 100, "Grader did not deduct points.");
    // Should have exactly one comment for this call
    assert.equal(
      grader.comments.length,
      1,
      "Grader created multiple comments for a single assertion.",
    );
  });
});
