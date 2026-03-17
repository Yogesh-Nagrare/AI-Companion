// backend/src/services/pdfExtractor.service.js

const { createRequire } = require("module");
const require2 = createRequire(require.resolve("pdf-parse/package.json"));
const pdfParse = require2("./lib/pdf-parse.js");

const extractTextFromBuffer = async (pdfBuffer) => {
  if (!Buffer.isBuffer(pdfBuffer)) {
    throw new Error("Invalid input: expected a Buffer");
  }

  let data;
  try {
    data = await pdfParse(pdfBuffer);
  } catch (err) {
    throw new Error(`pdf-parse failed to read the file: ${err.message}`);
  }

  const rawText = data?.text;

  if (!rawText || rawText.trim().length < 50) {
    throw new Error(
      "PDF appears to be empty or image-only (scanned). " +
      "Text extraction requires a text-based PDF."
    );
  }

  const cleaned = rawText
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return cleaned;
};

module.exports = { extractTextFromBuffer };