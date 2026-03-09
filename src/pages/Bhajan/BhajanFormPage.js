import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

// Reusable Components
import RichTextEditor from "../../common/RichTextEditor";
import ReusableSelect from "../../common/ReusableSelect";
import FormActionButtons from "../../common/FormActionButtons";
import PageHeader from "../../common/PageHeader";
import RelatedContentSelector from "../../common/RelatedContentSelector";

import { uploadImage } from "../../services/uploadService";
import { staticLanguages } from "../../constants/languages";

import { useBhajan, useAddBhajan, useUpdateBhajan } from "../../hooks/useBhajans";
import { useAllGods } from "../../hooks/useGod";

export default function BhajanFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: allGods = [], isLoading: isLoadingGods } = useAllGods();

  const { data: fetchedBhajan, isLoading: isFetchingBhajan } = useBhajan(id);
  const addBhajanMutation = useAddBhajan();
  const updateBhajanMutation = useUpdateBhajan();

  const [formData, setFormData] = useState({
    name: "",
    sort: "",
    isActive: true,
    god: "",
    description: "",
    language: "",
    image: "",
    views: "0",
    share: "0",
    like: "0",
    relatedContent: [],
  });

  const [filteredGods, setFilteredGods] = useState([]);
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (id && fetchedBhajan) {
      setFormData({
        name: fetchedBhajan.name || "",
        sort: fetchedBhajan.sort || "",
        isActive: fetchedBhajan.isActive ?? true,
        god: fetchedBhajan.god?._id || fetchedBhajan.god || "",
        description: fetchedBhajan.description || "",
        language: fetchedBhajan.language || "",
        image: fetchedBhajan.image || "",
        views: fetchedBhajan.views || "0",
        share: fetchedBhajan.share || "0",
        like: fetchedBhajan.like || "0",
        relatedContent: fetchedBhajan.relatedContent?.map(item => ({
          refId: item.refId?._id || item.refId,
          refModel: item.refModel
        })) || [],
      });
    }
  }, [id, fetchedBhajan]);

  useEffect(() => {
    if (formData.language && Array.isArray(allGods)) {
      setFilteredGods(allGods.filter((god) => god.language === formData.language));
    } else {
      setFilteredGods([]);
    }
  }, [formData.language, allGods]);

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
      ...(name === "language" ? { god: "", relatedContent: [] } : {}),
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Bhajan name is required.";
    if (!formData.god) newErrors.god = "Please select a God.";
    if (!formData.language) newErrors.language = "Please select a language.";
    if (!formData.description.replace(/<[^>]*>?/gm, "").trim()) newErrors.description = "Content is required.";
    if (formData.sort === "" || isNaN(formData.sort)) newErrors.sort = "Sort order is required.";
    if (!formData.image) newErrors.image = "Bhajan image is required.";

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
        views: Number(formData.views),
        share: Number(formData.share),
        like: Number(formData.like),
      };

      if (id) {
        await updateBhajanMutation.mutateAsync({ id, ...payload });
      } else {
        await addBhajanMutation.mutateAsync(payload);
      }

      navigate("/bhajan");
    } catch (err) {
      console.error("Submission failed", err);
    }
  };

  const languageOptions = staticLanguages.map((l) => ({
    value: l._id,
    label: `${l.nativeName} (${l.language})`
  }));

  const godOptions = filteredGods.map((g) => ({
    value: g._id,
    label: g.name
  }));

  const isSaving = addBhajanMutation.isPending || updateBhajanMutation.isPending || isUploading;

  if (id && isFetchingBhajan) {
    return <div className="text-center p-5">Loading Bhajan Data...</div>;
  }

  return (
    <div className="content-wrapper p-4">
      <PageHeader
        breadcrumbTitle="Bhajans"
        breadcrumbLink="/bhajan"
        currentTitle={id ? "Edit Bhajan" : "New Bhajan"}
      />

      <div className="card shadow-sm mb-4">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row">
              <div className="col-md-6">
                <h5 className="mb-4 text-primary">Bhajan Metadata</h5>

                <div className="mb-3">
                  <label className="form-label fw-bold">Bhajan Name *</label>
                  <input
                    name="name"
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <ReusableSelect
                      label="Language"
                      name="language"
                      options={languageOptions}
                      value={formData.language}
                      onChange={handleSelectChange}
                      error={errors.language}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <ReusableSelect
                      label="God"
                      name="god"
                      options={godOptions}
                      value={formData.god}
                      onChange={handleSelectChange}
                      error={errors.god}
                      isDisabled={!formData.language || isLoadingGods}
                      placeholder={isLoadingGods ? "Loading Gods..." : (formData.language ? "Select God..." : "Select Language first...")}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Bhajan Image *</label>
                  <input type="file" className={`form-control ${errors.image ? "is-invalid" : ""}`} onChange={handleImageUpload} accept="image/*" disabled={isUploading} />
                  {formData.image && <img src={formData.image} alt="Preview" className="img-fluid rounded mt-2 border" style={{ maxHeight: "120px" }} />}
                  {errors.image && <div className="invalid-feedback d-block">{errors.image}</div>}
                </div>

                <div className="row">
                  <div className="col-md-3 mb-3">
                    <label className="form-label fw-bold">Sort Order *</label>
                    <input type="number" name="sort" className={`form-control ${errors.sort ? "is-invalid" : ""}`} value={formData.sort} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label fw-bold">Views</label>
                    <input type="number" name="views" className="form-control" value={formData.views} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label fw-bold">Shares</label>
                    <input type="number" name="share" className="form-control" value={formData.share} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label fw-bold">Likes</label>
                    <input type="number" name="like" className="form-control" value={formData.like} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="form-check form-switch mt-2">
                  <input className="form-check-input" type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} />
                  <label className="form-check-label fw-bold">is Active</label>
                </div>
              </div>

              <div className="col-md-6">
                <h5 className="mb-4 text-primary">Bhajan Lyrics / Content</h5>
                <div className="mb-3">
                  <RichTextEditor
                    value={formData.description}
                    onChange={(html) => setFormData(p => ({ ...p, description: html }))}
                    minHeight={400}
                  />
                  {errors.description && <div className="text-danger small mt-1">{errors.description}</div>}
                </div>
              </div>
            </div>

            <hr className="my-4" />

            <RelatedContentSelector
              languageId={formData.language}
              godId={formData.god}
              relatedContent={formData.relatedContent}
              onChange={handleSelectChange}
            />

            <FormActionButtons
              onCancel={() => navigate("/bhajan")}
              isLoading={isSaving}
              isEditing={!!id}
              entityName="Bhajan"
            />
          </form>
        </div>
      </div>
    </div>
  );
}