import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// ✅ Hooks & Components
import FilterBar from "../../common/FilterBar";
import { useFilters } from "../../hook/useFilters";
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";

// ✅ Actions
import {
  fetchMantras,
  deleteMantra,
  updateMantra,
} from "../../store/mantra/index";
import { fetchAllGods } from "../../store/god";
import { staticLanguages } from "../../constants/languages";

const styles = `
  .truncate-text {
    max-width: 250px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    vertical-align: middle;
  }
`;

export default function MantraListPage() {
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
  const { list: mantras, pagination, status, error } = useSelector(
    (state) => state.mantras
  );
  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  // Local UI State
  const [isDeleting, setIsDeleting] = useState(false);
  const [mantraToDelete, setMantraToDelete] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // Load Data
  const loadMantras = useCallback(() => {
    dispatch(fetchMantras({ ...filters, limit: itemsPerPage }))
      .unwrap()
      .catch((err) => toast.error(err?.message || "Failed to load mantras."));
  }, [dispatch, filters, itemsPerPage]);

  useEffect(() => {
    loadMantras();
  }, [loadMantras]);

  useEffect(() => {
    if (godStatus === "idle") {
      dispatch(fetchAllGods());
    }
  }, [dispatch, godStatus]);

  // Actions
  const handleStatusToggle = async (mantra) => {
    if (togglingId === mantra._id) return;
    setTogglingId(mantra._id);
    const newStatus = !mantra.isActive;

    try {
      await dispatch(
        updateMantra({ id: mantra._id, isActive: newStatus })
      ).unwrap();
      toast.success(
        `Mantra "${mantra.name}" is now ${newStatus ? "Active" : "Inactive"}`
      );
    } catch (err) {
      toast.error(err?.message || "Failed to update status.");
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!mantraToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteMantra(mantraToDelete._id)).unwrap();
      toast.success(`Mantra "${mantraToDelete.name}" deleted successfully.`);

      if (mantras.length === 1 && filters.page > 1) {
        handlePageChange(filters.page - 1);
      } else {
        loadMantras();
      }
      setMantraToDelete(null);
    } catch (err) {
      toast.error(err?.message || "Failed to delete mantra.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getLanguageNameById = (langId) =>
    staticLanguages.find((lang) => lang._id === langId)?.language || "N/A";

  // Prepare God Options for the FilterBar
  const godOptions = [
    { value: "", label: "All Gods" },
    ...allGods.map((god) => ({ value: god._id, label: god.name })),
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="card shadow-sm">
        {/* Header */}
        <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
          <h4 className="mb-0 text-primary-emphasis">Mantra Management</h4>
          <button
            className="btn btn-labeled btn-success"
            style={{ fontSize: "17px" }}
            onClick={() => navigate("/mantras/new")}
          >
            <span className="btn-label me-2">
              <i className="fas fa-plus"></i>
            </span>
            Add New Mantra
          </button>
        </div>

        {/* ✅ Decoupled Filter Bar */}
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
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>God</th>
                  <th>Language</th>
                  <th>Description</th>
                  <th>Sort Order</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <TableStatus
                  status={status}
                  error={error}
                  dataLength={mantras.length}
                  colSpan={7}
                  loadingText="Loading mantras..."
                  emptyText="No mantras Found."
                />
                {status === "succeeded" &&
                  mantras.map((mantra) => (
                    <tr key={mantra._id}>
                      <td style={{ maxWidth: "100px" }}>{mantra?.name}</td>
                      <td>{mantra?.god?.name}</td>
                      <td>{getLanguageNameById(mantra?.language)}</td>
                      <td style={{ maxWidth: "400px" }}>
                        <span
                          title={mantra?.description.replace(/<[^>]+>/g, "")}
                        >
                          {mantra?.description
                            .replace(/<[^>]+>/g, "")
                            .substring(0, 50) + "..."}
                        </span>
                      </td>
                      <td>{mantra?.sort}</td>

                      <td>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={mantra?.isActive}
                            disabled={togglingId === mantra._id}
                            onChange={() => handleStatusToggle(mantra)}
                            style={{ cursor: "pointer" }}
                          />
                          <label className="form-check-label small ms-1">
                            {togglingId === mantra._id ? (
                              <span className="spinner-border spinner-border-sm text-secondary"></span>
                            ) : mantra.isActive ? (
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
                          onClick={() =>
                            navigate(`/mantras/edit/${mantra._id}`)
                          }
                          title="Edit"
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setMantraToDelete(mantra)}
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
              onPageChange={handlePageChange}
              totalItems={pagination.totalRecords}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}

        <ConfirmationModal
          show={mantraToDelete !== null}
          onClose={() => setMantraToDelete(null)}
          onConfirm={confirmDelete}
          title="Confirm Deletion"
          confirmText="Delete"
          isLoading={isDeleting}
          confirmButtonVariant="danger"
        >
          <p className="fs-5 text-center">
            Are you sure you want to delete <br />
            <strong className="text-danger">{mantraToDelete?.name}</strong>?
          </p>
        </ConfirmationModal>
      </div>
    </>
  );
}
