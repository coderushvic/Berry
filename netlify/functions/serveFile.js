// netlify/functions/serveFile.js
import { blobs } from "@netlify/blobs";

export async function handler(event) {
  try {
    const file = event.queryStringParameters.file;
    const blobStore = blobs();
    const blob = await blobStore.get(`uploads/${file}`);

    if (!blob) {
      return { statusCode: 404, body: "File not found" };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": blob.contentType || "image/jpeg",
      },
      body: blob.body.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify(err) };
  }
}
