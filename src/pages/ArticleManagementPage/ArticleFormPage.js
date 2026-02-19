import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import RichTextEditor from "../../common/RichTextEditor";
import { uploadImage } from "../../services/uploadService";

import {
  useArticle,
  useAddArticle,
  useUpdateArticle,
} from "../../hooks/useArticles";

import { fetchAllGods } from "../../store/god";
import { staticLanguages } from "../../constants/languages";

export default function ArticleFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: articleData, isLoading: isFetchingArticle } = useArticle(id);

  const addMutation = useAddArticle();
  const updateMutation = useUpdateArticle();

  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

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
    share: "",
    like: "",
    isGlobal: false,
  });

  const [filteredGods, setFilteredGods] = useState([]);
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const isSaving = addMutation.isPending || updateMutation.isPending || isUploading;

  useEffect(() => {
    if (godStatus === "idle") dispatch(fetchAllGods());
  }, [dispatch, godStatus]);

  useEffect(() => {
    if (formData.language && allGods.length > 0) {
      setFilteredGods(
        allGods.filter((g) => g.language === formData.language)
      );
    } else {
      setFilteredGods([]);
    }
  }, [formData.language, allGods]);
  useEffect(() => {
    if (articleData && id) {
      setFormData({
        title: articleData.title || "",
        shortdesc: articleData.shortdesc || "",
        longdesc: articleData.longdesc || "",
        sort: articleData.sort || "",
        isActive: articleData.isActive ?? true, 
        isFree: articleData.isFree ?? true,
        god: articleData.god?._id || articleData.god || "",
        language: articleData.language?._id || articleData.language || "",
        featureimage: articleData.featureimage || "",
        isGlobal: !!articleData.isGlobal,
        views: articleData.views || "",
        share: articleData.share || "",
        like: articleData.like || "",
      });
    }
  }, [articleData, id]);

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
    if (!formData.language) newErrors.language = "Please select a language.";
    if (!formData.isGlobal && !formData.god) newErrors.god = "Please select a God.";
    if (!formData.shortdesc.trim()) newErrors.shortdesc = "Short description is required.";
    if (!formData.longdesc.trim()) newErrors.longdesc = "Full article content is required.";

    if (formData.sort === "" || isNaN(Number(formData.sort)))
      newErrors.sort = "Sort order must be a valid number.";
    if (formData.views !== "" && isNaN(Number(formData.views)))
      newErrors.views = "Views must be a valid number.";
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

    setIsUploading(true);
    try {
      const uploadedUrl = await uploadImage(file);
      setFormData((prev) => ({
        ...prev,
        featureimage: uploadedUrl,
      }));
      toast.success("Image uploaded successfully!");
    } catch {
      toast.error("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      ...formData,
      sort: Number(formData.sort) || 0,
      views: Number(formData.views) || 0,
      share: Number(formData.share) || 0,
      like: Number(formData.like) || 0,
      god: formData.isGlobal ? null : formData.god,
    };

    try {
      if (id) {
        await updateMutation.mutateAsync({ id, ...payload });
      } else {
        await addMutation.mutateAsync(payload);
      }

      navigate("/articles");
    } catch (err) {
      console.error("Submission failed", err);
    }
  };

  const languageOptions = staticLanguages.map((l) => ({
    value: l._id,
    label: l.nativeName,
  }));

  const godOptions = filteredGods.map((g) => ({
    value: g._id,
    label: g.name,
  }));
  if (id && isFetchingArticle) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading article...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper p-4">
      <div className="mb-4 d-flex justify-content-between align-items-center">
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
          className="btn btn-outline-primary btn-sm"
          onClick={() => navigate("/articles")}
        >
          <i className="fas fa-arrow-left mr-2" />
          Back
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row">
              <div className="col-md-6">
                <h5 className="mb-4 text-primary">Core Details</h5>

                <div className="mb-3">
                  <div className="form-check form-switch border rounded p-3 bg-light-subtle">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={formData.isGlobal}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData((prev) => ({
                          ...prev,
                          isGlobal: checked,
                          god: checked ? "" : prev.god,
                        }));
                      }}
                    />
                    <label className="form-check-label fw-bold">
                      Is Global Article?
                    </label>
                    <div className="form-text">
                      Visible to all users regardless of God.
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Article Title <span className="text-danger">*</span>
                  </label>
                  <input
                    name="title"
                    className={`form-control ${errors.title ? "is-invalid" : ""}`}
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
                    God {!formData.isGlobal && <span className="text-danger">*</span>}
                  </label>
                  <Select
                    options={godOptions}
                    value={godOptions.find((g) => g.value === formData.god)}
                    onChange={(opt) => handleSelectChange("god", opt)}
                    isDisabled={!formData.language || formData.isGlobal}
                    isLoading={godStatus === "loading"}
                    placeholder={
                      formData.isGlobal
                        ? "Global article (not required)"
                        : !formData.language
                          ? "Select language first..."
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
                    accept="image/*"
                    disabled={isSaving}
                    onChange={handleImageUpload}
                  />
                  {formData.featureimage && (
                    <img
                      src={formData.featureimage}
                      alt="Preview"
                      className="img-fluid mt-2"
                      style={{ maxHeight: 150 }}
                    />
                  )}
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
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

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Views</label>
                    <input
                      type="number"
                      name="views"
                      className={`form-control ${errors.views ? "is-invalid" : ""}`}
                      value={formData.views}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Share</label>
                    <input
                      type="number"
                      name="share"
                      className={`form-control ${errors.share ? "is-invalid" : ""}`}
                      value={formData.share}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Like</label>
                    <input
                      type="number"
                      name="like"
                      className={`form-control ${errors.like ? "is-invalid" : ""}`}
                      value={formData.like}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Switches */}
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-check form-switch">
                      <input
                        type="checkbox"
                        name="isActive"
                        className="form-check-input"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label">Is Active</label>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-check form-switch">
                      <input
                        type="checkbox"
                        name="isFree"
                        className="form-check-input"
                        checked={formData.isFree}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label">Is Free</label>
                    </div>
                  </div>
                </div>
              </div>

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
                    <div className="invalid-feedback d-block mt-1">
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
                    <div className="invalid-feedback d-block mt-1">
                      {errors.shortdesc}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="d-flex justify-content-end gap-2 mt-4 border-top pt-3">
              <button
                type="button"
                className="btn btn-outline-secondary mr-2"
                disabled={isSaving}
                onClick={() => navigate("/articles")}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-success"
                disabled={isSaving}
              >
                {isSaving && (
                  <span className="spinner-border spinner-border-sm me-2" />
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