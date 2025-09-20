import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import RichTextEditor from "../../common/RichTextEditor";
import { fetchNews, addNews, updateNews } from "../../store/news/index";
import { fetchAllGods } from "../../store/god/index"; // <-- Corrected
import { staticLanguages } from "../../constants/languages";

export default function NewsFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { list: newsList = [], status: newsStatus } = useSelector(
    (state) => state.news || {}
  );
  const { masterList: allMasters = [], masterStatus } = useSelector(
    (state) => state.gods || {}
  );

  const [formData, setFormData] = useState({
    name: "",
    sort: "",
    isActive: true,
    language: "",
    master: "",
    description: "",
  });

  const [filteredMasters, setFilteredMasters] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Fetch data if idle
  useEffect(() => {
    if (newsStatus === "idle") dispatch(fetchNews());
    if (masterStatus === "idle") dispatch(fetchAllGods()); // <-- Corrected
  }, [newsStatus, masterStatus, dispatch]);

  // Populate form if editing
  useEffect(() => {
    if (id && Array.isArray(newsList) && newsList.length > 0) {
      const newsItem = newsList.find((n) => n._id === id);
      if (newsItem) {
        setFormData({
          name: newsItem.name || "",
          sort: newsItem.sort || "",
          isActive: newsItem.isActive ?? true,
          language: newsItem.language || "",
          master: newsItem.master?._id || newsItem.master || "",
          description: newsItem.description || "",
        });
      }
    }
  }, [id, newsList]);

  // Filter masters by selected language
  useEffect(() => {
    if (
      formData.language &&
      Array.isArray(allMasters) &&
      allMasters.length > 0
    ) {
      setFilteredMasters(
        allMasters.filter((m) => m.language === formData.language)
      );
    } else {
      setFilteredMasters([]);
    }
  }, [formData.language, allMasters]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "News title is required.";
    if (!formData.language) newErrors.language = "Please select a language.";
    if (!formData.master) newErrors.master = "Please select a Master.";
    if (!formData.description.trim())
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
      if (id) {
        await dispatch(updateNews({ id, ...formData })).unwrap();
      } else {
        await dispatch(addNews(formData)).unwrap();
      }
      navigate("/news");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const getSelectedOption = (list = [], id) => {
    if (!Array.isArray(list)) return null;
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
        <form onSubmit={handleSubmit}>
          <div className="row">
            {/* Left Column */}
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
                      master: "",
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
                  Master <span className="text-danger">*</span>
                </label>
                <Select
                  options={filteredMasters.map((master) => ({
                    value: master._id,
                    label: master.name,
                  }))}
                  value={getSelectedOption(filteredMasters, formData.master)}
                  onChange={(option) =>
                    setFormData((prev) => ({
                      ...prev,
                      master: option?.value || "",
                    }))
                  }
                  placeholder={
                    formData.language
                      ? "Select Master..."
                      : "Select Language first..."
                  }
                  isDisabled={
                    !formData.language || filteredMasters.length === 0
                  }
                />
                {errors.master && (
                  <div className="text-danger small mt-1">{errors.master}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Sort Order *</label>
                <input
                  type="number"
                  name="sort"
                  className={`form-control ${errors.sort ? "is-invalid" : ""}`}
                  value={formData.sort}
                  onChange={handleFormChange}
                />
                {errors.sort && (
                  <div className="invalid-feedback">{errors.sort}</div>
                )}
              </div>

              <div className="form-check form-switch mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleFormChange}
                />
                <label className="form-check-label">Active Status</label>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-md-6">
              <h5 className="mb-3 text-primary">News Content</h5>
              <RichTextEditor
                value={formData.description}
                minHeight={350}
                maxHeight={350}
                onChange={(html) =>
                  setFormData((prev) => ({ ...prev, description: html }))
                }
                placeholder="Enter the full news content here..."
                error={errors.description}
              />
              {errors.description && (
                <div className="invalid-feedback d-block mt-2">
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
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                <i className="fas fa-save me-2"></i>
              )}
              {id ? "Update News" : "Create News"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
