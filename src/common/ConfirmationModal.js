// src/components/common/ConfirmationModal.js

import React from "react";

/**
 * A reusable confirmation modal component.
 *
 * @param {object} props - The component's props.
 * @param {boolean} props.show - Controls if the modal is visible.
 * @param {string} props.title - The text for the modal header.
 * @param {React.ReactNode} props.children - The content to display in the modal body.
 * @param {function} props.onClose - Function to call when the modal is dismissed.
 * @param {function} props.onConfirm - Function to call when the confirm button is clicked.
 * @param {boolean} [props.isLoading=false] - If true, disables buttons and shows a loading state.
 * @param {string} [props.confirmText="Confirm"] - The text for the confirm button.
 * @param {string} [props.confirmButtonVariant="danger"] - The Bootstrap button variant (e.g., 'danger', 'primary', 'success').
 */
export default function ConfirmationModal({
  show,
  title,
  children,
  onClose,
  onConfirm,
  isLoading = false,
  confirmText = "Confirm",
  confirmButtonVariant = "danger",
}) {
  // Don't render anything if the modal is not supposed to be shown
  if (!show) {
    return null;
  }

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div
        className="modal fade show"
        style={{ display: "block" }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow-lg">
            <div
              className={`modal-header bg-${confirmButtonVariant} text-white`}
            >
              <h5 className="modal-title">
                <em className="fas fa-exclamation-triangle me-2"></em> {title}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
                disabled={isLoading}
              ></button>
            </div>
            <div className="modal-body">{children}</div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn btn-${confirmButtonVariant}`}
                onClick={onConfirm}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <em className="fas fa-check me-2"></em> {confirmText}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
