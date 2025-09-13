// import React, { useState } from "react";
// import { useFormikContext } from "formik";

// const ImageUpload = ({
//   uploadFunction,
//   fieldName = "image",
//   maxSize = 5 * 1024 * 1024, // 5MB
//   allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
//   value,
//   onChange,
//   error,
//   icon,
//   label = "Image *",
// }) => {
//   const [imagePreview, setImagePreview] = useState(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const formik = useFormikContext();

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     // Validate file type
//     if (!allowedTypes.includes(file.type)) {
//       const errorMsg = `Please upload a valid image file (${allowedTypes
//         .map((type) => type.split("/")[1].toUpperCase())
//         .join(", ")})`;
//       if (formik) {
//         formik.setFieldError(fieldName, errorMsg);
//       }
//       return;
//     }

//     // Validate file size
//     if (file.size > maxSize) {
//       const errorMsg = `Image size should be less than ${maxSize /
//         (1024 * 1024)}MB`;
//       if (formik) {
//         formik.setFieldError(fieldName, errorMsg);
//       }
//       return;
//     }

//     // Create local preview URL
//     const localPreview = URL.createObjectURL(file);
//     setImagePreview(localPreview);

//     setIsUploading(true);
//     try {
//       const imageUrl = await uploadFunction(file);
//       if (formik) {
//         formik.setFieldValue(fieldName, imageUrl);
//       } else if (onChange) {
//         onChange(imageUrl);
//       }
//       setImagePreview(imageUrl);
//     } catch (error) {
//       console.error("Upload error:", error);
//       if (formik) {
//         formik.setFieldError(
//           fieldName,
//           "Failed to upload image. Please try again."
//         );
//       }
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const currentImage =
//     imagePreview || (formik ? formik.values?.[fieldName] : value);
//   const currentError = formik ? formik.errors?.[fieldName] : error;

//   return (
//     <div className="form-group">
//        {/* <label>Image *</label> */}
//        <label>{label}</label>
//       <div className="mb-2">
//         {/* {currentImage && (
//           <img
//             src={currentImage}
//             alt="Preview"
//             style={{width: '100px', height: '100px', objectFit: 'cover'}}
//           />
//         )} */}
//         {currentImage &&
//           (currentImage.endsWith(".pdf") ? (
//             <a href={currentImage} target="_blank" rel="noopener noreferrer">
//               View PDF{" "}
//               <i
//                 className="far fa-file-pdf"
//                 style={{ marginRight: "10px", color: "#d9534f" }}
//               ></i>
//             </a>
//           ) : (
//             <div style={{justifySelf:"center"}}>
//             <img
//               src={currentImage}
//               alt="Preview"
//               style={{ width: "80px", height: "80px", objectFit: "cover" }}
//             />
//             </div>
//           ))}
//       </div>
//       <input
//         className="form-control"
//         name={fieldName}
//         type="file"
//         // accept="image/pdf*"
//         accept="image/jpeg,image/png,image/jpg,application/pdf,video/mp4"
//         onChange={handleImageUpload}
//         disabled={isUploading}
//       />
//       {isUploading && <div className="mt-2">Uploading...</div>}
//       {currentError && <div style={{ color: "red" }}>{currentError}</div>}
//     </div>
//   );
// };

// export default ImageUpload;


// import React, { useState } from "react";
// import { useFormikContext } from "formik";

// const ImageUpload = ({
//   uploadFunction,
//   fieldName = "media",
//   maxImageSize = 5 * 1024 * 1024, // 5MB
//   maxVideoDuration = 30, // 30 seconds
//   allowedTypes = [
//     "image/jpeg",
//     "image/png",
//     "image/jpg",
//     "application/pdf",
//     "video/mp4",
//   ],
//   value = null,         
//   onChange,
//   label = "Upload File",
//   error,
//   multiple = false,   
// }) => {
//   const formik = useFormikContext();
//   const [mediaPreview, setMediaPreview] = useState(multiple ? [] : null);
//   const [isUploading, setIsUploading] = useState(false);

//   // Get video duration helper
// const handleFileChange = async (e) => {
//   const files = Array.from(e.target.files);
//   if (!files.length) return;

//   const selectedFiles = multiple ? files : [files[0]];

//   // Clone existing states to avoid mutability issues
//   let previews = multiple ? [...(mediaPreview || [])] : null;
//   let uploadedUrls = multiple
//     ? [...(formik?.values?.[fieldName] || value || [])]
//     : null;

//   for (const file of selectedFiles) {
//     // Validate file type
//     if (!allowedTypes.includes(file.type)) {
//       alert(`Invalid file type: ${file.type}`);
//       continue;
//     }

//     // Validate image size
//     if (file.type.startsWith("image/") && file.size > maxImageSize) {
//       alert("Image size must be less than 5MB.");
//       continue;
//     }

//     // Validate video duration
//     if (file.type.startsWith("video/")) {
//       const duration = await getVideoDuration(file);
//       if (duration > maxVideoDuration) {
//         alert("Only videos under 30 seconds are allowed.");
//         continue;
//       }
//     }

//     const localPreview = URL.createObjectURL(file);

//     setIsUploading(true);
//     try {
//       const uploadedUrl = await uploadFunction(file);
//       const uploadedData = { url: uploadedUrl, type: file.type };

//       if (multiple) {
//         previews = [...previews, { url: localPreview, type: file.type }];
//         uploadedUrls = [...uploadedUrls, uploadedData];
//       } else {
//         previews = { url: localPreview, type: file.type };
//         uploadedUrls = uploadedData;
//       }
//     } catch (err) {
//       console.error("Upload failed:", err);
//       alert(`Failed to upload ${file.name}.`);
//     } finally {
//       setIsUploading(false);
//     }
//   }

//   // Update state safely
//   setMediaPreview(previews);

//   if (formik) {
//     formik.setFieldValue(fieldName, uploadedUrls);
//   } else if (onChange) {
//     onChange(uploadedUrls);
//   }
// };

//   const getVideoDuration = (file) =>
//     new Promise((resolve) => {
//       const video = document.createElement("video");
//       video.preload = "metadata";
//       video.onloadedmetadata = () => resolve(video.duration);
//       video.src = URL.createObjectURL(file);
//     });

//   // Current files (single or multiple)
//   const currentFiles =
//     mediaPreview !== null
//       ? mediaPreview
//       : formik
//       ? formik.values?.[fieldName]
//       : value;
//    console.log("currentFiles", currentFiles)
//   const currentError = formik ? formik.errors?.[fieldName] : error;

//   return (
//     <div className="form-group">
//       <label>{label}</label>
//       <div className="mb-2 flex gap-2 flex-wrap">
//         {multiple
//           ? currentFiles?.map?.((file, idx) => (
//               <PreviewItem key={idx} file={file} />
//             ))
//           : currentFiles && <PreviewItem file={currentFiles} />}
//       </div>

//       <input
//         type="file"
//         name={fieldName}
//         className="form-control"
//         multiple={multiple}
//         accept={allowedTypes.join(",")}
//         onChange={handleFileChange}
//         disabled={isUploading}
//       />

//       {isUploading && <div className="mt-2">Uploading...</div>}
//       {currentError && <div style={{ color: "red" }}>{currentError}</div>}
//     </div>
//   );
// };

// const PreviewItem = ({ file }) => {
//   if (!file) return null;

//   // Simple string URL
//   if (typeof file === "string") {
//     if (file.endsWith(".mp4")) {
//       return (
//         <video
//           src={file}
//           controls
//           style={{ width: "120px", height: "80px", objectFit: "cover" }}
//         />
//       );
//     }
//     return (
//       <img
//         src={file}
//         alt="Preview"
//         style={{ width: "80px", height: "80px", objectFit: "cover" }}
//       />
//     );
//   }

//   // PDF preview
//   if (file.type?.includes("pdf") || file.url?.endsWith(".pdf")) {
//     return (
//       <a
//         href={file.url}
//         target="_blank"
//         rel="noopener noreferrer"
//         style={{ color: "#4a76f0", textDecoration: "underline" }}
//       >
//         PDF File
//       </a>
//     );
//   }

//   // Video preview
//   if (file.type?.includes("video") || file.url?.endsWith(".mp4")) {
//     return (
//       <video
//         src={file.url}
//         controls
//         style={{ width: "120px", height: "80px", objectFit: "cover" }}
//       />
//     );
//   }

//   // Default image preview
//   return (
//     <img
//       src={file.url}
//       alt="Preview"
//       style={{ width: "80px", height: "80px", objectFit: "cover" }}
//     />
//   );
// };

// export default ImageUpload;

import React, { useState } from "react";
import { useFormikContext } from "formik";

const ImageUpload = ({
  uploadFunction,
  fieldName = "media",
  maxImageSize = 5 * 1024 * 1024, // 5MB
  maxVideoDuration = 30, // 30 seconds
  allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
    "video/mp4",
  ],
  value = null,
  onChange,
  label = "Upload File",
  error,
}) => {
  const formik = useFormikContext();
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Get video duration helper
  const getVideoDuration = (file) =>
    new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => resolve(video.duration);
      video.src = URL.createObjectURL(file);
    });

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      alert(`Invalid file type: ${file.type}`);
      return;
    }

    // Validate image size
    if (file.type.startsWith("image/") && file.size > maxImageSize) {
      alert("Image size must be less than 5MB.");
      return;
    }

    // Validate video duration
    if (file.type.startsWith("video/")) {
      const duration = await getVideoDuration(file);
      if (duration > maxVideoDuration) {
        alert("Only videos under 30 seconds are allowed.");
        return;
      }
    }

    const localPreview = URL.createObjectURL(file);

    setIsUploading(true);
    try {
      const uploadedUrl = await uploadFunction(file);
      const uploadedData = { url: uploadedUrl, type: file.type };

      setMediaPreview({ url: localPreview, type: file.type });

      if (formik) {
        formik.setFieldValue(fieldName, uploadedData);
      } else if (onChange) {
        onChange(uploadedData);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert(`Failed to upload ${file.name}.`);
    } finally {
      setIsUploading(false);
    }
  };

  // Current file (single)
  const currentFile =
    mediaPreview !== null
      ? mediaPreview
      : formik
      ? formik.values?.[fieldName]
      : value;
  const currentError = formik ? formik.errors?.[fieldName] : error;

  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="mb-2 flex gap-2 flex-wrap">
        {currentFile && <PreviewItem file={currentFile} />}
      </div>

      <input
        type="file"
        name={fieldName}
        className="form-control"
        accept={allowedTypes.join(",")}
        onChange={handleFileChange}
        disabled={isUploading}
      />

      {isUploading && <div className="mt-2">Uploading...</div>}
      {currentError && <div style={{ color: "red" }}>{currentError}</div>}
    </div>
  );
};

const PreviewItem = ({ file }) => {
  if (!file) return null;

  // If backend gives a plain string (URL)
  if (typeof file === "string") {
    if (file.endsWith(".mp4")) {
      return (
        <video
          src={file}
          controls
          style={{ width: "120px", height: "80px", objectFit: "cover" }}
        />
      );
    }
    if (file.endsWith(".pdf")) {
      return (
        <a
          href={file}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#4a76f0", textDecoration: "underline" }}
        >
          PDF File
        </a>
      );
    }
    return (
      <img
        src={file}
        alt="Preview"
        style={{ width: "80px", height: "80px", objectFit: "cover" }}
      />
    );
  }

  // If backend gives object { url, type }
  if (file.type === "application/pdf" || file.url?.endsWith(".pdf")) {
    return (
      <a
        href={file.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#4a76f0", textDecoration: "underline" }}
      >
        PDF File
      </a>
    );
  }

  if (file.type?.startsWith("video/") || file.url?.endsWith(".mp4")) {
    return (
      <video
        src={file.url}
        controls
        style={{ width: "120px", height: "80px", objectFit: "cover" }}
      />
    );
  }

  return (
    <img
      src={file.url}
      alt="Preview"
      style={{ width: "80px", height: "80px", objectFit: "cover" }}
    />
  );
};


export default ImageUpload;