import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useTemples,
  useDeleteTemple,
  useUpdateTemple,
  useSendTempleNotification // <-- 1. Import new hook
} from "../../hooks/useTemple";

import { useAllGods } from "../../hooks/useGod";
import { staticLanguages } from "../../constants/languages";

import FilterBar from "../../common/FilterBar";
import { useFilters } from "../../hooks/useFilters";
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";
import DynamicImage from "../../components/PostPreview/PostPreview";

export default function TempleListPage() {
  const navigate = useNavigate();
  const itemsPerPage = 10;

  const {
    filters,
    handleFilterChange,
    handlePageChange,
    resetFilters,
  } = useFilters(1);

  const apiFilters = useMemo(() => {
    return {
      ...filters,
      limit: itemsPerPage,
      god: filters.godId || filters.god || "",
      godId: undefined,
    };
  }, [filters, itemsPerPage]);

  const { data, isLoading, isError, error, isFetching } = useTemples(apiFilters);

  const temples = data?.data || [];
  const pagination = data?.pagination || null;

  const deleteMutation = useDeleteTemple();
  const updateMutation = useUpdateTemple();
  const notifyMutation = useSendTempleNotification(); // <-- 2. Initialize hook

  const { data: allGods = [], isLoading: isLoadingGods } = useAllGods();

  const [templeToDelete, setTempleToDelete] = useState(null);
  const [templeToNotify, setTempleToNotify] = useState(null); // <-- 3. Add notify state
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    if (filters.page > 1 && (filters.godId || filters.god)) {
      handlePageChange(1);
    }
  }, [filters.godId, filters.god, filters.page, handlePageChange]);

  const handleReset = () => {
    resetFilters();
    toast.info("Filters reset and list refreshed");
  };

  const handleStatusToggle = async (temple) => {
    if (togglingId === temple._id) return;
    setTogglingId(temple._id);
    const newStatus = !temple.isActive;

    try {
      await updateMutation.mutateAsync({ id: temple._id, isActive: newStatus });
      toast.success(
        `Temple "${temple.name}" is now ${newStatus ? "Active" : "Inactive"}`
      );
    } catch (err) {
      // Error handled in hook
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!templeToDelete) return;
    try {
      await deleteMutation.mutateAsync(templeToDelete._id);

      if (temples.length === 1 && filters.page > 1) {
        handlePageChange(filters.page - 1);
      }

      setTempleToDelete(null);
    } catch (err) {
      // Error handled in hook
    }
  };

  // <-- 4. Add confirm notification handler -->
  const confirmNotification = async () => {
    if (!templeToNotify) return;
    try {
      await notifyMutation.mutateAsync(templeToNotify._id);
      setTempleToNotify(null);
    } catch (err) { }
  };

  const getLanguageName = (langId) =>
    staticLanguages.find((l) => l._id === langId)?.language || "N/A";

  const godOptions = [
    { value: "", label: "All Gods" },
    ...allGods.map((god) => ({ value: god._id, label: god.name })),
  ];

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">Temple Management</h4>
        <div>
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
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        godOptions={godOptions}
        godStatus={isLoadingGods ? "loading" : "succeeded"}
      />

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
                status={isLoading || isFetching ? "loading" : isError ? "failed" : "succeeded"}
                error={error}
                dataLength={temples.length}
                colSpan={5}
                loadingText="Loading temples..."
                emptyText="No temples Found."
              />
              {!isLoading && !isError && Array.isArray(temples) &&
                temples.map((temple) => (
                  <tr key={temple._id} className={isFetching ? "opacity-50" : ""}>
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
                      {/* <-- 5. Add Bell Button for notifications --> */}
                      <button
                        className="btn btn-sm btn-outline-warning mr-2"
                        onClick={() => setTempleToNotify(temple)}
                        title="Send Notification"
                      >
                        <i className="fas fa-bell"></i>
                      </button>

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

      {/* Delete Modal */}
      <ConfirmationModal
        show={templeToDelete !== null}
        onClose={() => setTempleToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete the temple: <br />
          <strong className="text-danger">{templeToDelete?.name}</strong>?
        </p>
      </ConfirmationModal>

      {/* <-- 6. Add Notification Confirmation Modal --> */}
      <ConfirmationModal
        show={templeToNotify !== null}
        onClose={() => setTempleToNotify(null)}
        onConfirm={confirmNotification}
        title="Send Push Notification"
        confirmText="Send Notification"
        isLoading={notifyMutation.isPending}
        confirmButtonVariant="warning"
      >
        <p className="fs-5 text-center">
          Are you sure you want to broadcast a notification to all users for <br />
          <strong className="text-warning">{templeToNotify?.name}</strong>?
        </p>
      </ConfirmationModal>

    </div>
  );
} 