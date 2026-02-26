import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

import {
  useNewsList,
  useDeleteNews,
  useUpdateNews
} from "../../hooks/useNews";

import { useAllGods } from "../../hooks/useGod";
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

export default function NewsManagementPage() {
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

  const { data, isLoading, isError, error, isFetching } = useNewsList(apiFilters);
  const news = data?.data || [];
  const pagination = data?.pagination || null;

  const deleteMutation = useDeleteNews();
  const updateMutation = useUpdateNews();

  const { data: allGods = [], isLoading: isLoadingGods } = useAllGods();

  const [newsToDelete, setNewsToDelete] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    if (filters.page > 1 && (filters.godId || filters.god)) {
      handlePageChange(1);
    }
  }, [filters.godId, filters.god, filters.page, handlePageChange]);

  const handleReset = () => {
    resetFilters();
    queryClient.invalidateQueries(["newsList"]);
    toast.info("Filters reset");
  };

  const handleStatusToggle = async (newsItem) => {
    if (togglingId === newsItem._id) return;
    setTogglingId(newsItem._id);
    const newStatus = !newsItem.isActive;

    try {
      await updateMutation.mutateAsync({ id: newsItem._id, isActive: newStatus });
      toast.success(
        `News "${newsItem.name}" is now ${newStatus ? "Active" : "Inactive"}`
      );
    } catch (err) {
      // Error handled in hook
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!newsToDelete) return;
    try {
      await deleteMutation.mutateAsync(newsToDelete._id);
      if (news.length === 1 && filters.page > 1) {
        handlePageChange(filters.page - 1);
      }
      setNewsToDelete(null);
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
      <style>{styles}</style>

      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">News Management</h4>
        <div>
          <button
            className="btn btn-labeled btn-success"
            style={{ fontSize: "17px" }}
            onClick={() => navigate("/news/new")}
          >
            <span className="btn-label me-2">
              <i className="fas fa-plus"></i>
            </span>
            Add New News
          </button>
        </div>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        godOptions={godOptions}
        godStatus={isLoadingGods ? "loading" : "succeeded"}
      />

      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Title</th>
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
                dataLength={news.length}
                colSpan={7}
                loadingText="Loading news..."
                emptyText="No news Found."
              />
              {!isLoading && !isError && Array.isArray(news) &&
                news.map((newsItem) => (
                  <tr key={newsItem._id} className={isFetching ? "opacity-50" : ""}>
                    <td className="fw-semibold">{newsItem?.name}</td>
                    <td>{newsItem?.god?.name}</td>
                    <td>{getLanguageNameById(newsItem?.language)}</td>
                    <td style={{ maxWidth: "150px" }}>
                      <p className="mb-0">
                        {newsItem?.description
                          ?.replace(/<[^>]+>/g, "")
                          .substring(0, 50)}
                        ...
                      </p>
                    </td>
                    <td>{newsItem?.sort}</td>
                    <td>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={newsItem?.isActive}
                          disabled={togglingId === newsItem._id}
                          onChange={() => handleStatusToggle(newsItem)}
                          style={{ cursor: "pointer" }}
                        />
                        <label className="form-check-label small ms-1">
                          {togglingId === newsItem._id
                            ? <span className="spinner-border spinner-border-sm text-secondary"></span>
                            : newsItem.isActive
                              ? "Active"
                              : "Inactive"}
                        </label>
                      </div>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary mr-2"
                        onClick={() => navigate(`/news/${newsItem._id}/edit`)}
                      >
                        <i className="fas fa-pencil-alt"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setNewsToDelete(newsItem)}
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
        show={newsToDelete !== null}
        onClose={() => setNewsToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">{newsToDelete?.name}</strong>?
        </p>
      </ConfirmationModal>
    </div>
  );
}