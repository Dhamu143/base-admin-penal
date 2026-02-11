import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import RichTextEditor from "../../common/RichTextEditor";
import { uploadImage } from "../../services/uploadService";
import { useCreateDailyLog, useUpdateDailyLog } from "../../hooks/useDailyLog";

export default function DailyLogFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const passedLogData = location.state?.logData;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
  });
  const [isUploading, setIsUploading] = useState(false);

  const createMutation = useCreateDailyLog();
  const updateMutation = useUpdateDailyLog();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (id && passedLogData) {
      setFormData({
        title: passedLogData.title || "",
        description: passedLogData.description || "",
        image: passedLogData.image || "",
      });
    } else if (id && !passedLogData) {
      toast.warn("Backend error: Cannot load data on refresh. Please go back to list and click Edit again.");
    }
  }, [id, passedLogData]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setFormData((prev) => ({ ...prev, image: url }));
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description)
      return toast.error("Required fields missing.");

    try {
      if (id) {
        await updateMutation.mutateAsync({ id, ...formData });
        toast.success("Updated successfully!");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Created successfully!");
      }
      navigate("/dailylog");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Operation failed.");
    }
  };

  return (
    <div className="card shadow-sm p-4">
      <div className="card-header bg-white p-3 d-flex justify-content-between">
        <h5 className="mb-0 text-primary">{id ? "Edit Log" : "New Log"}</h5>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate("/dailylog")}>
          Back
        </button>
      </div>
      <div className="card-body p-4">
        {id && !passedLogData && !formData.title && (
          <div className="alert alert-warning">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Data could not be loaded. Please go back to the list and try editing again.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold">Title</label>
            <input
              className="form-control"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Image</label>
            <input
              className="form-control"
              type="file"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
            {isUploading && <small className="text-muted">Uploading...</small>}
            {formData.image && (
              <div className="mt-2">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="rounded border"
                  style={{ height: "100px", objectFit: 'cover' }}
                />
                <button
                  type="button"
                  className="btn btn-link text-danger btn-sm"
                  onClick={() => setFormData({ ...formData, image: "" })}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">Description</label>
            <RichTextEditor
              value={formData.description}
              onChange={(html) => setFormData({ ...formData, description: html })}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={isSaving || isUploading}>
            {isSaving ? (
              <span><i className="fas fa-spinner fa-spin me-2"></i>Saving...</span>
            ) : (
              "Save Log"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}