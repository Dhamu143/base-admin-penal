import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import RichTextEditor from "../../common/RichTextEditor";
import { toast } from "react-toastify";
import { uploadImage } from "../../services/uploadService"; // ADDED: Image upload service

// --- Actions ---
import { fetchSloks, addSlok, updateSlok } from "../../store/sloks/index";
import { fetchAllGods } from "../../store/god/index";
import { staticLanguages } from "../../constants/languages";

export default function SlokFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  // --- Redux State ---
  const { list: sloks, status: slokStatus } = useSelector(
    (state) => state.sloks
  );
  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  // --- Component State ---
  const [formData, setFormData] = useState({
    name: "",
    sort: "",
    isActive: true,
    isFree: true,
    god: "",
    description: "",
    language: "",
    image: "", // ADDED: State for sloka image URL
  });

  const [filteredGods, setFilteredGods] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // ADDED: Specific state for image upload

  // --- Effects ---
  useEffect(() => {
    if (slokStatus === "idle") dispatch(fetchSloks());
    if (godStatus === "idle") dispatch(fetchAllGods());
  }, [slokStatus, godStatus, dispatch]);

  useEffect(() => {
    if (id && sloks.length > 0) {
      const slok = sloks.find((s) => s._id === id);
      if (slok) {
        setFormData({
          name: slok.name || "",
          sort: slok.sort || "",
          isActive: slok.isActive,
          isFree: slok.isFree !== undefined ? slok.isFree : true,
          god: slok.god?._id || slok.god,
          description: slok.description || "",
          language: slok.language || "",
          image: slok.image || "", // MODIFIED: Populate image field
        });
      }
    }
  }, [id, sloks]);

  // filter gods by language
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
    if (!formData.name.trim()) newErrors.name = "Sloka name is required.";
    if (!formData.god) newErrors.god = "Please select a God.";
    if (!formData.language) newErrors.language = "Please select a language.";
    if (!formData.description.trim())
      newErrors.description = "Description / Content is required.";
    if (formData.sort === "" || isNaN(Number(formData.sort)))
      newErrors.sort = "Sort order must be a valid number.";
    if (!formData.image) newErrors.image = "Sloka image is required."; // ADDED: Validation for image
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Handlers ---

  // ADDED: Handler for image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadedUrl = await uploadImage(file);
      setFormData((prev) => ({ ...prev, image: uploadedUrl }));
      setErrors((prev) => ({ ...prev, image: null })); // Clear image error
      toast.success("Image uploaded successfully!");
    } catch (err) {
      toast.error("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      // The formData now includes the 'image' field automatically
      const action = id ? updateSlok({ id, ...formData }) : addSlok(formData);
      await dispatch(action).unwrap();
      toast.success(
        id ? "Sloka updated successfully!" : "Sloka added successfully!"
      );
      navigate("/sloka");
    } catch (err) {
      console.error("Failed to save sloka:", err);
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
            onClick={() => navigate("/sloka")}
          >
            Slokas
          </span>{" "}
          / <span>{id ? "Edit Sloka" : "New Sloka"}</span>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => navigate("/sloka")}
        >
          <i className="fas fa-arrow-left me-2"></i> Back
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row">
              {/* Left Column */}
              <div className="col-md-6">
                <h5 className="mb-4 text-primary">Sloka Details</h5>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Sloka Name <span className="text-danger">*</span>
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

                {/* Language */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Language <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={staticLanguages.map((l) => ({
                      value: l._id,
                      label: `${l.nativeName} (${l.language})`,
                    }))}
                    value={getSelectedOption(
                      staticLanguages,
                      formData.language
                    )}
                    onChange={(option) =>
                      setFormData((prev) => ({
                        ...prev,
                        language: option?.value || "",
                        god: "", // reset god on language change
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

                {/* God */}
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
                      formData.language
                        ? "Select God..."
                        : "Select Language first..."
                    }
                    isDisabled={!formData.language}
                  />
                  {errors.god && (
                    <div className="text-danger small mt-1">{errors.god}</div>
                  )}
                </div>

                {/* ADDED: Image Upload Section */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Sloka Image <span className="text-danger">*</span>
                  </label>
                  <input
                    type="file"
                    className={`form-control ${
                      errors.image ? "is-invalid" : ""
                    }`}
                    onChange={handleImageUpload}
                    accept="image/*"
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <div className="text-primary small mt-1">Uploading...</div>
                  )}
                  {errors.image && (
                    <div className="invalid-feedback d-block">
                      {errors.image}
                    </div>
                  )}
                  {formData.image && !isUploading && (
                    <div className="mt-2">
                      <img
                        src={formData.image}
                        alt="Sloka Preview"
                        className="img-fluid rounded"
                        style={{ maxHeight: "150px" }}
                      />
                    </div>
                  )}
                </div>

                {/* MOVED & MODIFIED: For layout consistency */}
                <div className="row">
                  <div className="col-md-4 mb-3">
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
                  <div className="col-md-4 d-flex align-items-center justify-content-start pt-3">
                    <div className="form-check form-switch fs-5">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        name="isFree"
                        checked={formData.isFree}
                        onChange={handleFormChange}
                      />
                      <label className="form-check-label">Free</label>
                    </div>
                  </div>
                  <div className="col-md-4 d-flex align-items-center justify-content-start pt-3">
                    <div className="form-check form-switch fs-5">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleFormChange}
                      />
                      <label className="form-check-label">Active</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="col-md-6">
                <h5 className="mb-4 text-primary">Content</h5>
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
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4 border-top pt-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate("/sloka")}
                disabled={isSaving || isUploading} // MODIFIED
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving || isUploading} // MODIFIED
              >
                {isSaving ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : (
                  <i className="fas fa-save me-2"></i>
                )}
                {id ? "Update Sloka" : "Create Sloka"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
