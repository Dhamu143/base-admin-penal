import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import RichTextEditor from "../../common/RichTextEditor";
import { fetchAartis, addAarti, updateAarti } from "../../store/aarti/index";
import { fetchGods } from "../../store/godmaster/index";
import { fetchGods as fetchgods } from "../../store/god/index";
import { staticLanguages } from "../../constants/languages";

export default function AartiFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  // MODIFICATION: Get 'status' from the Redux store
  const { list: aartis, status } = useSelector((state) => state.aartis);
  const { list: gods } = useSelector((state) => state.gods);
  const { list: Gods } = useSelector((state) => state.God);

  const [formData, setFormData] = useState({
    name: "",
    sort: 0,
    isActive: true,
    master: "",
    god: "",
    description: "",
    language: "",
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // MODIFICATION: Fetch all aartis if the list is not already loaded or loading
    if (status === "idle") {
      dispatch(fetchAartis());
    }

    // These can be fetched regardless
    dispatch(fetchGods());
    dispatch(fetchgods());

    // This part remains the same, but it will now work after the fetch completes
    if (id && aartis.length > 0) {
      const aarti = aartis.find((a) => a._id === id);
      if (aarti) {
        setFormData({
          name: aarti.name,
          sort: aarti.sort,
          isActive: aarti.isActive,
          master: aarti.master?._id || aarti.master,
          god: aarti.god?._id || aarti.god,
          description: aarti.description,
          language: aarti.language,
        });
      } else {
        // Optional: Handle case where ID is invalid and not found in the list
        console.error("Aarti with this ID not found.");
        // navigate('/404'); // or to an error page
      }
    }
    // MODIFICATION: Add 'status' to the dependency array
  }, [id, aartis, dispatch, status]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Aarti name is required.";
    if (!formData.master) newErrors.master = "Please select a God Master.";
    if (!formData.god) newErrors.god = "Please select a God.";
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
        await dispatch(updateAarti({ id, ...formData })).unwrap();
      } else {
        await dispatch(addAarti(formData)).unwrap();
      }
      navigate("/aarti");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // --- JSX remains the same ---
  return (
    <div className="content-wrapper p-4">
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <div>
          <span
            style={{ cursor: "pointer", color: "#0d6efd" }}
            onClick={() => navigate("/aarti")}
          >
            Aarti
          </span>{" "}
          / <span>{id ? "Edit Aarti" : "New Aarti"}</span>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => navigate("/aarti")}
        >
          <i className="fas fa-arrow-left me-2"></i> Back
        </button>
      </div>
      <div className="card shadow-sm p-4">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <h5 className="mb-3 text-primary">Aarti Details</h5>
              <div className="mb-3">
                <label className="form-label fw-bold">
                  Aarti Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g., Jai Ganesha Deva"
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
                  options={gods.map((god) => ({
                    value: god._id,
                    label: god.name,
                  }))}
                  value={
                    gods
                      .filter((god) => god._id === formData.master)
                      .map((god) => ({ value: god._id, label: god.name }))[0] ||
                    null
                  }
                  onChange={(option) =>
                    setFormData((prev) => ({
                      ...prev,
                      master: option?.value || "",
                    }))
                  }
                  placeholder="Select God Master..."
                />
                {errors.master && (
                  <div className="text-danger small mt-1">{errors.master}</div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">
                  God <span className="text-danger">*</span>
                </label>
                <Select
                  options={Gods.map((god) => ({
                    value: god._id,
                    label: god.name,
                  }))}
                  value={
                    Gods.filter(
                      (god) => god._id === formData.god
                    ).map((god) => ({ value: god._id, label: god.name }))[0] ||
                    null
                  }
                  onChange={(option) =>
                    setFormData((prev) => ({
                      ...prev,
                      god: option?.value || "",
                    }))
                  }
                  placeholder="Select God..."
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
                  options={staticLanguages.map((lang) => ({
                    value: lang._id,
                    label: `${lang.nativeName} (${lang.language})`,
                  }))}
                  value={
                    staticLanguages
                      .filter((lang) => lang._id === formData.language)
                      .map((lang) => ({
                        value: lang._id,
                        label: `${lang.nativeName} (${lang.language})`,
                      }))[0] || null
                  }
                  onChange={(option) =>
                    setFormData((prev) => ({
                      ...prev,
                      language: option?.value || "",
                    }))
                  }
                  placeholder="Select Language..."
                />
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
            <div className="col-md-6">
              <h5 className="mb-3 text-primary">Aarti Content</h5>
              <RichTextEditor
                value={formData.description}
                minHeight={350}
                maxHeight={350}
                onChange={(html) =>
                  setFormData((prev) => ({ ...prev, description: html }))
                }
                placeholder="Enter the full aarti text here..."
                error={errors.description}
              />
              {errors.description && (
                <div className="invalid-feedback d-block mt-2">
                  {errors.description}
                </div>
              )}
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate("/aarti")}
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
              {id ? "Update Aarti" : "Create Aarti"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
