import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

import {
  useSloks,
  useDeleteSlok,
  useUpdateSlok
} from "../../hooks/useSloks";

import { fetchAllGods } from "../../store/god";
import { staticLanguages } from "../../constants/languages";

import FilterBar from "../../common/FilterBar";
import { useFilters } from "../../hooks/useFilters";
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";

export default function SlokListPage() {
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

  const { data, isLoading, isError, error } = useSloks({
    ...filters,
    limit: itemsPerPage
  });

  const sloks = data?.data || [];
  const pagination = data?.pagination || null;

  const deleteMutation = useDeleteSlok();
  const updateMutation = useUpdateSlok();

  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  const [slokToDelete, setSlokToDelete] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    if (godStatus === "idle") {
      dispatch(fetchAllGods());
    }
  }, [dispatch, godStatus]);

  const handleManualRefresh = () => {
    queryClient.invalidateQueries(["sloks"]);
    toast.success("List refreshed!");
  };

  const handleReset = () => {
    resetFilters();
    queryClient.invalidateQueries(["sloks"]);
    toast.info("Filters reset and list refreshed");
  };

  const handleStatusToggle = async (slok) => {
    if (togglingId === slok._id) return;
    setTogglingId(slok._id);
    const newStatus = !slok.isActive;

    try {
      await updateMutation.mutateAsync({ id: slok._id, isActive: newStatus });
      toast.success(
        `Sloka "${slok.name}" is now ${newStatus ? "Active" : "Inactive"}`
      );
    } catch (err) {
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!slokToDelete) return;
    try {
      await deleteMutation.mutateAsync(slokToDelete._id);

      if (sloks.length === 1 && filters.page > 1) {
        handlePageChange(filters.page - 1);
      }

      setSlokToDelete(null);
    } catch (err) {
    }
  };

  const getLanguageNameById = (langId) =>
    staticLanguages.find((l) => l._id === langId)?.language || "N/A";

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
        <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
          <h4 className="mb-0 text-primary-emphasis">Sloka Management</h4>
          <div>
          
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
                  status={isLoading ? "loading" : isError ? "failed" : "succeeded"}
                  error={error}
                  dataLength={sloks.length}
                  colSpan={7}
                  loadingText="Loading sloks..."
                  emptyText="No sloks Found."
                />
                {!isLoading && !isError && Array.isArray(sloks) &&
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
          show={slokToDelete !== null}
          onClose={() => setSlokToDelete(null)}
          onConfirm={confirmDelete}
          title="Confirm Deletion"
          confirmText="Delete"
          isLoading={deleteMutation.isPending}
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