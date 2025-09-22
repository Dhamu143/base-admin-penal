import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";

import { fetchNews, deleteNews } from "../../store/news/index"; // <-- Changed
import ConfirmationModal from "../../common/ConfirmationModal";
import { staticLanguages } from "../../constants/languages";
import CustomPagination from "../../common/Pagination";

const languageOptions = [
  { value: "", label: "All Languages" },
  ...staticLanguages.map((lang) => ({
    value: lang._id,
    label: `${lang.language} (${lang.nativeName})`,
  })),
];

export default function NewsManagementPage() {
  // <-- Changed
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: news, pagination, status, error } = useSelector(
    (state) => state.news // <-- Changed
  );

  const [newsToDelete, setNewsToDelete] = useState(null); // <-- Changed
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState({ language: "" });

  const itemsPerPage = 10;

  const loadNews = (params = {}) => {
    // <-- Changed
    dispatch(fetchNews({ ...params, pageSize: itemsPerPage })) // <-- Changed
      .unwrap()
      .catch((err) => toast.error(err || "Failed to load news.")); // <-- Changed
  };

  useEffect(() => {
    loadNews({ page: 1 });
  }, [dispatch]);

  const handleLanguageChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setFilters((prev) => ({ ...prev, language: value }));
    loadNews({ language: value, page: 1 });
  };

  const handleResetFilters = () => {
    setFilters({ language: "" });
    loadNews({ language: "", page: 1 });
  };

  const handlePageChange = (newPage) => loadNews({ ...filters, page: newPage });

  const confirmDelete = async () => {
    if (!newsToDelete) return; // <-- Changed
    setIsDeleting(true);
    try {
      await dispatch(deleteNews(newsToDelete._id)).unwrap(); // <-- Changed
      toast.success(`News "${newsToDelete.name}" deleted successfully.`); // <-- Changed
      loadNews({ ...filters, page: pagination?.currentPage || 1 });
      setNewsToDelete(null); // <-- Changed
    } catch (err) {
      toast.error(err || "Failed to delete news item."); // <-- Changed
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedLanguage = languageOptions.find(
    (opt) => opt.value === filters.language
  );

  return (
    <div className="card shadow-sm">
      {/* Header */}
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">📰 News Management</h4>{" "}
        {/* <-- Changed */}
        <button
          className="btn btn-labeled btn-success"
          type="button"
          style={{ fontSize: "17px" }}
          onClick={() => navigate("/news/new")} // <-- Changed
        >
          <span className="btn-label me-2">
            <i className="fas fa-plus"></i>
          </span>
          Add New News {/* <-- Changed */}
        </button>
      </div>

      {/* Filters Section */}
      <div className="card-body border-bottom">
        <div className="d-flex flex-column flex-md-row align-items-md-center gap-3">
          <div style={{ minWidth: "300px" }}>
            <label className="form-label fw-bold small mb-1">
              Filter by Language
            </label>
            <Select
              placeholder="Select..."
              options={languageOptions}
              value={selectedLanguage}
              onChange={handleLanguageChange}
              isClearable={true}
              classNamePrefix="react-select"
            />
          </div>
          <div className="mt-md-auto">
            <button
              className="btn btn-outline-secondary w-100 ml-4"
              onClick={handleResetFilters}
            >
              <i className="fas fa-undo me-2"></i>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Title</th>
                <th>Language</th>
                <th>Description</th>
                <th>Sort</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {status === "loading" && (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              )}
              {status === "failed" && (
                <tr>
                  <td colSpan="6" className="text-center text-danger py-5">
                    <strong>Error:</strong> {error}
                  </td>
                </tr>
              )}
              {status === "succeeded" &&
              news.length === 0 && ( // <-- Changed
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-5">
                      No News Found. {/* <-- Changed */}
                    </td>
                  </tr>
                )}
              {status === "succeeded" &&
                news.map((
                  newsItem // <-- Changed
                ) => (
                  <tr key={newsItem._id}>
                    <td className="fw-semibold">{newsItem.name}</td>
                    <td>
                      {staticLanguages.find(
                        (lang) => lang._id === newsItem.language
                      )?.language || "N/A"}
                    </td>
                    <td
                      style={{
                        maxWidth: "200px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={newsItem.description.replace(/<[^>]+>/g, "")}
                    >
                      {newsItem.description.replace(/<[^>]+>/g, "")}
                    </td>
                    <td>{newsItem.sort}</td>
                    <td>
                      <span
                        className={`badge fs-6 ${
                          newsItem.isActive
                            ? "text-bg-success"
                            : "text-bg-secondary"
                        }`}
                      >
                        {newsItem.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => navigate(`/news/${newsItem._id}/edit`)} // <-- Changed
                        title="Edit"
                      >
                        <i className="fas fa-pencil-alt"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setNewsToDelete(newsItem)} // <-- Changed
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

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="card-footer">
          <CustomPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            totalItems={pagination.totalRecords}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmationModal
        show={newsToDelete !== null} // <-- Changed
        onClose={() => setNewsToDelete(null)} // <-- Changed
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={isDeleting}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">{newsToDelete?.name}</strong>?{" "}
          {/* <-- Changed */}
        </p>
        <p className="text-muted text-center">This action cannot be undone.</p>
      </ConfirmationModal>
    </div>
  );
}
