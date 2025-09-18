import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

// --- Festival Actions ---
import {
  fetchFestivals,
  addFestival,
  updateFestival,
  deleteFestival,
} from "../../store/festival/index";

// --- God Actions ---
import { fetchGods } from "../../store/godmaster/index";

// --- Reusable static languages array ---
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

export default function FestivalManagementPage() {
  const dispatch = useDispatch();

  // --- Redux State ---
  const { list: festivals, status, error } = useSelector(
    (state) => state.festivals
  );
  const { list: gods, status: godStatus } = useSelector((state) => state.gods);

  // --- Component State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingFestival, setEditingFestival] = useState(null);
  const [festivalToDelete, setFestivalToDelete] = useState(null);

  // --- NEW: State for validation errors ---
  const [errors, setErrors] = useState({});

  // --- Form State ---
  const initialFormState = {
    name: "",
    sort: "",
    isActive: true,
    master: "",
    description: "",
    language: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- Data Fetching Effects ---
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchFestivals());
    }
    if (godStatus === "idle") {
      dispatch(fetchGods());
    }
  }, [status, godStatus, dispatch]);

  // --- Helper function to get language name from ID ---
  const getLanguageNameById = (langId) => {
    const language = staticLanguages.find((lang) => lang._id === langId);
    return language ? language.nativeName : "N/A";
  };

  // --- Modal Handlers ---
  const handleOpenModal = (festival = null) => {
    if (festival) {
      setEditingFestival(festival);
      setFormData({
        id: festival._id,
        name: festival.name || "",
        sort: festival.sort || 0,
        isActive: festival.isActive,
        master: festival.master?._id || festival.master || "",
        description: festival.description || "",
        language: festival.language || "",
      });
    } else {
      setEditingFestival(null);
      setFormData(initialFormState);
    }
    setErrors({}); // Clear errors when modal opens
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFestival(null);
    setFormData(initialFormState);
    setErrors({});
  };

  // --- Form Handlers ---
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear the error for the field being edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // --- NEW: Validation Function ---
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Festival name is required.";
    if (!formData.master) newErrors.master = "Please select a God.";
    if (!formData.language) newErrors.language = "Please select a language.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";
    if (formData.sort === "" || isNaN(formData.sort)) {
      newErrors.sort = "Sort order must be a valid number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveFestival = async (e) => {
    e.preventDefault();

    // --- NEW: Trigger validation before saving ---
    if (!validateForm()) {
      return; // Stop if form is not valid
    }

    setIsSaving(true);
    try {
      const action = editingFestival
        ? updateFestival({ id: editingFestival._id, ...formData })
        : addFestival(formData);

      await dispatch(action).unwrap();
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save the festival:", err);
      alert(err?.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Delete Handlers ---
  const handleDeleteClick = (festival) => {
    setFestivalToDelete(festival);
  };

  const confirmDelete = async () => {
    if (!festivalToDelete) return;
    setIsSaving(true);
    try {
      await dispatch(deleteFestival(festivalToDelete._id)).unwrap();
      setFestivalToDelete(null);
    } catch (err) {
      console.error("Failed to delete the festival:", err);
      alert(err?.message || "An error occurred while deleting.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
          <h4 className="mb-0 text-primary-emphasis">🎉 Festival Management</h4>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <em className="fas fa-plus me-2"></em> Add New Festival
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
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
                {status === "succeeded" && festivals.length > 0
                  ? festivals.map((festival) => (
                      <tr key={festival._id}>
                        <td className="fw-bold">{festival.name}</td>
                        {/* <td>{festival.master?.name || "N/A"}</td> */}
                        <td>{getLanguageNameById(festival.language)}</td>
                        <td>
                          <span
                            className="truncate-text"
                            title={festival.description}
                          >
                            {festival.description}
                          </span>
                        </td>
                        <td>{festival.sort}</td>
                        <td>
                          <span
                            className={`badge fs-6 ${
                              festival.isActive
                                ? "text-bg-success"
                                : "text-bg-secondary"
                            }`}
                          >
                            {festival.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-outline-secondary me-2"
                            onClick={() => handleOpenModal(festival)}
                            title="Edit"
                          >
                            <em className="fas fa-pencil-alt"></em>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteClick(festival)}
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
                          No Festivals Found.
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
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content shadow-lg">
                <form onSubmit={handleSaveFestival} noValidate>
                  <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title">
                      <em className="fas fa-calendar-alt me-2"></em>
                      {editingFestival
                        ? `Edit: ${editingFestival.name}`
                        : "Add New Festival"}
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
                        Festival Name
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
                          placeholder="e.g., Diwali, Navratri"
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
                        Description
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
                        placeholder="Enter details about the festival..."
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
                      <div className="col-md-6 d-flex align-items-end mb-3">
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

      {/* --- Delete Confirmation Modal --- */}
      {/* --- Reusable Delete Confirmation Modal --- */}
      <ConfirmationModal
        show={festivalToDelete !== null}
        onClose={() => setFestivalToDelete(null)}
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
            {festivalToDelete?.name}
          </strong>
          ?
        </p>
        <p className="text-muted text-center">
          This action cannot be undone.
        </p>
      </ConfirmationModal>
      {/* {festivalToDelete && (
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
                    onClick={() => setFestivalToDelete(null)}
                    disabled={isSaving}
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="fs-5 text-center">
                    Are you sure you want to delete <br />
                    <strong className="text-danger">
                      {festivalToDelete.name}
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
                    onClick={() => setFestivalToDelete(null)}
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
