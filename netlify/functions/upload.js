const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const formidable = require("formidable");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const form = new formidable.IncomingForm({ multiples: false });

  return new Promise((resolve) => {
    form.parse(event, (err, fields, files) => {
      if (err) return resolve({ statusCode: 500, body: "Upload failed" });

      const file = files.file;
      if (!file) return resolve({ statusCode: 400, body: "No file uploaded" });

      const uploadDir = path.join(__dirname, "../../uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

      const fileExt = path.extname(file.name);
      const newFileName = uuidv4() + fileExt;
      const filePath = path.join(uploadDir, newFileName);

      fs.copyFileSync(file.path, filePath);

      const publicUrl = `/.netlify/functions/uploads/${newFileName}`;
      resolve({ statusCode: 200, body: JSON.stringify({ url: publicUrl }) });
    });
  });
};
