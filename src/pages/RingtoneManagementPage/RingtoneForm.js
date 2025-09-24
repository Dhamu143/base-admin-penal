// src/pages/ringtone/RingtoneFormPage.js
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { toast } from "react-toastify";

import {
  fetchRingtones,
  addRingtone,
  updateRingtone,
} from "../../store/ringtone";
import { fetchAllGods } from "../../store/god";
import { staticLanguages } from "../../constants/languages";

export default function RingtoneFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { list: ringtoneList = [] } = useSelector((state) => state.ringtones);
  const {
    masterList: allGods = [],
    masterStatus: godStatus = "idle",
  } = useSelector((state) => state.God);

  const [formData, setFormData] = useState({
    file: null,
    description: "",
    language: "",
    god: "",
    sort: "",
    isActive: true,
    isFree: false,
  });
  const [filteredGods, setFilteredGods] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // --- Load initial data ---
  useEffect(() => {
    dispatch(fetchRingtones());
    if (godStatus === "idle") dispatch(fetchAllGods());
  }, [dispatch, godStatus]);

  // --- Populate form when editing ---
  useEffect(() => {
    if (id && ringtoneList.length > 0) {
      const ringtone = ringtoneList.find((r) => r._id === id);
      if (ringtone) {
        setFormData({
          file: null, // new upload optional
          description: ringtone.description || "",
          language: ringtone.language || "",
          god: ringtone.god?._id || "",
          sort: ringtone.sort || "",
          isActive: ringtone.isActive ?? true,
          isFree: ringtone.isFree ?? false,
        });
      }
    }
  }, [id, ringtoneList]);

  // --- Filter gods based on selected language ---
  useEffect(() => {
    if (formData.language) {
      setFilteredGods(allGods.filter((g) => g.language === formData.language));
    } else {
      setFilteredGods([]);
    }
  }, [formData.language, allGods]);

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) payload.append(key, value);
      });

      if (id) {
        await dispatch(updateRingtone({ id, data: payload })).unwrap();
        toast.success("Ringtone updated successfully!");
      } else {
        await dispatch(addRingtone(payload)).unwrap();
        toast.success("Ringtone created successfully!");
      }
      navigate("/ringtones");
    } catch (err) {
      toast.error(err || "Failed to save ringtone.");
    } finally {
      setIsSaving(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.file && !id) newErrors.file = "Audio file is required.";
    if (!formData.language) newErrors.language = "Please select a language.";
    if (!formData.god) newErrors.god = "Please select a God.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";
    if (formData.sort === "" || isNaN(formData.sort))
      newErrors.sort = "Sort order must be a valid number.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getSelectedOption = (list = [], id) =>
    list.find((item) => item._id === id)
      ? { value: id, label: list.find((item) => item._id === id).name }
      : null;

  return (
    <div className="content-wrapper p-4">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <span
          style={{ cursor: "pointer", color: "#0d6efd" }}
          onClick={() => navigate("/ringtones")}
        >
          Ringtones
        </span>{" "}
        / <span>{id ? "Edit Ringtone" : "New Ringtone"}</span>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => navigate("/ringtones")}
        >
          <i className="fas fa-arrow-left me-2"></i> Back
        </button>
      </div>

      <div className="card shadow-sm p-4">
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="row">
            {/* Left Column */}
            <div className="col-md-6">
              {/* Audio Upload */}
              <div className="mb-3">
                <label className="form-label fw-bold">Audio File *</label>
                <input
                  type="file"
                  name="file"
                  accept="audio/*"
                  className={`form-control ${errors.file ? "is-invalid" : ""}`}
                  onChange={handleChange}
                />
                {errors.file && (
                  <div className="invalid-feedback">{errors.file}</div>
                )}
              </div>

              {/* Language */}
              <div className="mb-3">
                <label className="form-label fw-bold">Language *</label>
                <Select
                  options={staticLanguages.map((l) => ({
                    value: l._id,
                    label: `${l.language} (${l.nativeName})`,
                  }))}
                  value={getSelectedOption(staticLanguages, formData.language)}
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

              {/* God */}
              <div className="mb-3">
                <label className="form-label fw-bold">God *</label>
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
                  isDisabled={!formData.language || filteredGods.length === 0}
                />
                {errors.god && (
                  <div className="text-danger small mt-1">{errors.god}</div>
                )}
              </div>

              {/* Sort & Flags */}
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Sort *</label>
                  <input
                    type="number"
                    name="sort"
                    value={formData.sort}
                    onChange={handleChange}
                    className={`form-control ${
                      errors.sort ? "is-invalid" : ""
                    }`}
                  />
                  {errors.sort && (
                    <div className="invalid-feedback">{errors.sort}</div>
                  )}
                </div>
                <div className="col-md-4 d-flex align-items-center mb-3">
                  <div className="form-check form-switch mt-3">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="form-check-input"
                    />
                    <label className="form-check-label">Active</label>
                  </div>
                </div>
                <div className="col-md-4 d-flex align-items-center mb-3">
                  <div className="form-check form-switch mt-3">
                    <input
                      type="checkbox"
                      name="isFree"
                      checked={formData.isFree}
                      onChange={handleChange}
                      className="form-check-input"
                    />
                    <label className="form-check-label">Free</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-md-6">
              <label className="form-label fw-bold">Description *</label>
              <textarea
                name="description"
                className={`form-control ${
                  errors.description ? "is-invalid" : ""
                }`}
                value={formData.description}
                onChange={handleChange}
                rows={12}
                placeholder="Enter description..."
              />
              {errors.description && (
                <div className="text-danger small mt-1">
                  {errors.description}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate("/ringtones")}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                <i className="fas fa-save me-2"></i>
              )}
              {id ? "Update Ringtone" : "Create Ringtone"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
