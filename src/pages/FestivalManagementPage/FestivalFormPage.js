import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import RichTextEditor from "../../common/RichTextEditor";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { uploadImage } from "../../services/uploadService";

import {
  fetchFestivals,
  addFestival,
  updateFestival,
} from "../../store/festival/index";
import { staticLanguages } from "../../constants/languages";
import { indianStates } from "../../common/indianStates";

export default function FestivalFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { list: festivals, status: festivalStatus } = useSelector(
    (state) => state.festivals
  );

  const [formData, setFormData] = useState({
    name: "",
    sort: "",
    isActive: true,
    description: "",
    language: "",
    date: null,
    image: "",
    state: "",
    tag: "", 
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (festivalStatus === "idle") dispatch(fetchFestivals());
  }, [festivalStatus, dispatch]);

  useEffect(() => {
    if (id && festivals.length > 0) {
      const festival = festivals.find((f) => f._id === id);
      if (festival) {
        let parsedDate = null;

        if (festival.date) {
          const isDDMMYYYY = /^\d{2}-\d{2}-\d{4}$/.test(festival.date);
          if (isDDMMYYYY) {
            const [day, month, year] = festival.date.split("-");
            parsedDate = new Date(`${year}-${month}-${day}`);
          } else {
            parsedDate = new Date(festival.date);
          }
          if (isNaN(parsedDate.getTime())) {
            parsedDate = null;
          }
        }

        setFormData({
          name: festival.name || "",
          sort: festival.sort || "",
          isActive: festival.isActive,
          description: festival.description || "",
          language: festival.language?._id || festival.language || "",
          date: parsedDate,
          image: festival.image || "",
          state: festival.state || "",
          tag: festival.tag || "",
        });
      }
    }
  }, [id, festivals]);

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

  const getSelectedOption = (list, id) => {
    if (!id || !Array.isArray(list)) return null;
    const selected = list.find((item) => item._id === id);
    return selected
      ? {
          value: selected._id,
          label: `${selected.nativeName} (${selected.language})`,
        }
      : null;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Festival name is required.";
    if (!formData.language) newErrors.language = "Please select a language.";
    if (!formData.state) newErrors.state = "Please select a state.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";
    if (!formData.sort || isNaN(formData.sort))
      newErrors.sort = "Sort order must be a valid number.";
    if (!formData.date) newErrors.date = "Please select a festival date.";
    if (!formData.image) newErrors.image = "Festival image is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formatDate = (dateObj) => {
      if (!dateObj) return null;
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      return `${day}-${month}-${year}`;
    };

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        date: formatDate(formData.date),
      };

      const action = id
        ? updateFestival({ id, ...payload })
        : addFestival(payload);

      await dispatch(action).unwrap();

      toast.success(
        id ? "Festival updated successfully!" : "Festival added successfully!"
      );
      navigate("/festival");
    } catch (err) {
      toast.error(err?.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="content-wrapper p-4">
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <div>
          <span
            style={{ cursor: "pointer", color: "#0d6efd" }}
            onClick={() => navigate("/festival")}
          >
            Festivals
          </span>{" "}
          / <span>{id ? "Edit Festival" : "New Festival"}</span>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => navigate("/festival")}
        >
          <i className="fas fa-arrow-left me-2"></i> Back
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row">
              <div className="col-md-6">
                <h5 className="mb-4 text-primary">Festival Details</h5>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Festival Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className={`form-control ${
                      errors.name ? "is-invalid" : ""
                    }`}
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="e.g., Diwali, Navratri"
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Tag</label>
                  <input
                    type="text"
                    name="tag"
                    className="form-control"
                    value={formData.tag}
                    onChange={handleFormChange}
                    placeholder="e.g., Upcoming, Popular"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Festival Date <span className="text-danger">*</span>
                  </label>
                  <DatePicker
                    selected={formData.date}
                    onChange={(date) =>
                      setFormData((prev) => ({ ...prev, date }))
                    }
                    dateFormat="dd-MM-yyyy"
                    className={`form-control ${
                      errors.date ? "is-invalid" : ""
                    }`}
                    placeholderText="Select festival date..."
                  />
                  {errors.date && (
                    <div className="invalid-feedback">{errors.date}</div>
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
                    State <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={indianStates}
                    value={indianStates.find((s) => s.value === formData.state)}
                    onChange={(option) =>
                      setFormData((prev) => ({
                        ...prev,
                        state: option?.value || "",
                      }))
                    }
                    placeholder="Select State..."
                  />
                  {errors.state && (
                    <div className="text-danger small mt-1">{errors.state}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Festival Image <span className="text-danger">*</span>
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
                        alt="Festival Preview"
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
                  <div className="col-md-6 d-flex align-items-center mt-3">
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
                <h5 className="mb-4 text-primary">Description</h5>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Description <span className="text-danger">*</span>
                  </label>
                  <RichTextEditor
                    value={formData.description}
                    minHeight={400}
                    maxHeight={400}
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
                onClick={() => navigate("/festival")}
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
                  <span className="spinner-border spinner-border-sm mr-2"></span>
                ) : (
                  <i className="fas fa-save mr-2"></i>
                )}
                {id ? "Update Festival" : "Create Festival"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
