// netlify/functions/upload.js
import { blobs } from "@netlify/blobs";

export async function handler(event) {
  try {
    const formData = await event.body;
    const boundary = event.headers["content-type"].split("boundary=")[1];

    const buffer = Buffer.from(formData, "base64");
    const parts = buffer
      .toString()
      .split(boundary)
      .filter((p) => p.includes("filename"));

    if (!parts.length) {
      return { statusCode: 400, body: "No file received" };
    }

    const part = parts[0];
    const match = part.match(/filename="(.+?)"/);
    const filename = Date.now() + "-" + match[1];

    const fileContent = Buffer.from(
      part.split("\r\n\r\n")[1].replace(/\r\n--$/, ""),
      "binary"
    );

    const blobStore = blobs();
    await blobStore.set(`uploads/${filename}`, fileContent, {
      contentType: "image/jpeg",
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        url: `/uploads/${filename}`,
      }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error }) };
  }
}
