const mammoth = require("mammoth");

const extractFromPDF = async (buffer) => {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const uint8Array = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
  const pdf = await loadingTask.promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ") + "\n";
  }
  return text;
};

const extractFromDOCX = async (buffer) => {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
};

const extractTextFromFile = async (file) => {
  const { mimetype, buffer } = file;
  if (mimetype === "application/pdf") {
    return await extractFromPDF(buffer);
  } else if (
    mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimetype === "application/msword"
  ) {
    return await extractFromDOCX(buffer);
  } else {
    throw new Error(
      "❌ Unsupported file type. Please upload PDF or DOCX only.",
    );
  }
};

module.exports = { extractTextFromFile };
