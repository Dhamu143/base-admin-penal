import React, { useState } from "react";
import { useFormikContext } from "formik";
import { getVideoDuration, allowedTypes, maxImageSize, maxVideoDuration } from "../components/mediaHelpers/mediaHelpers";
import PreviewItem from "./PreviewItem";

const MultipleMediaUpload = ({
  uploadFunction,
  fieldName = "media",
  value = [],
  onChange,
  label = "Upload Files",
  error,
}) => {
  const formik = useFormikContext();
  const [mediaPreview, setMediaPreview] = useState(value);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    let previews = [...mediaPreview];
    let uploadedUrls = [...(formik?.values?.[fieldName] || value)];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        alert(`Invalid file type: ${file.type}`);
        continue;
      }

      if (file.type.startsWith("image/") && file.size > maxImageSize) {
        alert("Image size must be less than 5MB.");
        continue;
      }

      if (file.type.startsWith("video/")) {
        const duration = await getVideoDuration(file);
        if (duration > maxVideoDuration) {
          alert("Only videos under 30 seconds are allowed.");
          continue;
        }
      }

      const localPreview = URL.createObjectURL(file);
      setIsUploading(true);

      try {
        const uploadedUrl = await uploadFunction(file);
        const uploadedData = { url: uploadedUrl, type: file.type };

        previews.push({ url: localPreview, type: file.type });
        uploadedUrls.push(uploadedData);
      } catch (err) {
        console.error("Upload failed:", err);
        alert(`Failed to upload ${file.name}.`);
      } finally {
        setIsUploading(false);
      }
    }

    setMediaPreview(previews);

    if (formik) {
      formik.setFieldValue(fieldName, uploadedUrls);
    } else if (onChange) {
      onChange(uploadedUrls);
    }
  };

  const currentError = formik ? formik.errors?.[fieldName] : error;

  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="mb-2 flex gap-2 flex-wrap">
        {mediaPreview && mediaPreview.map((file, idx) => (
          <PreviewItem key={idx} file={file} />
        ))}
      </div>

      <input
        type="file"
        name={fieldName}
        className="form-control"
        multiple
        accept={allowedTypes.join(",")}
        onChange={handleFileChange}
        disabled={isUploading}
      />
      {isUploading && <div className="mt-2">Uploading...</div>}
      {currentError && <div style={{ color: "red" }}>{currentError}</div>}
    </div>
  );
};

export default MultipleMediaUpload;
