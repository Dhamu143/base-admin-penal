import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import RichTextEditor from "../../common/RichTextEditor";
import ReusableSelect from "../../common/ReusableSelect";
import FormActionButtons from "../../common/FormActionButtons";
import PageHeader from "../../common/PageHeader";
import RelatedContentSelector from "../../common/RelatedContentSelector";

import { uploadImage } from "../../services/uploadService";
import { staticLanguages } from "../../constants/languages";

import { useTemple, useAddTemple, useUpdateTemple } from "../../hooks/useTemple";
import { useAllGods } from "../../hooks/useGod";

export default function TempleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: templeData, isLoading: isLoadingTemple } = useTemple(id);
  const { data: allGods = [], isLoading: isLoadingGods } = useAllGods();
  const addTempleMutation = useAddTemple();
  const updateTempleMutation = useUpdateTemple();

  const [formData, setFormData] = useState({
    name: "",
    sort: "",
    isActive: true,
    isFamous: false,
    god: "",
    language: "",
    description: "",
    address: "",
    files: "",
    openTime: "",
    closeTime: "",
    latitude: "",
    longitude: "",
    rating: "0",
    relatedContent: [],
  });

  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (id && templeData) {
      setFormData({
        name: templeData.name || "",
        sort: templeData.sort || "",
        isActive: templeData.isActive ?? true,
        isFamous: templeData.isFamous === true,
        god: templeData.god?._id || templeData.god || "",
        language: templeData.language || "",
        description: templeData.description || "",
        address: templeData.address || "",
        files: templeData.files || "",
        openTime: templeData.openTime || "",
        closeTime: templeData.closeTime || "",
        latitude: templeData.location?.coordinates?.[1] || "",
        longitude: templeData.location?.coordinates?.[0] || "",
        rating: templeData.rating || "0",
        relatedContent: templeData.relatedContent?.map((item) => ({
          refId: item.refId?._id || item.refId,
          refModel: item.refModel,
        })) || [],
      });
    }
  }, [id, templeData]);

  const filteredGods = useMemo(() => {
    if (!formData.language || !Array.isArray(allGods)) return [];
    return allGods.filter((g) => g.language === formData.language);
  }, [formData.language, allGods]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Temple name is required.";
    if (!formData.god) newErrors.god = "Please select a God.";
    if (!formData.language) newErrors.language = "Please select a language.";
    if (!formData.description.replace(/<[^>]*>?/gm, "").trim()) newErrors.description = "Description is required.";
    if (!formData.address.trim()) newErrors.address = "Address is required.";
    if (!formData.openTime) newErrors.openTime = "Open time is required.";
    if (!formData.closeTime) newErrors.closeTime = "Close time is required.";

    if (formData.sort === "" || isNaN(Number(formData.sort))) {
      newErrors.sort = "Sort order must be a valid number.";
    }

    const lat = Number(formData.latitude);
    const lng = Number(formData.longitude);
    if (formData.latitude === "" || isNaN(lat) || lat < -90 || lat > 90) {
      newErrors.latitude = "Invalid Latitude (-90 to 90).";
    }
    if (formData.longitude === "" || isNaN(lng) || lng < -180 || lng > 180) {
      newErrors.longitude = "Invalid Longitude (-180 to 180).";
    }

    const ratingNum = Number(formData.rating);
    if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      newErrors.rating = "Rating must be between 0 and 5.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => {
      const updates = { ...prev, [name]: value };
      if (name === "language") {
        updates.god = ""; 
        updates.relatedContent = [];
      }
      return updates;
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadedUrl = await uploadImage(file);
      setFormData((prev) => ({ ...prev, files: uploadedUrl }));
      toast.success("Image uploaded!");
    } catch {
      toast.error("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the validation errors.");
      return;
    }

    const payload = {
      ...formData,
      sort: Number(formData.sort),
      rating: Number(formData.rating),
      location: {
        type: "Point",
        coordinates: [Number(formData.longitude), Number(formData.latitude)],
      },
    };

    const mutation = id ? updateTempleMutation : addTempleMutation;

    mutation.mutate(id ? { id, ...payload } : payload, {
      onSuccess: () => {
        navigate("/temple");
      }
    });
  };

  const languageOptions = staticLanguages.map((l) => ({ value: l._id, label: l.nativeName }));
  const godOptions = filteredGods.map((g) => ({ value: g._id, label: g.name }));

  if (id && isLoadingTemple) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div><p className="mt-2">Loading temple data...</p></div>;

  return (
    <div className="content-wrapper p-4">
      <PageHeader breadcrumbTitle="Temples" breadcrumbLink="/temple" currentTitle={id ? "Edit Temple" : "New Temple"} />

      <div className="card shadow-sm mb-4">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row">
              <div className="col-md-7">
                <h5 className="mb-4 text-primary">Temple Information</h5>

                <div className="row">
                  <div className="col-md-6">
                    <ReusableSelect label="Language" name="language" options={languageOptions} value={formData.language} onChange={handleSelectChange} error={errors.language} required />
                  </div>
                  <div className="col-md-6">
                    <ReusableSelect label="God" name="god" options={godOptions} value={formData.god} onChange={handleSelectChange} error={errors.god} required isDisabled={!formData.language || isLoadingGods} placeholder="Select God..." />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Temple Name *</label>
                  <input type="text" name="name" className={`form-control ${errors.name ? "is-invalid" : ""}`} value={formData.name} onChange={handleInputChange} />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Open Time *</label>
                    <input type="time" name="openTime" className={`form-control ${errors.openTime ? "is-invalid" : ""}`} value={formData.openTime} onChange={handleInputChange} />
                    {errors.openTime && <div className="invalid-feedback d-block">{errors.openTime}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Close Time *</label>
                    <input type="time" name="closeTime" className={`form-control ${errors.closeTime ? "is-invalid" : ""}`} value={formData.closeTime} onChange={handleInputChange} />
                    {errors.closeTime && <div className="invalid-feedback d-block">{errors.closeTime}</div>}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Address *</label>
                  <textarea name="address" className={`form-control ${errors.address ? "is-invalid" : ""}`} value={formData.address} onChange={handleInputChange} rows="2"></textarea>
                  {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Temple Image</label>
                  <input type="file" className="form-control" onChange={handleImageUpload} accept="image/*" disabled={isUploading || addTempleMutation.isPending || updateTempleMutation.isPending} />
                  {formData.files && (
                    <div className="mt-2 position-relative d-inline-block">
                      <img src={formData.files} alt="Preview" className="img-fluid rounded border" style={{ maxHeight: "150px" }} />
                    </div>
                  )}
                </div>
              </div>

              <div className="col-md-5">
                <h5 className="mb-4 text-primary">Location & Settings</h5>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Latitude *</label>
                    <input type="number" name="latitude" step="any" className={`form-control ${errors.latitude ? "is-invalid" : ""}`} value={formData.latitude} onChange={handleInputChange} />
                    {errors.latitude && <div className="invalid-feedback">{errors.latitude}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Longitude *</label>
                    <input type="number" name="longitude" step="any" className={`form-control ${errors.longitude ? "is-invalid" : ""}`} value={formData.longitude} onChange={handleInputChange} />
                    {errors.longitude && <div className="invalid-feedback">{errors.longitude}</div>}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Sort Order *</label>
                    <input type="number" name="sort" className={`form-control ${errors.sort ? "is-invalid" : ""}`} value={formData.sort} onChange={handleInputChange} />
                    {errors.sort && <div className="invalid-feedback">{errors.sort}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Rating (0-5)</label>
                    <input type="number" name="rating" step="0.1" className={`form-control ${errors.rating ? "is-invalid" : ""}`} value={formData.rating} onChange={handleInputChange} />
                    {errors.rating && <div className="invalid-feedback">{errors.rating}</div>}
                  </div>
                </div>

                <div className="d-flex gap-4 mb-4 mt-2">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" name="isActive" id="isActive" checked={formData.isActive} onChange={handleInputChange} />
                    <label className="form-check-label fw-bold" htmlFor="isActive">Active Status</label>
                  </div>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" name="isFamous" id="isFamous" checked={formData.isFamous} onChange={handleInputChange} />
                    <label className="form-check-label fw-bold" htmlFor="isFamous">Famous Temple</label>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Description *</label>
                  <RichTextEditor
                    value={formData.description}
                    minHeight={200}
                    onChange={(html) => setFormData((prev) => ({ ...prev, description: html }))}
                  />
                  {errors.description && <div className="text-danger small mt-1 d-block">{errors.description}</div>}
                </div>
              </div>
            </div>

            <hr className="my-4" />

            <RelatedContentSelector
              languageId={formData.language}
              relatedContent={formData.relatedContent}
              onChange={handleSelectChange}
            />

            <FormActionButtons
              onCancel={() => navigate("/temple")}
              isLoading={addTempleMutation.isPending || updateTempleMutation.isPending || isUploading}
              isEditing={!!id}
              entityName="Temple"
            />
          </form>
        </div>
      </div>
    </div>
  );
}