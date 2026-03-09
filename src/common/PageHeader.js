// src/common/PageHeader.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function PageHeader({ 
  breadcrumbTitle, 
  breadcrumbLink,  
  currentTitle     
}) {
  const navigate = useNavigate();

  return (
    <div className="mb-4 d-flex align-items-center justify-content-between">
      <div>
        <span
          style={{ cursor: "pointer", color: "#0d6efd", fontWeight: "600" }}
          onClick={() => navigate(breadcrumbLink)}
        >
          {breadcrumbTitle}
        </span>
        <span className="mx-2 text-muted">/</span>
        <span className="text-dark fw-medium">{currentTitle}</span>
      </div>
      
      <button
        type="button"
        className="btn btn-outline-primary btn-sm d-flex align-items-center"
        onClick={() => navigate(breadcrumbLink)}
      >
        <i className="fas fa-arrow-left mr-2"></i> Back
      </button>
    </div>
  );
}