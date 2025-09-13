import React, { useState } from "react";

const PostPreview = ({ value }) => {
  const [open, setOpen] = useState(false);

  const isVideo = value?.file?.endsWith(".mp4") || value?.file?.endsWith(".webm");

  return (
    <>
      {/* Table Cell Thumbnail */}
      <td onClick={() => setOpen(true)} style={{ cursor: "pointer" }}>
        {isVideo ? (
          <video
            src={value.file}
            width="50"
            height="50"
            style={{ borderRadius: "50%" }}
            muted
          />
        ) : (
          <img
            src={value.file}
            alt="post"
            style={{ width: "50px", height: "50px", borderRadius: "50%" }}
          />
        )}
      </td>

      {/* Modal */}
      {open && (
        <div
      className="modal fade show"
      style={{
        display: "block",
        backgroundColor: "rgba(0,0,0,0.5)",
        top: "50px",
      }}
    >
      <div className="modal-dialog modal-lg"  style={{maxHeight:"40%"}}>
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <h5 className="modal-title">Image or Video Preview</h5>
            <button type="button" className="close" onClick={() => setOpen(false)}>
              <span>&times;</span>
            </button>
          </div>

          {/* Body */}
          <div className="modal-body text-center">
            {isVideo ? (
              <video controls style={{ width: "100%",  height: "300px", borderRadius: "10px" }}>
                <source src={value.file} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={value.file}
                alt="Post Preview"
                style={{ width: "550px", height:"350px", borderRadius: "10px", objectFit:"contain" }}
              />
            )}
            {value.caption && (
              <p style={{ marginTop: "10px" }}>{value.caption}</p>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
      )}
    </>
  );
};

export default PostPreview;
