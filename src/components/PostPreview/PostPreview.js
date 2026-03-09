import React, { useState } from "react";

const DynamicImage = ({
  src,
  alt = "Preview", 
  size = 60, 
  className = "",
  style = {},
  ...rest
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const finalSrc = src || "/user.jpg";

  const isVideo = /\.(mp4|webm|mov)$/i.test(finalSrc);

  const thumbnailStyle = {
    width: `${size}px`,
    height: `${size}px`,
    objectFit: "cover",
    borderRadius: "50%", 
    border: "1px solid #ccc", 
    cursor: "pointer",
    ...style,
  };

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className={`dynamic-image-thumbnail ${className}`}
        aria-label={`Open preview for ${alt}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setIsOpen(true)}
        {...rest}
      >
        {isVideo ? (
          <video
            src={finalSrc}
            style={thumbnailStyle}
            muted
            playsInline
            key={finalSrc + "#t=0.1"}
          />
        ) : (
          <img src={finalSrc} alt={alt} style={thumbnailStyle} />
        )}
      </div>

      {isOpen && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setIsOpen(false)}
          ></div>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            onClick={() => setIsOpen(false)}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h5 className="modal-title">{alt}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body text-center p-2">
                  {isVideo ? (
                    <video
                      controls
                      autoPlay
                      className="w-100"
                      style={{ maxHeight: "60vh" }}
                      key={finalSrc}
                    >
                      <source src={finalSrc} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img
                      src={finalSrc}
                      alt={alt}
                      className="img-fluid rounded-full"
                      style={{
                        maxHeight: "60vh",
                        objectFit: "contain",
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default DynamicImage;
