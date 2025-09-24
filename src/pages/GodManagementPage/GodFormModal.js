import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import RichTextEditor from "../../common/RichTextEditor";

// CRUD from /store/god
import { addGod, updateGod, fetchAllGods } from "../../store/god";

// Master gods from /store/godmaster
import { fetchGods as fetchMasterGods } from "../../store/godmaster";

import { staticLanguages } from "../../constants/languages";

export default function GodFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  // god slice
  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  // godmaster slice
  const { list: masterGods, status: masterStatus } = useSelector(
    (state) => state.gods
  );

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sort: "",
    master: "",
    language: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // --- Fetch initial data ---
  useEffect(() => {
    if (godStatus === "idle") dispatch(fetchAllGods());
    if (masterStatus === "idle")
      dispatch(fetchMasterGods({ page: 1, limit: 1000 }));
  }, [godStatus, masterStatus, dispatch]);

  // --- Populate form when editing ---
  useEffect(() => {
    if (id && allGods.length > 0) {
      const god = allGods.find((g) => g._id === id);
      if (god) {
        setFormData({
          name: god.name || "",
          description: god.description || "",
          sort: god.sort || "",
          master: god.master?._id || "",
          language: god.language?._id || god.language || "",
          isActive: god.isActive !== undefined ? god.isActive : true,
        });
      }
    }
  }, [id, allGods]);

  // --- Validation ---
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "God name is required.";
    if (!formData.language) newErrors.language = "Please select a language.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";
    if (formData.sort === "" || isNaN(Number(formData.sort)))
      newErrors.sort = "Sort order must be a valid number.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const getSelectedOption = (list, value) => {
    if (!value || !list) return null;
    const selected = list.find((item) => item._id === value);
    return selected ? { value: selected._id, label: selected.name } : null;
  };

  const getLanguageOption = (value) => {
    return staticLanguages.find((l) => l._id === value)
      ? {
          value: value,
          label: `${staticLanguages.find((l) => l._id === value).nativeName} (${
            staticLanguages.find((l) => l._id === value).language
          })`,
        }
      : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const action = id ? updateGod({ id, ...formData }) : addGod(formData);
      await dispatch(action).unwrap();
      toast.success(
        id ? "God updated successfully!" : "God added successfully!"
      );
      navigate("/god");
    } catch (err) {
      toast.error(err?.message || "Error saving God.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="content-wrapper p-4">
      {/* Header */}
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <div>
          <span
            style={{ cursor: "pointer", color: "#0d6efd" }}
            onClick={() => navigate("/god")}
          >
            Gods
          </span>{" "}
          / <span>{id ? "Edit God" : "New God"}</span>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => navigate("/god")}
        >
          <i className="fas fa-arrow-left me-2"></i> Back
        </button>
      </div>

      {/* Form */}
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row">
              {/* Left Column */}
              <div className="col-md-6">
                <h5 className="mb-4 text-primary">God Details</h5>

                {/* Name */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Name <span className="text-danger">*</span>
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
                    value={getLanguageOption(formData.language)}
                    onChange={(option) =>
                      setFormData((prev) => ({
                        ...prev,
                        language: option?.value || "",
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

                {/* Master God (Independent) */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Master God</label>
                  <Select
                    options={masterGods.map((g) => ({
                      value: g._id,
                      label: g.name,
                    }))}
                    value={getSelectedOption(masterGods, formData.master)}
                    onChange={(option) =>
                      setFormData((prev) => ({
                        ...prev,
                        master: option?.value || "",
                      }))
                    }
                    placeholder="Select Master God..."
                  />
                </div>

                {/* Sort Order */}
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

                {/* Active Toggle */}
                <div className="col-md-6 d-flex align-items-center pt-3">
                  <div className="form-check form-switch fs-5">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleFormChange}
                    />
                    <label className="form-check-label">Is Active</label>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="col-md-6">
                <h5 className="mb-4 text-primary">Content & Settings</h5>

                {/* Description */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Description <span className="text-danger">*</span>
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

            {/* Buttons */}
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary mr-4"
                onClick={() => navigate("/god")}
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
                {id ? "Update God" : "Create God"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
