// backend/src/services/pdfExtractor.service.js

<<<<<<< HEAD
const { createRequire } = require("module");
const require2 = createRequire(require.resolve("pdf-parse/package.json"));
const pdfParse = require2("./lib/pdf-parse.js");

=======
>>>>>>> 2521827850d11c527a3dac8cfef97e2f5624a469
const extractTextFromBuffer = async (pdfBuffer) => {
  if (!Buffer.isBuffer(pdfBuffer)) {
    throw new Error("Invalid input: expected a Buffer");
  }

  console.log("Extracting PDF, buffer size:", pdfBuffer.length);

  // Dynamically import inside the function
  let pdfParse;
  try {
    pdfParse = require("pdf-parse");
    pdfParse = typeof pdfParse === "function" ? pdfParse : pdfParse.default;
  } catch (err) {
    console.error("Failed to load pdf-parse:", err);
    throw new Error("PDF parser not found. Check your pdf-parse installation.");
  }

  if (typeof pdfParse !== "function") {
    console.error("pdf-parse is not a function:", pdfParse);
    throw new Error("PDF parser not loaded correctly.");
  }

  let data;
  try {
    data = await pdfParse(pdfBuffer);
  } catch (err) {
    console.error("PDF parsing failed:", err);
    throw new Error(`pdf-parse failed to read the file: ${err.message}`);
  }

  const rawText = data?.text;
  if (!rawText || rawText.trim().length < 50) {
    throw new Error(
<<<<<<< HEAD
      "PDF appears to be empty or image-only (scanned). " +
      "Text extraction requires a text-based PDF."
    );
  }

=======
      "PDF appears empty or image-only (scanned). Text-based PDF required."
    );
  }

  console.log("Raw text length:", rawText.length);

>>>>>>> 2521827850d11c527a3dac8cfef97e2f5624a469
  const cleaned = rawText
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return cleaned;
};

module.exports = { extractTextFromBuffer };