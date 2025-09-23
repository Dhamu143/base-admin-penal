// components/TableStatus.jsx
import React from "react";

export const TableStatus = ({
  status,
  error,
  dataLength,
  colSpan,
  loadingText = "Loading...",
  emptyText = "No records found.",
}) => {
  if (status === "loading") {
    return (
      <tr>
        <td colSpan={colSpan} className="text-center py-5">
          <div className="d-flex flex-column align-items-center gap-2">
            <div className="spinner-border text-primary"></div>
            <p className="mb-0 text-primary">{loadingText}</p>
          </div>
        </td>
      </tr>
    );
  }

  if (status === "failed") {
    return (
      <tr>
        <td colSpan={colSpan} className="text-center text-danger py-5">
          <strong>Error:</strong> {error}
        </td>
      </tr>
    );
  }

  if (status === "succeeded" && dataLength === 0) {
    return (
      <tr>
        <td colSpan={colSpan} className="text-center text-muted py-5">
          {emptyText}
        </td>
      </tr>
    );
  }

  return null;
};
