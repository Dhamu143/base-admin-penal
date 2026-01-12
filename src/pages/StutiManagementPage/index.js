import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import FilterBar from "../../common/FilterBar";
import { useFilters } from "../../hook/useFilters";
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";

import { fetchStutis, deleteStuti, updateStuti } from "../../store/stuti/index";
import { fetchAllGods } from "../../store/god";
import { staticLanguages } from "../../constants/languages";

export default function StutiManagementPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const itemsPerPage = 10;

  const {
    filters,
    handleFilterChange,
    handlePageChange,
    resetFilters,
  } = useFilters(1);

  // Redux State
  const { list: stutis, pagination, status, error } = useSelector(
    (state) => state.stuti
  );
  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const loadStutis = useCallback(() => {
    dispatch(fetchStutis({ ...filters, limit: itemsPerPage }))
      .unwrap()
      .catch((err) => toast.error(err?.message || "Failed to load stutis."));
  }, [dispatch, filters, itemsPerPage]);

  useEffect(() => {
    loadStutis();
  }, [loadStutis]);

  useEffect(() => {
    if (godStatus === "idle") {
      dispatch(fetchAllGods());
    }
  }, [dispatch, godStatus]);

  // Actions
  const handleStatusToggle = async (stuti) => {
    if (togglingId === stuti._id) return;

    setTogglingId(stuti._id);
    const newStatus = !stuti.isActive;

    try {
      await dispatch(
        updateStuti({ id: stuti._id, isActive: newStatus })
      ).unwrap();
      toast.success(
        `Stuti "${stuti.name}" is now ${newStatus ? "Active" : "Inactive"}`
      );
    } catch (err) {
      toast.error(err?.message || "Failed to update status.");
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteStuti(itemToDelete._id)).unwrap();
      toast.success(`Stuti "${itemToDelete.name}" deleted successfully.`);

      if (stutis.length === 1 && filters.page > 1) {
        handlePageChange(filters.page - 1);
      } else {
        loadStutis();
      }
      setItemToDelete(null);
    } catch (err) {
      toast.error(err?.message || "Failed to delete stuti.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getLanguageNameById = (langId) =>
    staticLanguages.find((lang) => lang._id === langId)?.language || "N/A";

  // Prepare God Options for FilterBar
  const godOptions = [
    { value: "", label: "All Gods" },
    ...allGods.map((god) => ({ value: god._id, label: god.name })),
  ];

  return (
    <div className="card shadow-sm">
      {/* Header */}
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">Stuti Management</h4>
        <button
          className="btn btn-labeled btn-success"
          style={{ fontSize: "17px" }}
          onClick={() => navigate("/stuti/new")}
        >
          <span className="btn-label me-2">
            <i className="fas fa-plus"></i>
          </span>
          Add New Stuti
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
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Language</th>
                <th>God</th>
                <th>Sort</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <TableStatus
                status={status}
                error={error}
                dataLength={stutis.length}
                colSpan={6}
                loadingText="Loading stutis..."
                emptyText="No stutis Found."
              />
              {status === "succeeded" &&
                stutis.map((item) => (
                  <tr key={item._id}>
                    <td className="fw-semibold">{item?.name}</td>
                    <td>{getLanguageNameById(item?.language)}</td>
                    <td>{item?.god?.name}</td>
                    <td>{item?.sort}</td>

                    {/* Status Toggle Switch */}
                    <td>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={item.isActive}
                          disabled={togglingId === item._id}
                          onChange={() => handleStatusToggle(item)}
                          style={{ cursor: "pointer" }}
                        />
                        <label className="form-check-label small ms-1">
                          {togglingId === item._id ? (
                            <span className="spinner-border spinner-border-sm text-secondary"></span>
                          ) : item.isActive ? (
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
                        onClick={() => navigate(`/stuti/${item._id}/edit`)}
                        title="Edit"
                      >
                        <i className="fas fa-pencil-alt"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setItemToDelete(item)}
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
        show={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={isDeleting}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">{itemToDelete?.name}</strong>?
        </p>
      </ConfirmationModal>
    </div>
  );
}
