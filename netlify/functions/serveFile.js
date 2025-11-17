const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  const fileName = event.queryStringParameters?.file;

  if (!fileName) {
    return { statusCode: 400, body: "File parameter missing" };
  }

  const filePath = path.join(__dirname, "../../uploads", fileName);

  if (!fs.existsSync(filePath)) {
    return { statusCode: 404, body: "File not found" };
  }

  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
  };
  const mimeType = mimeTypes[ext] || "application/octet-stream";

  // Serve file as raw bytes
  const fileData = fs.readFileSync(filePath);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": mimeType,
      "Cache-Control": "max-age=31536000",
    },
    body: fileData.toString("binary"),
    isBase64Encoded: false, // Important: do NOT base64 encode
  };
};
