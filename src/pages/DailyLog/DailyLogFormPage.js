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
  const { currentLog, list } = useSelector((state) => state.dailyLog);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load Data
  useEffect(() => {
    if (id) {
      const existingLog = list.find((log) => log._id === id);
      if (existingLog) {
        setFormData({
          title: existingLog.title || "",
          description: existingLog.description || "",
          image: existingLog.image || "",
        });
      }
      dispatch(fetchDailyLogById(id));
    } else {
      dispatch(clearCurrentDailyLog());
      setFormData({ title: "", description: "", image: "" });
    }
  }, [id, dispatch, list]);

  // Sync with API Data
  useEffect(() => {
    if (id && currentLog && currentLog._id === id) {
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
    if (!formData.title || !formData.description)
      return toast.error("Required fields missing.");

    setIsSaving(true);
    try {
      if (id) {
        // Redux will call httpService.put(url, formData) -> Body Payload
        await dispatch(updateDailyLog({ id, ...formData })).unwrap();
        toast.success("Updated!");
      } else {
        await dispatch(addDailyLog(formData)).unwrap();
        toast.success("Created!");
      }
      navigate("/dailylog");
    } catch (err) {
      console.error(err);
      toast.error("Operation failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card shadow-sm p-4">
      <div className="card-header bg-white p-3 d-flex justify-content-between">
        <h5 className="mb-0 text-primary">{id ? "Edit Log" : "New Log"}</h5>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate("/dailylog")}
        >
          Back
        </button>
      </div>
      <div className="card-body p-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold">Title</label>
            <input
              className="form-control"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
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
            {isUploading && <small>Uploading...</small>}
            {formData.image && (
              <img
                src={formData.image}
                alt="Prev"
                className="mt-2 rounded"
                style={{ height: "100px" }}
              />
            )}
          </div>
          <div className="mb-4">
            <label className="form-label fw-bold">Description</label>
            <RichTextEditor
              value={formData.description}
              onChange={(html) =>
                setFormData({ ...formData, description: html })
              }
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSaving || isUploading}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
