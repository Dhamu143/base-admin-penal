import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify"; // Added for notifications

// --- Bhajan Actions ---
import {
  fetchBhajans,
  addBhajan,
  updateBhajan,
  deleteBhajan,
} from "../../store/bhajan/index";

// --- God Actions ---
import { fetchGods } from "../../store/godmaster/index";
import { fetchGods as fetchgods } from "../../store/god/index";

// --- Reusable static languages array ---
import { staticLanguages } from "../../constants/languages";
import ConfirmationModal from "../../common/ConfirmationModal";

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

export default function BhajanManagementPage() {
  const dispatch = useDispatch();

  const { list: bhajans, status, error } = useSelector(
    (state) => state.bhajans
  );
  const { list: gods, status: godStatus } = useSelector((state) => state.gods);
  const { list: Gods, status: GodStatus } = useSelector((state) => state.God);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingBhajan, setEditingBhajan] = useState(null);
  const [bhajanToDelete, setBhajanToDelete] = useState(null);
  const [errors, setErrors] = useState({});

  const initialFormState = {
    name: "",
    sort: "",
    isActive: false,
    master: "",
    God: "", // keep exactly "God"
    description: "",
    language: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchBhajans());
    }
    if (godStatus === "idle") {
      dispatch(fetchGods());
    }
  }, [status, godStatus, dispatch]);

  const getLanguageNameById = (langId) => {
    const language = staticLanguages.find((lang) => lang._id === langId);
    return language ? language.nativeName : "N/A";
  };

  const handleOpenModal = (bhajan = null) => {
    if (bhajan) {
      setEditingBhajan(bhajan);
      setFormData({
        id: bhajan._id,
        name: bhajan.name || "",
        sort: bhajan.sort || 0,
        isActive: bhajan.isActive,
        master: bhajan.master?._id || bhajan.master || "",
        God: bhajan.God?._id || "", // ✅ fix
        description: bhajan.description || "",
        language: bhajan.language || "",
      });
    } else {
      setEditingBhajan(null);
      setFormData(initialFormState);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBhajan(null);
    setFormData(initialFormState);
    setErrors({});
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Bhajan name is required.";
    if (!formData.master) newErrors.master = "Please select a God.";
    if (!formData.language) newErrors.language = "Please select a language.";
    if (!formData.description.trim())
      newErrors.description = "Description / Content is required.";
    if (formData.sort === "" || isNaN(formData.sort)) {
      newErrors.sort = "Sort order must be a valid number.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveBhajan = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const action = editingBhajan
        ? updateBhajan({ id: editingBhajan._id, ...formData })
        : addBhajan(formData);

      await dispatch(action).unwrap();

      const successMessage = editingBhajan
        ? "Bhajan updated successfully! 🙏"
        : "Bhajan added successfully! 🎶";
      toast.success(successMessage);

      handleCloseModal();
    } catch (err) {
      console.error("Failed to save the bhajan:", err);
      toast.error(err?.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (bhajan) => {
    setBhajanToDelete(bhajan);
  };

  const confirmDelete = async () => {
    if (!bhajanToDelete) return;
    setIsSaving(true);
    try {
      await dispatch(deleteBhajan(bhajanToDelete._id)).unwrap();
      toast.success(`Bhajan "${bhajanToDelete.name}" deleted successfully.`);
      setBhajanToDelete(null);
    } catch (err) {
      console.error("Failed to delete the bhajan:", err);
      toast.error(err?.message || "An error occurred while deleting.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
          <h4 className="mb-0 text-primary-emphasis">🎶 Bhajan Management</h4>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <i className="fas fa-plus me-2"></i> Add New Bhajan
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>God</th>
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
                      <i className="fas fa-exclamation-triangle me-2"></i>{" "}
                      Error: {error}
                    </td>
                  </tr>
                )}
                {status === "succeeded" && bhajans.length > 0
                  ? bhajans.map((bhajan) => (
                      <tr key={bhajan._id}>
                        <td className="fw-bold">{bhajan.name}</td>
                        <td>{bhajan.master?.name || "N/A"}</td>
                        <td>{getLanguageNameById(bhajan.language)}</td>
                        <td>
                          <span
                            className="truncate-text"
                            title={bhajan.description}
                          >
                            {bhajan.description}
                          </span>
                        </td>
                        <td>{bhajan.sort}</td>
                        <td>
                          <span
                            className={`badge fs-6 ${
                              bhajan.isActive
                                ? "text-bg-success"
                                : "text-bg-secondary"
                            }`}
                          >
                            {bhajan.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-outline-secondary me-2"
                            onClick={() => handleOpenModal(bhajan)}
                            title="Edit"
                          >
                            <i className="fas fa-pencil-alt"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteClick(bhajan)}
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  : status === "succeeded" && (
                      <tr>
                        <td colSpan="7" className="text-center py-5 text-muted">
                          No Bhajans Found.
                        </td>
                      </tr>
                    )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
                <form onSubmit={handleSaveBhajan} noValidate>
                  <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title">
                      <i className="fas fa-music me-2"></i>
                      {editingBhajan
                        ? `Edit: ${editingBhajan.name}`
                        : "Add New Bhajan"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={handleCloseModal}
                    ></button>
                  </div>
                  <div
                    className="modal-body p-4"
                    style={{ maxHeight: "65vh", overflowY: "auto" }}
                  >
                    <p className="text-muted small">
                      Fields marked with <span className="text-danger">*</span>{" "}
                      are required.
                    </p>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="master" className="form-label fw-bold">
                          God (Master) <span className="text-danger">*</span>
                        </label>
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
                        {errors.master && (
                          <div className="invalid-feedback">
                            {errors.master}
                          </div>
                        )}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="Gods" className="form-label fw-bold">
                          God <span className="text-danger">*</span>
                        </label>
                        <select
                          id="God"
                          name="God" // ✅ fix
                          className={`form-select ${
                            errors.God ? "is-invalid" : ""
                          }`}
                          value={formData.God}
                          onChange={handleFormChange}
                        >
                          <option value="" disabled>
                            -- Select a God --
                          </option>
                          {Gods.map((god) => (
                            <option key={god._id} value={god._id}>
                              {god.name}
                            </option>
                          ))}
                        </select>
                        {errors.God && (
                          <div className="invalid-feedback">{errors.God}</div>
                        )}

                        {errors.Gods && (
                          <div className="invalid-feedback">{errors.Gods}</div>
                        )}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="language"
                          className="form-label fw-bold"
                        >
                          Language <span className="text-danger">*</span>
                        </label>
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
                        {errors.language && (
                          <div className="invalid-feedback">
                            {errors.language}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label fw-bold">
                        Bhajan Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.name ? "is-invalid" : ""
                        }`}
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        placeholder="e.g., Shri Krishna Govind Hare Murari"
                      />
                      {errors.name && (
                        <div className="invalid-feedback">{errors.name}</div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="description"
                        className="form-label fw-bold"
                      >
                        Description / Content{" "}
                        <span className="text-danger">*</span>
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
                        placeholder="Enter the full bhajan lyrics here..."
                      ></textarea>
                      {errors.description && (
                        <div className="invalid-feedback">
                          {errors.description}
                        </div>
                      )}
                    </div>
                    <hr className="my-4" />
                    <div className="row align-items-end">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="sort" className="form-label fw-bold">
                          Sort Order <span className="text-danger">*</span>
                        </label>
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
                        {errors.sort && (
                          <div className="invalid-feedback">{errors.sort}</div>
                        )}
                      </div>
                      <div className="col-md-6 mb-3">
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
                            className="form-check-label"
                            htmlFor="isActive"
                          >
                            Active Status
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer bg-light border-top">
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
                          <i className="fas fa-save me-2"></i> Save Changes
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

      <ConfirmationModal
        show={bhajanToDelete !== null}
        onClose={() => setBhajanToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={isSaving}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">{bhajanToDelete?.name}</strong>?
        </p>
        <p className="text-muted text-center">This action cannot be undone.</p>
      </ConfirmationModal>
    </>
  );
}
