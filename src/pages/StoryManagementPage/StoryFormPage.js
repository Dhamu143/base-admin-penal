import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import RichTextEditor from "../../common/RichTextEditor";
import ReusableSelect from "../../common/ReusableSelect";
import FormActionButtons from "../../common/FormActionButtons";
import PageHeader from "../../common/PageHeader";
import RelatedContentSelector from "../../common/RelatedContentSelector";

import { uploadImage } from "../../services/uploadService";
import { staticLanguages } from "../../constants/languages";

import { useStory, useAddStory, useUpdateStory } from "../../hooks/useStory";
import { useAllGods } from "../../hooks/useGod";
export default function StoryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: allGods = [], isLoading: isLoadingGods } = useAllGods();

  const { data: fetchedStory, isLoading: isFetchingStory } = useStory(id);
  const addStoryMutation = useAddStory();
  const updateStoryMutation = useUpdateStory();

  const [formData, setFormData] = useState({
    name: "",
    sort: "",
    isActive: true,
    language: "",
    god: "",
    description: "",
    image: "",
    views: "",
    share: "",
    like: "",
    relatedContent: [],
  });

  const [filteredGods, setFilteredGods] = useState([]);
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (id && fetchedStory) {
      setFormData({
        name: fetchedStory.name || "",
        sort: fetchedStory.sort || "",
        isActive: fetchedStory.isActive ?? true,
        language: fetchedStory.language || "",
        god: fetchedStory.god?._id || fetchedStory.god || "",
        description: fetchedStory.description || "",
        image: fetchedStory.image || "",
        views: fetchedStory.views || "",
        share: fetchedStory.share || "",
        like: fetchedStory.like || "",
        relatedContent: fetchedStory.relatedContent?.map((item) => ({
          refId: item.refId?._id || item.refId,
          refModel: item.refModel,
        })) || [],
      });
    }
  }, [id, fetchedStory]);

  useEffect(() => {
    if (formData.language && Array.isArray(allGods)) {
      setFilteredGods(allGods.filter((g) => g.language === formData.language));
    } else {
      setFilteredGods([]);
    }
  }, [formData.language, allGods]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Story title is required.";
    if (!formData.language) newErrors.language = "Please select a language.";
    if (!formData.god) newErrors.god = "Please select a God.";
    if (!formData.description.replace(/<[^>]*>?/gm, "").trim()) newErrors.description = "Description / Content is required.";
    if (formData.sort === "" || isNaN(Number(formData.sort))) newErrors.sort = "Sort order must be a valid number.";
    if (!formData.image) newErrors.image = "Story image is required.";

    if (formData.views !== "" && isNaN(Number(formData.views))) newErrors.views = "Views must be a valid number.";
    if (formData.share !== "" && isNaN(Number(formData.share))) newErrors.share = "Share count must be a valid number.";
    if (formData.like !== "" && isNaN(Number(formData.like))) newErrors.like = "Like count must be a valid number.";

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
      setErrors((prev) => ({ ...prev, image: null }));
      toast.success("Image uploaded successfully!");
    } catch (err) {
      toast.error("Image upload failed. Please try again.");
      console.error("Image upload error:", err);
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
        sort: Number(formData.sort) || 0,
        views: Number(formData.views) || 0,
        share: Number(formData.share) || 0,
        like: Number(formData.like) || 0,
      };

      if (id) {
        await updateStoryMutation.mutateAsync({ id, ...payload });
      } else {
        await addStoryMutation.mutateAsync(payload);
      }

      navigate("/story");
    } catch (err) {
      console.error("Error saving story:", err);
    }
  };

  const languageOptions = staticLanguages.map((l) => ({ value: l._id, label: `${l.nativeName} (${l.language})` }));
  const godOptions = filteredGods.map((g) => ({ value: g._id, label: g.name }));

  const isSaving = addStoryMutation.isPending || updateStoryMutation.isPending || isUploading;

  if (id && isFetchingStory) {
    return <div className="text-center p-5">Loading Story Data...</div>;
  }

  return (
    <div className="content-wrapper p-4">
      <PageHeader breadcrumbTitle="Story" breadcrumbLink="/story" currentTitle={id ? "Edit Story" : "New Story"} />

      <div className="card shadow-sm mb-4">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row">
              <div className="col-md-6">
                <h5 className="mb-4 text-primary">Story Details</h5>

                <div className="mb-3">
                  <label className="form-label fw-bold">Story Title <span className="text-danger">*</span></label>
                  <input type="text" name="name" className={`form-control ${errors.name ? "is-invalid" : ""}`} value={formData.name} onChange={handleInputChange} placeholder="Enter story title" />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <ReusableSelect label="Language" name="language" options={languageOptions} value={formData.language} onChange={handleSelectChange} error={errors.language} required={true} />

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

                <div className="mb-3">
                  <label className="form-label fw-bold">Story Image <span className="text-danger">*</span></label>
                  <input type="file" className={`form-control ${errors.image ? "is-invalid" : ""}`} onChange={handleImageUpload} accept="image/*" disabled={isUploading || isSaving} />
                  {isUploading && <div className="text-primary small mt-1">Uploading...</div>}
                  {errors.image && <div className="invalid-feedback d-block">{errors.image}</div>}
                  {formData.image && !isUploading && (
                    <div className="mt-2">
                      <img src={formData.image} alt="Story Preview" className="img-fluid rounded border" style={{ maxHeight: "150px" }} />
                    </div>
                  )}
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Sort Order <span className="text-danger">*</span></label>
                    <input type="number" name="sort" className={`form-control ${errors.sort ? "is-invalid" : ""}`} value={formData.sort} onChange={handleInputChange} />
                    {errors.sort && <div className="invalid-feedback">{errors.sort}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Views</label>
                    <input type="number" name="views" className="form-control" value={formData.views} onChange={handleInputChange} placeholder="e.g., 100" />
                    {errors.views && <div className="invalid-feedback">{errors.views}</div>}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Share</label>
                    <input type="number" name="share" className="form-control" value={formData.share} onChange={handleInputChange} placeholder="e.g., 50" />
                    {errors.share && <div className="invalid-feedback">{errors.share}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Like</label>
                    <input type="number" name="like" className="form-control" value={formData.like} onChange={handleInputChange} placeholder="e.g., 200" />
                    {errors.like && <div className="invalid-feedback">{errors.like}</div>}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="form-check form-switch fs-5">
                    <input className="form-check-input" type="checkbox" role="switch" name="isActive" checked={formData.isActive} onChange={handleInputChange} />
                    <label className="form-check-label">is Active</label>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <h5 className="mb-4 text-primary">Content</h5>
                <div className="mb-3">
                  <label className="form-label fw-bold">Description / Content <span className="text-danger">*</span></label>
                  <RichTextEditor value={formData.description} minHeight={350} maxHeight={350} onChange={(html) => setFormData((prev) => ({ ...prev, description: html }))} placeholder="Enter the full story here..." />
                  {errors.description && <div className="invalid-feedback d-block mt-1">{errors.description}</div>}
                </div>
              </div>
            </div>

            <RelatedContentSelector
              languageId={formData.language}
              relatedContent={formData.relatedContent}
              onChange={handleSelectChange}
            />

            <FormActionButtons onCancel={() => navigate("/story")} isLoading={isSaving} isEditing={!!id} entityName="Story" />

          </form>
        </div>
      </div>
    </div>
  );
}