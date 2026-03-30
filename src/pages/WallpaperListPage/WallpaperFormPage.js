import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import ReusableSelect from "../../common/ReusableSelect";
import FormActionButtons from "../../common/FormActionButtons";
import PageHeader from "../../common/PageHeader";

import { uploadImage } from "../../services/uploadService";
import { useWallpaper, useAddWallpaper, useUpdateWallpaper } from "../../hooks/useWallpaper";
import { useGods } from "../../hooks/useGodmaster";

export default function WallpaperFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: wallpaperData, isLoading: isLoadingWallpaper } = useWallpaper(id);
  const { data: godsResponse, isLoading: isLoadingGods } = useGods(1, 500);
  
  const addWallpaperMutation = useAddWallpaper();
  const updateWallpaperMutation = useUpdateWallpaper();

  const [formData, setFormData] = useState({
    god: "",
    image: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (id && wallpaperData) {
      setFormData({
        god: wallpaperData.god?._id || wallpaperData.god || "",
        image: wallpaperData.image || "",
        isActive: wallpaperData.isActive ?? true,
      });
    }
  }, [id, wallpaperData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.god) newErrors.god = "Please select a God Master.";
    if (!formData.image) newErrors.image = "Please upload an image.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : undefined }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 🎯 PASS 'false' HERE TO SKIP COMPRESSION FOR WALLPAPERS
      const uploadedUrl = await uploadImage(file, false); 
      
      setFormData((prev) => ({ ...prev, image: uploadedUrl }));
      if (errors.image) setErrors((prev) => ({ ...prev, image: null }));
      toast.success("High-quality wallpaper uploaded successfully!");
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

    const mutation = id ? updateWallpaperMutation : addWallpaperMutation;

    mutation.mutate(id ? { id, ...formData } : formData, {
      onSuccess: () => {
        navigate("/wallpapers");
      }
    });
  };

  // Safely extract the array from the deeply nested response
  let godsList = [];
  if (Array.isArray(godsResponse?.data?.data)) {
    godsList = godsResponse.data.data;
  } else if (Array.isArray(godsResponse?.data)) {
    godsList = godsResponse.data;
  }
    
  const godOptions = godsList.map((g) => ({ value: g._id, label: g.name }));

  if (id && isLoadingWallpaper) {
    return (
      <div className="p-5 text-center">
        <div className="spinner-border text-primary"></div>
        <p className="mt-2">Loading wallpaper data...</p>
      </div>
    );
  }

  return (
    <div className="content-wrapper p-4">
      <PageHeader 
        breadcrumbTitle="Wallpapers" 
        breadcrumbLink="/wallpapers" 
        currentTitle={id ? "Edit Wallpaper" : "New Wallpaper"} 
      />

      <div className="card shadow-sm mb-4">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row">
              <div className="col-md-6">
                <h5 className="mb-4 text-primary">Wallpaper Details</h5>

                <div className="mb-3">
                  <ReusableSelect 
                    label="God Master *" 
                    name="god" 
                    options={godOptions} 
                    value={formData.god} 
                    onChange={handleSelectChange} 
                    error={errors.god} 
                    required 
                    isDisabled={isLoadingGods} 
                    placeholder="Select God Master..." 
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Wallpaper Image *</label>
                  <input 
                    type="file" 
                    className={`form-control ${errors.image ? "is-invalid" : ""}`} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    disabled={isUploading || addWallpaperMutation.isPending || updateWallpaperMutation.isPending} 
                  />
                  {errors.image && <div className="invalid-feedback">{errors.image}</div>}
                  
                  {formData.image && (
                    <div className="mt-3 position-relative d-inline-block">
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="img-fluid rounded border shadow-sm" 
                        style={{ maxHeight: "300px", objectFit: "contain" }} 
                      />
                    </div>
                  )}
                </div>

                <div className="form-check form-switch mt-4 mb-4">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    name="isActive" 
                    id="isActive" 
                    checked={formData.isActive} 
                    onChange={handleInputChange} 
                  />
                  <label className="form-check-label fw-bold" htmlFor="isActive">Active Status</label>
                </div>

              </div>
            </div>

            <hr className="my-4" />

            <FormActionButtons
              onCancel={() => navigate("/wallpapers")}
              isLoading={addWallpaperMutation.isPending || updateWallpaperMutation.isPending || isUploading}
              isEditing={!!id}
              entityName="Wallpaper"
            />
          </form>
        </div>
      </div>
    </div>
  );
}