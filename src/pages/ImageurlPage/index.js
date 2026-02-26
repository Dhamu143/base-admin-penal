import React, { useState, useRef } from "react";
import { toast } from "react-toastify";
import { uploadImage } from "../../services/uploadService"; // Adjust path if needed

export default function UploadImagePage() {
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const fileRef = useRef(null);

  const processFile = async (file) => {
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setImageUrl(url);
      toast.success("Image uploaded successfully!");
    } catch (err) {
      toast.error("Upload failed! Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    processFile(e.target.files?.[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const handleCopy = async () => {
    if (!imageUrl) return;
    try {
      await navigator.clipboard.writeText(imageUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); 
    } catch (err) {
      toast.error("Failed to copy URL.");
    }
  };

  const handleReset = () => {
    setImageUrl("");
    setIsCopied(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* Page Title Header */}
      <div style={{ marginBottom: "24px" }}>
        <h4 style={{ margin: "0 0 4px 0", color: "#1e293b", fontWeight: "600" }}>Image Management</h4>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Upload and manage image URLs for the system.</p>
      </div>

      <div className="row">
        <div className="col-12 col-md-8 col-lg-6 col-xl-12">
          
          {/* Bulletproof Card */}
          <div style={{ 
            backgroundColor: "#ffffff", 
            borderRadius: "10px", 
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", 
            border: "1px solid #e2e8f0",
            overflow: "hidden"
          }}>
            
            {/* Card Header */}
            <div style={{ 
              padding: "16px 24px", 
              backgroundColor: "#f8fafc", 
              borderBottom: "1px solid #e2e8f0" 
            }}>
              <h6 style={{ margin: 0, color: "#334155", fontWeight: "600", fontSize: "15px" }}>Upload New Image</h6>
            </div>

            {/* Card Body */}
            <div style={{ padding: "24px" }}>
              {!imageUrl ? (
                // Dropzone Area
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !isUploading && fileRef.current?.click()}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "32px",
                    borderRadius: "8px",
                    border: `2px dashed ${isDragging ? "#3b82f6" : "#cbd5e1"}`,
                    backgroundColor: isDragging ? "#eff6ff" : "#f8fafc",
                    cursor: isUploading ? "default" : "pointer",
                    transition: "all 0.2s ease",
                    minHeight: "200px",
                    textAlign: "center"
                  }}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />

                  {isUploading ? (
                    <>
                      <div className="spinner-border text-primary" style={{ marginBottom: "16px" }} role="status"></div>
                      <span style={{ color: "#3b82f6", fontWeight: "500", fontSize: "14px" }}>Uploading your image...</span>
                    </>
                  ) : (
                    <>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "16px" }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <span style={{ color: "#1e293b", fontWeight: "500", fontSize: "15px", display: "block" }}>Click or drag image here</span>
                      <span style={{ color: "#64748b", fontSize: "13px", marginTop: "4px", display: "block" }}>PNG, JPG, GIF up to 5MB</span>
                    </>
                  )}
                </div>
              ) : (
                // Success / Preview Area
                <div>
                  <div style={{ 
                    position: "relative", 
                    marginBottom: "24px", 
                    textAlign: "center", 
                    backgroundColor: "#f1f5f9", 
                    borderRadius: "8px", 
                    padding: "16px", 
                    border: "1px solid #e2e8f0" 
                  }}>
                    <img
                      src={imageUrl}
                      alt="Uploaded preview"
                      style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain", borderRadius: "4px" }}
                    />
                  </div>

                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>
                    Generated Image URL
                  </label>
                  
                  <div style={{ display: "flex", marginBottom: "24px", borderRadius: "6px", overflow: "hidden", border: "1px solid #cbd5e1" }}>
                    <input
                      type="text"
                      style={{ 
                        flex: 1, 
                        padding: "10px 12px", 
                        border: "none", 
                        backgroundColor: "#f8fafc", 
                        color: "#475569", 
                        fontSize: "14px",
                        outline: "none"
                      }}
                      value={imageUrl}
                      readOnly
                    />
                    <button
                      style={{ 
                        padding: "0 20px", 
                        border: "none", 
                        backgroundColor: isCopied ? "#10b981" : "#3b82f6", 
                        color: "white", 
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "background-color 0.2s"
                      }}
                      onClick={handleCopy}
                    >
                      {isCopied ? "Copied!" : "Copy URL"}
                    </button>
                  </div>

                  <button
                    style={{ 
                      width: "100%", 
                      padding: "10px", 
                      backgroundColor: "transparent", 
                      border: "1px solid #cbd5e1", 
                      borderRadius: "6px", 
                      color: "#475569", 
                      fontWeight: "500",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer"
                    }}
                    onClick={handleReset}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "8px" }}>
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Upload Another Image
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}