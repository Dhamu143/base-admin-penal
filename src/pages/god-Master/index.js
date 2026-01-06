import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  fetchGods,
  addGod,
  updateGod,
  deleteGod,
} from "../../store/godmaster/index";
import { uploadImage } from "../../services/uploadService";
import DynamicImage from "../../components/PostPreview/PostPreview";
import ImageUpload from "../../components/ImageUpload";
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination"; 
import { TableStatus } from "../../components/TableStatus";

export default function FeatureManagementPage() {
  const dispatch = useDispatch();

  const { list: gods, pagination, status, error } = useSelector(
    (state) => state.gods
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingGod, setEditingGod] = useState(null);
  const [godToDelete, setGodToDelete] = useState(null);
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const itemsPerPage = 10;

  const initialFormState = {
    name: "",
    featureimage: "",
    sort: "",
    percentage: "",
    isActive: true,
  };
  const [formData, setFormData] = useState(initialFormState);

  const loadGods = (page = 1) => {
    dispatch(fetchGods({ page, limit: itemsPerPage }));
  };

  useEffect(() => {
    loadGods(1); 
  }, [dispatch]);

  const handlePageChange = (newPage) => {
    if (newPage !== pagination?.currentPage) {
      loadGods(newPage);
    }
  };

  const handleOpenModal = (god = null) => {
    if (god) {
      setEditingGod(god);
      setFormData({
        id: god._id,
        name: god.name || "",
        featureimage: god.featureimage || "",
        sort: god.sort || "",
        percentage: god.percentage || 0,
        isActive: god.isActive,
      });
    } else {
      setEditingGod(null);
      setFormData(initialFormState);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGod(null);
    setFormData(initialFormState);
    setErrors({});
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = async (data) => {
    setFormData((prev) => ({ ...prev, featureimage: "" }));
    setErrors((prev) => ({ ...prev, featureimage: null }));
    if (!data?.file) return;

    setIsUploading(true);
    setFormData((prev) => ({ ...prev, featureimage: data.url }));
    try {
      const uploadedUrl = await uploadImage(data.file);
      setFormData((prev) => ({ ...prev, featureimage: uploadedUrl }));
    } catch (err) {
      console.error("Upload failed:", err);
      setErrors((prev) => ({
        ...prev,
        featureimage: err.message || "Image upload failed. Please try again.",
      }));
      setFormData((prev) => ({ ...prev, featureimage: "" }));
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "God name is required.";
    if (!formData.featureimage)
      newErrors.featureimage = "A feature image is required.";
    if (formData.sort === "" || isNaN(formData.sort)) {
      newErrors.sort = "Sort order must be a valid number.";
    }
    if (formData.percentage === "" || isNaN(formData.percentage)) {
      newErrors.percentage = "Percentage must be a valid number.";
    } else if (formData.percentage < 0 || formData.percentage > 100) {
      newErrors.percentage = "Percentage must be between 0 and 100.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveFeature = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isUploading) {
      toast.warn("Please wait for the image to finish uploading.");
      return;
    }

    setIsSaving(true);
    try {
      const action = editingGod
        ? updateGod({ id: editingGod._id, ...formData })
        : addGod(formData);
      await dispatch(action).unwrap();
      toast.success(
        editingGod ? "God updated successfully!" : "God added successfully!"
      );
      loadGods(pagination?.currentPage || 1); 
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save the feature:", err);
      toast.error(err.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!godToDelete) return;
    setIsSaving(true);
    try {
      await dispatch(deleteGod(godToDelete._id)).unwrap();
      toast.success(`"${godToDelete.name}" was deleted successfully.`);

      const pageToFetch =
        gods.length === 1 && pagination?.currentPage > 1
          ? pagination.currentPage - 1
          : pagination?.currentPage || 1;

      loadGods(pageToFetch);
      setGodToDelete(null);
    } catch (err) {
      console.error("Failed to delete the feature:", err);
      toast.error(err.message || "An error occurred while deleting.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
          <h4 className="mb-0 text-primary-emphasis">✨ God Management</h4>

          <button
            className="btn btn-labeled btn-success"
            type="button"
            style={{ fontSize: "17px" }}
            onClick={() => handleOpenModal()}
          >
            <span className="btn-label me-2">
              <i className="fas fa-plus"></i>
            </span>
            Add New God
          </button>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "10%" }}>Image</th>
                  <th>Name</th>
                  <th>Percentage</th>
                  <th>Sort Order</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <TableStatus
                  status={status}
                  error={error}
                  dataLength={gods.length}
                  colSpan={7}
                  loadingText="Loading gods..."
                  emptyText="No gods Found."
                />
                {status === "succeeded" &&
                  gods.map((god) => (
                    <tr key={god._id}>
                      <td>
                        <DynamicImage
                          src={god.featureimage || "/img/user.jpg"}
                          alt={god.name || "User"}
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "50%",
                            border: "2px solid #dee2e6",
                          }}
                        />
                      </td>
                      <td className="fw-bold">{god.name}</td>
                      <td>{god.percentage ?? 0}%</td>
                      <td>{god.sort}</td>
                      <td>
                        {god.isActive ? (
                          <span className="badge bg-success">Active</span>
                        ) : (
                          <span className="badge bg-secondary">Inactive</span>
                        )}
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-secondary mr-2"
                          onClick={() => handleOpenModal(god)}
                          title="Edit"
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setGodToDelete(god)}
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="card-footer">
            <CustomPagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalRecords}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {isModalOpen && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow-lg">
                <form onSubmit={handleSaveFeature} noValidate>
                  <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title">
                      <i className="fas fa-gopuram me-2"></i>
                      {editingGod ? `Edit: ${editingGod.name}` : "Add New God"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={handleCloseModal}
                    ></button>
                  </div>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label fw-bold">
                        Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.name ? "is-invalid" : ""
                        }`}
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        placeholder="e.g., Ganesha, Shiva"
                      />
                      {errors.name && (
                        <div className="invalid-feedback">{errors.name}</div>
                      )}
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="sort" className="form-label fw-bold">
                          Sort Order <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className={`form-control ${
                            errors.sort ? "is-invalid" : ""
                          }`}
                          id="sort"
                          name="sort"
                          value={formData.sort}
                          onChange={handleFormChange}
                        />
                        {errors.sort && (
                          <div className="invalid-feedback">{errors.sort}</div>
                        )}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="percentage"
                          className="form-label fw-bold"
                        >
                          Percentage (%) <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className={`form-control ${
                            errors.percentage ? "is-invalid" : ""
                          }`}
                          id="percentage"
                          name="percentage"
                          value={formData.percentage}
                          onChange={handleFormChange}
                        />
                        {errors.percentage && (
                          <div className="invalid-feedback">
                            {errors.percentage}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mb-3">
                      <ImageUpload
                        label="Feature Image"
                        value={{ url: formData.featureimage, type: "image" }}
                        onChange={handleImageChange}
                        isUploading={isUploading}
                      />
                      {errors.featureimage && (
                        <div className="text-danger small mt-1">
                          {errors.featureimage}
                        </div>
                      )}
                    </div>
                    <div className="form-check form-switch fs-5">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleFormChange}
                      />
                      <label className="form-check-label" htmlFor="isActive">
                        is Active
                      </label>
                    </div>
                  </div>
                  <div className="modal-footer bg-light">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseModal}
                      disabled={isSaving}
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSaving || isUploading}
                    >
                      {isSaving || isUploading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      <ConfirmationModal
        show={godToDelete !== null}
        onClose={() => setGodToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        isLoading={isSaving}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">{godToDelete?.name}</strong>?
        </p>
      </ConfirmationModal>
    </>
  );
}
