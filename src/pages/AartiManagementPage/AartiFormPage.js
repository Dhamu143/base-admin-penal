import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import RichTextEditor from "../../common/RichTextEditor";
import ReusableSelect from "../../common/ReusableSelect";
import FormActionButtons from "../../common/FormActionButtons";
import PageHeader from "../../common/PageHeader";
import RelatedContentSelector from "../../common/RelatedContentSelector";

import { uploadImage } from "../../services/uploadService";
import { useAarti, useAddAarti, useUpdateAarti } from "../../hooks/useAarti";
import { useAllGods } from "../../hooks/useGod";
import { staticLanguages } from "../../constants/languages";

export default function AartiFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: currentAarti, isLoading: isFetching } = useAarti(id);
  const addMutation = useAddAarti();
  const updateMutation = useUpdateAarti();

  const { data: allGods = [], isLoading: isLoadingGods } = useAllGods();

  const [formData, setFormData] = useState({
    name: "",
    sort: "",
    isActive: true,
    language: "",
    god: "",
    description: "",
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
    if (id && currentAarti) {
      setFormData({
        name: currentAarti.name || "",
        sort: currentAarti.sort || "",
        isActive: currentAarti.isActive ?? true,
        language: currentAarti.language || "",
        god: currentAarti.god?._id || currentAarti.god || "",
        description: currentAarti.description || "",
        image: currentAarti.image || "",
        views: currentAarti.views || "0",
        share: currentAarti.share || "0",
        like: currentAarti.like || "0",
        relatedContent: currentAarti.relatedContent?.map((item) => ({
          refId: item.refId?._id || item.refId,
          refModel: item.refModel,
        })) || [],
      });
    }
  }, [currentAarti, id]);

  useEffect(() => {
    if (formData.language && allGods.length > 0) {
      setFilteredGods(allGods.filter((g) => g.language === formData.language));
    } else {
      setFilteredGods([]);
    }
  }, [formData.language, allGods]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Aarti name is required.";
    if (!formData.language) newErrors.language = "Language is required.";
    if (!formData.god) newErrors.god = "God is required.";
    if (!formData.description.replace(/<[^>]*>?/gm, "").trim()) newErrors.description = "Content is required.";
    if (formData.sort === "" || isNaN(formData.sort)) newErrors.sort = "Sort order is required.";
    if (!formData.image) newErrors.image = "Image is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSelectChange = (name, value) => {
    if (name === "language") {
      setFormData((prev) => ({ ...prev, language: value, god: "", relatedContent: [] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadedUrl = await uploadImage(file);
      setFormData((prev) => ({ ...prev, image: uploadedUrl }));
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      ...formData,
      sort: Number(formData.sort),
      views: Number(formData.views),
      share: Number(formData.share),
      like: Number(formData.like),
    };

    try {
      if (id) {
        await updateMutation.mutateAsync({ id, ...payload });
        toast.success("Aarti updated successfully!");
      } else {
        await addMutation.mutateAsync(payload);
        toast.success("Aarti created successfully!");
      }
      navigate("/aarti");
    } catch (err) {
      // Errors handled by mutation hook
    }
  };

  if (id && isFetching) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

  const languageOptions = staticLanguages.map((l) => ({ value: l._id, label: l.nativeName }));
  const godOptions = filteredGods.map((g) => ({ value: g._id, label: g.name }));

  return (
    <div className="content-wrapper p-4">
      <PageHeader breadcrumbTitle="Aarti Management" breadcrumbLink="/aarti" currentTitle={id ? "Edit Aarti" : "New Aarti"} />

      <div className="card shadow-sm mb-4">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row">
              <div className="col-md-7">
                <h5 className="mb-4 text-primary">Aarti Details</h5>

                <div className="row">
                  <div className="col-md-6">
                    <ReusableSelect label="Language" name="language" options={languageOptions} value={formData.language} onChange={handleSelectChange} error={errors.language} required={true} />
                  </div>
                  <div className="col-md-6">
                    <ReusableSelect
                      label="God"
                      name="god"
                      options={godOptions}
                      value={formData.god}
                      onChange={handleSelectChange}
                      error={errors.god}
                      required={true}
                      isDisabled={!formData.language || isLoadingGods}
                      placeholder={isLoadingGods ? "Loading Gods..." : (formData.language ? "Select God..." : "Select Language first...")}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Aarti Name *</label>
                  <input type="text" name="name" className={`form-control ${errors.name ? "is-invalid" : ""}`} value={formData.name} onChange={handleInputChange} />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Image *</label>
                  <input type="file" className={`form-control ${errors.image ? "is-invalid" : ""}`} onChange={handleImageUpload} accept="image/*" disabled={isUploading} />
                  {formData.image && <img src={formData.image} alt="Preview" className="img-fluid rounded mt-2" style={{ maxHeight: "120px" }} />}
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

                <div className="form-check form-switch mb-3">
                  <input className="form-check-input" type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} />
                  <label className="form-check-label fw-bold">Active Status</label>
                </div>
              </div>

              <div className="col-md-5">
                <h5 className="mb-4 text-primary">Content</h5>
                <div className="mb-3">
                  <RichTextEditor
                    value={formData.description}
                    minHeight={350}
                    onChange={(html) => setFormData((prev) => ({ ...prev, description: html }))}
                  />
                  {errors.description && <div className="text-danger small mt-1">{errors.description}</div>}
                </div>
              </div>
            </div>

            <RelatedContentSelector
              languageId={formData.language}
              godId={formData.god}
              relatedContent={formData.relatedContent}
              onChange={handleSelectChange}
            />

            <FormActionButtons
              onCancel={() => navigate("/aarti")}
              isLoading={addMutation.isPending || updateMutation.isPending || isUploading}
              isEditing={!!id}
              entityName="Aarti"
            />
          </form>
        </div>
      </div>
    </div>
  );
}