import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";

import { fetchStories, deleteStory } from "../../store/story/index";
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

export default function StoryManagementPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: stories, pagination, status, error } = useSelector(
    (state) => state.story
  );

  const [storyToDelete, setStoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState({ language: "" });

  const itemsPerPage = 1;

  // 🔄 MODIFIED: Wrapped in useCallback and changed 'pageSize' to 'limit'
  const loadStories = useCallback(
    (params = {}) => {
      // Your API expects 'limit', not 'pageSize'
      dispatch(fetchStories({ ...params, limit: itemsPerPage }))
        .unwrap()
        .catch((err) => toast.error(err || "Failed to load stories."));
    },
    [dispatch, itemsPerPage]
  ); // Added dependencies

  useEffect(() => {
    loadStories({ page: 1 });
  }, [loadStories]); // 🔄 MODIFIED: Correct dependency

  const handleLanguageChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setFilters((prev) => ({ ...prev, language: value }));
    loadStories({ language: value, page: 1 });
  };

  const handleResetFilters = () => {
    setFilters({ language: "" });
    loadStories({ language: "", page: 1 });
  };

  const handlePageChange = (newPage) =>
    loadStories({ ...filters, page: newPage });

  const confirmDelete = async () => {
    if (!storyToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteStory(storyToDelete._id)).unwrap();
      toast.success(`Story "${storyToDelete.name}" deleted successfully.`);

      // 💡 UX Improvement: Smarter reload logic after delete
      const currentPage = pagination?.currentPage || 1;
      if (stories.length === 1 && currentPage > 1) {
        // If it was the last item on a page, fetch the previous page
        loadStories({ ...filters, page: currentPage - 1 });
      } else {
        // Otherwise, reload the current page
        loadStories({ ...filters, page: currentPage });
      }

      setStoryToDelete(null);
    } catch (err) {
      toast.error(err || "Failed to delete story.");
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
        <h4 className="mb-0 text-primary-emphasis">📚 Story Management</h4>
        <button
          className="btn btn-labeled btn-success"
          type="button"
          style={{ fontSize: "17px" }}
          onClick={() => navigate("/story/new")}
        >
          <span className="btn-label me-2">
            <i className="fas fa-plus"></i>
          </span>
          Add New Story
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
              className="btn btn-outline-secondary w-100"
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
                    <div className="spinner-border text-primary"></div>
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
              {status === "succeeded" && stories.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-5">
                    No Stories Found.
                  </td>
                </tr>
              )}
              {status === "succeeded" &&
                stories.map((storyItem) => (
                  <tr key={storyItem._id}>
                    <td className="fw-semibold">{storyItem.name}</td>
                    <td>
                      {staticLanguages.find(
                        (lang) => lang._id === storyItem.language
                      )?.language || "N/A"}
                    </td>
                    <td
                      style={{
                        maxWidth: "200px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={storyItem.description.replace(/<[^>]+>/g, "")}
                    >
                      {storyItem.description.replace(/<[^>]+>/g, "")}
                    </td>
                    <td>{storyItem.sort}</td>
                    <td>
                      <span
                        className={`badge fs-6 ${
                          storyItem.isActive
                            ? "text-bg-success"
                            : "text-bg-secondary"
                        }`}
                      >
                        {storyItem.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => navigate(`/story/${storyItem._id}/edit`)}
                        title="Edit"
                      >
                        <i className="fas fa-pencil-alt"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setStoryToDelete(storyItem)}
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
        show={storyToDelete !== null}
        onClose={() => setStoryToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={isDeleting}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">{storyToDelete?.name}</strong>?
        </p>
        <p className="text-muted text-center">This action cannot be undone.</p>
      </ConfirmationModal>
    </div>
  );
}
