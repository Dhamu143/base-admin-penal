import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import FilterBar from "../../common/FilterBar";
import { useFilters } from "../../hook/useFilters";
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";

import { fetchSloks, deleteSlok, updateSlok } from "../../store/sloks/index";
import { fetchAllGods } from "../../store/god";
import { staticLanguages } from "../../constants/languages";

export default function SlokListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const itemsPerPage = 10;

  const {
    filters,
    handleFilterChange,
    handlePageChange,
    resetFilters,
  } = useFilters(1);

  const { list: sloks, pagination, status, error } = useSelector(
    (state) => state.sloks
  );
  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  // Local UI State
  const [isDeleting, setIsDeleting] = useState(false);
  const [slokToDelete, setSlokToDelete] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // Load Data
  const loadSloks = useCallback(() => {
    dispatch(fetchSloks({ ...filters, limit: itemsPerPage }))
      .unwrap()
      .catch((err) => toast.error(err?.message || "Failed to load slokas."));
  }, [dispatch, filters, itemsPerPage]);

  useEffect(() => {
    loadSloks();
  }, [loadSloks]);

  useEffect(() => {
    if (godStatus === "idle") {
      dispatch(fetchAllGods());
    }
  }, [dispatch, godStatus]);

  // Actions
  const handleStatusToggle = async (slok) => {
    if (togglingId === slok._id) return;
    setTogglingId(slok._id);
    const newStatus = !slok.isActive;

    try {
      await dispatch(
        updateSlok({ id: slok._id, isActive: newStatus })
      ).unwrap();
      toast.success(
        `Sloka "${slok.name}" is now ${newStatus ? "Active" : "Inactive"}`
      );
    } catch (err) {
      toast.error(err?.message || "Failed to update status.");
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!slokToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteSlok(slokToDelete._id)).unwrap();
      toast.success(`Sloka "${slokToDelete.name}" deleted successfully.`);

      if (sloks.length === 1 && filters.page > 1) {
        handlePageChange(filters.page - 1);
      } else {
        loadSloks();
      }
      setSlokToDelete(null);
    } catch (err) {
      toast.error(err?.message || "An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getLanguageNameById = (langId) =>
    staticLanguages.find((l) => l._id === langId)?.language || "N/A";

  // Prepare God Options for FilterBar
  const godOptions = [
    { value: "", label: "All Gods" },
    ...allGods.map((god) => ({ value: god._id, label: god.name })),
  ];

  return (
    <>
      <style>{`
        .truncate-text { 
          max-width: 250px; 
          white-space: nowrap; 
          overflow: hidden; 
          text-overflow: ellipsis; 
          display: inline-block; 
          vertical-align: middle; 
        }
      `}</style>

      <div className="card shadow-sm">
        {/* Header */}
        <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
          <h4 className="mb-0 text-primary-emphasis">Sloka Management</h4>
          <button
            className="btn btn-labeled btn-success"
            style={{ fontSize: "17px" }}
            onClick={() => navigate("/sloks/new")}
          >
            <span className="btn-label me-2">
              <i className="fas fa-plus"></i>
            </span>
            Add New Sloka
          </button>
        </div>

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
                  dataLength={sloks.length}
                  colSpan={7}
                  loadingText="Loading sloks..."
                  emptyText="No sloks Found."
                />
                {status === "succeeded" &&
                  sloks.map((slok) => (
                    <tr key={slok._id}>
                      <td style={{ maxWidth: "150px" }}>
                        {slok?.name || "N/A"}
                      </td>
                      <td>{slok?.god?.name}</td>
                      <td>{getLanguageNameById(slok.language)}</td>
                      <td>
                        <p className="mb-0" style={{ maxWidth: "270px" }}>
                          <span
                            className="truncate-text"
                            title={slok?.description?.replace(/<[^>]+>/g, "")}
                          >
                            {slok?.description
                              ?.replace(/<[^>]+>/g, "")
                              .substring(0, 50)}
                            ...
                          </span>
                        </p>
                      </td>
                      <td>{slok?.sort}</td>

                      {/* Status Toggle */}
                      <td>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={slok.isActive}
                            disabled={togglingId === slok._id}
                            onChange={() => handleStatusToggle(slok)}
                            style={{ cursor: "pointer" }}
                          />
                          <label className="form-check-label small ms-1">
                            {togglingId === slok._id ? (
                              <span className="spinner-border spinner-border-sm text-secondary"></span>
                            ) : slok.isActive ? (
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
                          onClick={() => navigate(`/sloks/edit/${slok._id}`)}
                          title="Edit"
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setSlokToDelete(slok)}
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

        <ConfirmationModal
          show={slokToDelete !== null}
          onClose={() => setSlokToDelete(null)}
          onConfirm={confirmDelete}
          title="Confirm Deletion"
          confirmText="Delete"
          isLoading={isDeleting}
          confirmButtonVariant="danger"
        >
          <p className="fs-5 text-center">
            Are you sure you want to delete <br />
            <strong className="text-danger">{slokToDelete?.name}</strong>?
          </p>
        </ConfirmationModal>
      </div>
    </>
  );
}
