import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import FilterBar from "../../common/FilterBar";
import { useFilters } from "../../hook/useFilters";
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";
import DynamicImage from "../../components/PostPreview/PostPreview";

// ✅ Actions & Constants
import { fetchTemples, deleteTemple, updateTemple } from "../../store/temple";
import { fetchAllGods } from "../../store/god";
import { staticLanguages } from "../../constants/languages";

export default function TempleListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const itemsPerPage = 10;

  // --- Custom Hook for Filters ---
  const {
    filters,
    handleFilterChange,
    handlePageChange,
    resetFilters,
  } = useFilters(1);

  // Redux State
  const { list: temples, pagination, status, error } = useSelector(
    (state) => state.temple
  );
  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  // Local UI State
  const [templeToDelete, setTempleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // Load Data
  const loadTemples = useCallback(() => {
    dispatch(fetchTemples({ ...filters, limit: itemsPerPage }))
      .unwrap()
      .catch((err) => toast.error(err?.message || "Failed to load temples."));
  }, [dispatch, filters, itemsPerPage]);

  useEffect(() => {
    loadTemples();
  }, [loadTemples]);

  useEffect(() => {
    if (godStatus === "idle") {
      dispatch(fetchAllGods());
    }
  }, [dispatch, godStatus]);

  // Actions
  const handleStatusToggle = async (temple) => {
    if (togglingId === temple._id) return;

    setTogglingId(temple._id);
    const newStatus = !temple.isActive;

    try {
      await dispatch(
        updateTemple({ id: temple._id, isActive: newStatus })
      ).unwrap();

      toast.success(
        `Temple "${temple.name}" is now ${newStatus ? "Active" : "Inactive"}`
      );
    } catch (err) {
      toast.error(err?.message || "Failed to update status.");
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!templeToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteTemple(templeToDelete._id)).unwrap();
      toast.success(`Temple "${templeToDelete.name}" deleted successfully.`);

      if (temples.length === 1 && filters.page > 1) {
        handlePageChange(filters.page - 1);
      } else {
        loadTemples();
      }
      setTempleToDelete(null);
    } catch (err) {
      toast.error(err?.message || "Failed to delete temple.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getLanguageName = (langId) =>
    staticLanguages.find((l) => l._id === langId)?.language || "N/A";

  // Prepare God Options for FilterBar
  const godOptions = [
    { value: "", label: "All Gods" },
    ...allGods.map((god) => ({ value: god._id, label: god.name })),
  ];

  return (
    <div className="card shadow-sm">
      {/* Header */}
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">Temple Management</h4>
        <button
          className="btn btn-labeled btn-success"
          style={{ fontSize: "17px" }}
          onClick={() => navigate("/temples/new")}
        >
          <span className="btn-label me-2">
            <i className="fas fa-plus"></i>
          </span>
          Add New Temple
        </button>
      </div>

      {/* ✅ Centralized Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        godOptions={godOptions}
        godStatus={godStatus}
      />

      {/* Table Content */}
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Language</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <TableStatus
                status={status}
                error={error}
                dataLength={temples.length}
                colSpan={5}
                loadingText="Loading temples..."
                emptyText="No temples Found."
              />
              {status === "succeeded" &&
                temples.map((temple) => (
                  <tr key={temple._id}>
                    <td>
                      {temple.files ? (
                        <DynamicImage
                          src={temple.files}
                          alt={temple.name}
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />
                      ) : (
                        <div
                          className="d-flex justify-content-center align-items-center bg-light"
                          style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "8px",
                          }}
                        >
                          <i className="fas fa-image text-muted"></i>
                        </div>
                      )}
                    </td>
                    <td className="fw-semibold">{temple.name}</td>
                    <td>{getLanguageName(temple.language)}</td>

                    {/* Status Toggle Switch */}
                    <td>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={temple.isActive}
                          disabled={togglingId === temple._id}
                          onChange={() => handleStatusToggle(temple)}
                          style={{ cursor: "pointer" }}
                        />
                        <label className="form-check-label small ms-1">
                          {togglingId === temple._id ? (
                            <span className="spinner-border spinner-border-sm text-secondary"></span>
                          ) : temple.isActive ? (
                            "Active"
                          ) : (
                            "Inactive"
                          )}
                        </label>
                      </div>
                    </td>

                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary mr-2"
                        onClick={() => navigate(`/temples/edit/${temple._id}`)}
                        title="Edit"
                      >
                        <i className="fas fa-pencil-alt"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setTempleToDelete(temple)}
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

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="card-footer">
          <CustomPagination
            currentPage={filters.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalRecords}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        show={templeToDelete !== null}
        onClose={() => setTempleToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={isDeleting}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete the temple: <br />
          <strong className="text-danger">{templeToDelete?.name}</strong>?
        </p>
      </ConfirmationModal>
    </div>
  );
}
