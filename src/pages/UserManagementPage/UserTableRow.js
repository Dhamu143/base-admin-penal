// src/components/UserManagement/UserTableRow.js

import React from "react";
import DynamicImage from "../../components/PostPreview/PostPreview"; // Assuming this is an optimized image component

export default function UserTableRow({ user, onDeleteClick }) {
  return (
    <tr>
      <td>
        <DynamicImage
          src={user.featureimage || "/img/user.jpg"}
          alt={user.firstName}
          style={{
            // width: "45px",
            // height: "45px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      </td>
      <td>
        <div className="fw-bold">{user.firstName || "N/A"}</div>
        <div className="text-muted small">{user.mobile || "N/A"}</div>
      </td>
      <td>{user.rashi || "N/A"}</td>
      <td className="text-center">
        <span
          className={`badge fs-6 rounded-pill ${
            user.premium ? "text-bg-warning" : "text-bg-light border"
          }`}
        >
          {user.premium ? "Yes" : "No"}
        </span>
      </td>
      <td className="text-center">
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => onDeleteClick(user)}
          title="Delete"
        >
          <em className="fas fa-trash"></em>
        </button>
      </td>
    </tr>
  );
}
