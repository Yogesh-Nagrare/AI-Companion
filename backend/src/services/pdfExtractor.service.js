// backend/services/pdfExtractor.service.js

// ✅ FIX: pdf-parse uses CommonJS module.exports (not a named export)
// Wrong:  const pdfParse = require("pdf-parse");          → gives the module object
// Wrong:  const { default: pdfParse } = require(...)      → undefined
// Correct: require the module then access .default, OR just call it directly
const pdfParse = require("pdf-parse");

// Some bundler/Node version combos wrap it — this handles both cases:
const parse = typeof pdfParse === "function" ? pdfParse : pdfParse.default;

/**
 * extractTextFromBuffer
 * @param {Buffer} pdfBuffer - Raw PDF bytes (from axios arraybuffer response)
 * @returns {Promise<string>} Extracted, cleaned plain text
 */
const extractTextFromBuffer = async (pdfBuffer) => {
  if (!Buffer.isBuffer(pdfBuffer)) {
    throw new Error("Invalid input: expected a Buffer");
  }

  let data;
  try {
    data = await parse(pdfBuffer);
  } catch (err) {
    throw new Error(`pdf-parse failed to read the file: ${err.message}`);
  }

  const rawText = data?.text;

  if (!rawText || rawText.trim().length < 50) {
    throw new Error(
      "PDF appears to be empty or image-only (scanned). " +
      "Text extraction requires a text-based PDF, not a scanned image."
    );
  }

  // Clean up whitespace while keeping structure readable
  const cleaned = rawText
    .replace(/\r\n/g, "\n")     // normalize line endings
    .replace(/[ \t]+/g, " ")    // collapse tabs/spaces
    .replace(/\n{3,}/g, "\n\n") // max 2 consecutive blank lines
    .trim();

  return cleaned;
};

module.exports = { extractTextFromBuffer };