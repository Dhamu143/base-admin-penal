import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

// Import Redux Thunks
import {
  fetchTemples,
  addTemple,
  updateTemple,
  deleteTemple,
} from "../../store/temple/index";
// Using the 'god' slice as requested
import { fetchGods } from "../../store/god/index";

// Static data and services
import { staticLanguages } from "../../constants/languages";
import { uploadImage } from "../../services/uploadService";
import ImageUpload from "../../components/ImageUpload";
import ConfirmationModal from "../../common/ConfirmationModal";
import DynamicImage from "../../components/PostPreview/PostPreview";

export default function TempleManagementPage() {
  const dispatch = useDispatch();

  const { list: temples, status, error } = useSelector((state) => state.temple);
  // Using state.God as requested for the store configuration
  const { list: gods } = useSelector((state) => state.God);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingTemple, setEditingTemple] = useState(null);
  const [templeToDelete, setTempleToDelete] = useState(null);

  // --- CHANGED: Renamed 'master' to 'god' ---
  const initialFormState = {
    name: "",
    description: "",
    address: "",
    isFamous: false,
    god: "", // Replaced 'master'
    language: "",
    openTime: "",
    closeTime: "",
    files: "",
    location: {
      type: "Point",
      coordinates: [0, 0],
    },
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    dispatch(fetchTemples());
    dispatch(fetchGods());
  }, [dispatch]);

  const getGodNameById = (godId) =>
    gods.find((g) => g._id === godId)?.name || "N/A";
  const getLanguageNameById = (langId) =>
    staticLanguages.find((l) => l._id === langId)?.nativeName || "N/A";

  const handleOpenModal = (temple = null) => {
    if (temple) {
      setEditingTemple(temple);
      // --- CHANGED: Populate 'god' instead of 'master' ---
      setFormData({
        ...temple,
        address: temple.address || "",
        isFamous: temple.isFamous || false,
        god: temple.god?._id || temple.god || "", // Handles both object and ID
        language: temple.language || "",
        openTime: temple.openTime || "",
        closeTime: temple.closeTime || "",
      });
    } else {
      setEditingTemple(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCoordsChange = (e) => {
    const { name, value } = e.target;
    const index = name === "longitude" ? 0 : 1;
    setFormData((prev) => {
      const newCoords = [...prev.location.coordinates];
      newCoords[index] = parseFloat(value) || 0;
      return {
        ...prev,
        location: { ...prev.location, coordinates: newCoords },
      };
    });
  };

  const handleImageChange = (data) => {
    setFormData((prev) => ({ ...prev, files: data?.url || "" }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const longitude = formData.location.coordinates[0];
    const latitude = formData.location.coordinates[1];

    if (longitude < -180 || longitude > 180) {
      toast.error("Longitude must be between -180 and 180.");
      return;
    }
    if (latitude < -90 || latitude > 90) {
      toast.error("Latitude must be between -90 and 90.");
      return;
    }

    setIsSaving(true);
    try {
      let finalData = { ...formData };

      if (finalData.files?.startsWith("blob:")) {
        const response = await fetch(finalData.files);
        const blob = await response.blob();
        const file = new File([blob], "upload.jpg", { type: blob.type });
        finalData.files = await uploadImage(file);
      }

      // --- CHANGED: Check for 'god' instead of 'master' ---
      if (!finalData.god) {
        finalData.god = null;
      }

      const action = editingTemple
        ? updateTemple({ id: editingTemple._id, ...finalData })
        : addTemple(finalData);

      await dispatch(action).unwrap();

      const successMessage = editingTemple
        ? "Temple updated successfully! 🎉"
        : "Temple added successfully! 🙏";
      toast.success(successMessage);

      handleCloseModal();
    } catch (err) {
      toast.error(err?.message || "An error occurred while saving the temple.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!templeToDelete) return;
    setIsSaving(true);
    try {
      await dispatch(deleteTemple(templeToDelete._id)).unwrap();
      toast.success(`Temple "${templeToDelete.name}" deleted successfully.`);
      setTempleToDelete(null);
    } catch (err) {
      toast.error(
        err?.message || "An error occurred while deleting the temple."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">🕌 Temple Management</h4>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <i className="fas fa-plus me-2"></i> Add New Temple
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Address</th>
                  <th>God</th>
                  <th>Opening Time</th>
                  <th>Closing Time</th>
                  <th>Famous</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {status === "loading" && (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="spinner-border"></div>
                    </td>
                  </tr>
                )}
                {status === "failed" && (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-danger">
                      Error: {error}
                    </td>
                  </tr>
                )}
                {status === "succeeded" &&
                  temples.map((temple) => (
                    <tr key={temple._id}>
                      <td>
                        <DynamicImage
                          src={temple.files || "/placeholder.jpg"}
                          alt={temple.name}
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "50%",
                          }}
                        />
                      </td>
                      <td className="fw-bold">{temple.name}</td>
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
                        {temple.address || "-"}
                      </td>
                      {/* --- CHANGED: Display god name correctly --- */}
                      <td>
                        {temple.god?.name ||
                          getGodNameById(temple.god) ||
                          "N/A"}
                      </td>
                      <td>{temple.openTime || "-"}</td>
                      <td>{temple.closeTime || "-"}</td>
                      <td>
                        <span
                          className={`badge fs-6 ${
                            temple.isFamous
                              ? "text-bg-success"
                              : "text-bg-secondary"
                          }`}
                        >
                          {temple.isFamous ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => handleOpenModal(temple)}
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setTempleToDelete(temple)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <form onSubmit={handleSave}>
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    <i className="fas fa-place-of-worship me-2"></i>
                    {editingTemple
                      ? `Edit ${editingTemple.name}`
                      : "Add New Temple"}
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

                  <ImageUpload
                    label="Temple Image"
                    value={{ url: formData.files, type: "image" }}
                    onChange={handleImageChange}
                  />

                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Description</label>
                    <textarea
                      name="description"
                      className="form-control"
                      rows="3"
                      value={formData.description}
                      onChange={handleFormChange}
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Address</label>
                    <textarea
                      name="address"
                      className="form-control"
                      rows="3"
                      value={formData.address}
                      onChange={handleFormChange}
                    ></textarea>
                  </div>

                  <hr className="my-4" />

                  <div className="row">
                    {/* --- CHANGED: Updated God Dropdown --- */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">
                        God <span className="text-danger">*</span>
                      </label>
                      <select
                        name="god" // Changed from 'master'
                        className="form-select"
                        value={formData.god} // Changed from 'master'
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
                      <label className="form-label fw-bold">
                        Language <span className="text-danger">*</span>
                      </label>
                      <select
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
                          <option key={lang._id} value={lang._id}>
                            {lang.nativeName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Opening Time</label>
                      <input
                        type="time"
                        name="openTime"
                        className="form-control"
                        value={formData.openTime}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Closing Time</label>
                      <input
                        type="time"
                        name="closeTime"
                        className="form-control"
                        value={formData.closeTime}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="form-check form-switch fs-5">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="isFamous"
                        name="isFamous"
                        checked={formData.isFamous}
                        onChange={handleFormChange}
                      />
                      <label className="form-check-label" htmlFor="isFamous">
                        Is this a famous temple?
                      </label>
                    </div>
                  </div>

                  <hr className="my-4" />

                  <h6 className="text-muted">GEOLOCATION</h6>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">
                        Longitude <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        name="longitude"
                        className="form-control"
                        value={formData.location.coordinates[0]}
                        onChange={handleCoordsChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">
                        Latitude <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        name="latitude"
                        className="form-control"
                        value={formData.location.coordinates[1]}
                        onChange={handleCoordsChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light border-top">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
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
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        show={templeToDelete !== null}
        onClose={() => setTempleToDelete(null)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={isSaving}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">{templeToDelete?.name}</strong>?
        </p>
        <p className="text-muted text-center">This action cannot be undone.</p>
      </ConfirmationModal>
    </>
  );
}
