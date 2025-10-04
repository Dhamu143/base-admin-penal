// components/TableStatus.jsx
import React from "react";

// Helper component for consistent styling of each status view
const StatusView = ({ children }) => (
  <div className="d-flex flex-column align-items-center gap-3">{children}</div>
);

export const TableStatus = ({
  status,
  error,
  dataLength,
  colSpan,
  loadingText = "Loading...",
  emptyText = "No records found.",
  errorText = "Something went wrong.",
  onRetry,
}) => {
  // Safely get the error message if 'error' is an object or a string
  const errorMessage = typeof error === 'string' ? error : error?.message;

  // An object that maps each status to its corresponding JSX view
  const statusViews = {
    loading: (
      <StatusView>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mb-0 text-primary">{loadingText}</p>
      </StatusView>
    ),
    failed: (
      <StatusView>
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-exclamation-triangle-fill text-danger" viewBox="0 0 16 16">
          <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
        </svg>
        <div className="d-flex flex-column">
          <h5 className="mb-1">{errorText}</h5>
          {errorMessage && <small className="text-muted">{errorMessage}</small>}
        </div>
        {onRetry && (
          <button className="btn btn-primary mt-2" onClick={onRetry}>
            Try Again
          </button>
        )}
      </StatusView>
    ),
    empty: (
      <StatusView>
        {/* <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-files text-muted" viewBox="0 0 16 16">
          <path d="M13 0H6a2 2 0 0 0-2 2 2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm0 13V4a2 2 0 0 0-2-2H5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1zM3 4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4z"/>
        </svg> */}
        <p className="mb-0 text-muted">{emptyText}</p>
      </StatusView>
    ),
  };

  // Determine which state is active
  let activeState = null;
  if (status === "loading") {
    activeState = "loading";
  } else if (status === "failed") {
    activeState = "failed";
  } else if (status === "succeeded" && dataLength === 0) {
    activeState = "empty";
  }

  // If no state is active (e.g., status is 'succeeded' with data), render nothing.
  if (!activeState) {
    return null;
  }

  // Render the active state's view inside the table row
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-5">
        {statusViews[activeState]}
      </td>
    </tr>
  );
};