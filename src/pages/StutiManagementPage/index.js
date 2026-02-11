import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

import {
  useStutis,
  useDeleteStuti,
  useUpdateStuti
} from "../../hooks/useStuti";

import { fetchAllGods } from "../../store/god";
import { staticLanguages } from "../../constants/languages";

import FilterBar from "../../common/FilterBar";
import { useFilters } from "../../hooks/useFilters";
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";

export default function StutiManagementPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

  const { data, isLoading, isError, error, isFetching } = useStutis(apiFilters);
  const stutis = data?.data || [];
  const pagination = data?.pagination || null;

  const deleteMutation = useDeleteStuti();
  const updateMutation = useUpdateStuti();

  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  const [itemToDelete, setItemToDelete] = useState(null);
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
  }, [filters.godId, filters.god]);

  const handleReset = () => {
    resetFilters();
    queryClient.invalidateQueries(["stutis"]);
    toast.info("Filters reset and list refreshed");
  };

  const handleStatusToggle = async (stuti) => {
    if (togglingId === stuti._id) return;
    setTogglingId(stuti._id);
    const newStatus = !stuti.isActive;

    try {
      await updateMutation.mutateAsync({ id: stuti._id, isActive: newStatus });
      toast.success(
        `Stuti "${stuti.name}" is now ${newStatus ? "Active" : "Inactive"}`
      );
    } catch (err) {
      // Error handled in hook
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteMutation.mutateAsync(itemToDelete._id);

      if (stutis.length === 1 && filters.page > 1) {
        handlePageChange(filters.page - 1);
      }

      setItemToDelete(null);
    } catch (err) {
      // Error handled in hook
    }
  };

  const getLanguageNameById = (langId) =>
    staticLanguages.find((lang) => lang._id === langId)?.language || "N/A";

  const godOptions = [
    { value: "", label: "All Gods" },
    ...allGods.map((god) => ({ value: god._id, label: god.name })),
  ];

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">Stuti Management</h4>
        <div>
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
                status={isLoading || isFetching ? "loading" : isError ? "failed" : "succeeded"}
                error={error}
                dataLength={stutis.length}
                colSpan={6}
                loadingText="Loading stutis..."
                emptyText="No stutis Found."
              />
              {!isLoading && !isError && Array.isArray(stutis) &&
                stutis.map((item) => (
                  <tr key={item._id} className={isFetching ? "opacity-50" : ""}>
                    <td className="fw-semibold">{item?.name}</td>
                    <td>{getLanguageNameById(item?.language)}</td>
                    <td>{item?.god?.name}</td>
                    <td>{item?.sort}</td>

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
        show={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
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