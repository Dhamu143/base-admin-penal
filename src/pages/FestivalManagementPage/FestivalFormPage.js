import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import RichTextEditor from "../../common/RichTextEditor";

// --- Actions ---
import {
  fetchFestivals,
  addFestival,
  updateFestival,
} from "../../store/festival/index";
import { fetchAllGods } from "../../store/god/index";
import { staticLanguages } from "../../constants/languages";

export default function FestivalFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  // --- Redux State ---
  const { list: festivals, status: festivalStatus } = useSelector(
    (state) => state.festivals
  );
  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  // --- Component State ---
  const [formData, setFormData] = useState({
    name: "",
    sort: "",
    isActive: true,
    god: "",
    description: "",
    language: "",
  });
  const [filteredGods, setFilteredGods] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // --- Fetch Data ---
  useEffect(() => {
    if (festivalStatus === "idle") dispatch(fetchFestivals());
    if (godStatus === "idle") dispatch(fetchAllGods());
  }, [festivalStatus, godStatus, dispatch]);

  // --- Initialize Form for Edit ---
  useEffect(() => {
    if (id && festivals.length > 0) {
      const festival = festivals.find((f) => f._id === id);
      if (festival) {
        setFormData({
          name: festival.name || "",
          sort: festival.sort || 0,
          isActive: festival.isActive,
          god: festival.god?._id || festival.god || "",
          description: festival.description || "",
          language: festival.language?._id || festival.language || "",
        });
      }
    }
  }, [id, festivals]);

  // --- Filter Gods by Language ---
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

  // --- Handlers ---
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const getSelectedOption = (list, value) => {
    if (!value || !list) return null;
    const selected = list.find(
      (item) => item._id === value || item.language === value
    );
    return selected
      ? { value: selected._id, label: selected.name || selected.nativeName }
      : null;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Festival name is required.";
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
              {/* Left Column */}
              <div className="col-md-6">
                <h5 className="mb-4 text-primary">Festival Details</h5>

                {/* Festival Name */}
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

                {/* Language */}
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
                        god: "", // reset God on language change
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

                {/* God */}
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
                    isDisabled={!formData.language || filteredGods.length === 0}
                  />
                  {errors.god && (
                    <div className="text-danger small mt-1">{errors.god}</div>
                  )}
                </div>

                {/* Sort Order & Active */}
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
                  <div className="col-md-6 d-flex align-items-center justify-content-start pt-3">
                    <div className="form-check form-switch fs-5">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleFormChange}
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
                className="btn btn-outline-secondary"
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
                {id ? "Update Festival" : "Create Festival"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
