import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";

// Reusable Components
import RichTextEditor from "../../common/RichTextEditor";
import FormActionButtons from "../../common/FormActionButtons";
import PageHeader from "../../common/PageHeader";

import { uploadImage } from "../../services/uploadService";
import { staticLanguages } from "../../constants/languages";
import { indianStates } from "../../common/indianStates";

import { useFestival, useAddFestival, useUpdateFestival } from "../../hooks/useFestival";

export default function FestivalFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: fetchedFestival, isLoading: isFetchingFestival } = useFestival(id);
  const addMutation = useAddFestival();
  const updateMutation = useUpdateFestival();

  const [formData, setFormData] = useState({
    name: "",
    sort: "",
    isActive: true,
    description: "",
    language: "",
    date: null,
    image: "",
    isVrat: false,
    state: [],
    tag: "",
    relatedContent: [],
  });

  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  // ✅ Ensure state options are correctly formatted as { value, label } for react-select
  const stateOptions = indianStates.map((state) =>
    typeof state === "string" ? { value: state, label: state } : state
  );

  // ✅ Ensure language options are formatted correctly
  const languageOptions = staticLanguages.map((l) => ({
    value: l._id,
    label: `${l.nativeName} (${l.language})`,
  }));

  useEffect(() => {
    if (id && fetchedFestival) {
      setFormData({
        name: fetchedFestival.name || "",
        sort: fetchedFestival.sort || "",
        isActive: fetchedFestival.isActive ?? true,
        description: fetchedFestival.description || "",
        language: fetchedFestival.language?._id || fetchedFestival.language || "",
        date: fetchedFestival.date ? new Date(fetchedFestival.date) : null,
        image: fetchedFestival.image || "",
        isVrat: fetchedFestival.isVrat ?? false,
        state: Array.isArray(fetchedFestival.state)
          ? fetchedFestival.state
          : (fetchedFestival.state ? [fetchedFestival.state] : []),
        tag: fetchedFestival.tag || "",
        relatedContent: fetchedFestival.relatedContent?.map((item) => ({
          refId: item.refId?._id || item.refId,
          refModel: item.refModel,
        })) || [],
      });
    }
  }, [id, fetchedFestival]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  }, [errors]);

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "language" ? { relatedContent: [] } : {}),
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Festival name is required.";
    if (!formData.language) newErrors.language = "Language is required.";
    if (!formData.state || formData.state.length === 0) newErrors.state = "At least one state is required.";
    if (!formData.date) newErrors.date = "Festival date is required.";
    if (!formData.image) newErrors.image = "Festival image is required.";
    if (formData.sort === "" || isNaN(formData.sort)) newErrors.sort = "Sort order is required.";
    if (!formData.description.replace(/<[^>]*>?/gm, "").trim()) newErrors.description = "Description is required.";

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
      toast.success("Image uploaded!");
    } catch {
      toast.error("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        ...formData,
        sort: Number(formData.sort),
        date: formData.date ? formData.date.toISOString() : null,
      };

      if (id) {
        await updateMutation.mutateAsync({ id, ...payload });
      } else {
        await addMutation.mutateAsync(payload);
      }

      navigate("/festival");
    } catch (err) {
      console.error("Error saving festival:", err);
    }
  };

  const isSaving = addMutation.isPending || updateMutation.isPending || isUploading;

  if (id && isFetchingFestival) {
    return <div className="text-center p-5">Loading Festival Data...</div>;
  }

  return (
    <div className="content-wrapper p-4">
      <PageHeader
        breadcrumbTitle="Festivals"
        breadcrumbLink="/festival"
        currentTitle={id ? "Edit Festival" : "New Festival"}
      />

      <div className="card shadow-sm mb-4">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row">
              <div className="col-md-6">
                <h5 className="mb-4 text-primary">Festival Metadata</h5>

                <div className="mb-3">
                  <label className="form-label fw-bold">Festival Name *</label>
                  <input
                    name="name"
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Diwali"
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Date *</label>
                    <div className="custom-datepicker-container">
                      <DatePicker
                        selected={formData.date}
                        onChange={(date) => handleSelectChange("date", date)}
                        dateFormat="dd-MM-yyyy"
                        className={`form-control ${errors.date ? "is-invalid" : ""}`}
                        placeholderText="Select date"
                      />
                    </div>
                    {errors.date && <div className="text-danger small mt-1">{errors.date}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Language *</label>
                    <Select
                      options={languageOptions}
                      value={languageOptions.find((opt) => opt.value === formData.language) || null}
                      onChange={(selectedOption) => {
                        handleSelectChange("language", selectedOption ? selectedOption.value : "");
                      }}
                      placeholder="Select Language..."
                      classNamePrefix="react-select"
                    />
                    {errors.language && <div className="text-danger small mt-1">{errors.language}</div>}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">State *</label>
                    <Select
                      isMulti
                      options={stateOptions}
                      // matches the strings saved in state to the full object from options
                      value={stateOptions.filter((opt) => formData.state.includes(opt.value))}
                      onChange={(selectedOptions) => {
                        // Extracts only the strings to save to formData.state
                        const values = selectedOptions ? selectedOptions.map((opt) => opt.value) : [];
                        handleSelectChange("state", values);
                      }}
                      placeholder="Select States..."
                      classNamePrefix="react-select"
                    />
                    {errors.state && <div className="text-danger small mt-1">{errors.state}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Tag</label>
                    <input
                      name="tag"
                      className="form-control"
                      value={formData.tag}
                      onChange={handleInputChange}
                      placeholder="e.g., Popular"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Festival Image *</label>
                  <input type="file" className={`form-control ${errors.image ? "is-invalid" : ""}`} onChange={handleImageUpload} accept="image/*" disabled={isUploading} />
                  {formData.image && <img src={formData.image} alt="Preview" className="img-fluid rounded mt-2 border" style={{ maxHeight: "120px" }} />}
                  {errors.image && <div className="invalid-feedback d-block">{errors.image}</div>}
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label fw-bold">Sort Order *</label>
                    <input type="number" name="sort" className={`form-control ${errors.sort ? "is-invalid" : ""}`} value={formData.sort} onChange={handleInputChange} />
                    {errors.sort && <div className="invalid-feedback">{errors.sort}</div>}
                  </div>
                  <div className="col-md-8 d-flex align-items-center mt-3">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} />
                      <label className="form-check-label fw-bold">Status Active</label>
                    </div>
                  </div>
                  <div className="col-md-4 d-flex align-items-center mt-3">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" name="isVrat" checked={formData.isVrat} onChange={handleInputChange} />
                      <label className="form-check-label fw-bold ms-2">Is Vrat (Fast)?</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <h5 className="mb-4 text-primary">Festival Description</h5>
                <div className="mb-3">
                  <RichTextEditor
                    value={formData.description}
                    onChange={(html) => setFormData((p) => ({ ...p, description: html }))}
                    minHeight={420}
                  />
                  {errors.description && <div className="text-danger small mt-1">{errors.description}</div>}
                </div>
              </div>
            </div>

            <hr className="my-4" />

            <FormActionButtons
              onCancel={() => navigate("/festival")}
              isLoading={isSaving}
              isEditing={!!id}
              entityName="Festival"
            />
          </form>
        </div>
      </div>
    </div>
  );
}