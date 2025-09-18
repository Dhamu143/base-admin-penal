import React, { useState } from "react";

const ImageUpload = ({ label = "Upload Image", value = null, onChange }) => {
  const [error, setError] = useState(null);
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset previous error
    setError(null);

    // Validate type
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Use JPG, PNG, or GIF.");
      return;
    }

    // Validate size
    if (file.size > maxSize) {
      setError("File size must be less than 5MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    // Notify parent
    onChange({ url: previewUrl, file });
  };

  const handleRemove = () => {
    onChange(null);
    setError(null);
  };

  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">{label}</label>
      {value?.url ? (
        <div className="position-relative d-inline-block">
          <img
            src={value.url}
            alt="Preview"
            style={{
              width: "120px",
              height: "120px",
              objectFit: "cover",
              border: "2px solid #dee2e6",
              borderRadius: "8px",
            }}
          />
          <button
            type="button"
            className="btn btn-sm btn-danger position-absolute"
            style={{ top: "-10px", right: "-10px" }}
            onClick={handleRemove}
          >
            &times;
          </button>
        </div>
      ) : (
        <input
          type="file"
          accept={allowedTypes.join(",")}
          onChange={handleFileChange}
          className="form-control"
        />
      )}
      {error && <div className="text-danger mt-1">{error}</div>}
    </div>
  );
};

export default ImageUpload;
