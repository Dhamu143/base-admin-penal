import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import RichTextEditor from "../../common/RichTextEditor";
import { uploadImage } from "../../services/uploadService";

import {
  addDailyLog,
  updateDailyLog,
  fetchDailyLogById,
  clearCurrentDailyLog,
} from "../../store/dailylog/index";

export default function DailyLogFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  // Redux state
  const { currentLog } = useSelector((state) => state.dailyLog);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load data for Edit Mode
  useEffect(() => {
    if (id) {
      dispatch(fetchDailyLogById(id));
    } else {
      dispatch(clearCurrentDailyLog());
      setFormData({ title: "", description: "", image: "" });
    }
  }, [id, dispatch]);

  // Populate form when currentLog changes
  useEffect(() => {
    if (id && currentLog) {
      setFormData({
        title: currentLog.title || "",
        description: currentLog.description || "",
        image: currentLog.image || "",
      });
    }
  }, [currentLog, id]);

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
    if (!formData.title || !formData.description || !formData.image) {
      toast.error("Please fill all required fields.");
      return;
    }

    setIsSaving(true);
    try {
      if (id) {
        await dispatch(updateDailyLog({ id, ...formData })).unwrap();
        toast.success("Daily Log updated!");
      } else {
        await dispatch(addDailyLog(formData)).unwrap();
        toast.success("Daily Log created!");
      }
      navigate("/dailylog");
    } catch (err) {
      toast.error(err?.message || "Operation failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card shadow-sm p-4">
      {/* Header with Back Button */}
      <div className="card-header bg-white p-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 text-primary">
          {id ? "Edit Daily Log" : "Create Daily Log"}
        </h5>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate("/dailylog")}
        >
          <i className="fas fa-arrow-left me-2"></i> Back
        </button>
      </div>

      <div className="card-body p-4">
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-3">
            <label className="form-label fw-bold">Title</label>
            <input
              type="text"
              className="form-control"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter title..."
            />
          </div>

          {/* Image */}
          <div className="mb-3">
            <label className="form-label fw-bold">Image</label>
            <input
              type="file"
              className="form-control"
              onChange={handleImageUpload}
              accept="image/*"
              disabled={isUploading}
            />
            {isUploading && <small className="text-info">Uploading...</small>}
            {formData.image && (
              <img
                src={formData.image}
                alt="Preview"
                className="mt-2 rounded"
                style={{ height: "150px" }}
              />
            )}
          </div>

          {/* Description (Rich Text) */}
          <div className="mb-4">
            <label className="form-label fw-bold">Description</label>
            <RichTextEditor
              value={formData.description}
              onChange={(html) =>
                setFormData({ ...formData, description: html })
              }
            />
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-secondary mr-2"
              onClick={() => navigate("/dailylog")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving || isUploading}
            >
              {isSaving ? "Saving..." : "Save Daily Log"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
