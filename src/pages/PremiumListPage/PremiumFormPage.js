import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import FormActionButtons from "../../common/FormActionButtons";
import PageHeader from "../../common/PageHeader";
import { uploadImage } from "../../services/uploadService";
import { usePlan, useAddPlan, useUpdatePlan } from "../../hooks/usePremium";

const DURATION_TYPES = [
  { value: "day",      label: "Day"      },
  { value: "week",     label: "Week"     },
  { value: "month",    label: "Month"    },
  { value: "year",     label: "Year"     },
  { value: "lifetime", label: "Lifetime" },
];

const FEATURE_SUGGESTIONS = [
  "No Ads", "Faster App", "Exclusive Content", "Priority Alerts",
  "Offline Access", "HD Streaming", "Early Access", "24/7 Support",
  "Daily Panchang", "Premium Kundali", "Ad-Free Experience",
];

export default function PremiumFormPage() {
  const navigate = useNavigate();
  const { id }   = useParams();

  const { data: fetchedPlan, isLoading: isFetchingPlan } = usePlan(id);
  const addMutation    = useAddPlan();
  const updateMutation = useUpdatePlan();

  const [formData, setFormData] = useState({
    name:          "",
    features:      [],
    banner:        "",
    durationType:  "month",
    price:         "",
    discountPrice: "",
    isActive:      true,
    noAds:         true,
    sortOrder:     "",
    isRecommended: false,
  });

  const [errors,          setErrors]          = useState({});
  const [isUploading,     setIsUploading]   = useState(false);
  const [featureInput,    setFeatureInput]  = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (id && fetchedPlan) {
      setFormData({
        name:          fetchedPlan.name          || "",
        features:      fetchedPlan.features      || [],
        banner:        fetchedPlan.banner        || "",
        durationType:  fetchedPlan.durationType  || "month",
        price:         fetchedPlan.price         ?? "",
        discountPrice: fetchedPlan.discountPrice ?? "",
        isActive:      fetchedPlan.isActive      ?? true,
        noAds:         fetchedPlan.noAds         ?? true,
        sortOrder:     fetchedPlan.sortOrder     ?? "",
        isRecommended: fetchedPlan.isRecommended ?? false,
      });
    }
  }, [id, fetchedPlan]);

  const addFeature = (text) => {
    const trimmed = text.trim();
    if (!trimmed || formData.features.some(f => f.toLowerCase() === trimmed.toLowerCase())) return;
    
    setFormData((prev) => ({ ...prev, features: [...prev.features, trimmed] }));
    setFeatureInput("");
    setShowSuggestions(false);
  };

  const removeFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const filteredSuggestions = FEATURE_SUGGESTIONS.filter(
    (s) => s.toLowerCase().includes(featureInput.toLowerCase()) && !formData.features.includes(s)
  );

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Plan name is required.";
    if (!formData.price && formData.price !== 0)    e.price = "Price is required.";
    if (isNaN(Number(formData.price)))              e.price = "Price must be a valid number.";
    if (formData.discountPrice !== "" && isNaN(Number(formData.discountPrice)))
      e.discountPrice = "Discounted price must be a valid number.";
    if (formData.sortOrder !== "" && isNaN(Number(formData.sortOrder)))
      e.sortOrder = "Sort order must be a valid number.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleDurationTypeSelect = (opt) => {
    setFormData((prev) => ({ ...prev, durationType: opt ? opt.value : "month" }));
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setFormData((prev) => ({ ...prev, banner: url }));
      setErrors((prev) => ({ ...prev, banner: null }));
      toast.success("Banner uploaded!");
    } catch {
      toast.error("Banner upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    let finalFeatures = [...formData.features];
    if (featureInput.trim()) {
      if (!finalFeatures.some(f => f.toLowerCase() === featureInput.trim().toLowerCase())) {
        finalFeatures.push(featureInput.trim());
      }
    }

    const payload = {
      ...formData,
      features:      finalFeatures, 
      price:         Number(formData.price),
      discountPrice: formData.discountPrice !== "" ? Number(formData.discountPrice) : null,
      sortOrder:     formData.sortOrder     !== "" ? Number(formData.sortOrder) : 0,
    };

    try {
      if (id) {
        await updateMutation.mutateAsync({ id, ...payload });
      } else {
        await addMutation.mutateAsync(payload);
      }
      navigate("/premium");
    } catch (err) {
      console.error("Failed to save plan:", err);
    }
  };

  const isSaving = addMutation.isPending || updateMutation.isPending || isUploading;

  if (id && isFetchingPlan) {
    return <div className="text-center p-5">Loading Plan Data...</div>;
  }

  const currentDurationValue = DURATION_TYPES.find((d) => d.value === formData.durationType) || null;

  return (
    <div className="content-wrapper p-4">
      <PageHeader
        breadcrumbTitle="Premium Plans"
        breadcrumbLink="/premium"
        currentTitle={id ? "Edit Plan" : "New Plan"}
      />

      <div className="card shadow-sm mb-4">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row">

              {/* ── LEFT COLUMN ── */}
              <div className="col-md-6">
                <h5 className="mb-4 text-primary">Plan Details</h5>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Plan Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text" name="name"
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    value={formData.name} onChange={handleInputChange}
                    placeholder="e.g. 1 Month Plan"
                  />
                  {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Duration <span className="text-danger">*</span>
                  </label>
                  <Select
                    name="durationType" options={DURATION_TYPES}
                    value={currentDurationValue}
                    onChange={handleDurationTypeSelect}
                    isSearchable={false} classNamePrefix="react-select"
                  />
                  <div className="form-text">Fixed to 1 unit of the selected type (e.g. 1 Month).</div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Price (₹) <span className="text-danger">*</span></label>
                    <input
                      type="number" name="price"
                      className={`form-control ${errors.price ? "is-invalid" : ""}`}
                      value={formData.price} onChange={handleInputChange} placeholder="e.g. 199"
                    />
                    {errors.price && <div className="invalid-feedback d-block">{errors.price}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Discounted Price (₹)</label>
                    <input
                      type="number" name="discountPrice"
                      className={`form-control ${errors.discountPrice ? "is-invalid" : ""}`}
                      value={formData.discountPrice} onChange={handleInputChange} placeholder="e.g. 149"
                    />
                    {errors.discountPrice && <div className="invalid-feedback d-block">{errors.discountPrice}</div>}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Sort Order</label>
                    <input
                      type="number" name="sortOrder"
                      className={`form-control ${errors.sortOrder ? "is-invalid" : ""}`}
                      value={formData.sortOrder} onChange={handleInputChange} placeholder="e.g. 1"
                    />
                    {errors.sortOrder && <div className="invalid-feedback d-block">{errors.sortOrder}</div>}
                  </div>

                  <div className="col-md-6 d-flex flex-column justify-content-center gap-3 mt-4">
                    <div className="form-check form-switch fs-5">
                      <input
                        className="form-check-input" type="checkbox" role="switch"
                        name="isActive" checked={formData.isActive} onChange={handleInputChange}
                      />
                      <label className="form-check-label ms-2">Is Active</label>
                    </div>
                    <div className="form-check form-switch fs-5">
                      <input
                        className="form-check-input" type="checkbox" role="switch"
                        name="isRecommended" checked={formData.isRecommended} onChange={handleInputChange}
                      />
                      <label className="form-check-label ms-2 text-warning fw-bold">Is Recommended</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── RIGHT COLUMN ── */}
              <div className="col-md-6">
                <h5 className="mb-4 text-primary">Content & Features</h5>

                <div className="mb-4">
                  <label className="form-label fw-bold mb-2">Plan Features</label>

                  {/* 1. Display Selected Features */}
                  {formData.features.length > 0 && (
                    <div 
                      className="form-control d-flex flex-wrap gap-2 align-items-center mb-2" 
                      style={{ height: "auto", minHeight: "46px", backgroundColor: "#fafbfc" }}
                    >
                      {formData.features.map((f, i) => (
                        <span
                          key={i}
                          className="badge d-inline-flex align-items-center gap-1 px-2 py-1"
                          style={{
                            backgroundColor: "#fff3cd", color: "#856404",
                            border: "1px solid #ffc107", borderRadius: 20,
                            fontSize: 13, fontWeight: 600,
                          }}
                        >
                          {f}
                          <button
                            type="button"
                            className="btn-close btn-close-sm"
                            style={{ fontSize: 8, opacity: 0.6 }}
                            onClick={() => removeFeature(i)}
                            aria-label="Remove"
                          />
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 2. Explicit Dedicated Input Field */}
                  <div className="position-relative mb-2">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Type a new feature here..."
                        value={featureInput}
                        onChange={(e) => { setFeatureInput(e.target.value); setShowSuggestions(true); }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            addFeature(featureInput);
                          }
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-primary fw-bold"
                        onClick={() => addFeature(featureInput)}
                      >
                        Add Feature
                      </button>
                    </div>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && featureInput && filteredSuggestions.length > 0 && (
                      <div
                        className="border rounded shadow-sm bg-white position-absolute mt-1"
                        style={{ zIndex: 1000, maxHeight: 180, overflowY: "auto", width: "100%", left: 0 }}
                      >
                        {filteredSuggestions.map((s, i) => (
                          <div
                            key={i}
                            className="px-3 py-2 suggestion-item"
                            style={{ cursor: "pointer", fontSize: 13, color: "#333" }}
                            onMouseDown={(e) => {
                              e.preventDefault(); 
                              addFeature(s);
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f9fa")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            {s}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3. Quick add suggestion pills */}
                  {!featureInput && FEATURE_SUGGESTIONS.filter(s => !formData.features.includes(s)).length > 0 && (
                    <div className="mt-2 d-flex flex-wrap gap-2 align-items-center">
                      <small className="text-muted me-1">Quick add:</small>
                      {FEATURE_SUGGESTIONS.filter(s => !formData.features.includes(s)).slice(0, 6).map((s, i) => (
                        <span
                          key={i}
                          className="badge border"
                          style={{
                            cursor: "pointer", 
                            borderRadius: 20, 
                            backgroundColor: "#f8f9fa", 
                            color: "#333",              
                            padding: "6px 12px",
                            fontWeight: 500
                          }}
                          onClick={() => addFeature(s)}
                        >
                          + {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold d-block">App Features</label>
                  <div className="form-check form-switch fs-5">
                    <input
                      className="form-check-input" type="checkbox" role="switch"
                      name="noAds" checked={formData.noAds} onChange={handleInputChange}
                    />
                    <label className="form-check-label ms-2">Remove Advertisements</label>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">Plan Banner</label>
                  <input
                    type="file" className="form-control"
                    onChange={handleBannerUpload} accept="image/*"
                    disabled={isUploading || isSaving}
                  />
                  {isUploading && <div className="text-primary small mt-1">Uploading...</div>}
                  {formData.banner && !isUploading && (
                    <div className="mt-2">
                      <img
                        src={formData.banner} alt="Banner Preview"
                        className="img-fluid rounded border"
                        style={{ maxHeight: 120, width: "100%", objectFit: "cover" }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <FormActionButtons
              onCancel={() => navigate("/premium")}
              isLoading={isSaving}
              isEditing={!!id}
              entityName="Plan"
            />
          </form>
        </div>
      </div>
    </div>
  );
}