import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

// Redux Actions for God
import {
  fetchGods as fetchGodList, // Renamed to avoid conflict
  addGod,
  updateGod,
  deleteGod,
} from "../../store/god/index";
import { fetchGods } from "../../store/godmaster/index";

// Import the reusable static languages array
import { staticLanguages } from "../../constants/languages";

// Services and Components for image handling
import { uploadImage } from "../../services/uploadService";
import ConfirmationModal from "../../common/ConfirmationModal";
import DynamicImage from "../../components/PostPreview/PostPreview";

export default function GodManagementPage() {
  const dispatch = useDispatch();

  // CHANGED: Selector now points to 'state.god'
  // The slice name is 'god', so the state key in the root reducer is 'god'.
  const { list: gods, status, error } = useSelector((state) => state.God);

  const { list: Gods, status: godStatus } = useSelector((state) => state.gods);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingGod, setEditingGod] = useState(null);
  const [godToDelete, setGodToDelete] = useState(null);

  const initialFormState = {
    name: "",
    description: "",
    featureimage: "",
    sort: "",
    language: "",
    master: "",
    active: "", // 👈 added
  };

  const [formData, setFormData] = useState(initialFormState);
  useEffect(() => {
    // Fetch the list only if it hasn't been fetched yet
    if (status === "idle") {
      dispatch(fetchGodList());
    }
    if (godStatus === "idle") {
      dispatch(fetchGods());
    }
  }, [status, dispatch]);

  // Helper functions to get names from IDs for the table display
  const getLanguageNameById = (langId) => {
    const language = staticLanguages.find((lang) => lang._id === langId);
    return language ? language.nativeName : "N/A";
  };

  const getGodNameById = (godId) => {
    if (!godId) return "None";
    const masterGod = gods.find((g) => g._id === godId);
    return masterGod ? masterGod.name : "N/A";
  };

  const handleOpenModal = (god = null) => {
    if (god) {
      setEditingGod(god);
      setFormData({
        id: god._id,
        name: god.name,
        description: god.description,
        featureimage: god.featureimage || "",
        sort: god.sort,
        language: god.language || "",
        master: god.master?._id || "",
      });
    } else {
      setEditingGod(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGod(null);
    setFormData(initialFormState);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (data) => {
    setFormData((prev) => ({ ...prev, featureimage: data?.url || "" }));
  };

  const handleSaveGod = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let finalFormData = { ...formData };

      // If the image is a local blob, upload it first
      if (finalFormData.featureimage?.startsWith("blob:")) {
        const response = await fetch(finalFormData.featureimage);
        const blob = await response.blob();
        const fileToUpload = new File([blob], "upload.jpg", {
          type: blob.type,
        });
        const permanentImageUrl = await uploadImage(fileToUpload);
        finalFormData.featureimage = permanentImageUrl;
      }

      // Ensure 'master' is null if the string is empty
      if (!finalFormData.master) {
        finalFormData.master = null;
      }

      const action = editingGod
        ? updateGod({ id: editingGod._id, ...finalFormData })
        : addGod(finalFormData);

      await dispatch(action).unwrap(); // .unwrap() will throw an error on rejection

      // 👇 ADD THIS LINE to refetch the list with populated data
      dispatch(fetchGodList());

      handleCloseModal();
    } catch (err) {
      console.error("Failed to save the god:", err);
      alert(err || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (god) => {
    setGodToDelete(god);
  };

  const confirmDelete = async () => {
    if (!godToDelete) return;
    setIsSaving(true);
    try {
      await dispatch(deleteGod(godToDelete._id)).unwrap();
      setGodToDelete(null); // This closes the confirmation modal
    } catch (err) {
      console.error("Failed to delete the god:", err);
      alert(err || "An error occurred while deleting.");
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
            <span className="btn-label">
              <em className="fas fa-plus"></em>
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
                  <th>Language</th>
                  <th>Master</th>
                  <th>Sort Order</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {status === "loading" && (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="spinner-border text-primary"></div>
                    </td>
                  </tr>
                )}
                {status === "failed" && (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-danger">
                      <em className="fas fa-exclamation-triangle me-2"></em>{" "}
                      Error: {error}
                    </td>
                  </tr>
                )}
                {status === "succeeded" &&
                  gods.map((god) => (
                    <tr key={god._id}>
                      <td>
                        <DynamicImage
                          src={god.master.featureimage}
                          alt={god.name}
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "50%",
                          }}
                        />
                      </td>
                      <td className="fw-bold">{god.name}</td>
                      <td>{getLanguageNameById(god.language)}</td>
                      <td>{god.master ? god.master.name : "None"}</td>
                      <td>{god.sort}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-secondary me-2 mr-2"
                          onClick={() => handleOpenModal(god)}
                          title="Edit"
                        >
                          <em className="fas fa-pencil-alt"></em>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteClick(god)}
                          title="Delete"
                        >
                          <em className="fas fa-trash"></em>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- Add/Edit Modal --- */}
      {isModalOpen && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content shadow-lg">
                <form onSubmit={handleSaveGod}>
                  <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title">
                      <em className="fas fa-gopuram me-2"></em>
                      {editingGod ? `Edit ${editingGod.name}` : "Add New God"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={handleCloseModal}
                    ></button>
                  </div>
                  <div className="modal-body">
                    {/* <div className="mb-3">
                      <ImageUpload
                        label="God Image"
                        value={{ url: formData.featureimage, type: "image" }}
                        onChange={handleImageChange}
                      />
                    </div> */}
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="language"
                          className="form-label fw-semibold"
                        >
                          Language
                        </label>
                        <select
                          id="language"
                          name="language"
                          className="form-select"
                          value={formData.language}
                          onChange={handleFormChange}
                          required
                        >
                          {/* Extra option */}
                          <option value="">-- Select Language --</option>

                          {staticLanguages.map((lang) => (
                            <option key={lang._id} value={lang._id}>
                              {`${lang.nativeName} (${lang.language})`}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="master"
                          className="form-label fw-semibold"
                        >
                          Master God (Optional)
                        </label>
                        <select
                          id="master"
                          name="master"
                          className="form-select"
                          value={formData.master}
                          onChange={handleFormChange}
                        >
                          <option value="">-- None --</option>
                          {Gods.filter((g) => g._id !== editingGod?._id).map(
                            (masterGod) => (
                              <option key={masterGod._id} value={masterGod._id}>
                                {masterGod.name}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label fw-semibold">
                        Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="description"
                        className="form-label fw-semibold"
                      >
                        Description
                      </label>
                      <textarea
                        className="form-control"
                        id="description"
                        name="description"
                        rows="3"
                        value={formData.description}
                        onChange={handleFormChange}
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="sort" className="form-label fw-semibold">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="sort"
                        name="sort"
                        value={formData.sort}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
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
                      disabled={isSaving}
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* --- Delete Confirmation Modal --- */}
      {/* --- Reusable Delete Confirmation Modal --- */}
      <ConfirmationModal
        show={godToDelete !== null}
        onClose={() => setGodToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={isSaving}
        confirmButtonVariant="danger"
      >
        {/* This content is passed as 'children' to the modal */}
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">
            {/* Use optional chaining `?.` for safety as the object might be null during fade-out */}
            {godToDelete?.name}
          </strong>
          ?
        </p>
        <p className="text-muted text-center">This action cannot be undone.</p>
      </ConfirmationModal>
      {/* {godToDelete && (
        <div
          className="modal"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  <em className="fas fa-exclamation-triangle me-2"></em> Confirm
                  Deletion
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setGodToDelete(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="fs-5 text-center">
                  Are you sure you want to delete <br />
                  <strong className="text-danger">{godToDelete.name}</strong>?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setGodToDelete(null)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmDelete}
                  disabled={isSaving}
                >
                  {isSaving ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </>
  );
}
