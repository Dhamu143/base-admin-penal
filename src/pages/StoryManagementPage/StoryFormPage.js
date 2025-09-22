import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import RichTextEditor from "../../common/RichTextEditor";
import { toast } from "react-toastify"; // Added for better user feedback

// --- Store Imports ---
import { fetchStories, addStory, updateStory } from "../../store/story/index";
import { fetchAllGods } from "../../store/god/index";
import { staticLanguages } from "../../constants/languages";

export default function StoryFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  // --- Redux State ---
  const { list: stories = [] } = useSelector((state) => state.story || {});

  // CORRECTED: Select from state.God and use consistent variable names
  const {
    masterList: allGods = [],
    masterStatus: godStatus = "idle",
  } = useSelector((state) => state.God || {});

  // --- Component State ---
  const [formData, setFormData] = useState({
    name: "",
    sort: "",
    isActive: true,
    language: "",
    god: "", // CHANGED: from 'master' to 'god' for consistency
    description: "",
  });

  const [filteredGods, setFilteredGods] = useState([]); // CHANGED: from 'filteredMasters'
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // --- Effects ---

  // Fetch initial data if not already loaded
  useEffect(() => {
    dispatch(fetchStories()); // Always fetch list for consistency
    if (godStatus === "idle") {
      dispatch(fetchAllGods());
    }
  }, [godStatus, dispatch]);

  // Populate form when editing an existing item
  useEffect(() => {
    if (id && stories.length > 0) {
      const storyItem = stories.find((s) => s._id === id);
      if (storyItem) {
        setFormData({
          name: storyItem.name || "",
          sort: storyItem.sort || "",
          isActive: storyItem.isActive ?? true,
          language: storyItem.language || "",
          god: storyItem.god?._id || storyItem.god || "", // CHANGED: Populating 'god' field
          description: storyItem.description || "",
        });
      }
    }
  }, [id, stories]);

  // Filter gods whenever the selected language or the main god list changes
  useEffect(() => {
    if (formData.language && Array.isArray(allGods)) {
      setFilteredGods(allGods.filter((g) => g.language === formData.language));
    } else {
      setFilteredGods([]);
    }
  }, [formData.language, allGods]);

  // --- Handlers ---

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const action = id ? updateStory({ id, ...formData }) : addStory(formData);
      await dispatch(action).unwrap();
      toast.success(`Story ${id ? "updated" : "created"} successfully!`);
      navigate("/story");
    } catch (err) {
      toast.error(err?.message || "Failed to save the story.");
      console.error("Error saving story:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Validation ---

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Story title is required.";
    if (!formData.language) newErrors.language = "Please select a language.";
    if (!formData.god) newErrors.god = "Please select a God."; // CHANGED: Validating 'god'
    if (!formData.description.trim())
      newErrors.description = "Description / Content is required.";
    if (formData.sort === "" || isNaN(formData.sort))
      newErrors.sort = "Sort order must be a valid number.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Helpers ---

  // Helper for react-select to find the selected option object
  const getSelectedOption = (list = [], id) => {
    if (!id || !Array.isArray(list)) return null;
    const selected = list.find((item) => item._id === id);
    return selected
      ? { value: selected._id, label: selected.name || selected.nativeName }
      : null;
  };

  return (
    <div className="content-wrapper p-4">
      {/* Header */}
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <div>
          <span
            style={{ cursor: "pointer", color: "#0d6efd" }}
            onClick={() => navigate("/story")}
          >
            Story
          </span>
          {" / "}
          <span>{id ? "Edit Story" : "New Story"}</span>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => navigate("/story")}
        >
          <i className="fas fa-arrow-left me-2"></i> Back
        </button>
      </div>

      {/* Form Card */}
      <div className="card shadow-sm p-4">
        <form onSubmit={handleSubmit} noValidate>
          <div className="row">
            {/* Left Column */}
            <div className="col-md-6">
              <h5 className="mb-3 text-primary">Story Details</h5>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  Story Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Enter story title"
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
                      god: "", // Reset god selection
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

              {/* God Dropdown */}
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

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Sort Order *</label>
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
                <div className="col-md-6 d-flex align-items-center mb-3">
                  <div className="form-check form-switch mt-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleFormChange}
                      role="switch"
                    />
                    <label className="form-check-label">Active Status</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-md-6">
              <h5 className="mb-3 text-primary">Story Content</h5>
              <RichTextEditor
                value={formData.description}
                minHeight={350}
                maxHeight={350}
                onChange={(html) =>
                  setFormData((prev) => ({ ...prev, description: html }))
                }
                placeholder="Enter the full story here..."
              />
              {errors.description && (
                <div className="text-danger small mt-2">
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
              onClick={() => navigate("/story")}
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
              {id ? "Update Story" : "Create Story"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
