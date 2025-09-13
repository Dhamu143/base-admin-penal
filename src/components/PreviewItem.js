const PreviewItem = ({ file }) => {
  if (!file) return null;

  // Handle plain string
  const fileUrl = typeof file === "string" ? file : file.url;
  const fileType = typeof file === "string" ? "" : file.type;

  if (fileType.includes("pdf") || fileUrl.endsWith(".pdf")) {
    return (
      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-red-600 underline">
        PDF File
      </a>
    );
  }

  if (fileType.includes("video") || fileUrl.endsWith(".mp4")) {
    return (
      <video
        src={fileUrl}
        controls
        style={{ width: "120px", height: "80px", objectFit: "cover" }}
      />
    );
  }

  return (
    <img
      src={fileUrl}
      alt="Preview"
      style={{ width: "80px", height: "80px", objectFit: "cover" }}
    />
  );
};

export default PreviewItem;
