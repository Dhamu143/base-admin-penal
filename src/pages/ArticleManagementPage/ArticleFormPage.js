import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import RichTextEditor from "../../common/RichTextEditor";
import { uploadImage } from "../../services/uploadService";

// --- Redux Actions ---
import { fetchArticles, addArticle, updateArticle } from "../../store/Articles";
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
    views: "",
    share: "", // ADDED: State for share
    like: "", // ADDED: State for like
  });
  const [filteredGods, setFilteredGods] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // --- Load initial data ---
  useEffect(() => {
    if (articlesStatus === "idle") dispatch(fetchArticles());
    if (godStatus === "idle") dispatch(fetchAllGods());
  }, [dispatch, articlesStatus, godStatus]);

  // --- Filter gods by language ---
  useEffect(() => {
    if (formData.language && allGods.length > 0) {
      setFilteredGods(allGods.filter((g) => g.language === formData.language));
    } else {
      setFilteredGods([]);
    }
  }, [formData.language, allGods]);

  // --- Populate form when editing ---
  useEffect(() => {
    if (id && articles.length > 0) {
      const article = articles.find((a) => a._id === id);
      if (article) {
        setFormData({
          title: article.title || "",
          shortdesc: article.shortdesc || "",
          longdesc: article.longdesc || "",
          sort: article.sort || "",
          isActive: !!article.isActive,
          isFree: article.isFree !== undefined ? article.isFree : true,
          god: article.god?._id || article.god || "",
          language: article.language?._id || article.language || "",
          featureimage: article.featureimage || "",
          views: article.views || "",
          share: article.share || "", // MODIFIED: Populate share
          like: article.like || "", // MODIFIED: Populate like
        });
      }
    }
  }, [id, articles]);

  // --- Handlers ---
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleSelectChange = (field, option) => {
    const value = option ? option.value : "";
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "language" ? { god: "" } : {}),
    }));
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
    if (formData.views !== "" && isNaN(Number(formData.views)))
      newErrors.views = "Views must be a valid number.";
    // ADDED: Validation for share and like
    if (formData.share !== "" && isNaN(Number(formData.share)))
      newErrors.share = "Share count must be a valid number.";
    if (formData.like !== "" && isNaN(Number(formData.like)))
      newErrors.like = "Like count must be a valid number.";
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
      // formData now includes share and like
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

  // --- Select options ---
  const languageOptions = staticLanguages.map((l) => ({
    value: l._id,
    label: l.nativeName,
  }));
  const godOptions = filteredGods.map((g) => ({ value: g._id, label: g.name }));

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
            <div className="row">
              {/* --- Left Column --- */}
              <div className="col-md-6">
                <h5 className="mb-4 text-primary">Core Details</h5>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Article Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    className={`form-control ${
                      errors.title ? "is-invalid" : ""
                    }`}
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                  {errors.title && (
                    <div className="invalid-feedback">{errors.title}</div>
                  )}
                </div>

                <div className="mb-3">
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

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    God <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={godOptions}
                    value={godOptions.find((g) => g.value === formData.god)}
                    onChange={(opt) => handleSelectChange("god", opt)}
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
                <div className="mb-3">
                  <label className="form-label fw-bold">Featured Image</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleImageUpload}
                    disabled={isSaving}
                    accept="image/*"
                  />
                  {formData.featureimage && (
                    <img
                      src={formData.featureimage}
                      alt="Preview"
                      className="img-fluid mt-2"
                      style={{ maxHeight: "150px" }}
                    />
                  )}
                </div>

                {/* MODIFIED: Row layout for Sort, Views, Share, Like */}
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
                      onChange={handleInputChange}
                    />
                    {errors.sort && (
                      <div className="invalid-feedback">{errors.sort}</div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Views</label>
                    <input
                      type="number"
                      name="views"
                      className={`form-control ${
                        errors.views ? "is-invalid" : ""
                      }`}
                      value={formData.views}
                      onChange={handleInputChange}
                      placeholder="e.g., 100"
                    />
                    {errors.views && (
                      <div className="invalid-feedback">{errors.views}</div>
                    )}
                  </div>
                </div>
                
                {/* ADDED: New row for Share and Like */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Share</label>
                    <input
                      type="number"
                      name="share"
                      className={`form-control ${
                        errors.share ? "is-invalid" : ""
                      }`}
                      value={formData.share}
                      onChange={handleInputChange}
                      placeholder="e.g., 50"
                    />
                    {errors.share && (
                      <div className="invalid-feedback">{errors.share}</div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Like</label>
                    <input
                      type="number"
                      name="like"
                      className={`form-control ${
                        errors.like ? "is-invalid" : ""
                      }`}
                      value={formData.like}
                      onChange={handleInputChange}
                      placeholder="e.g., 200"
                    />
                    {errors.like && (
                      <div className="invalid-feedback">{errors.like}</div>
                    )}
                  </div>
                </div>


                <div className="row">
                  <div className="col-md-6 d-flex align-items-center">
                    <div className="form-check form-switch fs-5">
                      <input
                        type="checkbox"
                        name="isActive"
                        className="form-check-input"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label">is Active</label>
                    </div>
                  </div>

                  <div className="col-md-6 d-flex align-items-center">
                    <div className="form-check form-switch fs-5">
                      <input
                        type="checkbox"
                        name="isFree"
                        className="form-check-input"
                        checked={formData.isFree}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label">is Free</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- Right Column --- */}
              <div className="col-md-6">
                <h5 className="mb-4 text-primary">Content</h5>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Full Content <span className="text-danger">*</span>
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

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Short Description <span className="text-danger">*</span>
                  </label>
                  <RichTextEditor
                    value={formData.shortdesc}
                    onChange={(html) =>
                      setFormData((p) => ({ ...p, shortdesc: html }))
                    }
                  />
                  {errors.shortdesc && (
                    <div className="d-block invalid-feedback mt-1">
                      {errors.shortdesc}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* --- Buttons --- */}
            <div className="d-flex justify-content-end gap-2 mt-4 border-top pt-3">
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
                className="btn btn-success"
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