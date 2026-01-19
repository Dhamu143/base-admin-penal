import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// 1. Import QueryClient Hook
import { useQueryClient } from "@tanstack/react-query";

import { useAartis, useDeleteAarti, useUpdateAarti } from "../../hooks/useAarti";
import { fetchAllGods } from "../../store/god/index";
import { staticLanguages } from "../../constants/languages";

import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";
import FilterBar from "../../common/FilterBar";
import { useFilters } from "../../hooks/useFilters";

export default function AartiListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // 2. Initialize QueryClient
  const queryClient = useQueryClient();

  const {
    filters,
    handleFilterChange,
    handlePageChange,
    resetFilters,
  } = useFilters();
  const itemsPerPage = 10;

  const { data, isLoading, isError, error } = useAartis({
    ...filters,
    limit: itemsPerPage
  });

  const aartis = Array.isArray(data?.data) ? data.data : [];
  const pagination = data?.pagination || null;

  const deleteMutation = useDeleteAarti();
  const updateMutation = useUpdateAarti();

  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  const [aartiToDelete, setAartiToDelete] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    if (godStatus === "idle") dispatch(fetchAllGods());
  }, [dispatch, godStatus]);

  // ✅ 3. New Handle Reset Function
  // This resets the filters state AND tells React Query to fetch fresh data
  const handleReset = () => {
    resetFilters(); // 1. Clear State
    queryClient.invalidateQueries(["aartis"]); // 2. Force API Call
    toast.info("Filters reset and list refreshed");
  };

  // ✅ 4. Manual Refresh Button Function
  const handleManualRefresh = () => {
    queryClient.invalidateQueries(["aartis"]);
    toast.success("List refreshed!");
  };

  const handleStatusToggle = async (aarti) => {
    if (togglingId === aarti._id) return;
    setTogglingId(aarti._id);
    const newStatus = !aarti.isActive;

    try {
      await updateMutation.mutateAsync({ id: aarti._id, isActive: newStatus });
      toast.success(
        `Aarti "${aarti.name}" is now ${newStatus ? "Active" : "Inactive"}`
      );
    } catch (err) {
      // Error handled in hook
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!aartiToDelete) return;
    try {
      await deleteMutation.mutateAsync(aartiToDelete._id);
      setAartiToDelete(null);
    } catch (err) {
      // Error handled in hook
    }
  };

  const godOptions = [
    { value: "", label: "All Gods" },
    ...allGods.map((god) => ({ value: god._id, label: god.name })),
  ];

  const getLanguageNameById = (langId) =>
    staticLanguages.find((lang) => lang._id === langId)?.nativeName || "N/A";

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3 border-bottom">
        <h4 className="mb-0 text-primary-emphasis">Aarti Management</h4>
        <div>
          <button
            className="btn btn-success"
            onClick={() => navigate("/aartis/new")}
          >
            <i className="fas fa-plus me-2"></i> Add New Aarti
          </button>
        </div>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset} // ✅ Pass the new reset handler here
        godOptions={godOptions}
        godStatus={godStatus}
      />

      {/* Rest of the table code remains the same... */}
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
                dataLength={aartis.length}
                colSpan={7}
              />
              {!isLoading && !isError && Array.isArray(aartis) &&
                aartis.map((aarti) => (
                  <tr key={aarti._id}>
                    <td className="fw-bold">{aarti?.name || "N/A"}</td>
                    <td>{aarti?.god?.name}</td>
                    <td>{getLanguageNameById(aarti?.language)}</td>
                    <td className="text-muted" style={{ fontSize: "0.9rem" }}>
                      {aarti.description
                        ?.replace(/<[^>]+>/g, "")
                        .substring(0, 40)}
                      ...
                    </td>
                    <td>{aarti?.sort}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="form-check form-switch me-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={aarti.isActive}
                            disabled={togglingId === aarti._id}
                            onChange={() => handleStatusToggle(aarti)}
                            style={{ cursor: "pointer" }}
                          />
                        </div>
                        <span
                          className={`badge rounded-pill ${aarti.isActive
                            ? "bg-success-subtle text-success"
                            : "bg-secondary-subtle text-secondary"
                            }`}
                        >
                          {togglingId === aarti._id ? (
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                            ></span>
                          ) : aarti.isActive ? (
                            "Active"
                          ) : (
                            "Inactive"
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary mr-2"
                        onClick={() => navigate(`/aartis/edit/${aarti._id}`)}
                        title="Edit"
                      >
                        <i className="fas fa-pencil-alt"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setAartiToDelete(aarti)}
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

      {pagination?.totalPages > 1 && (
        <div className="card-footer bg-white border-top">
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
        show={aartiToDelete !== null}
        onClose={() => setAartiToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        isLoading={deleteMutation.isPending}
        confirmButtonVariant="danger"
      >
        <p className="text-center mb-0">
          Are you sure you want to delete <strong>{aartiToDelete?.name}</strong>?
        </p>
      </ConfirmationModal>
    </div>
  );
}