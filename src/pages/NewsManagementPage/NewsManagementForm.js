import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import RichTextEditor from "../../common/RichTextEditor";
import { toast } from "react-toastify";
import { uploadImage } from "../../services/uploadService";

import { fetchNews, addNews, updateNews } from "../../store/news/index";
import { fetchAllGods } from "../../store/god/index";
import { staticLanguages } from "../../constants/languages";

export default function NewsFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { list: newsList = [] } = useSelector((state) => state.news || {});
  const {
    masterList: allGods = [],
    masterStatus: godStatus = "idle",
  } = useSelector((state) => state.God || {});

  const [formData, setFormData] = useState({
    name: "",
    sort: "",
    isActive: true,
    language: "",
    god: "",
    description: "",
    link: "",
    files: "",
    views: "",
    share: "",
    like: "",
  });
  const [filteredGods, setFilteredGods] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);


  useEffect(() => {
    dispatch(fetchNews());
    if (godStatus === "idle") {
      dispatch(fetchAllGods());
    }
  }, [godStatus, dispatch]);

  useEffect(() => {
    if (id && newsList.length > 0) {
      const newsItem = newsList.find((n) => n._id === id);
      if (newsItem) {
        setFormData({
          name: newsItem.name || "",
          sort: newsItem.sort || "",
          isActive: newsItem.isActive ?? true,
          language: newsItem.language || "",
          god: newsItem.god?._id || newsItem.god || "",
          description: newsItem.description || "",
          link: newsItem.link || "",
          files: newsItem.files || "",
          views: newsItem.views || "",
          share: newsItem.share || "",
          like: newsItem.like || "",
        });
      }
    }
  }, [id, newsList]);

  useEffect(() => {
    if (formData.language && Array.isArray(allGods)) {
      setFilteredGods(allGods.filter((g) => g.language === formData.language));
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
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    try {
      const uploadedUrl = await uploadImage(file);
      setFormData((prev) => ({ ...prev, files: uploadedUrl }));
      toast.success("Image uploaded successfully!");
    } catch (err) {
      toast.error("Failed to upload image.");
      console.error("Image upload error:", err);
    } finally {
      setIsSaving(false);
    }
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

      const action = id ? updateNews({ id, ...payload }) : addNews(payload);
      await dispatch(action).unwrap();
      toast.success(`News ${id ? "updated" : "created"} successfully!`);
      navigate("/news");
    } catch (err) {
      toast.error(err?.message || "Failed to save news.");
      console.error("Error saving news:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "News title is required.";
    if (!formData.language) newErrors.language = "Please select a language.";
    if (!formData.god) newErrors.god = "Please select a God.";
    if (!formData.description.trim())
      newErrors.description = "Description / Content is required.";
    if (formData.sort === "" || isNaN(Number(formData.sort)))
      newErrors.sort = "Sort order must be a valid number.";
    if (formData.link && !/^(ftp|http|https):\/\/[^ "]+$/.test(formData.link)) {
      newErrors.link = "Please enter a valid URL (e.g., https://example.com).";
    }
    if (!formData.files) {
      newErrors.files = "A news image is required.";
    }
    if (formData.views !== "" && isNaN(Number(formData.views))) {
      newErrors.views = "Views must be a valid number.";
    }
    if (formData.share !== "" && isNaN(Number(formData.share))) {
      newErrors.share = "Share count must be a valid number.";
    }
    if (formData.like !== "" && isNaN(Number(formData.like))) {
      newErrors.like = "Like count must be a valid number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getSelectedOption = (list = [], id) => {
    if (!id || !Array.isArray(list)) return null;
    const selected = list.find((item) => item._id === id);
    return selected
      ? { value: selected._id, label: selected.name || selected.nativeName }
      : null;
  };

  return (
    <div className="content-wrapper p-4">
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <div>
          <span
            style={{ cursor: "pointer", color: "#0d6efd" }}
            onClick={() => navigate("/news")}
          >
            News
          </span>{" "}
          / <span>{id ? "Edit News" : "New News"}</span>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => navigate("/news")}
        >
          <i className="fas fa-arrow-left me-2"></i> Back
        </button>
      </div>

      <div className="card shadow-sm p-4">
        <form onSubmit={handleSubmit} noValidate>
          <div className="row">
            <div className="col-md-6">
              <h5 className="mb-3 text-primary">News Details</h5>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  News Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Enter news title"
                />
                {errors.name && (
                  <div className="invalid-feedback">{errors.name}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Link (Optional)</label>
                <input
                  type="url"
                  name="link"
                  className={`form-control ${errors.link ? "is-invalid" : ""}`}
                  value={formData.link}
                  onChange={handleFormChange}
                  placeholder="https://example.com/news-article"
                />
                {errors.link && (
                  <div className="invalid-feedback">{errors.link}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  Language <span className="text-danger">*</span>
                </label>
                <Select
                  options={staticLanguages.map((lang) => ({
                    value: lang._id,
                    label: `${lang.nativeName} (${lang.language})`,
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

              <div className="mb-3">
                <label className="form-label fw-bold">
                  God <span className="text-danger">*</span>
                </label>
                <Select
                  options={filteredGods.map((god) => ({
                    value: god._id,
                    label: god.name,
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

              <div className="mb-3">
                <label className="form-label fw-bold">
                  News Image <span className="text-danger">*</span>
                </label>
                <input
                  type="file"
                  className="form-control"
                  onChange={handleImageUpload}
                  accept="image/*"
                  disabled={isSaving}
                />
                {errors.files && (
                  <div className="text-danger small mt-1">{errors.files}</div>
                )}
                {formData.files && (
                  <div className="mt-2">
                    <img
                      src={formData.files}
                      alt="News Preview"
                      className="img-thumbnail"
                      style={{ maxWidth: "200px", maxHeight: "150px" }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <h5 className="mb-3 text-primary">Settings & Content</h5>

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

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Views</label>
                  <input
                    type="number"
                    name="views"
                    className={`form-control ${
                      errors.views ? "is-invalid" : ""
                    }`}
                    value={formData.views}
                    onChange={handleFormChange}
                    placeholder="e.g., 100"
                  />
                  {errors.views && (
                    <div className="invalid-feedback">{errors.views}</div>
                  )}
                </div>
              </div>

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
                    onChange={handleFormChange}
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
                    onChange={handleFormChange}
                    placeholder="e.g., 200"
                  />
                  {errors.like && (
                    <div className="invalid-feedback">{errors.like}</div>
                  )}
                </div>
              </div>

              <div className="row">
                <div className="col-md-12 mb-3">
                  <div className="form-check form-switch fs-5">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleFormChange}
                      role="switch"
                    />
                    <label className="form-check-label">Active</label>
                  </div>
                </div>
              </div>

              <h5 className="mb-3 text-primary mt-3">News Content</h5>
              <RichTextEditor
                value={formData.description}
                minHeight={350}
                maxHeight={350}
                onChange={(html) =>
                  setFormData((prev) => ({ ...prev, description: html }))
                }
                placeholder="Enter the full news content here..."
              />
              {errors.description && (
                <div className="text-danger small mt-2">
                  {errors.description}
                </div>
              )}
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4 border-top pt-3">
            <button
              type="button"
              className="btn btn-outline-secondary mr-2"
              onClick={() => navigate("/news")}
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
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
              ) : (
                <i className="fas fa-save mr-2"></i>
              )}
              {id ? "Update News" : "Create News"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
