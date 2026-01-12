import React, { useEffect, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import FilterBar from "../../common/FilterBar"; 
import { useFilters } from "../../hook/useFilters"; 
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";

import { fetchNews, deleteNews, updateNews } from "../../store/news/index";
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

export default function NewsManagementPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const itemsPerPage = 10;

  const {
    filters,
    handleFilterChange,
    handlePageChange,
    resetFilters,
  } = useFilters(1);

  const { list: news, pagination, status, error } = useSelector(
    (state) => state.news
  );
  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  const [newsToDelete, setNewsToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const loadNews = useCallback(() => {
    dispatch(fetchNews({ ...filters, limit: itemsPerPage }))
      .unwrap()
      .catch((err) => toast.error(err?.message || "Failed to load news."));
  }, [dispatch, filters, itemsPerPage]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  useEffect(() => {
    if (godStatus === "idle") {
      dispatch(fetchAllGods());
    }
  }, [dispatch, godStatus]);

  // Actions
  const handleStatusToggle = async (newsItem) => {
    if (togglingId === newsItem._id) return;
    setTogglingId(newsItem._id);
    const newStatus = !newsItem.isActive;

    try {
      await dispatch(
        updateNews({ id: newsItem._id, isActive: newStatus })
      ).unwrap();
      toast.success(
        `News "${newsItem.name}" is now ${newStatus ? "Active" : "Inactive"}`
      );
    } catch (err) {
      toast.error(err?.message || "Failed to update status.");
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!newsToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteNews(newsToDelete._id)).unwrap();
      toast.success(`News "${newsToDelete.name}" deleted successfully.`);

      if (news.length === 1 && filters.page > 1) {
        handlePageChange(filters.page - 1);
      } else {
        loadNews();
      }
      setNewsToDelete(null);
    } catch (err) {
      toast.error(err?.message || "Failed to delete news item.");
    } finally {
      setIsDeleting(false);
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

      {/* Header */}
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">News Management</h4>
        <button
          className="btn btn-labeled btn-success"
          onClick={() => navigate("/news/new")}
        >
          <span className="btn-label me-2">
            <i className="fas fa-plus"></i>
          </span>
          Add New News
        </button>
      </div>

      {/* Reusable Filter Bar */}
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
                status={status}
                error={error}
                dataLength={news.length}
                colSpan={7}
                loadingText="Loading news..."
                emptyText="No news Found."
              />
              {status === "succeeded" &&
                news.map((newsItem) => (
                  <tr key={newsItem._id}>
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
                            ? "..."
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

      {/* Modals */}
      <ConfirmationModal
        show={newsToDelete !== null}
        onClose={() => setNewsToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={isDeleting}
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
