import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import RichTextEditor from "../../common/RichTextEditor";
import { toast } from "react-toastify";

// --- Actions ---
import {
  fetchMantras,
  addMantra,
  updateMantra,
} from "../../store/mantra/index";
import { fetchAllGods } from "../../store/god/index";
import { staticLanguages } from "../../constants/languages";

export default function MantraFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  // --- Redux State ---
  const { list: mantras, status: mantraStatus } = useSelector(
    (state) => state.mantras
  );
  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  // --- Component State ---
  const [formData, setFormData] = useState({
    name: "",
    sort: "",
    isActive: true,
    god: "",
    description: "",
    language: "",
  });

  const [filteredGods, setFilteredGods] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // --- Effects ---

  // Effect for fetching initial data
  useEffect(() => {
    if (mantraStatus === "idle") dispatch(fetchMantras());
    if (godStatus === "idle") dispatch(fetchAllGods());
  }, [mantraStatus, godStatus, dispatch]);

  // Effect for populating form data when editing
  useEffect(() => {
    if (id && mantras.length > 0) {
      const mantra = mantras.find((m) => m._id === id);
      if (mantra) {
        setFormData({
          name: mantra.name || "",
          sort: mantra.sort || "",
          isActive: mantra.isActive,
          god: mantra.god?._id || mantra.god,
          description: mantra.description || "",
          language: mantra.language,
        });
      }
    }
  }, [id, mantras]);

  // Effect to filter the God list based on selected language
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
    if (!formData.name.trim()) newErrors.name = "Mantra name is required.";
    if (!formData.god) newErrors.god = "Please select a God.";
    if (!formData.language) newErrors.language = "Please select a language.";
    if (!formData.description.trim())
      newErrors.description = "Description / Content is required.";
    if (formData.sort === "" || isNaN(formData.sort))
      newErrors.sort = "Sort order must be a valid number.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Event Handlers ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const payload = { ...formData };
      const action = id ? updateMantra({ id, ...payload }) : addMantra(payload);

      await dispatch(action).unwrap();
      toast.success(
        id ? "Mantra updated successfully!" : "Mantra added successfully!"
      );
      navigate("/mantra");
    } catch (err) {
      console.error("Failed to save mantra:", err);
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

  // Helper function for react-select value
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
            onClick={() => navigate("/mantra")}
          >
            Mantras
          </span>{" "}
          / <span>{id ? "Edit Mantra" : "New Mantra"}</span>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => navigate("/mantra")}
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
                <h5 className="mb-4 text-primary">Mantra Details</h5>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Mantra Name <span className="text-danger">*</span>
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
                        god: "", // Reset god selection when language changes
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
                <div className=" mb-3">
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
                <div className="col-md-6 d-flex align-items-center justify-content-start pt-3">
                  <div className="form-check form-switch fs-5">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleFormChange}
                    />
                    <label className="form-check-label">is Active</label>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="col-md-6">
                <h5 className="mb-4 text-primary">Content & Settings</h5>
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

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary mr-3"
                onClick={() => navigate("/mantra")}
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
                {id ? "Update Mantra" : "Create Mantra"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
