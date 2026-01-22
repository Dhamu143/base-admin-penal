import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import RichTextEditor from "../../common/RichTextEditor";
import { staticLanguages } from "../../constants/languages";
import { useGod, useAddGod, useUpdateGod } from "../../hooks/useGod";
import { useGods as useMasterGodList } from "../../hooks/useGodmaster";

export default function GodFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: currentGod, isLoading: isGodLoading } = useGod(id);

  const { data: masterGodData } = useMasterGodList(1, 1000);
  const masterGods = masterGodData?.data?.data || [];

  const addMutation = useAddGod();
  const updateMutation = useUpdateGod();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sort: "",
    master: null,
    language: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id && currentGod) {
      setFormData({
        name: currentGod.name || "",
        description: currentGod.description || "",
        sort: currentGod.sort || "",
        master: typeof currentGod.master === "object"
          ? currentGod.master?._id
          : currentGod.master || null,
        language: typeof currentGod.language === "object"
          ? currentGod.language?._id
          : currentGod.language || "",
        isActive: currentGod.isActive !== undefined ? currentGod.isActive : true,
      });
    }
  }, [id, currentGod]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "God name is required.";
    if (!formData.language) newErrors.language = "Please select a language.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";
    if (formData.sort === "" || isNaN(Number(formData.sort)))
      newErrors.sort = "Sort order must be a valid number.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const masterGodOptions = useMemo(() => {
    if (!masterGods) return [];

    const options = masterGods.map((g) => ({ value: g._id, label: g.name }));

    if (formData.master && !options.find((o) => o.value === formData.master)) {
      if (currentGod?.master && typeof currentGod.master === 'object') {
        options.push({ value: currentGod.master._id, label: currentGod.master.name });
      }
    }
    return options;
  }, [masterGods, formData.master, currentGod]);

  const selectedMasterOption = useMemo(() => {
    return masterGodOptions.find((o) => o.value === formData.master) || null;
  }, [masterGodOptions, formData.master]);

  const getLanguageOption = (value) => {
    const lang = staticLanguages.find((l) => l._id === value);
    return lang
      ? { value: lang._id, label: `${lang.nativeName} (${lang.language})` }
      : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      ...formData,
      sort: Number(formData.sort),
      master: formData.master || null,
    };

    try {
      if (id) {
        await updateMutation.mutateAsync({ id, ...payload });
      } else {
        await addMutation.mutateAsync(payload);
      }
      navigate("/god");
    } catch (err) {
      // Error is handled in the hook's onError (toast)
    }
  };

  const isSaving = addMutation.isPending || updateMutation.isPending;

  if (id && isGodLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper p-4">
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <div>
          <span
            style={{ cursor: "pointer", color: "#0d6efd" }}
            onClick={() => navigate("/god")}
          >
            Gods
          </span>{" "}
          / <span>{id ? "Edit God" : "New God"}</span>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => navigate("/god")}
        >
          <i className="fas fa-arrow-left me-2"></i> Back
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row">
              <div className="col-md-6">
                <h5 className="mb-4 text-primary">God Details</h5>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className={`form-control ${errors.name ? "is-invalid" : ""
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
                    value={getLanguageOption(formData.language)}
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
                  <label className="form-label fw-bold">Master God</label>
                  <Select
                    options={masterGodOptions}
                    value={selectedMasterOption}
                    onChange={(option) =>
                      setFormData((prev) => ({
                        ...prev,
                        master: option?.value || null,
                      }))
                    }
                    placeholder="Select Master God..."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Sort Order <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    name="sort"
                    className={`form-control ${errors.sort ? "is-invalid" : ""
                      }`}
                    value={formData.sort}
                    onChange={handleFormChange}
                  />
                  {errors.sort && (
                    <div className="invalid-feedback">{errors.sort}</div>
                  )}
                </div>

                <div className="col-md-6 d-flex align-items-center pt-3">
                  <div className="form-check form-switch fs-5">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleFormChange}
                    />
                    <label className="form-check-label">Is Active</label>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <h5 className="mb-4 text-primary">Content & Settings</h5>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Description <span className="text-danger">*</span>
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

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary mr-4"
                onClick={() => navigate("/god")}
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
                  <i className="fas fa-save mr-2"></i>
                )}
                {id ? "Update God" : "Create God"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}