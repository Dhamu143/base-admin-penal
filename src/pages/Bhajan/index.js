import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

import {
  useBhajans,
  useDeleteBhajan,
  useUpdateBhajan
} from "../../hooks/useBhajans";

import { fetchAllGods } from "../../store/god";
import { staticLanguages } from "../../constants/languages";

import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";
import FilterBar from "../../common/FilterBar";
import { useFilters } from "../../hooks/useFilters";

export default function BhajanListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    filters,
    handleFilterChange,
    handlePageChange,
    resetFilters,
  } = useFilters();
  const itemsPerPage = 10;
  const apiFilters = useMemo(() => {
    return {
      ...filters,
      limit: itemsPerPage,
      god: filters.godId || filters.god || "",
      godId: undefined,
    };
  }, [filters, itemsPerPage]);

  const { data, isLoading, isError, error, isFetching } = useBhajans(apiFilters);
  const bhajans = data?.data || [];
  const pagination = data?.pagination || null;

  const deleteMutation = useDeleteBhajan();
  const updateMutation = useUpdateBhajan();

  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  const [bhajanToDelete, setBhajanToDelete] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    if (godStatus === "idle") {
      dispatch(fetchAllGods());
    }
  }, [dispatch, godStatus]);

  useEffect(() => {
    if (filters.page > 1 && (filters.godId || filters.god)) {
      handlePageChange(1);
    }
  }, [filters.godId, filters.god, filters.page, handlePageChange]);

  const handleReset = () => {
    resetFilters();
    queryClient.invalidateQueries(["bhajans"]);
    toast.info("Filters reset and list refreshed");
  };

  const handleStatusToggle = async (bhajan) => {
    if (togglingId === bhajan._id) return;
    setTogglingId(bhajan._id);
    const newStatus = !bhajan.isActive;

    try {
      await updateMutation.mutateAsync({ id: bhajan._id, isActive: newStatus });
      toast.success(
        `Bhajan "${bhajan.name}" is now ${newStatus ? "Active" : "Inactive"}`
      );
    } catch (err) {
      // Error handled in hook
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!bhajanToDelete) return;
    try {
      await deleteMutation.mutateAsync(bhajanToDelete._id);

      if (bhajans.length === 1 && filters.page > 1) {
        handlePageChange(filters.page - 1);
      }

      setBhajanToDelete(null);
    } catch (err) {
      // Error handled in hook
    }
  };

  const godOptions = [
    { value: "", label: "All Gods" },
    ...allGods.map((god) => ({ value: god._id, label: god.name })),
  ];

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">Bhajan Management</h4>
        <div>
          <button
            className="btn btn-success"
            onClick={() => navigate("/bhajans/new")}
          >
            <i className="fas fa-plus me-2"></i> Add New Bhajan
          </button>
        </div>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
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
                status={isLoading || isFetching ? "loading" : isError ? "failed" : "succeeded"}
                error={error}
                dataLength={bhajans.length}
                colSpan={7}
                loadingText="Loading bhajans..."
                emptyText="No bhajans Found."
              />
              {!isLoading && !isError && Array.isArray(bhajans) &&
                bhajans.map((b) => (
                  <tr key={b._id} className={isFetching ? "opacity-50" : ""}>
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
                          style={{ cursor: "pointer" }}
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
        isLoading={deleteMutation.isPending}
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