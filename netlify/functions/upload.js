// netlify/functions/upload.js
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const formidable = require("formidable");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const { Readable } = require("stream");
const fs = require("fs");

const {
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_ACCOUNT_ID, // Cloudflare account id
  R2_BUCKET, // bucket name
} = process.env;

if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ACCOUNT_ID || !R2_BUCKET) {
  console.warn("R2 env vars missing. Set R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ACCOUNT_ID, R2_BUCKET");
}

// Construct S3-compatible client pointed at R2
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, // R2 endpoint style
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false,
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Netlify will base64 encode binary bodies. Create a readable stream from decoded body
  const buffer = event.isBase64Encoded ? Buffer.from(event.body, "base64") : Buffer.from(event.body || "");
  const req = new Readable();
  req.push(buffer);
  req.push(null);

  // Make headers available to formidable
  req.headers = event.headers;

  const form = formidable({
    multiples: false,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB, adjust if needed
  });

  return new Promise((resolve) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parse error:", err);
        return resolve({
          statusCode: 500,
          body: JSON.stringify({ error: "Upload parse failed", details: err.message }),
        });
      }

      const file = files.file || files.image || Object.values(files)[0];
      if (!file) {
        return resolve({ statusCode: 400, body: JSON.stringify({ error: "No file uploaded" }) });
      }

      try {
        // formidable v2 stores file path at file.filepath or file.path
        const filepath = file.filepath || file.path;
        const originalName = file.originalFilename || file.name || "upload";
        const ext = path.extname(originalName) || ".jpg";
        const contentType = file.mimetype || file.type || "application/octet-stream";
        const key = `uploads/${uuidv4()}${ext}`;

        // Read file into buffer
        const fileBuffer = fs.readFileSync(filepath);

        // Upload to R2 (S3 API)
        const putParams = {
          Bucket: R2_BUCKET,
          Key: key,
          Body: fileBuffer,
          ContentType: contentType,
        };

        await s3.send(new PutObjectCommand(putParams));

        // Public URL (R2 public gateway). Two common URL formats:
        // 1) https://<bucket>.<account_id>.r2.cloudflarestorage.com/<key>
        // 2) https://<account_id>.r2.cloudflarestorage.com/<bucket>/<key>
        // Many setups work with format #1:
        const publicUrl = `https://${R2_BUCKET}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;

        return resolve({
          statusCode: 200,
          body: JSON.stringify({ url: publicUrl }),
        });
      } catch (uploadErr) {
        console.error("Upload to R2 error:", uploadErr);
        return resolve({
          statusCode: 500,
          body: JSON.stringify({ error: "Upload to R2 failed", details: uploadErr.message }),
        });
      } finally {
        // remove temp file if present
        try {
          if (file && (file.filepath || file.path) && fs.existsSync(file.filepath || file.path)) {
            fs.unlinkSync(file.filepath || file.path);
          }
        } catch (e) {}
      }
    });
  });
};
