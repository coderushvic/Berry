// src/components/ImageUploader/index.jsx
import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import "./ImageUploader.css";

/**
 * Reusable ImageUploader
 * Props:
 *  - initialImage (string | null)
 *  - onUploaded(url) => void
 *  - buttonText (string)
 *  - accept (string)
 *  - prominent (bool) -> larger, colorful button for admin
 */
const ImageUploader = ({ initialImage = null, onUploaded, buttonText = "Upload Image", accept = "image/*", prominent = false }) => {
  const [preview, setPreview] = useState(initialImage || null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const uploadToRender = async (file) => {
    if (!file) return null;
    const uploadUrl = process.env.REACT_APP_RENDER_UPLOAD_URL;
    if (!uploadUrl) throw new Error("REACT_APP_RENDER_UPLOAD_URL not set");

    const form = new FormData();
    form.append("file", file);

    const res = await fetch(uploadUrl, { method: "POST", body: form });
    if (!res.ok) {
      const txt = await res.text().catch(() => null);
      throw new Error(txt || `Upload failed (${res.status})`);
    }
    const json = await res.json();
    return json.url;
  };

  const handleFile = async (file) => {
    if (!file) return;
    // show local preview immediately
    setPreview(URL.createObjectURL(file));
    try {
      setUploading(true);
      const url = await uploadToRender(file);
      setPreview(url);
      onUploaded(url);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed: " + (err.message || ""));
    } finally {
      setUploading(false);
    }
  };

  const onChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) handleFile(f);
  };

  return (
    <div className="image-uploader">
      <div className="iu-preview">
        {preview ? (
          <img
            src={preview}
            alt="preview"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
            style={{ maxWidth: 220, maxHeight: 220, borderRadius: 8, objectFit: "cover" }}
          />
        ) : (
          <div className="iu-no-preview" style={{ width: 220, height: 140, display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f4f4", borderRadius: 8 }}>
            <span style={{ color: "#666" }}>No image</span>
          </div>
        )}
      </div>

      <label
        className={`iu-button ${prominent ? "iu-prominent" : ""}`}
        style={{ marginTop: 10, display: "inline-block", cursor: "pointer" }}
      >
        {uploading ? "Uploading..." : buttonText}
        <input ref={inputRef} type="file" accept={accept} onChange={onChange} style={{ display: "none" }} />
      </label>
    </div>
  );
};

ImageUploader.propTypes = {
  initialImage: PropTypes.string,
  onUploaded: PropTypes.func.isRequired,
  buttonText: PropTypes.string,
  accept: PropTypes.string,
  prominent: PropTypes.bool,
};

export default ImageUploader;
