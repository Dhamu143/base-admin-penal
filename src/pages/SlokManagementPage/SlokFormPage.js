import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import RichTextEditor from "../../common/RichTextEditor";
import ReusableSelect from "../../common/ReusableSelect";
import FormActionButtons from "../../common/FormActionButtons";
import PageHeader from "../../common/PageHeader";
import RelatedContentSelector from "../../common/RelatedContentSelector";

import { uploadImage } from "../../services/uploadService";
import { fetchAllGods } from "../../store/god/index";
import { staticLanguages } from "../../constants/languages";

import { useSlok, useAddSlok, useUpdateSlok } from "../../hooks/useSloks";

export default function SlokFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { masterList: allGods = [], masterStatus: godStatus = "idle" } = useSelector((state) => state.God || {});

  const { data: fetchedSlok, isLoading: isFetchingSlok } = useSlok(id);
  const addSlokMutation = useAddSlok();
  const updateSlokMutation = useUpdateSlok();

  const [formData, setFormData] = useState({
    name: "",
    sort: "",
    isActive: true,
    isFree: true,
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
    if (godStatus === "idle") dispatch(fetchAllGods());
  }, [godStatus, dispatch]);

  useEffect(() => {
    if (id && fetchedSlok) {
      setFormData({
        name: fetchedSlok.name || "",
        sort: fetchedSlok.sort || "",
        isActive: fetchedSlok.isActive ?? true,
        isFree: fetchedSlok.isFree ?? true,
        god: fetchedSlok.god?._id || fetchedSlok.god || "",
        description: fetchedSlok.description || "",
        language: fetchedSlok.language || "",
        image: fetchedSlok.image || "",
        views: fetchedSlok.views || "",
        share: fetchedSlok.share || "",
        like: fetchedSlok.like || "",
        relatedContent: fetchedSlok.relatedContent?.map((item) => ({
          refId: item.refId?._id || item.refId,
          refModel: item.refModel,
        })) || [],
      });
    }
  }, [id, fetchedSlok]);

  useEffect(() => {
    if (formData.language && Array.isArray(allGods)) {
      setFilteredGods(allGods.filter((g) => g.language === formData.language));
    } else {
      setFilteredGods([]);
    }
  }, [formData.language, allGods]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Sloka name is required.";
    if (!formData.god) newErrors.god = "Please select a God.";
    if (!formData.language) newErrors.language = "Please select a language.";
    if (!formData.description.replace(/<[^>]*>?/gm, "").trim()) newErrors.description = "Description / Content is required.";
    if (formData.sort === "" || isNaN(Number(formData.sort))) newErrors.sort = "Sort order must be a valid number.";
    if (!formData.image) newErrors.image = "Sloka image is required.";

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
        await updateSlokMutation.mutateAsync({ id, ...payload });
      } else {
        await addSlokMutation.mutateAsync(payload);
      }

      navigate("/sloka");
    } catch (err) {
      console.error("Failed to save sloka:", err);
    }
  };

  const languageOptions = staticLanguages.map((l) => ({ value: l._id, label: `${l.nativeName} (${l.language})` }));
  const godOptions = filteredGods.map((g) => ({ value: g._id, label: g.name }));

  const isSaving = addSlokMutation.isPending || updateSlokMutation.isPending || isUploading;

  if (id && isFetchingSlok) {
    return <div className="text-center p-5">Loading Sloka Data...</div>;
  }

  return (
    <div className="content-wrapper p-4">
      <PageHeader breadcrumbTitle="Slokas" breadcrumbLink="/sloka" currentTitle={id ? "Edit Sloka" : "New Sloka"} />

      <div className="card shadow-sm mb-4">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row">
              <div className="col-md-6">
                <h5 className="mb-4 text-primary">Sloka Details</h5>

                <div className="mb-3">
                  <label className="form-label fw-bold">Sloka Name <span className="text-danger">*</span></label>
                  <input type="text" name="name" className={`form-control ${errors.name ? "is-invalid" : ""}`} value={formData.name} onChange={handleInputChange} placeholder="Enter sloka name" />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <ReusableSelect label="Language" name="language" options={languageOptions} value={formData.language} onChange={handleSelectChange} error={errors.language} required={true} />
                <ReusableSelect label="God" name="god" options={godOptions} value={formData.god} onChange={handleSelectChange} error={errors.god} required={true} isDisabled={!formData.language} placeholder={formData.language ? "Select God..." : "Select Language first..."} />

                <div className="mb-3">
                  <label className="form-label fw-bold">Sloka Image <span className="text-danger">*</span></label>
                  <input type="file" className={`form-control ${errors.image ? "is-invalid" : ""}`} onChange={handleImageUpload} accept="image/*" disabled={isUploading || isSaving} />
                  {isUploading && <div className="text-primary small mt-1">Uploading...</div>}
                  {errors.image && <div className="invalid-feedback d-block">{errors.image}</div>}
                  {formData.image && !isUploading && (
                    <div className="mt-2">
                      <img src={formData.image} alt="Sloka Preview" className="img-fluid rounded border" style={{ maxHeight: "150px" }} />
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

                <div className="row mb-3">
                  <div className="col-md-6 d-flex align-items-center">
                    <div className="form-check form-switch fs-5">
                      <input className="form-check-input" type="checkbox" role="switch" name="isFree" checked={formData.isFree} onChange={handleInputChange} />
                      <label className="form-check-label ms-2">is Free</label>
                    </div>
                  </div>
                  <div className="col-md-6 d-flex align-items-center">
                    <div className="form-check form-switch fs-5">
                      <input className="form-check-input" type="checkbox" role="switch" name="isActive" checked={formData.isActive} onChange={handleInputChange} />
                      <label className="form-check-label ms-2">is Active</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <h5 className="mb-4 text-primary">Content</h5>
                <div className="mb-3">
                  <label className="form-label fw-bold">Description / Content <span className="text-danger">*</span></label>
                  <RichTextEditor value={formData.description} minHeight={350} maxHeight={350} onChange={(html) => setFormData((prev) => ({ ...prev, description: html }))} placeholder="Enter the full sloka content here..." />
                  {errors.description && <div className="invalid-feedback d-block mt-1">{errors.description}</div>}
                </div>
              </div>
            </div>

            <RelatedContentSelector
              languageId={formData.language}
              relatedContent={formData.relatedContent}
              onChange={handleSelectChange}
            />

            <FormActionButtons onCancel={() => navigate("/sloka")} isLoading={isSaving} isEditing={!!id} entityName="Sloka" />
          </form>
        </div>
      </div>
    </div>
  );
}