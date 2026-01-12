import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import RichTextEditor from "../../common/RichTextEditor";
import { uploadImage } from "../../services/uploadService";

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

  const { currentAarti, detailsStatus, error } = useSelector(
    (state) => state.aartis
  );
  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  const [formData, setFormData] = useState({
    name: "",
    sort: "",
    isActive: true,
    language: "",
    god: "",
    description: "",
    image: "",
    views: "",
    share: "",
    like: "",
  });

  const [filteredGods, setFilteredGods] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (godStatus === "idle") {
      dispatch(fetchAllGods());
    }
  }, [godStatus, dispatch]);

  useEffect(() => {
    if (id) {
      console.log("🔄 Edit Mode Detected. Fetching ID:", id);
      dispatch(fetchAartiById(id));
    } else {
      console.log("✨ Add Mode Detected. Clearing previous data.");
      dispatch(clearCurrentAarti());
      setFormData({
        name: "",
        sort: "",
        isActive: true,
        language: "",
        god: "",
        description: "",
        image: "",
        views: "",
        share: "",
        like: "",
      });
    }

    return () => {
      dispatch(clearCurrentAarti());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (
      id &&
      currentAarti &&
      (currentAarti._id === id || currentAarti.id === id)
    ) {
      console.log("✅ Data Arrived! Populating Form:", currentAarti);

      setFormData({
        name: currentAarti.name || "",
        sort: currentAarti.sort || "",
        isActive: currentAarti.isActive ?? true,
        language: currentAarti.language || "",
        god: currentAarti.god?._id || currentAarti.god || "", 
        description: currentAarti.description || "",
        image: currentAarti.image || "",
        views: currentAarti.views || "",
        share: currentAarti.share || "",
        like: currentAarti.like || "",
      });
    }
  }, [currentAarti, id]);

  useEffect(() => {
    if (formData.language && allGods.length > 0) {
      const filtered = allGods.filter(
        (god) => god.language === formData.language
      );
      setFilteredGods(filtered);
    } else {
      setFilteredGods([]);
    }
  }, [formData.language, allGods]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadedUrl = await uploadImage(file);
      setFormData((prev) => ({ ...prev, image: uploadedUrl }));
      setErrors((prev) => ({ ...prev, image: null }));
      toast.success("Image uploaded successfully!");
    } catch (err) {
      toast.error("Image upload failed.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
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
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.language) newErrors.language = "Language is required";
    if (!formData.god) newErrors.god = "God is required";
    if (!formData.description.trim() || formData.description === "<p><br></p>")
      newErrors.description = "Content is required";
    if (formData.sort === "" || isNaN(formData.sort))
      newErrors.sort = "Sort must be a number";
    if (!formData.image) newErrors.image = "Image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        sort: Number(formData.sort) || 0,
        views: Number(formData.views) || 0,
        share: Number(formData.share) || 0,
        like: Number(formData.like) || 0,
      };

      const action = id ? updateAarti({ id, ...payload }) : addAarti(payload);
      await dispatch(action).unwrap();

      toast.success(`Aarti ${id ? "updated" : "created"} successfully!`);
      navigate("/aarti");
    } catch (err) {
      toast.error(err?.message || "Operation failed.");
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
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (id && detailsStatus === "failed") {
    return (
      <div className="alert alert-danger text-center m-5">
        <h4>Error Loading Data</h4>
        <p>{error || "Unable to fetch Aarti details."}</p>
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
                <h5 className="mb-3 text-primary">Details</h5>

                <div className="mb-3">
                  <label className="form-label fw-bold">Name *</label>
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
                  <label className="form-label fw-bold">Language *</label>
                  <Select
                    options={staticLanguages.map((l) => ({
                      value: l._id,
                      label: `${l.nativeName} (${l.language})`,
                    }))}
                    value={getSelectedOption(
                      staticLanguages,
                      formData.language
                    )}
                    onChange={(opt) =>
                      setFormData((prev) => ({
                        ...prev,
                        language: opt?.value || "",
                        god: "",
                      }))
                    }
                    placeholder="Select Language..."
                  />
                  {errors.language && (
                    <div className="text-danger small">{errors.language}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">God *</label>
                  <Select
                    options={filteredGods.map((g) => ({
                      value: g._id,
                      label: g.name,
                    }))}
                    value={getSelectedOption(filteredGods, formData.god)}
                    onChange={(opt) =>
                      setFormData((prev) => ({
                        ...prev,
                        god: opt?.value || "",
                      }))
                    }
                    placeholder={
                      formData.language
                        ? "Select God..."
                        : "Select Language First"
                    }
                    isDisabled={!formData.language}
                  />
                  {errors.god && (
                    <div className="text-danger small">{errors.god}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Image *</label>
                  <input
                    type="file"
                    className={`form-control ${
                      errors.image ? "is-invalid" : ""
                    }`}
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <small className="text-primary">Uploading...</small>
                  )}
                  {formData.image && !isUploading && (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="img-fluid rounded mt-2"
                      style={{ maxHeight: "100px" }}
                    />
                  )}
                  {errors.image && (
                    <div className="invalid-feedback">{errors.image}</div>
                  )}
                </div>

                <div className="row">
                  <div className="col-6 mb-3">
                    <label className="form-label fw-bold">Sort *</label>
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
                  <div className="col-6 mb-3">
                    <label className="form-label fw-bold">Views</label>
                    <input
                      type="number"
                      name="views"
                      className="form-control"
                      value={formData.views}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-6 mb-3">
                    <label className="form-label fw-bold">Share</label>
                    <input
                      type="number"
                      name="share"
                      className="form-control"
                      value={formData.share}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="col-6 mb-3">
                    <label className="form-label fw-bold">Like</label>
                    <input
                      type="number"
                      name="like"
                      className="form-control"
                      value={formData.like}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="form-check form-switch mb-3">
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

              <div className="col-md-6">
                <h5 className="mb-3 text-primary">Content</h5>
                <RichTextEditor
                  value={formData.description}
                  onChange={(html) =>
                    setFormData((prev) => ({ ...prev, description: html }))
                  }
                />
                {errors.description && (
                  <div className="text-danger small mt-1">
                    {errors.description}
                  </div>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate("/aarti")}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-success"
                disabled={isSaving || isUploading}
              >
                {isSaving && (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                )}
                {id ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
