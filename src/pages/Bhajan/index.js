import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Actions & Constants
import {
  fetchBhajans,
  deleteBhajan,
  updateBhajan,
} from "../../store/bhajan/index";
import { fetchAllGods } from "../../store/god";
import { staticLanguages } from "../../constants/languages";

// Reusable Components & Hooks
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";
import FilterBar from "../../common/FilterBar"; // Reusable Component
import { useFilters } from "../../hook/useFilters"; // Reusable Hook

export default function BhajanListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux State
  const { list: bhajans, pagination, status, error } = useSelector(
    (state) => state.bhajans
  );
  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  // Local UI State
  const [isDeleting, setIsDeleting] = useState(false);
  const [bhajanToDelete, setBhajanToDelete] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // Reusable Filter Hook
  const {
    filters,
    handleFilterChange,
    handlePageChange,
    resetFilters,
  } = useFilters();
  const itemsPerPage = 10;

  // Load Data
  const loadBhajans = useCallback(() => {
    dispatch(fetchBhajans({ ...filters, limit: itemsPerPage }))
      .unwrap()
      .catch((err) => toast.error(err?.message || "Failed to load bhajans."));
  }, [dispatch, filters, itemsPerPage]);

  useEffect(() => {
    loadBhajans();
  }, [loadBhajans]);

  useEffect(() => {
    if (godStatus === "idle") {
      dispatch(fetchAllGods());
    }
  }, [dispatch, godStatus]);

  // Handlers
  const handleStatusToggle = async (bhajan) => {
    if (togglingId === bhajan._id) return;
    setTogglingId(bhajan._id);
    const newStatus = !bhajan.isActive;

    try {
      await dispatch(
        updateBhajan({ id: bhajan._id, isActive: newStatus })
      ).unwrap();

      toast.success(
        `Bhajan "${bhajan.name}" is now ${newStatus ? "Active" : "Inactive"}`
      );
    } catch (err) {
      toast.error(err?.message || "Failed to update status.");
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!bhajanToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteBhajan(bhajanToDelete._id)).unwrap();
      toast.success(`Bhajan "${bhajanToDelete.name}" deleted successfully.`);
      loadBhajans();
      setBhajanToDelete(null);
    } catch (err) {
      toast.error(err?.message || "An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Prepare Options for FilterBar
  const godOptions = [
    { value: "", label: "All Gods" },
    ...allGods.map((god) => ({ value: god._id, label: god.name })),
  ];

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">Bhajan Management</h4>
        <button
          className="btn btn-success"
          onClick={() => navigate("/bhajans/new")}
        >
          <i className="fas fa-plus me-2"></i> Add New Bhajan
        </button>
      </div>

      {/* REUSABLE FILTER BAR */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        godOptions={godOptions}
        godStatus={godStatus}
      />

      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>God</th>
                <th>Language</th>
                <th>Description</th>
                <th>Sort</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <TableStatus
                status={status}
                error={error}
                dataLength={bhajans.length}
                colSpan={7}
                loadingText="Loading bhajans..."
                emptyText="No bhajans Found."
              />
              {status === "succeeded" &&
                bhajans.map((b) => (
                  <tr key={b._id}>
                    <td className="fw-bold">{b.name}</td>
                    <td>{b?.god?.name}</td>
                    <td>
                      {staticLanguages.find((l) => l._id === b.language)
                        ?.nativeName || "N/A"}
                    </td>
                    <td style={{ maxWidth: "200px" }}>
                      {b?.description
                        ? b.description
                            .replace(/<[^>]+>/g, "")
                            .substring(0, 40) + "..."
                        : ""}
                    </td>
                    <td>{b?.sort}</td>
                    <td>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={b.isActive}
                          disabled={togglingId === b._id}
                          onChange={() => handleStatusToggle(b)}
                        />
                        <label className="form-check-label small ms-1">
                          {togglingId === b._id ? (
                            <span className="spinner-border spinner-border-sm text-secondary"></span>
                          ) : b.isActive ? (
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
                        onClick={() => navigate(`/bhajans/edit/${b._id}`)}
                      >
                        <i className="fas fa-pencil-alt"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setBhajanToDelete(b)}
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
            onPageChange={handlePageChange}
            totalItems={pagination.totalRecords}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      <ConfirmationModal
        show={bhajanToDelete !== null}
        onClose={() => setBhajanToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        isLoading={isDeleting}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">{bhajanToDelete?.name}</strong>?
        </p>
      </ConfirmationModal>
    </div>
  );
}
