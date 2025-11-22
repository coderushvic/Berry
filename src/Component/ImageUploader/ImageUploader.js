// src/components/ImageUploader/ImageUploader.jsx
import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

/**
 * Reusable ImageUploader
 * Props:
 * - initialImage (string) optional: existing image url to show
 * - onUploaded(url) required: callback after successful upload
 * - buttonText optional
 * - accept optional (default "image/*")
 */
const ImageUploader = ({ initialImage = null, onUploaded, buttonText = 'Upload Image', accept = 'image/*' }) => {
  const { t } = useTranslation();
  const [preview, setPreview] = useState(initialImage || null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const uploadToRender = async (file) => {
    if (!file) return null;
    // Optional client-side MIME check
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (file.type && !allowed.includes(file.type)) {
      throw new Error('Invalid file type. Only PNG/JPG/JPEG/WebP allowed.');
    }

    const uploadUrl = process.env.REACT_APP_RENDER_UPLOAD_URL;
    if (!uploadUrl) throw new Error('REACT_APP_RENDER_UPLOAD_URL not set');

    const fd = new FormData();
    fd.append('file', file);

    const res = await fetch(uploadUrl, {
      method: 'POST',
      body: fd,
    });

    if (!res.ok) {
      const err = await res.text().catch(() => null);
      throw new Error(err || 'Upload failed');
    }
    const data = await res.json();
    return data.url;
  };

  const handleFile = async (file) => {
    if (!file) return;
    const blob = URL.createObjectURL(file);
    setPreview(blob);

    try {
      setUploading(true);
      const url = await uploadToRender(file);
      setPreview(url);
      onUploaded(url);
    } catch (err) {
      console.error('Image upload failed', err);
      alert(t('uploadFailed') || 'Upload failed: ' + (err.message || ''));
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
      <div className="preview">
        {preview ? (
          <img src={preview} alt="preview" style={{ maxWidth: '200px', borderRadius: 8 }} />
        ) : (
          <div style={{ width: 200, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f3f3', borderRadius: 8 }}>
            <span>{t('noImage') || 'No image'}</span>
          </div>
        )}
      </div>

      <label className="upload-label" style={{ marginTop: 8, cursor: 'pointer' }}>
        {uploading ? (t('uploading') || 'Uploading...') : (buttonText || t('uploadImage') || 'Upload')}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={onChange}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  );
};

ImageUploader.propTypes = {
  initialImage: PropTypes.string,
  onUploaded: PropTypes.func.isRequired,
  buttonText: PropTypes.string,
  accept: PropTypes.string
};

export default ImageUploader;