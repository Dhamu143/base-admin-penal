import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import RichTextEditor from "../../common/RichTextEditor";
import { uploadImage } from "../../services/uploadService";

// --- Redux Actions ---
import {
  fetchTemples,
  addTemple,
  updateTemple,
} from "../../store/temple/index";
import { fetchAllGods } from "../../store/god/index";
import { staticLanguages } from "../../constants/languages";

export default function TempleFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  // --- Redux State ---
  const { list: temples, status: templeStatus } = useSelector(
    (state) => state.temple
  );
  const { masterList: gods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  // --- Component State ---
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    isFamous: false,
    god: "",
    language: "",
    openTime: "",
    closeTime: "",
    files: "",
    rating: 0,
    location: { type: "Point", coordinates: [0, 0] },
  });

  // ✨ NEW: State to hold the list of gods filtered by language
  const [filteredGods, setFilteredGods] = useState([]);

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Effect for fetching initial data
  useEffect(() => {
    if (godStatus === "idle") {
      dispatch(fetchAllGods());
    }
    if (id && templeStatus === "idle") {
      dispatch(fetchTemples());
    }
  }, [godStatus, templeStatus, dispatch, id]);

  // Effect for populating the form when editing
  useEffect(() => {
    if (id && temples.length > 0) {
      const temple = temples.find((t) => t._id === id);
      if (temple) {
        setFormData({
          name: temple.name || "",
          description: temple.description || "",
          address: temple.address || "",
          isFamous: temple.isFamous || false,
          god: temple.god?._id || temple.god || "",
          language: temple.language || "",
          openTime: temple.openTime || "",
          closeTime: temple.closeTime || "",
          files: temple.files || "",
          rating: temple.rating || 0,
          location: temple.location || { type: "Point", coordinates: [0, 0] },
        });
      }
    }
  }, [id, temples]);

  // ✨ NEW: Effect to filter the God list based on the selected language
  useEffect(() => {
    if (formData.language && gods.length > 0) {
      const godsByLang = gods.filter((g) => g.language === formData.language);
      setFilteredGods(godsByLang);
    } else {
      setFilteredGods([]);
    }
  }, [formData.language, gods]);

  // --- Validation ---
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Temple name is required.";
    if (!formData.god) newErrors.god = "Please select a God.";
    if (!formData.language) newErrors.language = "Please select a language.";
    if (
      formData.location.coordinates[0] < -180 ||
      formData.location.coordinates[0] > 180
    )
      newErrors.longitude = "Longitude must be between -180 and 180.";
    if (
      formData.location.coordinates[1] < -90 ||
      formData.location.coordinates[1] > 90
    )
      newErrors.latitude = "Latitude must be between -90 and 90.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsSaving(true);
    try {
      const uploadedUrl = await uploadImage(file);
      setFormData((prev) => ({ ...prev, files: uploadedUrl }));
      toast.success("Image uploaded successfully!");
    } catch (err) {
      toast.error("Failed to upload image.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const action = id
        ? updateTemple({ id, ...formData })
        : addTemple(formData);
      await dispatch(action).unwrap();
      toast.success(
        id ? "Temple updated successfully!" : "Temple added successfully!"
      );
      navigate("/temple");
    } catch (err) {
      toast.error(err?.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  // ✨ NEW: Helper function for react-select value
  const getSelectedOption = (list, id) => {
    if (!id || !list) return null;
    const selected = list.find((item) => item._id === id);
    return selected
      ? {
          value: selected._id,
          label: selected.name || selected.nativeName,
        }
      : null;
  };

  return (
    <div className="content-wrapper p-4">
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <div>
          <span
            style={{ cursor: "pointer", color: "#0d6efd" }}
            onClick={() => navigate("/temple")}
          >
            Temples
          </span>{" "}
          / <span>{id ? "Edit Temple" : "New Temple"}</span>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => navigate("/temple")}
        >
          <i className="fas fa-arrow-left me-2"></i> Back
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            {/* --- Section 1: Basic Info --- */}
            <h5 className="mb-4 text-primary">Basic Information</h5>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">
                  Temple Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                />
                {errors.name && (
                  <div className="invalid-feedback">{errors.name}</div>
                )}
              </div>

              {/* ✨ MODIFIED: Language Select - Placed before God */}
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">
                  Language <span className="text-danger">*</span>
                </label>
                <Select
                  options={staticLanguages.map((l) => ({
                    value: l._id,
                    label: `${l.nativeName} (${l.language})`,
                  }))}
                  value={getSelectedOption(staticLanguages, formData.language)}
                  onChange={(option) =>
                    setFormData((prev) => ({
                      ...prev,
                      language: option?.value || "",
                      god: "", // Reset god selection
                    }))
                  }
                />
                {errors.language && (
                  <div className="text-danger small mt-1">
                    {errors.language}
                  </div>
                )}
              </div>

              {/* ✨ MODIFIED: God Select - Now filtered by language */}
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">
                  Main God <span className="text-danger">*</span>
                </label>
                <Select
                  options={filteredGods.map((g) => ({
                    value: g._id,
                    label: g.name,
                  }))}
                  value={getSelectedOption(filteredGods, formData.god)}
                  onChange={(option) =>
                    setFormData((p) => ({ ...p, god: option?.value || "" }))
                  }
                  placeholder={
                    formData.language
                      ? "Select God..."
                      : "Select Language first..."
                  }
                  isDisabled={!formData.language}
                  isLoading={godStatus === "loading"}
                />
                {errors.god && (
                  <div className="text-danger small mt-1">{errors.god}</div>
                )}
              </div>
            </div>
            <hr className="my-4" />

            {/* --- Other form sections... --- */}

            <div className="mb-3">
              <label className="form-label fw-bold">Featured Image</label>
              <input
                type="file"
                className="form-control mb-2"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isSaving}
              />
              <small className="text-muted d-block mb-3">
                Upload JPG, PNG, or GIF (max 5MB)
              </small>

              {formData.files && (
                <div
                  className="position-relative d-inline-block"
                  style={{ maxWidth: "200px" }}
                >
                  <img
                    src={formData.files}
                    alt="Preview"
                    className="img-fluid rounded shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, files: "" }))
                    }
                    className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 p-0"
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                    }}
                    disabled={isSaving}
                  >
                    &times;
                  </button>
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Description</label>
              <RichTextEditor
                value={formData.description}
                onChange={(html) =>
                  setFormData((p) => ({ ...p, description: html }))
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Address</label>
              <RichTextEditor
                value={formData.address}
                onChange={(html) =>
                  setFormData((p) => ({ ...p, address: html }))
                }
              />
            </div>

            <hr className="my-4" />

            <h5 className="mb-4 text-primary">Details & Timings</h5>
            <div className="row">
              <div className="col-md-3 mb-3">
                <label className="form-label fw-bold">Open Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={formData.openTime}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, openTime: e.target.value }))
                  }
                />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label fw-bold">Close Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={formData.closeTime}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, closeTime: e.target.value }))
                  }
                />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label fw-bold">Rating (0-5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  className="form-control"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, rating: e.target.value }))
                  }
                />
              </div>
              <div className="col-md-3 d-flex align-items-center pt-3">
                <div className="form-check form-switch fs-5">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={formData.isFamous}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, isFamous: e.target.checked }))
                    }
                  />
                  <label className="form-check-label">Is Famous?</label>
                </div>
              </div>
            </div>

            <hr className="my-4" />

            <h5 className="mb-4 text-primary">Geolocation</h5>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  Longitude <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  className={`form-control ${
                    errors.longitude ? "is-invalid" : ""
                  }`}
                  value={formData.location.coordinates[0]}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      location: {
                        ...p.location,
                        coordinates: [
                          parseFloat(e.target.value),
                          p.location.coordinates[1],
                        ],
                      },
                    }))
                  }
                />
                {errors.longitude && (
                  <div className="invalid-feedback">{errors.longitude}</div>
                )}
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  Latitude <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  className={`form-control ${
                    errors.latitude ? "is-invalid" : ""
                  }`}
                  value={formData.location.coordinates[1]}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      location: {
                        ...p.location,
                        coordinates: [
                          p.location.coordinates[0],
                          parseFloat(e.target.value),
                        ],
                      },
                    }))
                  }
                />
                {errors.latitude && (
                  <div className="invalid-feedback">{errors.latitude}</div>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate("/temple")}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : (
                  <i className="fas fa-save me-2"></i>
                )}
                {id ? "Update Temple" : "Create Temple"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
