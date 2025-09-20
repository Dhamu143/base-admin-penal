import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import RichTextEditor from "../../common/RichTextEditor"; // MODIFICATION: Using RichTextEditor for consistency

// --- Actions ---
import {
  fetchFestivals,
  addFestival,
  updateFestival,
} from "../../store/festival/index";
import { fetchGods } from "../../store/godmaster/index";
import { fetchGods as fetchOtherGods } from "../../store/god/index";
import { staticLanguages } from "../../constants/languages";

export default function FestivalFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { list: festivals, status } = useSelector((state) => state.festivals);
  const { list: gods } = useSelector((state) => state.gods);
  const { list: Gods } = useSelector((state) => state.God);

  const [formData, setFormData] = useState({
    name: "",
    sort: "",
    isActive: true,
    master: "",
    god: "",
    description: "",
    language: "",
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Fetch data if it's not already loaded, handles page refresh case
    if (status === "idle") dispatch(fetchFestivals());
    dispatch(fetchGods());
    dispatch(fetchOtherGods());

    if (id && festivals.length > 0) {
      const festival = festivals.find((f) => f._id === id);
      if (festival) {
        setFormData({
          name: festival.name,
          sort: festival.sort,
          isActive: festival.isActive,
          master: festival.master?._id || festival.master,
          god: festival.god?._id || festival.god,
          description: festival.description,
          language: festival.language,
        });
      }
    }
  }, [id, festivals, dispatch, status]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Festival name is required.";
    if (!formData.master) newErrors.master = "Please select a God Master.";
    if (!formData.god) newErrors.god = "Please select a God.";
    if (!formData.language) newErrors.language = "Please select a language.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";
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
      const action = id
        ? updateFestival({ id, ...formData })
        : addFestival(formData);
      await dispatch(action).unwrap();
      navigate("/festival"); // Navigate back to the list
    } catch (err) {
      console.error(err);
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
              {/* Left Column */}
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
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., Diwali, Navratri"
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    God (Master) <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={gods.map((g) => ({ value: g._id, label: g.name }))}
                    value={
                      gods
                        .filter((g) => g._id === formData.master)
                        .map((g) => ({ value: g._id, label: g.name }))[0] ||
                      null
                    }
                    onChange={(opt) =>
                      setFormData((prev) => ({ ...prev, master: opt.value }))
                    }
                  />
                  {errors.master && (
                    <div className="text-danger small mt-1">
                      {errors.master}
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    God <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={Gods.map((g) => ({ value: g._id, label: g.name }))}
                    value={
                      Gods.filter((g) => g._id === formData.god).map((g) => ({
                        value: g._id,
                        label: g.name,
                      }))[0] || null
                    }
                    onChange={(opt) =>
                      setFormData((prev) => ({ ...prev, god: opt.value }))
                    }
                  />
                  {errors.god && (
                    <div className="text-danger small mt-1">{errors.god}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Language <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={staticLanguages.map((l) => ({
                      value: l._id,
                      label: l.nativeName,
                    }))}
                    value={
                      staticLanguages
                        .filter((l) => l._id === formData.language)
                        .map((l) => ({
                          value: l._id,
                          label: l.nativeName,
                        }))[0] || null
                    }
                    onChange={(opt) =>
                      setFormData((prev) => ({ ...prev, language: opt.value }))
                    }
                  />
                  {errors.language && (
                    <div className="text-danger small mt-1">
                      {errors.language}
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
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          sort: e.target.value,
                        }))
                      }
                    />
                    {errors.sort && (
                      <div className="invalid-feedback">{errors.sort}</div>
                    )}
                  </div>
                  <div className="col-md-6 d-flex align-items-center justify-content-start pt-3">
                    <div className="form-check form-switch fs-5">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            isActive: e.target.checked,
                          }))
                        }
                      />
                      <label className="form-check-label">Active</label>
                    </div>
                  </div>
                </div>
              </div>
              {/* Right Column */}
              <div className="col-md-6">
                <h5 className="mb-4 text-primary">Description & Settings</h5>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Description <span className="text-danger">*</span>
                  </label>
                  <RichTextEditor
                    value={formData.description}
                    minHeight={300}
                    maxHeight={300}
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
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary mr-2"
                onClick={() => navigate("/festival")}
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
                {"    "}
                {id ? "Update Festival" : "Create Festival"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
