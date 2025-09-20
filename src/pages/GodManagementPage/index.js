import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CustomPagination from "../../common/Pagination";

// Redux Actions for God
import {
  fetchGods as fetchPaginatedGods,
  addGod,
  updateGod,
  deleteGod,
} from "../../store/god/index";

// Action for the 'Master God' dropdown
import { fetchGods as fetchMasterGods } from "../../store/godmaster/index";

import ConfirmationModal from "../../common/ConfirmationModal";
import DynamicImage from "../../components/PostPreview/PostPreview";
import AsyncSelect from "react-select/async";

export default function GodManagementPage() {
  const dispatch = useDispatch();

  // Main paginated list
  const {
    list: gods,
    status: paginatedStatus,
    error,
    currentPage,
    totalPages,
    totalItems,
  } = useSelector((state) => state.God);

  // Master God list for dropdown
  const { list: masterGods, status: masterStatus } = useSelector(
    (state) => state.gods
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingGod, setEditingGod] = useState(null);
  const [godToDelete, setGodToDelete] = useState(null);

  const itemsPerPage = 10;

  const initialFormState = {
    name: "",
    description: "",
    sort: "",
    master: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fetch paginated gods and master god list
  useEffect(() => {
    if (paginatedStatus === "idle") {
      dispatch(fetchPaginatedGods({ page: 1, limit: itemsPerPage }));
    }
    if (masterStatus === "idle") {
      dispatch(fetchMasterGods());
    }
  }, [paginatedStatus, masterStatus, dispatch]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber !== currentPage) {
      dispatch(fetchPaginatedGods({ page: pageNumber, limit: itemsPerPage }));
    }
  };

  // Modal handlers
  const handleOpenModal = (god = null) => {
    if (god) {
      setEditingGod(god);
      setFormData({
        id: god._id,
        name: god.name,
        description: god.description,
        sort: god.sort,
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

  const handleSaveGod = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let finalFormData = { ...formData };
      if (!finalFormData.master) finalFormData.master = null;

      const action = editingGod
        ? updateGod({ id: editingGod._id, ...finalFormData })
        : addGod(finalFormData);

      await dispatch(action).unwrap();
      dispatch(fetchPaginatedGods({ page: currentPage, limit: itemsPerPage }));
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save the god:", err);
      alert(err.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (god) => setGodToDelete(god);

  const confirmDelete = async () => {
    if (!godToDelete) return;
    setIsSaving(true);
    try {
      await dispatch(deleteGod(godToDelete._id)).unwrap();

      let pageToFetch = currentPage;
      if (gods.length === 1 && currentPage > 1) pageToFetch = currentPage - 1;

      dispatch(fetchPaginatedGods({ page: pageToFetch, limit: itemsPerPage }));
      setGodToDelete(null);
    } catch (err) {
      console.error("Failed to delete the god:", err);
      alert(err.message || "An error occurred while deleting.");
    } finally {
      setIsSaving(false);
    }
  };

  // Async loader for react-select
  const loadMasterOptions = (inputValue) => {
    return new Promise((resolve) => {
      const filtered = masterGods
        .filter(
          (g) =>
            g.name.toLowerCase().includes(inputValue.toLowerCase()) &&
            g._id !== editingGod?._id
        )
        .map((g) => ({ label: g.name, value: g._id }));
      resolve(filtered);
    });
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
                  <th>Master</th>
                  <th>Sort Order</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStatus === "loading" && (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div className="spinner-border text-primary"></div>
                    </td>
                  </tr>
                )}
                {paginatedStatus === "failed" && (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-danger">
                      <em className="fas fa-exclamation-triangle me-2"></em>
                      Error: {error}
                    </td>
                  </tr>
                )}
                {paginatedStatus === "succeeded" &&
                  gods.map((god) => (
                    <tr key={god._id}>
                      <td>
                        <DynamicImage
                          src={god.featureimage || god.master?.featureimage}
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
                      <td>{god.master ? god.master.name : "None"}</td>
                      <td>{god.sort}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
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

          {totalItems > itemsPerPage && (
            <div className="mt-3">
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
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
                    <div className="mb-3">
                      <label
                        htmlFor="master"
                        className="form-label fw-semibold"
                      >
                        Master God (Optional)
                      </label>
                      <AsyncSelect
                        cacheOptions
                        defaultOptions={masterGods.map((god) => ({
                          label: god.name,
                          value: god._id,
                        }))}
                        loadOptions={loadMasterOptions}
                        value={
                          formData.master
                            ? {
                                label:
                                  masterGods.find(
                                    (g) => g._id === formData.master
                                  )?.name || "None",
                                value: formData.master,
                              }
                            : null
                        }
                        onChange={(selectedOption) =>
                          setFormData((prev) => ({
                            ...prev,
                            master: selectedOption ? selectedOption.value : "",
                          }))
                        }
                        isClearable
                        placeholder="-- Select Master God --"
                      />
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
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        required
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
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
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
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            sort: e.target.value,
                          }))
                        }
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        show={godToDelete !== null}
        onClose={() => setGodToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={isSaving}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">{godToDelete?.name}</strong>?
        </p>
        <p className="text-muted text-center">This action cannot be undone.</p>
      </ConfirmationModal>
    </>
  );
}
