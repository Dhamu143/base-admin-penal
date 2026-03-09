import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

import { useBadges, useDeleteBadge, useUpdateBadge } from "../../hooks/useBadge";
import { staticLanguages } from "../../constants/languages";

import FilterBar from "../../common/FilterBar";
import { useFilters } from "../../hooks/useFilters";
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";
import DynamicImage from "../../components/PostPreview/PostPreview";


const styles = `
  .truncate-text {
    max-width: 250px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    vertical-align: middle;
  }
  .badge-thumbnail {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 50%;
  }
  .empty-state-icon {
    font-size: 4rem;
    color: #dee2e6; /* Bootstrap text-muted/light color */
  }
`;

export default function BadgeListPage() {
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
    };
  }, [filters, itemsPerPage]);

  const { data, isLoading, isError, error, isFetching } = useBadges(apiFilters);

  const badges = data?.data || [];
  const pagination = data?.pagination || null;

  const deleteMutation = useDeleteBadge();
  const updateMutation = useUpdateBadge();

  const [badgeToDelete, setBadgeToDelete] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const handleReset = () => {
    resetFilters();
    queryClient.invalidateQueries(["badges"]);
    toast.info("Filters reset and list refreshed");
  };

  const handleStatusToggle = async (badge) => {
    if (togglingId === badge._id) return;
    setTogglingId(badge._id);
    const newStatus = !badge.isActive;

    try {
      await updateMutation.mutateAsync({ id: badge._id, isActive: newStatus });
      toast.success(
        `Badge "${badge.name}" is now ${newStatus ? "Active" : "Inactive"}`
      );
    } catch (err) {
      // Error handled in hook
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!badgeToDelete) return;
    try {
      await deleteMutation.mutateAsync(badgeToDelete._id);

      if (badges.length === 1 && filters.page > 1) {
        handlePageChange(filters.page - 1);
      }

      setBadgeToDelete(null);
    } catch (err) {
      // Error handled in hook
    }
  };

  const getLanguageNameById = (langId) =>
    staticLanguages?.find((lang) => lang._id === langId)?.language || "N/A";

  // Check if we have no data and are not loading/erroring
  const isEmptyState = !isLoading && !isError && badges.length === 0;

  return (
    <>
      <style>{styles}</style>
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
          <h4 className="mb-0 text-primary-emphasis">Badge Management</h4>
          <div>
            <button
              className="btn btn-labeled btn-success"
              style={{ fontSize: "17px" }}
              onClick={() => navigate("/badges/new")}
            >
              <span className="btn-label me-2">
                <i className="fas fa-plus"></i>
              </span>
              Add New Badge
            </button>
          </div>
        </div>

        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          godOptions={[]}
          godStatus="succeeded"
        />

        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Language</th>
                  <th>Information</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* 1. Show standard loading/error states */}
                {(isLoading || isFetching || isError) && (
                  <TableStatus
                    status={isLoading || isFetching ? "loading" : isError ? "failed" : "succeeded"}
                    error={error}
                    dataLength={badges.length}
                    colSpan={6}
                    loadingText="Loading badges..."
                  />
                )}

                {/* 2. Show Beautiful Empty Fallback State */}
                {isEmptyState && (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <div className="py-4">
                        <i className="fas fa-medal empty-state-icon mb-3"></i>
                        <h5 className="text-secondary fw-bold">No Badges Found</h5>
                        <p className="text-muted mb-4">
                          You haven't created any badges yet, or none match your current filters.
                        </p>
                        <button
                          className="btn btn-primary px-4"
                          onClick={() => navigate("/badges/new")}
                        >
                          <i className="fas fa-plus me-2"></i>Create Your First Badge
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {!isEmptyState && !isLoading && !isError &&
                  badges.map((badge) => (
                    <tr key={badge._id} className={isFetching ? "opacity-50" : ""}>
                      <td>
                        {badge.file ? (
                          <DynamicImage 
                            src={badge.file} 
                            alt={badge.name} 
                            size={40}
                          />
                        ) : (
                          <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center badge-thumbnail">
                            <i className="fas fa-award"></i>
                          </div>
                        )}
                      </td>
                      <td style={{ maxWidth: "150px" }}>{badge?.name}</td>
                      <td>{getLanguageNameById(badge?.language)}</td>
                      <td style={{ maxWidth: "400px" }}>
                        <span title={badge?.information?.replace(/<[^>]+>/g, "")}>
                          {badge?.information
                            ?.replace(/<[^>]+>/g, "")
                            .substring(0, 50) + (badge?.information?.length > 50 ? "..." : "")}
                        </span>
                      </td>

                      <td>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={badge?.isActive}
                            disabled={togglingId === badge._id}
                            onChange={() => handleStatusToggle(badge)}
                            style={{ cursor: "pointer" }}
                          />
                          <label className="form-check-label small ms-1">
                            {togglingId === badge._id ? (
                              <span className="spinner-border spinner-border-sm text-secondary"></span>
                            ) : badge.isActive ? (
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
                          onClick={() => navigate(`/badges/edit/${badge._id}`)}
                          title="Edit"
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setBadgeToDelete(badge)}
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
          show={badgeToDelete !== null}
          onClose={() => setBadgeToDelete(null)}
          onConfirm={confirmDelete}
          title="Confirm Deletion"
          confirmText="Delete"
          isLoading={deleteMutation.isPending}
          confirmButtonVariant="danger"
        >
          <p className="fs-5 text-center">
            Are you sure you want to delete <br />
            <strong className="text-danger">{badgeToDelete?.name}</strong>?
          </p>
        </ConfirmationModal>
      </div>
    </>
  );
}