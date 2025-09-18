import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify"; // --- ADDED ---

// Redux Actions for Ringtone
import {
  fetchRingtones,
  addRingtone,
  updateRingtone,
  deleteRingtone,
} from "../../store/ringtone/index";

// Redux Actions for God Master List
import { fetchGods } from "../../store/godmaster/index";

// Import the static languages array
import { staticLanguages } from "../../constants/languages"; // Adjust path as needed
import ConfirmationModal from "../../common/ConfirmationModal";

export default function RingtoneManagementPage() {
  const dispatch = useDispatch();

  // --- Redux State ---
  const { list: ringtones, status, error } = useSelector(
    (state) => state.ringtones
  );
  const { list: gods, status: godStatus } = useSelector((state) => state.gods);

  // --- Component State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingRingtone, setEditingRingtone] = useState(null);
  const [ringtoneToDelete, setRingtoneToDelete] = useState(null);

  // --- Form State ---
  const initialFormState = {
    sort: "",
    isActive: true,
    isFree: true,
    master: "",
    language: "",
    description: "", // ADDED: Description field in state
    file: null,
  };
  const [formData, setFormData] = useState(initialFormState);

  // Fetch initial data
  useEffect(() => {
    if (status === "idle") dispatch(fetchRingtones());
    if (godStatus === "idle") dispatch(fetchGods());
  }, [status, godStatus, dispatch]);

  const handleOpenModal = (ringtone = null) => {
    if (ringtone) {
      setEditingRingtone(ringtone);
      setFormData({
        sort: ringtone.sort || 0,
        isActive: ringtone.isActive,
        isFree: ringtone.isFree,
        master: ringtone.master?._id || ringtone.master || "",
        language: ringtone.language?._id || ringtone.language || "",
        description: ringtone.description || "", // ADDED: Populate description on edit
        file: null,
      });
    } else {
      setEditingRingtone(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const getLanguageNameById = (langId) => {
    const language = staticLanguages.find((lang) => lang._id === langId);
    return language ? language.nativeName : "N/A";
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRingtone(null);
    setFormData(initialFormState);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // RingtoneManagementPage.jsx - CORRECTED

  const handleSaveRingtone = async (e) => {
    e.preventDefault();
    if (!formData.master || !formData.language) {
      toast.warn("Please select a God and a Language.");
      return;
    }
    if (!editingRingtone && !formData.file) {
      toast.warn("Please select a ringtone file to upload.");
      return;
    }
    setIsSaving(true);
    try {
      const dataToSubmit = new FormData();

      // --- CORRECTED LOGIC ---
      // This new loop correctly handles optional file uploads during updates.
      for (const key in formData) {
        // If the key is 'file' and its value is falsy (null, undefined), skip it.
        // This prevents sending an empty file field on update.
        if (key === "file" && !formData[key]) {
          continue; // Go to the next item in the loop
        }
        // Append all other fields.
        dataToSubmit.append(key, formData[key]);
      }
      // --- END CORRECTION ---

      const isEditing = !!editingRingtone;
      const action = isEditing
        ? updateRingtone({ id: editingRingtone._id, data: dataToSubmit })
        : addRingtone(dataToSubmit);

      await dispatch(action).unwrap();

      const successMessage = isEditing
        ? "Ringtone updated successfully! 🎵"
        : "Ringtone added successfully! 🎶";
      toast.success(successMessage);

      handleCloseModal();
    } catch (err) {
      console.error("Failed to save the ringtone:", err);
      toast.error(err || "An error occurred while saving the ringtone.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!ringtoneToDelete) return;
    setIsSaving(true);
    try {
      await dispatch(deleteRingtone(ringtoneToDelete._id)).unwrap();

      // --- CHANGED: Added success toast ---
      toast.success("Ringtone deleted successfully.");

      setRingtoneToDelete(null);
    } catch (err) {
      console.error("Failed to delete ringtone:", err);
      // --- CHANGED: Replaced alert with toast.error ---
      toast.error(err || "Failed to delete the ringtone.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
          <h4 className="mb-0 text-primary-emphasis">🎵 Ringtone Management</h4>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <em className="fas fa-plus me-2"></em> Add New Ringtone
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Preview</th>
                  <th>Description</th>
                  <th>Language</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {status === "loading" && (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="spinner-border text-primary"></div>
                    </td>
                  </tr>
                )}
                {status === "failed" && (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-danger">
                      <em className="fas fa-exclamation-triangle me-2"></em>
                      Error: {error}
                    </td>
                  </tr>
                )}
                {status === "succeeded" && ringtones.length > 0
                  ? ringtones.map((ringtone) => (
                      <tr key={ringtone._id}>
                        <td>
                          <audio
                            controls
                            src={ringtone.file}
                            style={{ height: "40px", width: "250px" }}
                          >
                            Your browser does not support the audio element.
                          </audio>
                        </td>
                        <td>{ringtone.description || "-"}</td>
                        <td>{getLanguageNameById(ringtone.language)}</td>
                        <td>
                          <span
                            className={`badge fs-6 ${
                              ringtone.isFree
                                ? "text-bg-info"
                                : "text-bg-warning"
                            }`}
                          >
                            {ringtone.isFree ? "Free" : "Premium"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge fs-6 ${
                              ringtone.isActive
                                ? "text-bg-success"
                                : "text-bg-secondary"
                            }`}
                          >
                            {ringtone.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-outline-secondary me-2"
                            onClick={() => handleOpenModal(ringtone)}
                            title="Edit"
                          >
                            <em className="fas fa-pencil-alt"></em>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setRingtoneToDelete(ringtone)}
                            title="Delete"
                          >
                            <em className="fas fa-trash"></em>
                          </button>
                        </td>
                      </tr>
                    ))
                  : status === "succeeded" && (
                      <tr>
                        <td colSpan="6" className="text-center py-5 text-muted">
                          No Ringtones Found.
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
                <form onSubmit={handleSaveRingtone}>
                  <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title">
                      <em className="fas fa-music me-2"></em>
                      {editingRingtone ? "Edit Ringtone" : "Add New Ringtone"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={handleCloseModal}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label htmlFor="file" className="form-label fw-semibold">
                        Ringtone File
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        id="file"
                        name="file"
                        onChange={handleFormChange}
                        accept="audio/*"
                        required={!editingRingtone}
                      />
                      {editingRingtone && (
                        <small className="form-text text-muted">
                          Current file:{" "}
                          <a
                            href={editingRingtone.file}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Play
                          </a>
                          . Upload a new file to replace it.
                        </small>
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
                        className="form-control"
                        id="description"
                        name="description"
                        rows="3"
                        value={formData.description}
                        onChange={handleFormChange}
                      ></textarea>
                    </div>

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
                            -- Select a God --
                          </option>
                          {staticLanguages.map((lang) => (
                            <option key={lang._id} value={lang._id}>
                              {lang.nativeName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="sort" className="form-label fw-semibold">
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

                    <div className="d-flex justify-content-around mb-3">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isActive"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleFormChange}
                        />
                        <label className="form-check-label" htmlFor="isActive">
                          Active
                        </label>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isFree"
                          name="isFree"
                          checked={formData.isFree}
                          onChange={handleFormChange}
                        />
                        <label className="form-check-label" htmlFor="isFree">
                          Free
                        </label>
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
        show={ringtoneToDelete !== null}
        onClose={() => setRingtoneToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={isSaving}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">
            {ringtoneToDelete?.file?.split("/").pop() || "this ringtone"}
          </strong>
          ?
        </p>
        <p className="text-muted text-center">This action cannot be undone.</p>
      </ConfirmationModal>
    </>
  );
}
