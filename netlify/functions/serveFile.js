// netlify/functions/serveFile.js
const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  const fileName = event.queryStringParameters.file;

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
    ".gif": "image/gif"
  };

  const mimeType = mimeTypes[ext] || "application/octet-stream";
  const fileData = fs.readFileSync(filePath);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": mimeType,
    },
    body: fileData.toString("base64"),
    isBase64Encoded: true,
  };
};
