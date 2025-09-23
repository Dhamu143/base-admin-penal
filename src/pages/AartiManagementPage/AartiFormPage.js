import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import RichTextEditor from "../../common/RichTextEditor";

import {
  addAarti,
  updateAarti,
  fetchAartiById,
  clearCurrentAarti,
} from "../../store/aarti/index";
import { fetchAllGods } from "../../store/god/index";
import { staticLanguages } from "../../constants/languages";

export default function AartiFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  // Redux state
  const { currentAarti, detailsStatus, error, list } = useSelector(
    (state) => state.aartis
  );
  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  // Component state
  const [formData, setFormData] = useState({
    name: "",
    sort: "",
    isActive: true,
    language: "",
    god: "",
    description: "",
  });
  const [filteredGods, setFilteredGods] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Fetch gods once
  useEffect(() => {
    if (godStatus === "idle") dispatch(fetchAllGods());
  }, [godStatus, dispatch]);

  // Initialize form for edit
  useEffect(() => {
    if (!id) return; // Only for edit

    const aarti = currentAarti || list.find((a) => a._id === id);
    if (aarti) {
      setFormData({
        name: aarti.name || "",
        sort: aarti.sort || "",
        isActive: aarti.isActive,
        language: aarti.language || "",
        god: aarti.god?._id || aarti.god || "",
        description: aarti.description || "",
      });
    } else {
      dispatch(fetchAartiById(id));
    }

    return () => dispatch(clearCurrentAarti());
  }, [id, currentAarti, list, dispatch]);

  // Filter gods by selected language
  useEffect(() => {
    if (formData.language && allGods.length > 0) {
      setFilteredGods(
        allGods.filter((god) => god.language === formData.language)
      );
    } else {
      setFilteredGods([]);
    }
  }, [formData.language, allGods]);

  // Handlers
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const getSelectedOption = (list, selectedId) => {
    if (!list || !selectedId) return null;
    const selected = list.find((item) => item._id === selectedId);
    return selected
      ? { value: selected._id, label: selected.name || selected.nativeName }
      : null;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Aarti name is required.";
    if (!formData.language) newErrors.language = "Please select a language.";
    if (!formData.god) newErrors.god = "Please select a God.";
    if (!formData.description.trim() || formData.description === "<p><br></p>")
      newErrors.description = "Description / Content is required.";
    if (formData.sort === "" || isNaN(formData.sort))
      newErrors.sort = "Sort order must be a valid number.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const action = id ? updateAarti({ id, ...formData }) : addAarti(formData);
      await dispatch(action).unwrap();
      toast.success(`Aarti ${id ? "updated" : "created"} successfully!`);
      navigate("/aarti");
    } catch (err) {
      toast.error(err || `Failed to ${id ? "update" : "create"} aarti.`);
    } finally {
      setIsSaving(false);
    }
  };

  if (id && detailsStatus === "loading") {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "50vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Aarti...</span>
        </div>
      </div>
    );
  }

  if (id && detailsStatus === "failed") {
    return (
      <div className="alert alert-danger text-center m-4">
        <h4>Error</h4>
        <p>
          {error || "Could not load Aarti details. Please try again later."}
        </p>
        <button className="btn btn-primary" onClick={() => navigate("/aarti")}>
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="content-wrapper p-4">
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <div>
          <span
            style={{ cursor: "pointer", color: "#0d6efd" }}
            onClick={() => navigate("/aarti")}
          >
            Aarti Management
          </span>{" "}
          / <span>{id ? "Edit Aarti" : "New Aarti"}</span>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => navigate("/aarti")}
        >
          <i className="fas fa-arrow-left me-2"></i> Back
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row">
              <div className="col-md-6">
                <h5 className="mb-3 text-primary">Aarti Details</h5>
                {/* Name */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Aarti Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className={`form-control ${
                      errors.name ? "is-invalid" : ""
                    }`}
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="e.g., Jai Ganesha Deva"
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
                    isDisabled={!formData.language || filteredGods.length === 0}
                  />
                  {errors.god && (
                    <div className="text-danger small mt-1">{errors.god}</div>
                  )}
                </div>

                {/* Sort & Active */}
                <div className="row">
                  <div className="col-md-6 mb-3">
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
                      <label className="form-check-label">Active</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <h5 className="mb-3 text-primary">Aarti Content</h5>
                <RichTextEditor
                  value={formData.description}
                  onChange={(html) =>
                    setFormData((prev) => ({ ...prev, description: html }))
                  }
                  placeholder="Enter the full aarti text here..."
                />
                {errors.description && (
                  <div className="invalid-feedback d-block mt-2">
                    {errors.description}
                  </div>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary mr-3"
                onClick={() => navigate("/aarti")}
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
                  <i className="fas fa-save mr-2"></i>
                )}
                {id ? "Update Aarti" : "Create Aarti"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
