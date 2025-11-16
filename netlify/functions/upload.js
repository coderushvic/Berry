const fs = require("fs");
const path = require("path");
const formidable = require("formidable");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Dynamically import uuid
  const { v4: uuidv4 } = await import("uuid");

  const form = new formidable.IncomingForm({ multiples: false });

  return new Promise((resolve) => {
    form.parse(event, (err, fields, files) => {
      if (err) {
        return resolve({ statusCode: 500, body: JSON.stringify({ error: "Upload failed", details: err.message }) });
      }

      const file = files.file;
      if (!file) {
        return resolve({ statusCode: 400, body: JSON.stringify({ error: "No file uploaded" }) });
      }

      const uploadDir = path.join(__dirname, "../../uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const fileExt = path.extname(file.name);
      const newFileName = uuidv4() + fileExt;
      const filePath = path.join(uploadDir, newFileName);

      fs.copyFileSync(file.path, filePath);

      // Public URL for frontend access via Netlify Functions redirect
      const publicUrl = `/.netlify/functions/serveFile?file=${newFileName}`;
      resolve({ statusCode: 200, body: JSON.stringify({ url: publicUrl }) });
    });
  });
};
