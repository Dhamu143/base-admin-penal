// src/common/FormActionButtons.jsx
import React from "react";

export default function FormActionButtons({
    onCancel,
    isLoading = false,
    isEditing = false,
    entityName = "Item",
    customSubmitText = null, // Optional override for the submit button
    customCancelText = "Cancel" // Optional override for the cancel button
}) {

    // Automatically generate "Update Mantra" or "Create Mantra" based on the props
    const defaultSubmitText = isEditing ? `Update ${entityName}` : `Create ${entityName}`;
    const finalSubmitText = customSubmitText || defaultSubmitText;

    return (
        <div className="d-flex justify-content-end gap-2 mt-4 border-top pt-3">
            <button
                type="button"
                className="btn btn-outline-secondary mr-2"
                onClick={onCancel}
                disabled={isLoading}
            >
                {customCancelText}
            </button>

            <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
            >
                {isLoading ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : (
                    <i className="fas fa-save mr-2"></i>
                )}
                {finalSubmitText}
            </button>
        </div>
    );
}