import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  fetchArticles,
  deleteArticle,
  updateArticle,
} from "../../store/Articles/index";
import { fetchAllGods } from "../../store/god/index";
import { staticLanguages } from "../../constants/languages";

import ConfirmationModal from "../../common/ConfirmationModal";
import DynamicImage from "../../components/PostPreview/PostPreview";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";
import FilterBar from "../../common/FilterBar"; 
import { useFilters } from "../../hook/useFilters"; 

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

export default function ArticleListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: articles, pagination, status, error } = useSelector(
    (state) => state.articles
  );
  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  const [isDeleting, setIsDeleting] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const {
    filters,
    handleFilterChange,
    handlePageChange,
    resetFilters,
  } = useFilters();
  const itemsPerPage = 10;

  const loadArticles = useCallback(() => {
    dispatch(fetchArticles({ ...filters, limit: itemsPerPage }))
      .unwrap()
      .catch((err) => toast.error(err?.message || "Failed to load articles."));
  }, [dispatch, filters, itemsPerPage]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  useEffect(() => {
    if (godStatus === "idle") dispatch(fetchAllGods());
  }, [dispatch, godStatus]);

  const handleStatusToggle = async (article) => {
    if (togglingId === article._id) return;
    setTogglingId(article._id);
    const newStatus = !article.isActive;

    try {
      await dispatch(
        updateArticle({ id: article._id, isActive: newStatus })
      ).unwrap();
      toast.success(
        `Article "${article.title}" is now ${newStatus ? "Active" : "Inactive"}`
      );
    } catch (err) {
      toast.error(err?.message || "Failed to update status.");
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!articleToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteArticle(articleToDelete._id)).unwrap();
      toast.success(`Article deleted successfully.`);
      loadArticles();
      setArticleToDelete(null);
    } catch (err) {
      toast.error(err?.message || "Failed to delete article.");
    } finally {
      setIsDeleting(false);
    }
  };

  const godOptions = [
    { value: "", label: "All Gods" },
    ...allGods.map((god) => ({ value: god._id, label: god.name })),
  ];

  const getLanguageNameById = (langId) =>
    staticLanguages.find((lang) => lang._id === langId)?.nativeName || "N/A";

  return (
    <>
      <style>{styles}</style>
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
          <h4 className="mb-0 text-primary-emphasis">Article Management</h4>
          <button
            className="btn btn-success"
            onClick={() => navigate("/articles/new")}
          >
            <i className="fas fa-plus me-2"></i> Add New Article
          </button>
        </div>

        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
          godOptions={godOptions}
          godStatus={godStatus}
        />

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
                  <th>Membership</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <TableStatus
                  status={status}
                  error={error}
                  dataLength={articles.length}
                  colSpan={8}
                />
                {status === "succeeded" &&
                  articles.map((article) => (
                    <tr key={article._id}>
                      <td className="fw-bold">
                        <span className="truncate-text" title={article?.title}>
                          {article?.title}
                        </span>
                      </td>
                      <td>
                        {article.featureimage ? (
                          <DynamicImage
                            src={article?.featureimage}
                            alt={article?.title}
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                              borderRadius: "6px",
                            }}
                          />
                        ) : (
                          <div
                            className="bg-light d-flex align-items-center justify-content-center"
                            style={{
                              width: "50px",
                              height: "50px",
                              borderRadius: "6px",
                            }}
                          >
                            <i className="fas fa-image text-muted"></i>
                          </div>
                        )}
                      </td>
                      <td>{article?.god?.name}</td>
                      <td>{getLanguageNameById(article?.language)}</td>
                      <td>{article?.sort}</td>
                      <td>
                        <span
                          className={`badge ${
                            article.isFree ? "bg-info" : "bg-warning"
                          }`}
                        >
                          {article.isFree ? "Free" : "Paid"}
                        </span>
                      </td>
                      <td>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={article.isActive}
                            disabled={togglingId === article._id}
                            onChange={() => handleStatusToggle(article)}
                          />
                        </div>
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary mr-2"
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
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {pagination?.totalPages > 1 && (
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
        <p className="text-center">
          Are you sure you want to delete{" "}
          <strong>{articleToDelete?.title}</strong>?
        </p>
      </ConfirmationModal>
    </>
  );
}
