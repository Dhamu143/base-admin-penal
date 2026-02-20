import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

import {
  useArticles,
  useDeleteArticle,
  useUpdateArticle
} from "../../hooks/useArticles";
import { fetchAllGods } from "../../store/god/index";
import { staticLanguages } from "../../constants/languages";

import ConfirmationModal from "../../common/ConfirmationModal";
import DynamicImage from "../../components/PostPreview/PostPreview";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";
import FilterBar from "../../common/FilterBar";
import { useFilters } from "../../hooks/useFilters";

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

  const { data, isLoading, isError, error, isFetching } = useArticles(apiFilters);

  const articles = Array.isArray(data?.data) ? data.data : [];
  const pagination = data?.pagination || null;

  const deleteMutation = useDeleteArticle();
  const updateMutation = useUpdateArticle();

  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  const [articleToDelete, setArticleToDelete] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    if (godStatus === "idle") dispatch(fetchAllGods());
  }, [dispatch, godStatus]);

  useEffect(() => {
    if (filters.page > 1 && (filters.godId || filters.god)) {
      handlePageChange(1);
    }
  }, [filters.godId, filters.god, filters.page, handlePageChange]);


  const handleReset = () => {
    resetFilters();
    queryClient.invalidateQueries(["articles"]);
    toast.info("Filters reset and list refreshed");
  };

  const handleStatusToggle = async (article) => {
    if (togglingId === article._id) return;
    setTogglingId(article._id);
    const newStatus = !article.isActive;

    try {
      await updateMutation.mutateAsync({ id: article._id, isActive: newStatus });
      toast.success(
        `Article "${article.title}" is now ${newStatus ? "Active" : "Inactive"}`
      );
    } catch (err) {
      // Error handled in hook
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!articleToDelete) return;
    try {
      await deleteMutation.mutateAsync(articleToDelete._id);

      if (articles.length === 1 && filters.page > 1) {
        handlePageChange(filters.page - 1);
      }

      setArticleToDelete(null);
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
    <>
      <style>{styles}</style>
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
          <h4 className="mb-0 text-primary-emphasis">Article Management</h4>
          <div>
            <button
              className="btn btn-success"
              onClick={() => navigate("/articles/new")}
            >
              <i className="fas fa-plus me-2"></i> Add New Article
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
                  status={isLoading || isFetching ? "loading" : isError ? "failed" : "succeeded"}
                  error={error}
                  dataLength={articles.length}
                  colSpan={8}
                  loadingText="Loading articles..."
                  emptyText="No articles Found."
                />
                {!isLoading && !isError && Array.isArray(articles) &&
                  articles.map((article) => (
                    <tr key={article._id} className={isFetching ? "opacity-50" : ""}>
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
                          className={`badge ${article.isFree ? "bg-info" : "bg-warning"
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
                            style={{ cursor: "pointer" }}
                          />
                          <label className="form-check-label small ms-1">
                            {togglingId === article._id ? (
                              <span className="spinner-border spinner-border-sm text-secondary"></span>
                            ) : article.isActive ? (
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
        isLoading={deleteMutation.isPending}
        confirmButtonVariant="danger"
      >
        <p className="text-center">
          Are you sure you want to delete <br />
          <strong>{articleToDelete?.title}</strong>?
        </p>
      </ConfirmationModal>
    </>
  );
}