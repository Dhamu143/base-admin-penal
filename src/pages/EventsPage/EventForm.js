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

import { useEvent, useAddEvent, useUpdateEvent } from "../../hooks/useEvents";
import { useTemples } from "../../hooks/useTemple"; 
import { useGodsList } from "../../hooks/useGod"; 

export default function EventFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: fetchedEvent, isLoading: isFetchingEvent } = useEvent(id);
  const addMutation = useAddEvent();
  const updateMutation = useUpdateEvent();

  const [formData, setFormData] = useState({
    title: "",
    address: "",     // ✅ ADDED ADDRESS STATE
    isActive: true,
    description: "",
    language: "",
    god: "",       
    templeId: "",  
    startDate: null,
    endDate: null,
    image: "",
  });

  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  // 1. Language Options
  const languageOptions = staticLanguages.map((l) => ({
    value: l._id,
    label: `${l.nativeName} (${l.language})`,
  }));

  // 2. DEPENDENT FETCH: Fetch Gods ONLY for the selected language
  const { data: godsData, isFetching: isFetchingGods } = useGodsList({ 
    language: formData.language,
    isActive: true, 
    limit: 100 
  });
  
  const godOptions = (godsData?.data || godsData || []).map(g => ({
    value: g._id,
    label: g.name
  }));

  // 3. DEPENDENT FETCH: Fetch Temples ONLY when God & Language are selected
  const { data: templesData, isFetching: isFetchingTemples } = useTemples({
    god: formData.god,
    language: formData.language,
    isActive: true,
    limit: 100
  });
  
  const templeOptions = (templesData?.data || templesData || []).map(t => ({
    value: t._id,
    label: t.name
  }));

  useEffect(() => {
    if (id && fetchedEvent) {
      setFormData({
        title: fetchedEvent.title || "",
        address: fetchedEvent.address || "", // ✅ POPULATE ADDRESS ON EDIT
        isActive: fetchedEvent.isActive ?? true,
        description: fetchedEvent.description || "",
        language: fetchedEvent.language?._id || fetchedEvent.language || "",
        god: fetchedEvent.god?._id || fetchedEvent.god || "",
        templeId: fetchedEvent.templeId?._id || fetchedEvent.templeId || "",
        startDate: fetchedEvent.startDate ? new Date(fetchedEvent.startDate) : null,
        endDate: fetchedEvent.endDate ? new Date(fetchedEvent.endDate) : null,
        image: fetchedEvent.image || "",
      });
    }
  }, [id, fetchedEvent]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  }, [errors]);

  const handleSelectChange = (name, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      
      // CASCADE RESETS: 
      // If language changes -> reset God AND Temple
      if (name === 'language') {
        newData.god = "";
        newData.templeId = "";
      }
      // If god changes -> reset Temple only
      if (name === 'god') {
        newData.templeId = "";
      }
      
      return newData;
    });
    
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Event title is required.";
    if (!formData.language) newErrors.language = "Language is required.";
    if (!formData.startDate) newErrors.startDate = "Start date is required.";
    if (!formData.endDate) newErrors.endDate = "End date is required.";
    if (!formData.image) newErrors.image = "Event image is required.";
    if (!formData.description.replace(/<[^>]*>?/gm, "").trim()) newErrors.description = "Description is required.";

    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      newErrors.endDate = "End date cannot be before start date.";
    }

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
        startDate: formData.startDate ? formData.startDate.toISOString() : null,
        endDate: formData.endDate ? formData.endDate.toISOString() : null,
      };

      if (id) {
        await updateMutation.mutateAsync({ id, ...payload });
        toast.success("Event updated successfully!");
      } else {
        await addMutation.mutateAsync(payload);
        toast.success("Event created successfully!");
      }

      navigate("/events");
    } catch (err) {
      console.error("Error saving event:", err);
      toast.error(err.response?.data?.message || "Failed to save event");
    }
  };

  const isSaving = addMutation.isPending || updateMutation.isPending || isUploading;

  if (id && isFetchingEvent) {
    return <div className="text-center p-5">Loading Event Data...</div>;
  }

  return (
    <div className="content-wrapper p-4">
      <PageHeader
        breadcrumbTitle="Events"
        breadcrumbLink="/events"
        currentTitle={id ? "Edit Event" : "New Event"}
      />

      <div className="card shadow-sm mb-4">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row">
              <div className="col-md-6">
                <h5 className="mb-4 text-primary">Event Metadata</h5>

                <div className="mb-3">
                  <label className="form-label fw-bold">Event Title *</label>
                  <input
                    name="title"
                    className={`form-control ${errors.title ? "is-invalid" : ""}`}
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Maha Shivratri Celebration"
                  />
                  {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Language *</label>
                    <Select
                      options={languageOptions}
                      value={languageOptions.find((opt) => opt.value === formData.language) || null}
                      onChange={(opt) => handleSelectChange("language", opt ? opt.value : "")}
                      placeholder="Select Language..."
                    />
                    {errors.language && <div className="text-danger small mt-1">{errors.language}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Select God (Optional)</label>
                    <Select
                      options={godOptions}
                      value={godOptions.find((opt) => opt.value === formData.god) || null}
                      onChange={(opt) => handleSelectChange("god", opt ? opt.value : "")}
                      placeholder={!formData.language ? "Select Language first..." : "Select God..."}
                      isDisabled={!formData.language}
                      isLoading={isFetchingGods}
                      isClearable
                      noOptionsMessage={() => "No Gods found for this Language"}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Assign to Temple (Optional)</label>
                  <Select
                    options={templeOptions}
                    value={templeOptions.find((opt) => opt.value === formData.templeId) || null}
                    onChange={(opt) => handleSelectChange("templeId", opt ? opt.value : "")}
                    placeholder={
                      !formData.god || !formData.language 
                        ? "Select Language & God first..." 
                        : "Select Temple..."
                    }
                    isDisabled={!formData.god || !formData.language}
                    isLoading={isFetchingTemples}
                    isClearable
                    noOptionsMessage={() => "No temples found for this God and Language"}
                  />
                </div>

                {/* ✅ ADDED EVENT ADDRESS / LOCATION FIELD */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Event Address / Location (Optional)</label>
                  <input
                    name="address"
                    className="form-control"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g., Main Courtyard, Kashi Vishwanath Temple, Varanasi"
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Start Date & Time *</label>
                    <div className="custom-datepicker-container">
                      <DatePicker
                        selected={formData.startDate}
                        onChange={(date) => handleSelectChange("startDate", date)}
                        dateFormat="dd-MM-yyyy h:mm aa"
                        showTimeSelect
                        className={`form-control ${errors.startDate ? "is-invalid" : ""}`}
                        placeholderText="Select start date"
                      />
                    </div>
                    {errors.startDate && <div className="text-danger small mt-1">{errors.startDate}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">End Date & Time *</label>
                    <div className="custom-datepicker-container">
                      <DatePicker
                        selected={formData.endDate}
                        onChange={(date) => handleSelectChange("endDate", date)}
                        dateFormat="dd-MM-yyyy h:mm aa"
                        showTimeSelect
                        className={`form-control ${errors.endDate ? "is-invalid" : ""}`}
                        placeholderText="Select end date"
                      />
                    </div>
                    {errors.endDate && <div className="text-danger small mt-1">{errors.endDate}</div>}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Event Image Banner *</label>
                  <input 
                    type="file" 
                    className={`form-control ${errors.image ? "is-invalid" : ""}`} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    disabled={isUploading} 
                  />
                  {formData.image && <img src={formData.image} alt="Preview" className="img-fluid rounded mt-2 border" style={{ maxHeight: "120px" }} />}
                  {errors.image && <div className="invalid-feedback d-block">{errors.image}</div>}
                </div>

                <div className="row">
                  <div className="col-md-12 d-flex align-items-center mt-3">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} />
                      <label className="form-check-label fw-bold ms-2">Status Active</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <h5 className="mb-4 text-primary">Event Description</h5>
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
              onCancel={() => navigate("/events")}
              isLoading={isSaving}
              isEditing={!!id}
              entityName="Event"
            />
          </form>
        </div>
      </div>
    </div>
  );
}