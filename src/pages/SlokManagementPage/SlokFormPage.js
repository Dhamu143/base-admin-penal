// pages/SlokFormPage.jsx

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import RichTextEditor from "../../common/RichTextEditor";

// --- Actions ---
import { fetchSloks, addSlok, updateSlok } from "../../store/sloks/index";
import { fetchGods } from "../../store/godmaster/index";
import { fetchGods as fetchOtherGods } from "../../store/god/index";
import { staticLanguages } from "../../constants/languages";

export default function SlokFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  // --- Redux State ---
  const { list: sloks, status } = useSelector((state) => state.sloks);
  const { list: gods } = useSelector((state) => state.gods);
  const { list: Gods } = useSelector((state) => state.God);

  // --- Component State ---
  const [formData, setFormData] = useState({
    name: "",
    sort: 0,
    isActive: true,
    isFree: true, // Field for Free/Premium
    master: "",
    god: "",
    description: "",
    language: "",
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // --- Effects ---
  useEffect(() => {
    // Fetch data if not already loaded (handles page refresh)
    if (status === "idle") dispatch(fetchSloks());
    dispatch(fetchGods());
    dispatch(fetchOtherGods());

    // If editing, find the Slok and populate the form
    if (id && sloks.length > 0) {
      const slok = sloks.find((s) => s._id === id);
      if (slok) {
        setFormData({
          name: slok.name || "",
          sort: slok.sort || 0,
          isActive: slok.isActive,
          isFree: slok.isFree !== undefined ? slok.isFree : true,
          master: slok.master?._id || slok.master,
          god: slok.god?._id || slok.god,
          description: slok.description || "",
          language: slok.language || "",
        });
      }
    }
  }, [id, sloks, dispatch, status]);

  // --- Validation ---
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Sloka name is required.";
    if (!formData.master) newErrors.master = "Please select a God Master.";
    if (!formData.god) newErrors.god = "Please select a God.";
    if (!formData.language) newErrors.language = "Please select a language.";
    if (!formData.description.trim())
      newErrors.description = "Description / Content is required.";
    if (formData.sort === "" || isNaN(Number(formData.sort)))
      newErrors.sort = "Sort order must be a valid number.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
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
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    God (Master) <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={gods.map((g) => ({ value: g._id, label: g.name }))}
                    value={
                      gods
                        .filter((g) => g._id === formData.master)
                        .map((g) => ({ value: g._id, label: g.name }))[0] ||
                      null
                    }
                    onChange={(opt) =>
                      setFormData((prev) => ({ ...prev, master: opt.value }))
                    }
                  />
                  {errors.master && (
                    <div className="text-danger small mt-1">
                      {errors.master}
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    God <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={Gods.map((g) => ({ value: g._id, label: g.name }))}
                    value={
                      Gods.filter((g) => g._id === formData.god).map((g) => ({
                        value: g._id,
                        label: g.name,
                      }))[0] || null
                    }
                    onChange={(opt) =>
                      setFormData((prev) => ({ ...prev, god: opt.value }))
                    }
                  />
                  {errors.god && (
                    <div className="text-danger small mt-1">{errors.god}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Language <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={staticLanguages.map((l) => ({
                      value: l._id,
                      label: l.nativeName,
                    }))}
                    value={
                      staticLanguages
                        .filter((l) => l._id === formData.language)
                        .map((l) => ({
                          value: l._id,
                          label: l.nativeName,
                        }))[0] || null
                    }
                    onChange={(opt) =>
                      setFormData((prev) => ({ ...prev, language: opt.value }))
                    }
                  />
                  {errors.language && (
                    <div className="text-danger small mt-1">
                      {errors.language}
                    </div>
                  )}
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
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary mr-2"
                onClick={() => navigate("/sloka")}
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
                {"  "}
                {id ? "Update Sloka" : "Create Sloka"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
