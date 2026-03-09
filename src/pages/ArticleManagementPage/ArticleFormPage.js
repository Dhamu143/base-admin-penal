import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import RichTextEditor from "../../common/RichTextEditor";
import ReusableSelect from "../../common/ReusableSelect";
import FormActionButtons from "../../common/FormActionButtons";
import PageHeader from "../../common/PageHeader";
import RelatedContentSelector from "../../common/RelatedContentSelector";

import { uploadImage } from "../../services/uploadService";
import { useArticle, useAddArticle, useUpdateArticle } from "../../hooks/useArticles";
import { useAllGods } from "../../hooks/useGod";
import { staticLanguages } from "../../constants/languages";

export default function ArticleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: articleData, isLoading: isFetching } = useArticle(id);
  const addMutation = useAddArticle();
  const updateMutation = useUpdateArticle();

  const { data: allGods = [], isLoading: isLoadingGods } = useAllGods();

  const [formData, setFormData] = useState({
    title: "",
    shortdesc: "",
    longdesc: "",
    sort: "",
    isActive: true,
    isFree: true,
    god: "",
    language: "",
    featureimage: "",
    views: "0",
    share: "0",
    like: "0",
    isGlobal: false,
    relatedContent: [],
  });

  const [filteredGods, setFilteredGods] = useState([]);
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (formData.language && allGods.length > 0) {
      setFilteredGods(allGods.filter((g) => g.language === formData.language));
    } else {
      setFilteredGods([]);
    }
  }, [formData.language, allGods]);

  useEffect(() => {
    if (articleData && id) {
      setFormData({
        title: articleData.title || "",
        shortdesc: articleData.shortdesc || "",
        longdesc: articleData.longdesc || "",
        sort: articleData.sort || "",
        isActive: articleData.isActive ?? true,
        isFree: articleData.isFree ?? true,
        god: articleData.god?._id || articleData.god || "",
        language: articleData.language?._id || articleData.language || "",
        featureimage: articleData.featureimage || "",
        isGlobal: !!articleData.isGlobal,
        views: articleData.views || "0",
        share: articleData.share || "0",
        like: articleData.like || "0",
        relatedContent: articleData.relatedContent?.map((item) => ({
          refId: item.refId?._id || item.refId,
          refModel: item.refModel,
        })) || [],
      });
    }
  }, [articleData, id]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "isGlobal" && checked ? { god: "" } : {}),
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
    if (!formData.title.trim()) newErrors.title = "Article title is required.";
    if (!formData.language) newErrors.language = "Language is required.";
    if (!formData.isGlobal && !formData.god) newErrors.god = "God is required.";
    if (!formData.longdesc.replace(/<[^>]*>?/gm, "").trim()) newErrors.longdesc = "Full content is required.";
    if (formData.sort === "" || isNaN(formData.sort)) newErrors.sort = "Sort order is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const uploadedUrl = await uploadImage(file);
      setFormData((prev) => ({ ...prev, featureimage: uploadedUrl }));
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

    const payload = {
      ...formData,
      sort: Number(formData.sort),
      views: Number(formData.views),
      share: Number(formData.share),
      like: Number(formData.like),
      god: formData.isGlobal ? null : formData.god,
    };

    try {
      if (id) {
        await updateMutation.mutateAsync({ id, ...payload });
        toast.success("Article updated!");
      } else {
        await addMutation.mutateAsync(payload);
        // toast.success("Article created!");
      }
      navigate("/articles");
    } catch (err) { }
  };

  if (id && isFetching) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

  // Fallback to l.id or g.id in case the data structure doesn't use _id
  const languageOptions = staticLanguages.map((l) => ({ value: l._id || l.id, label: l.nativeName }));
  const godOptions = filteredGods.map((g) => ({ value: g._id || g.id, label: g.name }));

  return (
    <div className="content-wrapper p-4">
      <PageHeader
        breadcrumbTitle="Articles"
        breadcrumbLink="/articles"
        currentTitle={id ? "Edit Article" : "New Article"}
      />

      <div className="card shadow-sm mb-4">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row">
              <div className="col-md-6">
                <h5 className="mb-4 text-primary">Article Metadata</h5>

                <div className="mb-4 p-3 bg-light rounded border">
                  <div className="form-check form-switch">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isGlobal"
                      name="isGlobal"
                      checked={formData.isGlobal}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label fw-bold" htmlFor="isGlobal">Is Global Article?</label>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Article Title *</label>
                  <input
                    name="title"
                    className={`form-control ${errors.title ? "is-invalid" : ""}`}
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                  {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <ReusableSelect
                      label="Language"
                      name="language" // Added name prop
                      options={languageOptions}
                      value={formData.language}
                      // Catch the SECOND argument (value)
                      onChange={(name, value) => handleSelectChange("language", value)}
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
                      onChange={(name, value) => handleSelectChange("god", value)}
                      error={errors.god}
                      isDisabled={formData.isGlobal || !formData.language || isLoadingGods}
                      placeholder={
                        isLoadingGods
                          ? "Loading Gods..."
                          : formData.isGlobal
                            ? "Global Article"
                            : formData.language
                              ? "Select God..."
                              : "Select Language first..."
                      }
                      required={!formData.isGlobal}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Featured Image</label>
                  <input type="file" className="form-control" onChange={handleImageUpload} accept="image/*" disabled={isUploading} />
                  {formData.featureimage && <img src={formData.featureimage} alt="Preview" className="img-fluid rounded mt-2 border" style={{ maxHeight: "100px" }} />}
                </div>

                <div className="row">
                  <div className="col-md-3 mb-3">
                    <label className="form-label fw-bold">Sort *</label>
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
              </div>

              <div className="col-md-6">
                <h5 className="mb-4 text-primary">Content</h5>
                <div className="mb-4">
                  <label className="form-label fw-bold">Full Content *</label>
                  <RichTextEditor
                    value={formData.longdesc}
                    onChange={(html) => setFormData(p => ({ ...p, longdesc: html }))}
                    minHeight={200}
                  />
                  {errors.longdesc && <div className="text-danger small mt-1">{errors.longdesc}</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Short Description</label>
                  <RichTextEditor
                    value={formData.shortdesc}
                    onChange={(html) => setFormData(p => ({ ...p, shortdesc: html }))}
                    minHeight={100}
                  />
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
              onCancel={() => navigate("/articles")}
              isLoading={addMutation.isPending || updateMutation.isPending || isUploading}
              isEditing={!!id}
              entityName="Article"
            />
          </form>
        </div>
      </div>
    </div>
  );
}