import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

// Redux Actions
import {
  fetchGods,
  addGod,
  updateGod,
  deleteGod,
} from "../../store/godmaster/index";

// Upload Service
import { uploadImage } from "../../services/uploadService";

// UI Components
import DynamicImage from "../../components/PostPreview/PostPreview";
import ImageUpload from "../../components/ImageUpload";
import ConfirmationModal from "../../common/ConfirmationModal";

export default function FeatureManagementPage() {
  const dispatch = useDispatch();

  const { list: gods, status, error } = useSelector((state) => state.gods);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingGod, setEditingGod] = useState(null);
  const [godToDelete, setGodToDelete] = useState(null);

  // --- NEW: State for validation errors and image uploading status ---
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const initialFormState = {
    name: "",
    featureimage: "",
    sort: "",
    isActive: true,
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchGods());
    }
  }, [status, dispatch]);

  const handleOpenModal = (god = null) => {
    if (god) {
      setEditingGod(god);
      setFormData({
        id: god._id,
        name: god.name || "",
        featureimage: god.featureimage || "",
        sort: god.sort || 0,
        isActive: god.isActive,
      });
    } else {
      setEditingGod(null);
      setFormData(initialFormState);
    }
    setErrors({}); // Clear errors on open
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGod(null);
    setFormData(initialFormState);
    setErrors({});
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // --- REFINED: Streamlined image handling logic ---
  const handleImageChange = async (data) => {
    // Clear previous image URL and any existing errors
    setFormData((prev) => ({ ...prev, featureimage: "" }));
    setErrors((prev) => ({ ...prev, featureimage: null }));

    if (!data?.file) return;

    setIsUploading(true);
    // Use the temporary blob URL for an instant preview
    setFormData((prev) => ({ ...prev, featureimage: data.url }));

    try {
      // Upload the file to get the permanent URL
      const uploadedUrl = await uploadImage(data.file);
      // Replace the temporary preview URL with the permanent one
      setFormData((prev) => ({ ...prev, featureimage: uploadedUrl }));
    } catch (err) {
      console.error("Upload failed:", err);
      setErrors((prev) => ({
        ...prev,
        featureimage: err.message || "Image upload failed. Please try again.",
      }));
      setFormData((prev) => ({ ...prev, featureimage: "" })); // Clear image on failure
    } finally {
      setIsUploading(false);
    }
  };

  // --- NEW: Validation Function ---
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "God name is required.";
    if (!formData.featureimage)
      newErrors.featureimage = "A feature image is required.";
    if (formData.sort === "" || isNaN(formData.sort)) {
      newErrors.sort = "Sort order must be a valid number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveFeature = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // Stop if form is not valid
    }
    if (isUploading) {
      alert("Please wait for the image to finish uploading.");
      return;
    }

    setIsSaving(true);
    try {
      const action = editingGod
        ? updateGod({ id: editingGod._id, ...formData })
        : addGod(formData);

      await dispatch(action).unwrap();
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save the feature:", err);
      alert(err.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!godToDelete) return;
    setIsSaving(true);
    try {
      await dispatch(deleteGod(godToDelete._id)).unwrap();
      setGodToDelete(null);
    } catch (err) {
      console.error("Failed to delete the feature:", err);
      alert(err.message || "An error occurred while deleting.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (god) => {
    setGodToDelete(god);
  };

  return (
    <>
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
          <h4 className="mb-0 text-primary-emphasis">✨ God Management</h4>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <em className="fas fa-plus me-2"></em> Add New God
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "10%" }}>Image</th>
                  <th>Name</th>
                  <th>Sort Order</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {status === "loading" && (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div className="spinner-border text-primary"></div>
                    </td>
                  </tr>
                )}
                {status === "failed" && (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-danger">
                      <em className="fas fa-exclamation-triangle me-2"></em>{" "}
                      Error: {error}
                    </td>
                  </tr>
                )}
                {status === "succeeded" && gods.length > 0
                  ? gods.map((god) => (
                      <tr key={god._id}>
                        <td>
                          <DynamicImage
                            src={god.featureimage || "/img/user.jpg"} // Default placeholder
                            alt={god.name || "User"}
                            style={{
                              width: "60px",
                              height: "60px",
                              objectFit: "cover",
                              borderRadius: "50%",
                              border: "2px solid #dee2e6",
                            }}
                          />
                        </td>
                        <td className="fw-bold">{god.name}</td>
                        <td>{god.sort}</td>
                        <td>
                          <span
                            className={`badge fs-6 ${
                              god.isActive
                                ? "text-bg-success"
                                : "text-bg-secondary"
                            }`}
                          >
                            {god.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-outline-secondary me-2"
                            onClick={() => handleOpenModal(god)}
                            title="Edit"
                          >
                            <em className="fas fa-pencil-alt"></em>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteClick(god)}
                            title="Delete"
                          >
                            <em className="fas fa-trash"></em>
                          </button>
                        </td>
                      </tr>
                    ))
                  : status === "succeeded" && (
                      <tr>
                        <td colSpan="5" className="text-center py-5 text-muted">
                          No Gods Found.
                        </td>
                      </tr>
                    )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- Add/Edit Modal --- */}
      {isModalOpen && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow-lg">
                <form onSubmit={handleSaveFeature} noValidate>
                  <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title">
                      <em className="fas fa-gopuram me-2"></em>
                      {editingGod ? `Edit: ${editingGod.name}` : "Add New God"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={handleCloseModal}
                    ></button>
                  </div>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label fw-semibold">
                        Name
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <em className="fas fa-user"></em>
                        </span>
                        <input
                          type="text"
                          className={`form-control ${
                            errors.name ? "is-invalid" : ""
                          }`}
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleFormChange}
                          placeholder="e.g., Ganesha, Shiva"
                        />
                      </div>
                      {errors.name && (
                        <div className="text-danger small mt-1">
                          {errors.name}
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="sort" className="form-label fw-semibold">
                        Sort Order
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <em className="fas fa-sort-numeric-down"></em>
                        </span>
                        <input
                          type="number"
                          className={`form-control ${
                            errors.sort ? "is-invalid" : ""
                          }`}
                          id="sort"
                          name="sort"
                          value={formData.sort}
                          onChange={handleFormChange}
                        />
                      </div>
                      {errors.sort && (
                        <div className="text-danger small mt-1">
                          {errors.sort}
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <ImageUpload
                        label="Feature Image"
                        value={{ url: formData.featureimage, type: "image" }}
                        onChange={handleImageChange}
                        isUploading={isUploading} // Pass uploading state to component
                      />
                      {errors.featureimage && (
                        <div className="text-danger small mt-1">
                          {errors.featureimage}
                        </div>
                      )}
                    </div>

                    <div className="form-check form-switch fs-5">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleFormChange}
                      />
                      <label
                        className="form-check-label fw-semibold"
                        htmlFor="isActive"
                      >
                        Active Status
                      </label>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseModal}
                      disabled={isSaving}
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSaving || isUploading}
                    >
                      {isSaving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <em className="fas fa-save me-2"></em> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* --- Delete Confirmation Modal --- */}
      {/* --- Reusable Delete Confirmation Modal --- */}
      <ConfirmationModal
        show={godToDelete !== null}
        onClose={() => setGodToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={isSaving}
        confirmButtonVariant="danger"
      >
        {/* This content is passed as 'children' to the modal */}
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">
            {/* Use optional chaining `?.` for safety as the object might be null during fade-out */}
            {godToDelete?.name}
          </strong>
          ?
        </p>
        <p className="text-muted text-center">This action cannot be undone.</p>
      </ConfirmationModal>
      {/* {godToDelete && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow-lg">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title">
                    <em className="fas fa-exclamation-triangle me-2"></em>{" "}
                    Confirm Deletion
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setGodToDelete(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="fs-5 text-center">
                    Are you sure you want to delete <br />
                    <strong className="text-danger">{godToDelete.name}</strong>?
                  </p>
                  <p className="text-muted text-center">
                    This action cannot be undone.
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setGodToDelete(null)}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={confirmDelete}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <em className="fas fa-trash-alt me-2"></em> Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )} */}
    </>
  );
}
