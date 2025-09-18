// pages/SlokManagementPage.jsx

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify"; // --- ADDED ---

// --- Slok Actions ---
import {
  fetchSloks,
  addSlok,
  updateSlok,
  deleteSlok,
} from "../../store/sloks/index"; // Adjust path as needed

// --- God Actions ---
import { fetchGods } from "../../store/godmaster/index"; // Adjust path as needed

// NEW: Import the reusable static languages array
import { staticLanguages } from "../../constants/languages"; // Adjust path as needed
import ConfirmationModal from "../../common/ConfirmationModal";

export default function SlokManagementPage() {
  const dispatch = useDispatch();

  // --- Redux State ---
  const { list: sloks, status, error } = useSelector((state) => state.sloks);
  const { list: gods, status: godStatus } = useSelector((state) => state.gods);

  // --- Component State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSlok, setEditingSlok] = useState(null);
  const [slokToDelete, setSlokToDelete] = useState(null);

  // --- Form State ---
  const initialFormState = {
    name: "",
    sort: "",
    isActive: "",
    isFree: "",
    master: "",
    description: "",
    language: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- Data Fetching Effects ---
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchSloks());
    }
    if (godStatus === "idle") {
      dispatch(fetchGods());
    }
  }, [status, godStatus, dispatch]);

  // NEW: Helper function to get language name from ID
  const getLanguageNameById = (langId) => {
    const language = staticLanguages.find((lang) => lang._id === langId);
    return language ? language.nativeName : "N/A";
  };

  // --- Modal Handlers ---
  const handleOpenModal = (slok = null) => {
    if (slok) {
      setEditingSlok(slok);
      setFormData({
        id: slok._id,
        name: slok.name || "",
        sort: slok.sort || 0,
        isActive: slok.isActive,
        isFree: slok.isFree !== undefined ? slok.isFree : true,
        master: slok.master?._id || slok.master || "",
        description: slok.description || "",
        language: slok.language || "", // FIXED: Was missing from edit form
      });
    } else {
      setEditingSlok(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSlok(null);
    setFormData(initialFormState);
  };

  // --- Form Handlers ---
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveSlok = async (e) => {
    e.preventDefault();
    if (!formData.master || !formData.language) {
      // --- CHANGED: Replaced alert with toast.warn ---
      toast.warn("Please select a God and a Language.");
      return;
    }
    setIsSaving(true);
    try {
      const action = editingSlok
        ? updateSlok({ id: editingSlok._id, ...formData })
        : addSlok(formData);
      await dispatch(action).unwrap();

      // --- CHANGED: Added dynamic success toast ---
      const successMessage = editingSlok
        ? "Sloka updated successfully! 🙏"
        : "Sloka added successfully! 🕉️";
      toast.success(successMessage);

      handleCloseModal();
    } catch (err) {
      console.error("Failed to save the sloka:", err);
      // --- CHANGED: Replaced alert with toast.error ---
      toast.error(err || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Delete Handlers ---
  const handleDeleteClick = (slok) => {
    setSlokToDelete(slok);
  };

  const confirmDelete = async () => {
    if (!slokToDelete) return;
    setIsSaving(true);
    try {
      await dispatch(deleteSlok(slokToDelete._id)).unwrap();

      // --- CHANGED: Added success toast ---
      toast.success(`Sloka "${slokToDelete.name}" deleted successfully.`);

      setSlokToDelete(null);
    } catch (err) {
      console.error("Failed to delete the sloka:", err);
      // --- CHANGED: Replaced alert with toast.error ---
      toast.error(err || "An error occurred while deleting.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
          <h4 className="mb-0 text-primary-emphasis">🕉️ Sloka Management</h4>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <em className="fas fa-plus me-2"></em> Add New Sloka
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                {/* UPDATED: Added God and Language columns */}
                <tr>
                  <th>Name</th>
                  <th>Language</th>
                  <th>description</th>
                  <th>Type</th>
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
                {status === "succeeded" && sloks.length > 0
                  ? sloks.map((slok) => (
                      <tr key={slok._id}>
                        <td className="fw-bold">{slok.name}</td>
                        {/* UPDATED: Display God and Language */}
                        {/* <td>{slok.master?.name || "N/A"}</td> */}
                        <td>{getLanguageNameById(slok.language)}</td>
                        <td
                          style={{
                            fontSize: "14px",
                            color: "#444",
                            lineHeight: "1.6",
                            maxWidth: "200px", // adjust as per need
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {slok.description}
                        </td>

                        <td>
                          <span
                            className={`badge fs-6 ${
                              slok.isFree ? "text-bg-info" : "text-bg-warning"
                            }`}
                          >
                            {slok.isFree ? "Free" : "Premium"}
                          </span>
                        </td>
                        <td>{slok.sort}</td>
                        <td>
                          <span
                            className={`badge fs-6 ${
                              slok.isActive
                                ? "text-bg-success"
                                : "text-bg-secondary"
                            }`}
                          >
                            {slok.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-outline-secondary me-2"
                            onClick={() => handleOpenModal(slok)}
                            title="Edit"
                          >
                            <em className="fas fa-pencil-alt"></em>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteClick(slok)}
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
                          No Slokas Found.
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
                <form onSubmit={handleSaveSlok}>
                  <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title">
                      <em className="fas fa-om me-2"></em>
                      {editingSlok
                        ? `Edit ${editingSlok.name}`
                        : "Add New Sloka"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={handleCloseModal}
                    ></button>
                  </div>
                  <div className="modal-body">
                    {/* UPDATED: Modal layout with Language dropdown */}
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="master"
                          className="form-label fw-semibold"
                        >
                          God (Master)
                        </label>
                        <select
                          id="master"
                          name="master"
                          className="form-select"
                          value={formData.master}
                          onChange={handleFormChange}
                          required
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
                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="language"
                          className="form-label fw-semibold"
                        >
                          Language
                        </label>
                        <select
                          id="language"
                          name="language"
                          className="form-select"
                          value={formData.language}
                          onChange={handleFormChange}
                          required
                        >
                          <option value="" disabled>
                            -- Select a Language --
                          </option>
                          {staticLanguages.map((lang) => (
                            <option
                              key={lang._id}
                              value={lang._id}
                            >{`${lang.nativeName} (${lang.language})`}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="name" className="form-label fw-semibold">
                        Sloka Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor="description"
                        className="form-label fw-semibold"
                      >
                        Description / Content
                      </label>
                      <textarea
                        className="form-control"
                        id="description"
                        name="description"
                        rows="5"
                        value={formData.description}
                        onChange={handleFormChange}
                      ></textarea>
                    </div>

                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label
                          htmlFor="sort"
                          className="form-label fw-semibold"
                        >
                          Sort Order
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="sort"
                          name="sort"
                          value={formData.sort}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                      <div className="col-md-4 d-flex align-items-end mb-3">
                        <div className="form-check form-switch">
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
                      <div className="col-md-4 d-flex align-items-end mb-3">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="isFree"
                            name="isFree"
                            checked={formData.isFree}
                            onChange={handleFormChange}
                          />
                          <label
                            className="form-check-label fw-semibold"
                            htmlFor="isFree"
                          >
                            Free
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

      {/* --- Reusable Delete Confirmation Modal --- */}
      <ConfirmationModal
        show={slokToDelete !== null}
        onClose={() => setSlokToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={isSaving}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">{slokToDelete?.name}</strong>?
        </p>
        <p className="text-muted text-center">This action cannot be undone.</p>
      </ConfirmationModal>
    </>
  );
}
