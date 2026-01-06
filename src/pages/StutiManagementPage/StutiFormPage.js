import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import RichTextEditor from "../../common/RichTextEditor";
import { toast } from "react-toastify";
import { uploadImage } from "../../services/uploadService";

import { fetchStutis, addStuti, updateStuti } from "../../store/stuti/index";
import { fetchAllGods } from "../../store/god/index";
import { staticLanguages } from "../../constants/languages";

export default function StutiFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { list: stutis, status: stutiStatus } = useSelector(
    (state) => state.stuti
  );
  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  const [formData, setFormData] = useState({
    name: "",
    sort: "",
    isActive: true,
    god: "",
    description: "",
    language: "",
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
    if (stutiStatus === "idle") dispatch(fetchStutis());
    if (godStatus === "idle") dispatch(fetchAllGods());
  }, [stutiStatus, godStatus, dispatch]);

  useEffect(() => {
    if (id && stutis.length > 0) {
      const stuti = stutis.find((s) => s._id === id);
      if (stuti) {
        setFormData({
          name: stuti.name || "",
          sort: stuti.sort || "",
          isActive: stuti.isActive,
          god: stuti.god?._id || stuti.god,
          description: stuti.description || "",
          language: stuti.language,
          image: stuti.image || "",
          views: stuti.views || "",
          share: stuti.share || "",
          like: stuti.like || "",
        });
      }
    }
  }, [id, stutis]);

  useEffect(() => {
    if (formData.language && allGods.length > 0) {
      const godsByLang = allGods.filter(
        (g) => g.language === formData.language
      );
      setFilteredGods(godsByLang);
    } else {
      setFilteredGods([]);
    }
  }, [formData.language, allGods]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Stuti name is required.";
    if (!formData.god) newErrors.god = "Please select a God.";
    if (!formData.language) newErrors.language = "Please select a language.";
    if (!formData.description.trim())
      newErrors.description = "Description / Content is required.";
    if (formData.sort === "" || isNaN(formData.sort))
      newErrors.sort = "Sort order must be a valid number.";
    if (!formData.image) newErrors.image = "Stuti image is required.";
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
      setFormData((prev) => ({ ...prev, image: uploadedUrl }));
      setErrors((prev) => ({ ...prev, image: null })); 
      toast.success("Image uploaded successfully!");
    } catch (err) {
      toast.error("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
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

      const action = id ? updateStuti({ id, ...payload }) : addStuti(payload);

      await dispatch(action).unwrap();
      toast.success(
        id ? "Stuti updated successfully!" : "Stuti added successfully!"
      );
      navigate("/stuti");
    } catch (err) {
      console.error("Failed to save stuti:", err);
      toast.error(err?.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const getSelectedOption = (list, id) => {
    if (!id || !list) return null;
    const selected = list.find((item) => item._id === id);
    return selected
      ? {
          value: selected._id,
          label: selected.name || selected.nativeName,
        }
      : null;
  };

  return (
    <div className="content-wrapper p-4">
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <div>
          <span
            style={{ cursor: "pointer", color: "#0d6efd" }}
            onClick={() => navigate("/stuti")}
          >
            Stutis
          </span>{" "}
          / <span>{id ? "Edit Stuti" : "New Stuti"}</span>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => navigate("/stuti")}
        >
          <i className="fas fa-arrow-left me-2"></i> Back
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row">
              <div className="col-md-6">
                <h5 className="mb-4 text-primary">Stuti Details</h5>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Stuti Name <span className="text-danger">*</span>
                  </label>
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
                    isDisabled={!formData.language}
                  />
                  {errors.god && (
                    <div className="text-danger small mt-1">{errors.god}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Stuti Image <span className="text-danger">*</span>
                  </label>
                  <input
                    type="file"
                    className={`form-control ${
                      errors.image ? "is-invalid" : ""
                    }`}
                    onChange={handleImageUpload}
                    accept="image/*"
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <div className="text-primary small mt-1">Uploading...</div>
                  )}
                  {errors.image && (
                    <div className="invalid-feedback d-block">
                      {errors.image}
                    </div>
                  )}
                  {formData.image && !isUploading && (
                    <div className="mt-2">
                      <img
                        src={formData.image}
                        alt="Stuti Preview"
                        className="img-fluid rounded"
                        style={{ maxHeight: "150px" }}
                      />
                    </div>
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
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleFormChange}
                      />
                      <label className="form-check-label">is Active</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <h5 className="mb-4 text-primary">Content</h5>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Description / Content <span className="text-danger">*</span>
                  </label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(html) =>
                      setFormData((prev) => ({ ...prev, description: html }))
                    }
                  />
                  {errors.description && (
                    <div className="invalid-feedback d-block mt-1">
                      {errors.description}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4 border-top pt-3">
              <button
                type="button"
                className="btn btn-outline-secondary mr-2"
                onClick={() => navigate("/stuti")}
                disabled={isSaving || isUploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving || isUploading}
              >
                {isSaving ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : (
                  <i className="fas fa-save mr-2"></i>
                )}
                {id ? "Update Stuti" : "Create Stuti"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
