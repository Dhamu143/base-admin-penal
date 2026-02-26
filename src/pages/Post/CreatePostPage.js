import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

import { uploadImage } from "../../services/uploadService";
import RichTextEditor from "../../common/RichTextEditor";
import { staticLanguages } from "../../constants/languages";

import { useCreatePost } from "../../hooks/usePosts";
import { useAllGods } from "../../hooks/useGod";

export default function CreatePostPage() {
  const navigate = useNavigate();

  const { data: allGods = [], isLoading: isLoadingGods } = useAllGods();

  const { mutateAsync: createPostMutate, isPending: isCreating } = useCreatePost();

  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [filteredGods, setFilteredGods] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    godId: "",
    languageId: "",
    image: "",
    deviceId: "ADMIN_DEVICE_001",
    isAdmin: true,
  });

  useEffect(() => {
    if (formData.languageId && Array.isArray(allGods)) {
      const filtered = allGods.filter(
        (g) => g.language === formData.languageId
      );
      setFilteredGods(filtered);
    } else {
      setFilteredGods([]);
    }
  }, [formData.languageId, allGods]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    try {
      const uploadedUrl = await uploadImage(file);
      setFormData((prev) => ({ ...prev, image: uploadedUrl }));
      toast.success("Image uploaded successfully!");
      if (errors.image) setErrors((prev) => ({ ...prev, image: null }));
    } catch (err) {
      toast.error("Failed to upload image.");
      console.error("Image upload error:", err);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Post title is required.";
    if (!formData.languageId)
      newErrors.languageId = "Please select a language.";
    if (!formData.godId) newErrors.godId = "Please select a God.";
    if (!formData.image) newErrors.image = "An image is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await createPostMutate(formData);
      navigate("/post");
    } catch (err) {
      console.error("Failed to create post:", err);
    }
  };

  const getSelectedOption = (list, id, labelKey = "name") => {
    if (!id || !Array.isArray(list)) return null;
    const item = list.find((i) => i._id === id);
    return item
      ? { value: item._id, label: item[labelKey] || item.nativeName }
      : null;
  };

  const isFormDisabled = isCreating || isProcessingImage;

  return (
    <div className="content-wrapper p-4">
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <div>
          <span
            style={{ cursor: "pointer", color: "#0d6efd" }}
            onClick={() => navigate("/post")}
          >
            Posts
          </span>{" "}
          / <span>Create Admin Post</span>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => navigate("/post")}
        >
          <i className="fas fa-arrow-left me-2"></i> Back
        </button>
      </div>

      <div className="card shadow-sm p-4">
        <form onSubmit={handleSubmit} noValidate>
          <div className="row">
            <div className="col-md-6">
              <h5 className="mb-3 text-primary">Post Details</h5>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  Post Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className={`form-control ${errors.title ? "is-invalid" : ""}`}
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="e.g. Morning Prayer"
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
                  options={staticLanguages.map((lang) => ({
                    value: lang._id,
                    label: `${lang.nativeName} (${lang.language})`,
                  }))}
                  value={getSelectedOption(
                    staticLanguages,
                    formData.languageId,
                    "language"
                  )}
                  onChange={(option) =>
                    setFormData((prev) => ({
                      ...prev,
                      languageId: option?.value || "",
                      godId: "",
                    }))
                  }
                  placeholder="Select Language..."
                />
                {errors.languageId && (
                  <div className="text-danger small mt-1">
                    {errors.languageId}
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
                  value={getSelectedOption(
                    filteredGods,
                    formData.godId,
                    "name"
                  )}
                  onChange={(option) =>
                    setFormData((prev) => ({
                      ...prev,
                      godId: option?.value || "",
                    }))
                  }
                  placeholder={
                    isLoadingGods
                      ? "Loading Gods..."
                      : formData.languageId
                        ? "Select God..."
                        : "Select Language first..."
                  }
                  isDisabled={!formData.languageId || isLoadingGods}
                  noOptionsMessage={() => "No Gods found for this language"}
                />
                {errors.godId && (
                  <div className="text-danger small mt-1">{errors.godId}</div>
                )}
              </div>

              {/* Image Upload */}
              <div className="mb-3">
                <label className="form-label fw-bold">
                  Post Image <span className="text-danger">*</span>
                </label>
                <input
                  type="file"
                  className={`form-control ${errors.image ? "is-invalid" : ""}`}
                  onChange={handleImageUpload}
                  accept="image/*"
                  disabled={isFormDisabled}
                />
                {isProcessingImage && <div className="text-primary small mt-1">Uploading...</div>}
                {errors.image && (
                  <div className="text-danger small mt-1">{errors.image}</div>
                )}
                {formData.image && !isProcessingImage && (
                  <div className="mt-2">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="img-thumbnail"
                      style={{ maxWidth: "200px", maxHeight: "150px" }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <h5 className="mb-3 text-primary">Content</h5>

              <div className="mb-3">
                <label className="form-label fw-bold">Description</label>
                <RichTextEditor
                  value={formData.description}
                  minHeight={350}
                  maxHeight={350}
                  onChange={(html) =>
                    setFormData((prev) => ({ ...prev, description: html }))
                  }
                  placeholder="Write a description or prayer..."
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="d-flex justify-content-end gap-2 mt-4 border-top pt-3">
            <button
              type="button"
              className="btn btn-outline-secondary mr-2"
              onClick={() => navigate("/post")}
              disabled={isFormDisabled}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={isFormDisabled}
            >
              {isCreating ? (
                <>
                  <span className="spinner-border spinner-border-sm mr-2"></span>
                  Publishing...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i> Publish Post
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}