import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

// --- Actions ---
import {
  fetchAartis,
  addAarti,
  updateAarti,
  deleteAarti,
} from "../../store/aarti/index";
import { fetchGods } from "../../store/godmaster/index";

// Import the reusable static languages array
import { staticLanguages } from "../../constants/languages"; // Adjust path as needed
import ConfirmationModal from "../../common/ConfirmationModal";

// A little CSS for text truncation in the table
const styles = `
  .truncate-text {
    max-width: 250px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    vertical-align: middle;
  }
`;

export default function AartiManagementPage() {
  const dispatch = useDispatch();

  const { list: aartis, status, error } = useSelector((state) => state.aartis);
  const { list: gods, status: godStatus } = useSelector((state) => state.gods);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingAarti, setEditingAarti] = useState(null);
  const [aartiToDelete, setAartiToDelete] = useState(null);

  // --- NEW: State to hold validation errors ---
  const [errors, setErrors] = useState({});

  const initialFormState = {
    name: "",
    sort: "",
    isActive: true,
    master: "",
    description: "",
    language: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (status === "idle") dispatch(fetchAartis());
    if (godStatus === "idle") dispatch(fetchGods());
  }, [status, godStatus, dispatch]);

  const getLanguageNameById = (langId) => {
    const language = staticLanguages.find((lang) => lang._id === langId);
    return language ? language.nativeName : "N/A";
  };

  const handleOpenModal = (aarti = null) => {
    if (aarti) {
      setEditingAarti(aarti);
      setFormData({
        id: aarti._id,
        name: aarti.name || "",
        sort: aarti.sort || 0,
        isActive: aarti.isActive,
        master: aarti.master?._id || aarti.master || "",
        description: aarti.description || "",
        language: aarti.language || "",
      });
    } else {
      setEditingAarti(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
    setErrors({}); // Clear previous errors when opening
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAarti(null);
    setFormData(initialFormState);
    setErrors({}); // Also clear errors on close
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Optional: Clear error for a field when user starts typing in it
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // --- NEW: Validation Function ---
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Aarti name is required.";
    if (!formData.master) newErrors.master = "Please select a God.";
    if (!formData.language) newErrors.language = "Please select a language.";
    if (!formData.description.trim())
      newErrors.description = "Description / Content is required.";
    if (formData.sort === "" || isNaN(formData.sort)) {
      newErrors.sort = "Sort order must be a valid number.";
    }

    setErrors(newErrors);
    // Return true if there are no errors, false otherwise
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAarti = async (e) => {
    e.preventDefault();

    // --- NEW: Trigger validation before saving ---
    if (!validateForm()) {
      return; // Stop if form is not valid
    }

    setIsSaving(true);
    try {
      const action = editingAarti
        ? updateAarti({ id: editingAarti._id, ...formData })
        : addAarti(formData);

      await dispatch(action).unwrap();
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save the aarti:", err);
      // You could set a general form error here if needed
      // e.g., setErrors({ form: err.message || "An error occurred while saving." });
      alert(err.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (aarti) => setAartiToDelete(aarti);

  const confirmDelete = async () => {
    if (!aartiToDelete) return;
    setIsSaving(true);
    try {
      await dispatch(deleteAarti(aartiToDelete._id)).unwrap();
      setAartiToDelete(null);
    } catch (err) {
      console.error("Failed to delete the aarti:", err);
      alert(err.message || "An error occurred while deleting.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
          <h4 className="mb-0 text-primary-emphasis">🪔 Aarti Management</h4>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <em className="fas fa-plus me-2"></em> Add New Aarti
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                {/* --- UPDATED: Added God column back --- */}
                <tr>
                  <th>Name</th>
                  {/* <th>God</th> */}
                  <th>Language</th>
                  <th>Description</th>
                  <th>Sort Order</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {status === "loading" && (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="spinner-border text-primary"></div>
                    </td>
                  </tr>
                )}
                {status === "failed" && (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-danger">
                      <em className="fas fa-exclamation-triangle me-2"></em>{" "}
                      Error: {error}
                    </td>
                  </tr>
                )}
                {status === "succeeded" && aartis.length > 0
                  ? aartis.map((aarti) => (
                      <tr key={aarti._id}>
                        <td className="fw-bold">{aarti.name}</td>
                        {/* --- UPDATED: Display God and Description with truncation --- */}
                        {/* <td>{aarti.master?.name || "N/A"}</td> */}
                        <td>{getLanguageNameById(aarti.language)}</td>
                        <td>
                          <span
                            className="truncate-text"
                            title={aarti.description}
                          >
                            {aarti.description}
                          </span>
                        </td>
                        <td>{aarti.sort}</td>
                        <td>
                          <span
                            className={`badge fs-6 ${
                              aarti.isActive
                                ? "text-bg-success"
                                : "text-bg-secondary"
                            }`}
                          >
                            {aarti.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-outline-secondary me-2"
                            onClick={() => handleOpenModal(aarti)}
                            title="Edit"
                          >
                            <em className="fas fa-pencil-alt"></em>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteClick(aarti)}
                            title="Delete"
                          >
                            <em className="fas fa-trash"></em>
                          </button>
                        </td>
                      </tr>
                    ))
                  : status === "succeeded" && (
                      <tr>
                        <td colSpan="7" className="text-center py-5 text-muted">
                          No Aartis Found.
                        </td>
                      </tr>
                    )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content shadow-lg">
                <form onSubmit={handleSaveAarti} noValidate>
                  <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title">
                      <em className="fas fa-book-open me-2"></em>
                      {editingAarti
                        ? `Edit ${editingAarti.name}`
                        : "Add New Aarti"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={handleCloseModal}
                    ></button>
                  </div>
                  <div className="modal-body p-4">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="master"
                          className="form-label fw-semibold"
                        >
                          God (Master)
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <em className="fas fa-user"></em>
                          </span>
                          <select
                            id="master"
                            name="master"
                            className={`form-select ${
                              errors.master ? "is-invalid" : ""
                            }`}
                            value={formData.master}
                            onChange={handleFormChange}
                          >
                            <option value="" disabled>
                              -- Select a God --
                            </option>
                            {gods.map((god) => (
                              <option key={god._id} value={god._id}>
                                {god.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        {errors.master && (
                          <div className="text-danger small mt-1">
                            {errors.master}
                          </div>
                        )}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="language"
                          className="form-label fw-semibold"
                        >
                          Language
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <em className="fas fa-language"></em>
                          </span>
                          <select
                            id="language"
                            name="language"
                            className={`form-select ${
                              errors.language ? "is-invalid" : ""
                            }`}
                            value={formData.language}
                            onChange={handleFormChange}
                          >
                            <option value="" disabled>
                              -- Select a Language --
                            </option>
                            {staticLanguages.map((lang) => (
                              <option key={lang._id} value={lang._id}>
                                {`${lang.nativeName} (${lang.language})`}
                              </option>
                            ))}
                          </select>
                        </div>
                        {errors.language && (
                          <div className="text-danger small mt-1">
                            {errors.language}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="name" className="form-label fw-semibold">
                        Aarti Name
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <em className="fas fa-tag"></em>
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
                          placeholder="e.g., Jai Ganesha Deva"
                        />
                      </div>
                      {errors.name && (
                        <div className="text-danger small mt-1">
                          {errors.name}
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor="description"
                        className="form-label fw-semibold"
                      >
                        Description / Content
                      </label>
                      <textarea
                        className={`form-control ${
                          errors.description ? "is-invalid" : ""
                        }`}
                        id="description"
                        name="description"
                        rows="5"
                        value={formData.description}
                        onChange={handleFormChange}
                        placeholder="Enter the full aarti text here..."
                      ></textarea>
                      {errors.description && (
                        <div className="text-danger small mt-1">
                          {errors.description}
                        </div>
                      )}
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="sort"
                          className="form-label fw-semibold"
                        >
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
                      <div className="col-md-6 d-flex align-items-center justify-content-start pt-3 mb-3">
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
                      disabled={isSaving}
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

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {/* --- Reusable Delete Confirmation Modal --- */}
      <ConfirmationModal
        show={aartiToDelete !== null}
        onClose={() => setAartiToDelete(null)}
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
            {aartiToDelete?.name}
          </strong>
          ?
        </p>
        <p className="text-muted text-center">This action cannot be undone.</p>
      </ConfirmationModal>
      {/* {aartiToDelete && (
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
                    onClick={() => setAartiToDelete(null)}
                    disabled={isSaving}
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="fs-5 text-center">
                    Are you sure you want to delete <br />
                    <strong className="text-danger">
                      {aartiToDelete.name}
                    </strong>
                    ?
                  </p>
                  <p className="text-muted text-center">
                    This action cannot be undone.
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setAartiToDelete(null)}
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
