import React, { useState, useEffect } from "react";
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

import { useNews, useAddNews, useUpdateNews } from "../../hooks/useNews";
import { useAllGods } from "../../hooks/useGod"; 

export default function NewsFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: allGods = [], isLoading: isLoadingGods } = useAllGods();

  const { data: newsData, isLoading: isFetchingNews } = useNews(id);
  const { mutateAsync: createNews, isPending: isAdding } = useAddNews();
  const { mutateAsync: updateNewsMutate, isPending: isUpdating } = useUpdateNews();

  const [formData, setFormData] = useState({
    name: "",
    sort: "",
    isActive: true,
    god: "",
    description: "",
    language: "",
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
    if (id && newsData) {
      setFormData({
        name: newsData.name || "",
        sort: newsData.sort || "",
        isActive: newsData.isActive ?? true,
        god: newsData.god?._id || newsData.god || "",
        description: newsData.description || "",
        language: newsData.language || "",
        image: newsData.image || newsData.files || "",
        views: newsData.views || "",
        share: newsData.share || "",
        like: newsData.like || "",
        relatedContent: newsData.relatedContent?.map((item) => ({
          refId: item.refId?._id || item.refId,
          refModel: item.refModel,
        })) || [],
      });
    }
  }, [id, newsData]);

  useEffect(() => {
    if (formData.language && allGods?.length > 0) {
      setFilteredGods(allGods.filter((g) => g.language === formData.language));
    } else {
      setFilteredGods([]);
    }
  }, [formData.language, allGods]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "News title is required.";
    if (!formData.god) newErrors.god = "Please select a God.";
    if (!formData.language) newErrors.language = "Please select a language.";
    if (!formData.description.replace(/<[^>]*>?/gm, "").trim()) newErrors.description = "News content is required.";
    if (formData.sort === "" || isNaN(formData.sort)) newErrors.sort = "Sort order must be a valid number.";
    if (!formData.image) newErrors.image = "News image is required.";

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
      setErrors((prev) => ({ ...prev, image: null }));
      toast.success("Image uploaded successfully!");
    } catch (err) {
      toast.error("Image upload failed.");
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
        files: formData.image
      };

      if (id) {
        await updateNewsMutate({ id, ...payload });
      } else {
        await createNews(payload);
      }
      navigate("/news");
    } catch (err) {
      console.error("Failed to save:", err);
    }
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

  const languageOptions = staticLanguages.map((l) => ({ value: l._id, label: `${l.nativeName} (${l.language})` }));
  const godOptions = filteredGods.map((g) => ({ value: g._id, label: g.name }));

  const isSaving = isAdding || isUpdating || isUploading;

  if (id && isFetchingNews) {
    return (
      <div className="content-wrapper p-4 d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="content-wrapper p-4">
      <PageHeader breadcrumbTitle="News" breadcrumbLink="/news" currentTitle={id ? "Edit News" : "New News"} />

      <div className="card shadow-sm mb-4">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row">
              <div className="col-md-6">
                <h5 className="mb-4 text-primary">News Details</h5>

                <div className="mb-3">
                  <label className="form-label fw-bold">News Title <span className="text-danger">*</span></label>
                  <input type="text" name="name" className={`form-control ${errors.name ? "is-invalid" : ""}`} value={formData.name} onChange={handleInputChange} />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <ReusableSelect label="Language" name="language" options={languageOptions} value={formData.language} onChange={handleSelectChange} error={errors.language} required={true} />
                  </div>
                  <div className="col-md-6 mb-3">
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
                  <label className="form-label fw-bold">News Image <span className="text-danger">*</span></label>
                  <input type="file" className={`form-control ${errors.image ? "is-invalid" : ""}`} onChange={handleImageUpload} accept="image/*" disabled={isUploading} />
                  {isUploading && <div className="text-primary small mt-1">Uploading...</div>}
                  {errors.image && <div className="invalid-feedback d-block">{errors.image}</div>}
                  {formData.image && !isUploading && (
                    <div className="mt-2">
                      <img src={formData.image} alt="Preview" className="img-fluid rounded border" style={{ maxHeight: "150px" }} />
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
                    <input type="number" name="views" className="form-control" value={formData.views} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Share</label>
                    <input type="number" name="share" className="form-control" value={formData.share} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Like</label>
                    <input type="number" name="like" className="form-control" value={formData.like} onChange={handleInputChange} />
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
                  <label className="form-label fw-bold">Description / Story <span className="text-danger">*</span></label>
                  <RichTextEditor value={formData.description} onChange={(html) => setFormData((prev) => ({ ...prev, description: html }))} />
                  {errors.description && <div className="invalid-feedback d-block mt-1">{errors.description}</div>}
                </div>
              </div>
            </div>

            <RelatedContentSelector
              languageId={formData.language}
              godId={formData.god}
              relatedContent={formData.relatedContent}
              onChange={handleSelectChange}
            />

            <FormActionButtons onCancel={() => navigate("/news")} isLoading={isSaving} isEditing={!!id} entityName="News" />
          </form>
        </div>
      </div>
    </div>
  );
}