import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import RichTextEditor from "../../common/RichTextEditor";
import { uploadImage } from "../../services/uploadService";

// --- Redux Actions ---
import { fetchArticles, addArticle, updateArticle } from "../../store/Articles";
// This correctly uses the thunk that populates the masterList in your slice
import { fetchAllGods } from "../../store/god";
import { staticLanguages } from "../../constants/languages";

export default function ArticleFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  // --- Redux State ---
  const { list: articles, status: articlesStatus } = useSelector(
    (state) => state.articles
  );
  // ✨ CORRECTED: Select 'masterList' and 'masterStatus' as defined in your godSlice
  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  // --- Component State ---
  const [formData, setFormData] = useState({
    title: "",
    shortdesc: "",
    longdesc: "",
    sort: "",
    isActive: true,
    isFree: true,
    god: "",
    language: "",
    featureimage: "",
  });

  // ✨ NEW: State to hold gods filtered by language
  const [filteredGods, setFilteredGods] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // --- Load initial data ---
  useEffect(() => {
    if (articlesStatus === "idle") dispatch(fetchArticles());
    // Use the correct status from the god slice to fetch only once
    if (godStatus === "idle") {
      dispatch(fetchAllGods());
    }
  }, [dispatch, articlesStatus, godStatus]);

  // ✨ NEW: Effect to filter gods when language or the main god list changes
  useEffect(() => {
    if (formData.language && allGods.length > 0) {
      const godsForLanguage = allGods.filter(
        (god) => god.language === formData.language
      );
      setFilteredGods(godsForLanguage);
    } else {
      setFilteredGods([]); // Clear filtered list if no language is selected
    }
  }, [formData.language, allGods]);

  // --- Populate form data when editing ---
  useEffect(() => {
    if (id && articles.length > 0) {
      const article = articles.find((a) => a._id === id);
      if (article) {
        setFormData({
          title: article.title || "",
          shortdesc: article.shortdesc || "",
          longdesc: article.longdesc || "",
          sort: article.sort || 0,
          isActive: !!article.isActive,
          isFree: article.isFree !== undefined ? article.isFree : true,
          god: article.god?._id || article.god || "",
          language: article.language?._id || article.language || "",
          featureimage: article.featureimage || "",
        });
      }
    }
  }, [id, articles]);

  // --- Helpers ---
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  // ✨ MODIFIED: Reset god selection when language changes
  const handleSelectChange = (field, option) => {
    const value = option ? option.value : "";
    setFormData((prev) => {
      const newState = { ...prev, [field]: value };
      if (field === "language") {
        newState.god = ""; // Reset god when a new language is picked
      }
      return newState;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Article title is required.";
    if (!formData.god) newErrors.god = "Please select a God.";
    if (!formData.language) newErrors.language = "Please select a language.";
    if (!formData.shortdesc.trim())
      newErrors.shortdesc = "Short description is required.";
    if (!formData.longdesc.trim())
      newErrors.longdesc = "Full article content is required.";
    if (formData.sort === "" || isNaN(Number(formData.sort)))
      newErrors.sort = "Sort order must be a valid number.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsSaving(true);
    try {
      const uploadedUrl = await uploadImage(file);
      setFormData((prev) => ({ ...prev, featureimage: uploadedUrl }));
      toast.success("Image uploaded successfully!");
    } catch {
      toast.error("Failed to upload image.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const action = id
        ? updateArticle({ id, ...formData })
        : addArticle(formData);
      await dispatch(action).unwrap();
      toast.success(
        id ? "Article updated successfully!" : "Article added successfully!"
      );
      navigate("/articles");
    } catch (err) {
      toast.error(err?.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Select Options ---
  const languageOptions = staticLanguages.map((l) => ({
    value: l._id,
    label: l.nativeName,
  }));

  // ✨ MODIFIED: Options are now built from the filtered list
  const godOptions = filteredGods.map((g) => ({
    value: g._id,
    label: g.name,
  }));

  return (
    <div className="content-wrapper p-4">
      {/* Breadcrumb + Back */}
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <div>
          <span
            style={{ cursor: "pointer", color: "#0d6efd" }}
            onClick={() => navigate("/articles")}
          >
            Articles
          </span>{" "}
          / <span>{id ? "Edit Article" : "New Article"}</span>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => navigate("/articles")}
        >
          <i className="fas fa-arrow-left me-2"></i> Back
        </button>
      </div>

      {/* Form */}
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            {/* --- Section 1: Core Details --- */}
            <h5 className="mb-4 text-primary">Core Details</h5>
            <div className="mb-3">
              <label className="form-label fw-bold">
                Article Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="title"
                className={`form-control ${errors.title ? "is-invalid" : ""}`}
                value={formData.title}
                onChange={handleInputChange}
              />
              {errors.title && (
                <div className="invalid-feedback">{errors.title}</div>
              )}
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  Language <span className="text-danger">*</span>
                </label>
                <Select
                  options={languageOptions}
                  value={languageOptions.find(
                    (l) => l.value === formData.language
                  )}
                  onChange={(opt) => handleSelectChange("language", opt)}
                />
                {errors.language && (
                  <div className="text-danger small mt-1">
                    {errors.language}
                  </div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  God <span className="text-danger">*</span>
                </label>
                <Select
                  options={godOptions}
                  value={godOptions.find((g) => g.value === formData.god)}
                  onChange={(opt) => handleSelectChange("god", opt)}
                  // ✨ IMPROVED: UX is better with these props
                  isDisabled={!formData.language}
                  isLoading={godStatus === "loading"}
                  placeholder={
                    !formData.language
                      ? "Select a language first..."
                      : "Select a God..."
                  }
                />
                {errors.god && (
                  <div className="text-danger small mt-1">{errors.god}</div>
                )}
              </div>
            </div>

            <hr className="my-4" />

            {/* --- Section 2: Image & Content --- */}
            <h5 className="mb-4 text-primary">Content & Media</h5>
            <div className="mb-3">
              <label className="form-label fw-bold">Featured Image</label>
              <input
                type="file"
                className="form-control mb-2"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isSaving}
              />
              {formData.featureimage && (
                <div
                  className="position-relative d-inline-block w-100"
                  style={{ maxWidth: "300px" }}
                >
                  <img
                    src={formData.featureimage}
                    alt="Preview"
                    className="img-fluid rounded shadow-sm"
                    style={{
                      maxHeight: "160px",
                      objectFit: "cover",
                      width: "180px",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, featureimage: "" }))
                    }
                    className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 p-0"
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      left: "150px",
                    }}
                    disabled={isSaving}
                  >
                    &times;
                  </button>
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">
                Short Description <span className="text-danger">*</span>
              </label>
              <textarea
                name="shortdesc"
                rows={3}
                className={`form-control ${
                  errors.shortdesc ? "is-invalid" : ""
                }`}
                value={formData.shortdesc}
                onChange={handleInputChange}
              ></textarea>
              {errors.shortdesc && (
                <div className="invalid-feedback">{errors.shortdesc}</div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">
                Full Content (Long Description){" "}
                <span className="text-danger">*</span>
              </label>
              <RichTextEditor
                value={formData.longdesc}
                onChange={(html) =>
                  setFormData((p) => ({ ...p, longdesc: html }))
                }
              />
              {errors.longdesc && (
                <div className="d-block invalid-feedback mt-1">
                  {errors.longdesc}
                </div>
              )}
            </div>

            <hr className="my-4" />

            {/* --- Section 3: Settings --- */}
            <h5 className="mb-4 text-primary">Settings</h5>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">
                  Sort Order <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  name="sort"
                  className={`form-control ${errors.sort ? "is-invalid" : ""}`}
                  value={formData.sort}
                  onChange={handleInputChange}
                />
                {errors.sort && (
                  <div className="invalid-feedback">{errors.sort}</div>
                )}
              </div>

              <div className="col-md-4 d-flex align-items-center pt-3">
                <div className="form-check form-switch fs-5">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="isFree"
                    checked={formData.isFree}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label">Free Article</label>
                </div>
              </div>

              <div className="col-md-4 d-flex align-items-center pt-3">
                <div className="form-check form-switch fs-5">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label">Active</label>
                </div>
              </div>
            </div>

            {/* --- Buttons --- */}
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate("/articles")}
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
                {id ? "Update Article" : "Create Article"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
