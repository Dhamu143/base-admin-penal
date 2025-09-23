import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";

// --- Redux Actions ---
import { fetchArticles, deleteArticle } from "../../store/Articles/index";
// ✨ NEW: Renamed import for clarity, though functionality is the same.
import { fetchAllGods } from "../../store/god/index";
import { staticLanguages } from "../../constants/languages";

// --- Common Components ---
import ConfirmationModal from "../../common/ConfirmationModal";
import DynamicImage from "../../components/PostPreview/PostPreview";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";

const styles = `
  .truncate-text {
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    vertical-align: middle;
  }
`;

const languageOptions = [
  { value: "", label: "All Languages" },
  ...staticLanguages.map((lang) => ({
    value: lang._id,
    label: `${lang.language} (${lang.nativeName})`,
  })),
];

export default function ArticleListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: articles, pagination, status, error } = useSelector(
    (state) => state.articles
  );
  // 🔄 MODIFIED: Using masterList to align with the pattern, assuming your slice provides it.
  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  const [isDeleting, setIsDeleting] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);

  // 🔄 MODIFIED: Centralized filters state, including 'god' and 'page'.
  const [filters, setFilters] = useState({ language: "", god: "", page: 1 });
  const itemsPerPage = 10; // You can adjust this value

  // 🔄 MODIFIED: Simplified loadArticles, now dependent on the central 'filters' state.
  const loadArticles = useCallback(() => {
    dispatch(fetchArticles({ ...filters, limit: itemsPerPage }))
      .unwrap()
      .catch((err) => toast.error(err?.message || "Failed to load articles."));
  }, [dispatch, filters, itemsPerPage]);

  // 🔄 MODIFIED: This useEffect now correctly handles all data loading for articles.
  // It runs ONLY when the filters (language, god, or page) change.
  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  // ✨ NEW: This useEffect fetches the master list of gods, but only once.
  useEffect(() => {
    if (godStatus === "idle") {
      dispatch(fetchAllGods());
    }
  }, [dispatch, godStatus]);

  // Helper Functions
  const getLanguageNameById = (langId) =>
    staticLanguages.find((lang) => lang._id === langId)?.nativeName || "N/A";

  const getGodNameById = (godId) =>
    allGods.find((g) => g._id === godId)?.name || "N/A";

  // --- Event Handlers ---

  // 🔄 MODIFIED: Handlers now ONLY update state. The useEffect above handles fetching.
  const handleLanguageChange = (option) => {
    const value = option?.value || "";
    setFilters((prev) => ({ ...prev, language: value, page: 1 }));
  };

  // ✨ NEW: Handler for the new God filter.
  const handleGodChange = (option) => {
    const value = option?.value || "";
    setFilters((prev) => ({ ...prev, god: value, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({ language: "", god: "", page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage !== filters.page) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  // 🔄 MODIFIED: Deletion logic now correctly reloads or changes page.
  const confirmDelete = async () => {
    if (!articleToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteArticle(articleToDelete._id)).unwrap();
      toast.success(`Article "${articleToDelete.title}" deleted successfully.`);

      if (articles.length === 1 && filters.page > 1) {
        setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
      } else {
        loadArticles();
      }
      setArticleToDelete(null);
    } catch (err) {
      toast.error(err?.message || "Failed to delete article.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ✨ NEW: Options for the God filter dropdown.
  const godOptions = [
    { value: "", label: "All Gods" },
    ...allGods.map((god) => ({ value: god._id, label: god.name })),
  ];

  const selectedLanguage = languageOptions.find(
    (opt) => opt.value === filters.language
  );
  // ✨ NEW: Find the currently selected god option.
  const selectedGod = godOptions.find((opt) => opt.value === filters.god);

  return (
    <>
      <style>{styles}</style>
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
          <h4 className="mb-0 text-primary-emphasis">📰 Article Management</h4>
          <button
            className="btn btn-labeled btn-success"
            type="button"
            style={{ fontSize: "17px" }}
            onClick={() => navigate("/articles/new")}
          >
            <span className="btn-label me-2">
              <i className="fas fa-plus"></i>
            </span>
            Add New Article
          </button>
        </div>

        {/* 🔄 MODIFIED: Filter section with new God filter */}
        <div className="card-body border-bottom">
          <div className="d-flex flex-column flex-md-row align-items-md-center">
            <div className="me-md-4 mb-3 mb-md-0" style={{ minWidth: "250px" }}>
              <label className="form-label fw-bold small mb-1">
                Filter by Language
              </label>
              <Select
                placeholder="Select Language..."
                options={languageOptions}
                value={selectedLanguage}
                onChange={handleLanguageChange}
                isClearable
                classNamePrefix="react-select"
              />
            </div>

            {/* ✨ NEW: God Filter Select component */}
            <div className="ml-4" style={{ minWidth: "250px" }}>
              <label className="form-label fw-bold small mb-1">
                Filter by God
              </label>
              <Select
                placeholder="Select God..."
                options={godOptions}
                value={selectedGod}
                onChange={handleGodChange}
                isClearable
                isLoading={godStatus === "loading"}
                isDisabled={godStatus !== "succeeded"}
                classNamePrefix="react-select"
              />
            </div>

            <div className="mt-md-auto ms-md-2">
              <button
                className="btn btn-outline-secondary w-100 p-2 ml-4"
                onClick={handleResetFilters}
              >
                <i className="fas fa-undo mr-1"></i>Reset
              </button>
            </div>
          </div>
        </div>

        <div className="card-body">
          {/* Table and other content remains the same */}
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              {/* ... thead ... */}
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>Image</th>
                  <th>God</th>
                  <th>Language</th>
                  <th>Sort</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <TableStatus
                  status={status}
                  error={error}
                  dataLength={articles.length}
                  colSpan={7}
                  loadingText="Loading articles..."
                  emptyText="No articles Found."
                />
                {/* ... map through articles ... */}
                {status === "succeeded" &&
                  articles.map((article) => (
                    <tr key={article._id}>
                      <td className="fw-bold">
                        <span className="truncate-text" title={article.title}>
                          {article.title}
                        </span>
                      </td>
                      <td>
                        {article.featureimage ? (
                          <DynamicImage
                            src={article.featureimage}
                            alt={article.title}
                            style={{
                              width: "60px",
                              height: "60px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        ) : (
                          <div
                            className="d-flex justify-content-center align-items-center bg-light"
                            style={{
                              width: "60px",
                              height: "60px",
                              borderRadius: "8px",
                            }}
                          >
                            <i className="fas fa-image text-muted"></i>
                          </div>
                        )}
                      </td>
                      <td>{article.god.name}</td>
                      <td>{getLanguageNameById(article.language)}</td>
                      <td>{article.sort}</td>
                      <td>
                        <span
                          className={`badge fs-6 ${
                            article.isFree ? "text-bg-info" : "text-bg-warning"
                          }`}
                        >
                          {article.isFree ? "Free" : "Premium"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge fs-6 ${
                            article.isActive
                              ? "text-bg-success"
                              : "text-bg-secondary"
                          }`}
                        >
                          {article.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary mr-2"
                          onClick={() =>
                            navigate(`/articles/edit/${article._id}`)
                          }
                          title="Edit"
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setArticleToDelete(article)}
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

        {/* 🔄 MODIFIED: Pagination now reads from the unified filters state */}
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
      </div>

      <ConfirmationModal
        show={articleToDelete !== null}
        onClose={() => setArticleToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        isLoading={isDeleting}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">{articleToDelete?.title}</strong>?
        </p>
      </ConfirmationModal>
    </>
  );
}
