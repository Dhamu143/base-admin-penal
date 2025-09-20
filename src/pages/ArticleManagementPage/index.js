import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select"; // Import react-select

// --- Redux Actions ---
import { fetchArticles, deleteArticle } from "../../store/Articles/index";
import { fetchGods as fetchgods } from "../../store/god/index";
import { staticLanguages } from "../../constants/languages";
import ConfirmationModal from "../../common/ConfirmationModal";
import DynamicImage from "../../components/PostPreview/PostPreview";

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

// Prepare options for react-select
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

  const { list: articles, status, error } = useSelector(
    (state) => state.articles
  );
  const { list: Gods, status: GodStatus } = useSelector((state) => state.God);

  const [isDeleting, setIsDeleting] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  // --- NEW: State for filters ---
  const [filters, setFilters] = useState({ language: "" });

  useEffect(() => {
    if (status === "idle") dispatch(fetchArticles());
    if (GodStatus === "idle") dispatch(fetchgods());
  }, [status, GodStatus, dispatch]);

  // --- NEW: Client-side filtering using useMemo for performance ---
  const filteredArticles = useMemo(() => {
    if (!filters.language) {
      return articles; // No filter, return all articles
    }
    return articles.filter((article) => article.language === filters.language);
  }, [articles, filters.language]);

  const getLanguageNameById = (langId) => {
    const language = staticLanguages.find((lang) => lang._id === langId);
    return language ? language.nativeName : "N/A";
  };

  const getGodNameById = (id) => {
    const god = Gods.find((g) => g._id === id);
    return god ? god.name : "N/A";
  };

  // --- NEW: Handlers for the filter ---
  const handleLanguageChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setFilters((prev) => ({ ...prev, language: value }));
  };

  const handleResetFilters = () => {
    setFilters({ language: "" });
  };

  const confirmDelete = async () => {
    if (!articleToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteArticle(articleToDelete._id)).unwrap();
      toast.success(`Article "${articleToDelete.title}" deleted successfully.`);
      setArticleToDelete(null);
    } catch (err) {
      toast.error(err?.message || "Failed to delete article.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Find the currently selected language object for react-select's value prop
  const selectedLanguage = languageOptions.find(
    (opt) => opt.value === filters.language
  );

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
              <em className="fas fa-plus"></em>
            </span>
            Add New Article
          </button>
        </div>

        {/* --- NEW: Filter Section --- */}
        <div className="card-body border-bottom">
          <div className="row g-3 align-items-center">
            <div style={{ minWidth: "300px" }}>
              <div className="col-md-10">
                <Select
                  placeholder="Filter by language..."
                  options={languageOptions}
                  value={selectedLanguage}
                  onChange={handleLanguageChange}
                  isClearable={true}
                />
              </div>
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-secondary w-100"
                onClick={handleResetFilters}
              >
                <i className="fas fa-undo me-2"></i>Reset
              </button>
            </div>
          </div>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
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
                {status === "loading" && (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="spinner-border text-primary"></div>
                    </td>
                  </tr>
                )}
                {status === "failed" && (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-danger">
                      Error: {error}
                    </td>
                  </tr>
                )}
                {/* --- MODIFIED: Map over filteredArticles --- */}
                {status === "succeeded" && filteredArticles.length > 0
                  ? filteredArticles.map((article) => (
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
                                borderRadius: "50%",
                              }}
                            />
                          ) : (
                            <span className="text-muted">No Image</span>
                          )}
                        </td>
                        <td>{getGodNameById(article.god)}</td>
                        <td>{getLanguageNameById(article.language)}</td>
                        <td>{article.sort}</td>
                        <td>
                          <span
                            className={`badge fs-6 ${
                              article.isFree
                                ? "text-bg-info"
                                : "text-bg-warning"
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
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() =>
                              navigate(`/articles/edit/${article._id}`)
                            }
                          >
                            <i className="fas fa-pencil-alt"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setArticleToDelete(article)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  : status === "succeeded" && (
                      <tr>
                        <td colSpan="8" className="text-center py-5 text-muted">
                          No Articles Found
                        </td>
                      </tr>
                    )}
              </tbody>
            </table>
          </div>
        </div>
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
