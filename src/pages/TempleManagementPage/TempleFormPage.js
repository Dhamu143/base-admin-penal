import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import RichTextEditor from "../../common/RichTextEditor";
import { toast } from "react-toastify";
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
  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  // --- Component State ---
  const [formData, setFormData] = useState({
    name: "",
    sort: "",
    isFamous: false,
    god: "",
    language: "",
    description: "",
    address: "",
    files: "",
    openTime: "",
    closeTime: "",
    latitude: "",
    longitude: "",
    rating: "",
  });

  const [filteredGods, setFilteredGods] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // --- Effects ---
  useEffect(() => {
    if (templeStatus === "idle") dispatch(fetchTemples());
    if (godStatus === "idle") dispatch(fetchAllGods());
  }, [templeStatus, godStatus, dispatch]);

  useEffect(() => {
    if (id && temples.length > 0) {
      const temple = temples.find((t) => t._id === id);
      if (temple) {
        setFormData({
          name: temple.name || "",
          sort: temple.sort || "",
          isFamous: temple.isFamous === true,
          god: temple.god?._id || temple.god || "",
          language: temple.language || "",
          description: temple.description || "",
          address: temple.address || "",
          files: temple.files || "",
          openTime: temple.openTime || "",
          closeTime: temple.closeTime || "",
          latitude: temple.location?.coordinates?.[1] || formData.latitude,
          longitude: temple.location?.coordinates?.[0] || formData.longitude,
          rating: temple.rating || "0",
        });
      }
    }
  }, [id, temples]);

  useEffect(() => {
    if (formData.language && allGods.length > 0) {
      const godsByLang = allGods.filter(
        (g) => g.language === formData.language
      );
      setFilteredGods(godsByLang);
    } else {
      setFilteredGods([]);
    }
  }, [formData.language, allGods]);

  // --- Validation ---
  const validateForm = () => {
    const newErrors = {};

    // Temple Name
    if (!formData.name.trim()) {
      newErrors.name = "Temple name is required.";
    }

    // God
    if (!formData.god) {
      newErrors.god = "Please select a God.";
    }

    // Language
    if (!formData.language) {
      newErrors.language = "Please select a language.";
    }

    // Description (strip HTML before checking)
    if (!formData.description.replace(/<[^>]*>?/gm, "").trim()) {
      newErrors.description = "Description / Content is required.";
    }
    // address
    if (formData.sort === "" || !formData.address.trim()) {
      newErrors.address = "address is required.";
    }
    if (!formData.openTime) newErrors.openTime = "Open time is required.";
    if (!formData.closeTime) newErrors.closeTime = "Close time is required.";

    // Sort Order
    if (formData.sort === "" || isNaN(formData.sort)) {
      newErrors.sort = "Sort order must be a valid number.";
    }

    // Latitude
    if (formData.latitude === "" || isNaN(formData.latitude)) {
      newErrors.latitude = "Latitude must be a valid number.";
    } else if (formData.latitude < -90 || formData.latitude > 90) {
      newErrors.latitude = "Latitude must be between -90 and 90.";
    }

    // Longitude
    if (formData.longitude === "" || isNaN(formData.longitude)) {
      newErrors.longitude = "Longitude must be a valid number.";
    } else if (formData.longitude < -180 || formData.longitude > 180) {
      newErrors.longitude = "Longitude must be between -180 and 180.";
    }

    // Rating
    if (formData.rating === "" || isNaN(formData.rating)) {
      newErrors.rating = "Rating must be a valid number.";
    } else if (formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = "Rating must be between 1 and 5.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Event Handlers ---
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsSaving(true);
    try {
      const uploadedUrl = await uploadImage(file);
      setFormData((prev) => ({ ...prev, files: uploadedUrl }));
      toast.success("Image uploaded!");
    } catch {
      toast.error("Image upload failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      // Correct payload for backend
      const payload = {
        name: formData.name,
        sort: Number(formData.sort),
        isActive: formData.isActive,
        isFamous: formData.isFamous,
        god: formData.god,
        language: formData.language,
        description: formData.description,
        address: formData.address,
        files: formData.files,
        openTime: formData.openTime,
        closeTime: formData.closeTime,
        location: {
          type: "Point",
          coordinates: [formData.longitude, formData.latitude], // GeoJSON [lng, lat]
        },
        rating: formData.rating,
      };

      const action = id ? updateTemple({ id, ...payload }) : addTemple(payload);

      await dispatch(action).unwrap();

      toast.success(
        id ? "Temple updated successfully!" : "Temple added successfully!"
      );
      navigate("/temple"); // Navigate to singular temple list page
    } catch (err) {
      toast.error(err?.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const getSelectedOption = (list, id) => {
    if (!id || !list) return null;
    const selected = list.find((item) => item._id === id);
    return selected
      ? { value: selected._id, label: selected.name || selected.nativeName }
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
            <div className="row">
              {/* --- Left Column --- */}
              <div className="col-md-7">
                <h5 className="mb-4 text-primary">Temple Content</h5>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Language <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={staticLanguages.map((l) => ({
                      value: l._id,
                      label: l.nativeName,
                    }))}
                    value={getSelectedOption(
                      staticLanguages,
                      formData.language
                    )}
                    onChange={(option) =>
                      setFormData((prev) => ({
                        ...prev,
                        language: option?.value || "",
                        god: "",
                      }))
                    }
                    placeholder="Select Language..."
                  />
                  {errors.language && (
                    <div className="text-danger small mt-1">
                      {errors.language}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    God <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={filteredGods.map((g) => ({
                      value: g._id,
                      label: g.name,
                    }))}
                    value={getSelectedOption(filteredGods, formData.god)}
                    onChange={(option) =>
                      setFormData((prev) => ({
                        ...prev,
                        god: option?.value || "",
                      }))
                    }
                    placeholder={
                      formData.language ? "Select God..." : "Language first..."
                    }
                    isDisabled={!formData.language}
                  />
                  {errors.god && (
                    <div className="text-danger small mt-1">{errors.god}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Open Time</label>
                  <input
                    type="time"
                    name="openTime"
                    className={`form-control ${
                      errors.openTime ? "is-invalid" : ""
                    }`}
                    value={formData.openTime}
                    onChange={handleFormChange}
                  />
                  {errors.openTime && (
                    <div className="invalid-feedback">{errors.openTime}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Close Time</label>
                  <input
                    type="time"
                    name="closeTime"
                    className={`form-control ${
                      errors.closeTime ? "is-invalid" : ""
                    }`}
                    value={formData.closeTime}
                    onChange={handleFormChange}
                  />
                  {errors.closeTime && (
                    <div className="invalid-feedback">{errors.closeTime}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Temple Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className={`form-control ${
                      errors.name ? "is-invalid" : ""
                    }`}
                    value={formData.name}
                    onChange={handleFormChange}
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Address <span className="text-danger">*</span>
                  </label>
                  <textarea
                    name="address"
                    className={`form-control ${
                      errors.address ? "is-invalid" : ""
                    }`}
                    value={formData.address}
                    onChange={handleFormChange}
                    rows="3"
                  ></textarea>
                  {errors.address && (
                    <div className="invalid-feedback">{errors.address}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Temple Image</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleImageUpload}
                    accept="image/*"
                    disabled={isSaving}
                  />
                  {formData.files && (
                    <img
                      src={formData.files}
                      alt="Preview"
                      className="img-fluid rounded mt-2"
                      style={{ maxHeight: "150px" }}
                    />
                  )}
                </div>
              </div>

              {/* --- Right Column --- */}
              <div className="col-md-5">
                <h5 className="mb-4 text-primary">Details & Settings</h5>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Description / Content <span className="text-danger">*</span>
                  </label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(html) =>
                      setFormData((prev) => ({ ...prev, description: html }))
                    }
                  />
                  {errors.description && (
                    <div className="invalid-feedback d-block mt-1">
                      {errors.description}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Sort Order <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    name="sort"
                    className={`form-control ${
                      errors.sort ? "is-invalid" : ""
                    }`}
                    value={formData.sort}
                    onChange={handleFormChange}
                  />
                  {errors.sort && (
                    <div className="invalid-feedback">{errors.sort}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Latitude <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    name="latitude"
                    placeholder="Latitude"
                    value={formData.latitude}
                    className={`form-control ${
                      errors.latitude ? "is-invalid" : ""
                    }`}
                    onChange={handleFormChange}
                  />
                  {errors.latitude && (
                    <div className="invalid-feedback">{errors.latitude}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Longitude <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    placeholder="Longitude"
                    className={`form-control ${
                      errors.longitude ? "is-invalid" : ""
                    }`}
                    value={formData.longitude}
                    onChange={handleFormChange}
                  />
                  {errors.longitude && (
                    <div className="invalid-feedback">{errors.longitude}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Rating <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="rating"
                    placeholder="Rating (1-5)"
                    className={`form-control ${
                      errors.rating ? "is-invalid" : ""
                    }`}
                    value={formData.rating}
                    onChange={handleFormChange}
                  />
                  {errors.rating && (
                    <div className="invalid-feedback">{errors.rating}</div>
                  )}
                </div>

                <div className="form-check form-switch fs-5 mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    name="isFamous"
                    checked={formData.isFamous}
                    onChange={handleFormChange}
                  />
                  <label className="form-check-label">is Famous</label>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4 border-top pt-3">
              <button
                type="button"
                className="btn btn-outline-secondary mr-3"
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
                  <i className="fas fa-save mr-2"></i>
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
