import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import {
  useMantras,
  useDeleteMantra,
  useUpdateMantra
} from "../../hooks/useMantra";

import { fetchAllGods } from "../../store/god";
import { staticLanguages } from "../../constants/languages";

import FilterBar from "../../common/FilterBar";
import { useFilters } from "../../hooks/useFilters";
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";

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

  const { data, isLoading, isError, error, isFetching } = useMantras(apiFilters);

  const mantras = data?.data || [];
  const pagination = data?.pagination || null;

  const deleteMutation = useDeleteMantra();
  const updateMutation = useUpdateMantra();

  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  const [mantraToDelete, setMantraToDelete] = useState(null);
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
    queryClient.invalidateQueries(["mantras"]);
    toast.info("Filters reset and list refreshed");
  };

  const handleStatusToggle = async (mantra) => {
    if (togglingId === mantra._id) return;
    setTogglingId(mantra._id);
    const newStatus = !mantra.isActive;

    try {
      await updateMutation.mutateAsync({ id: mantra._id, isActive: newStatus });
      toast.success(
        `Mantra "${mantra.name}" is now ${newStatus ? "Active" : "Inactive"}`
      );
    } catch (err) {
      // Error handled in hook
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!mantraToDelete) return;
    try {
      await deleteMutation.mutateAsync(mantraToDelete._id);

      if (mantras.length === 1 && filters.page > 1) {
        handlePageChange(filters.page - 1);
      }

      setMantraToDelete(null);
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
    <>
      <style>{styles}</style>
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
          <h4 className="mb-0 text-primary-emphasis">Mantra Management</h4>
          <div>
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
                  status={isLoading || isFetching ? "loading" : isError ? "failed" : "succeeded"}
                  error={error}
                  dataLength={mantras.length}
                  colSpan={7}
                  loadingText="Loading mantras..."
                  emptyText="No mantras Found."
                />
                {!isLoading && !isError && Array.isArray(mantras) &&
                  mantras.map((mantra) => (
                    <tr key={mantra._id} className={isFetching ? "opacity-50" : ""}>
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
          isLoading={deleteMutation.isPending}
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