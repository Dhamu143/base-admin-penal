import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

// --- Mantra Actions ---
import {
  fetchMantras,
  addMantra,
  updateMantra,
  deleteMantra,
} from "../../store/mantra/index";
// --- God Actions ---
import { fetchGods } from "../../store/godmaster/index";
import { fetchGods as fetchgods } from "../../store/god/index";

// --- Reusable static languages array ---
import { staticLanguages } from "../../constants/languages"; // Adjust path as needed
import ConfirmationModal from "../../common/ConfirmationModal"; // Adjust the path as needed

export default function MantraManagementPage() {
  const dispatch = useDispatch();

  // --- Redux State ---
  const { list: mantras, status, error } = useSelector(
    (state) => state.mantras
  );

  const { list: gods, status: godStatus } = useSelector((state) => state.gods);
  const { list: Gods, status: GodStatus } = useSelector((state) => state.God);

  // --- Component State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingMantra, setEditingMantra] = useState(null);
  const [mantraToDelete, setMantraToDelete] = useState(null);

  // --- Form State ---
  const initialFormState = {
    name: "",
    sort: 0,
    isActive: true,
    master: "",
    Gods: "",
    description: "",
    language: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  // --- Data Fetching Effects ---
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchMantras());
    }
    if (godStatus === "idle") {
      dispatch(fetchGods());
    }
    if (godStatus === "idle") {
      dispatch(fetchgods());
    }
  }, [status, godStatus, GodStatus, fetchgods, dispatch]);

  // --- Helper function to get language name from ID ---
  const getLanguageNameById = (langId) => {
    const language = staticLanguages.find((lang) => lang._id === langId);
    return language ? language.nativeName : "N/A";
  };

  // --- Modal Handlers ---
  const handleOpenModal = (mantra = null) => {
    if (mantra) {
      setEditingMantra(mantra);
      setFormData({
        id: mantra._id,
        name: mantra.name || "",
        sort: mantra.sort || 0,
        isActive: mantra.isActive,
        master: mantra.master?._id || mantra.master || "",
        Gods: mantra.Gods?._id || mantra.Gods || "",
        description: mantra.description || "",
        language: mantra.language || "",
      });
    } else {
      setEditingMantra(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMantra(null);
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

  // --- Save Handler ---
  const handleSaveMantra = async (e) => {
    e.preventDefault();
    if (!formData.master || !formData.language) {
      alert("Please select a God and a Language.");
      return;
    }
    setIsSaving(true);
    try {
      // The entire formData (including description) is sent with the action
      const action = editingMantra
        ? updateMantra({ id: editingMantra._id, ...formData })
        : addMantra(formData);

      await dispatch(action).unwrap();
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save the mantra:", err);
      alert(err || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Delete Handlers ---
  const handleDeleteClick = (mantra) => {
    setMantraToDelete(mantra);
  };

  const confirmDelete = async () => {
    if (!mantraToDelete) return;
    setIsSaving(true);
    try {
      await dispatch(deleteMantra(mantraToDelete._id)).unwrap();
      setMantraToDelete(null);
    } catch (err) {
      console.error("Failed to delete the mantra:", err);
      alert(err || "An error occurred while deleting.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
          <h4 className="mb-0 text-primary-emphasis">🕉️ Mantra Management</h4>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <em className="fas fa-plus me-2"></em> Add New Mantra
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
                  {/* The description column header is here */}
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
                {status === "succeeded" && mantras.length > 0
                  ? mantras.map((mantra) => (
                      <tr key={mantra._id}>
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
                          {mantra.name}
                        </td>
                        {/* <td>{mantra.master?.name || "N/A"}</td> */}
                        <td>{getLanguageNameById(mantra.language)}</td>
                        {/* The description data is displayed here */}
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
                          {mantra.description}
                        </td>
                        <td>{mantra.sort}</td>
                        <td>
                          <span
                            className={`badge fs-6 ${
                              mantra.isActive
                                ? "text-bg-success"
                                : "text-bg-secondary"
                            }`}
                          >
                            {mantra.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-outline-secondary me-2"
                            onClick={() => handleOpenModal(mantra)}
                            title="Edit"
                          >
                            <em className="fas fa-pencil-alt"></em>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteClick(mantra)}
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
                          No Mantras Found.
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
                <form onSubmit={handleSaveMantra}>
                  <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title">
                      <em className="fas fa-om me-2"></em>
                      {editingMantra
                        ? `Edit ${editingMantra.name}`
                        : "Add New Mantra"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={handleCloseModal}
                    ></button>
                  </div>
                  <div className="modal-body">
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
                          htmlFor="Gods"
                          className="form-label fw-semibold"
                        >
                          Gods
                        </label>
                        <select
                          id="Gods"
                          name="Gods"
                          className="form-select"
                          value={formData.Gods}
                          onChange={handleFormChange}
                          required
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
                        Mantra Name
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

                    {/* This is the form element for the description */}
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
                      <div className="col-md-6 mb-3">
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
                      <div className="col-md-6 d-flex align-items-end mb-3">
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
        show={mantraToDelete !== null}
        onClose={() => setMantraToDelete(null)}
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
            {mantraToDelete?.name}
          </strong>
          ?
        </p>
        <p className="text-muted text-center">This action cannot be undone.</p>
      </ConfirmationModal>
    </>
  );
}
