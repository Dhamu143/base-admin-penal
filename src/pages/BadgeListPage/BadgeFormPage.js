import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import RichTextEditor from "../../common/RichTextEditor";
import ReusableSelect from "../../common/ReusableSelect";
import FormActionButtons from "../../common/FormActionButtons";
import PageHeader from "../../common/PageHeader";

import { uploadImage } from "../../services/uploadService";
import { staticLanguages } from "../../constants/languages";

import { useBadge, useAddBadge, useUpdateBadge } from "../../hooks/useBadge";

export default function BadgeFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const { data: badgeData, isLoading: isFetchingBadge } = useBadge(id);
    const { mutateAsync: createBadge, isPending: isAdding } = useAddBadge();
    const { mutateAsync: updateBadgeMutate, isPending: isUpdating } = useUpdateBadge();

    const [formData, setFormData] = useState({
        name: "",
        isActive: true,
        information: "",
        language: "",
        file: "",
    });

    const [errors, setErrors] = useState({});
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (id && badgeData) {
            setFormData({
                name: badgeData.name || "",
                isActive: badgeData.isActive ?? true,
                information: badgeData.information || "",
                language: badgeData.language || "",
                file: badgeData.file || "",
            });
        }
    }, [id, badgeData]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Badge name is required.";
        if (!formData.language) newErrors.language = "Please select a language.";
        if (!formData.information.replace(/<[^>]*>?/gm, "").trim()) newErrors.information = "Information is required.";
        if (!formData.file) newErrors.file = "Badge image is required.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const uploadedUrl = await uploadImage(file);
            setFormData((prev) => ({ ...prev, file: uploadedUrl }));
            setErrors((prev) => ({ ...prev, file: null }));
            toast.success("Image uploaded successfully!");
        } catch (err) {
            toast.error("Image upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const payload = { ...formData };

            if (id) {
                await updateBadgeMutate({ id, ...payload });
            } else {
                await createBadge(payload);
            }

            navigate("/badges");
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
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const languageOptions = (staticLanguages || []).map((l) => ({
        value: l._id,
        label: `${l.nativeName} (${l.language})`
    }));

    const isSaving = isAdding || isUpdating || isUploading;

    if (id && isFetchingBadge) {
        return (
            <div className="content-wrapper p-4 d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    return (
        <div className="content-wrapper p-4">
            <PageHeader breadcrumbTitle="Badges" breadcrumbLink="/badges" currentTitle={id ? "Edit Badge" : "New Badge"} />

            <div className="card shadow-sm mb-4">
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="row">
                            <div className="col-md-6">
                                <h5 className="mb-4 text-primary">Badge Details</h5>

                                <div className="mb-3">
                                    <label className="form-label fw-bold">Badge Name <span className="text-danger">*</span></label>
                                    <input type="text" name="name" className={`form-control ${errors.name ? "is-invalid" : ""}`} value={formData.name} onChange={handleInputChange} />
                                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                </div>

                                <ReusableSelect
                                    label="Language"
                                    name="language"
                                    options={languageOptions}
                                    value={formData.language}
                                    onChange={handleSelectChange}
                                    error={errors.language}
                                    required={true}
                                />

                                <div className="mb-3">
                                    <label className="form-label fw-bold">Badge Image / Icon <span className="text-danger">*</span></label>
                                    <input type="file" className={`form-control ${errors.file ? "is-invalid" : ""}`} onChange={handleImageUpload} accept="image/*" disabled={isUploading} />
                                    {isUploading && <div className="text-primary small mt-1">Uploading...</div>}
                                    {errors.file && <div className="invalid-feedback d-block">{errors.file}</div>}

                                    {formData.file && !isUploading && (
                                        <div className="mt-2">
                                            <img src={formData.file} alt="Badge Preview" className="img-fluid rounded border" style={{ maxHeight: "150px", objectFit: "contain", backgroundColor: "#f8f9fa", padding: "10px" }} />
                                        </div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <div className="form-check form-switch fs-5 mt-4">
                                        <input className="form-check-input" type="checkbox" role="switch" name="isActive" checked={formData.isActive} onChange={handleInputChange} />
                                        <label className="form-check-label">is Active</label>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <h5 className="mb-4 text-primary">Information</h5>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Information / Criteria <span className="text-danger">*</span></label>
                                    <RichTextEditor
                                        value={formData.information}
                                        minHeight={350}
                                        maxHeight={350}
                                        onChange={(html) => setFormData((prev) => ({ ...prev, information: html }))}
                                    />
                                    {errors.information && <div className="invalid-feedback d-block mt-1">{errors.information}</div>}
                                </div>
                            </div>
                        </div>

                        <FormActionButtons onCancel={() => navigate("/badges")} isLoading={isSaving} isEditing={!!id} entityName="Badge" />
                    </form>
                </div>
            </div>
        </div>
    );
}