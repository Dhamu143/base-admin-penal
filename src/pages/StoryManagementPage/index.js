import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import { fetchStories, deleteStory } from "../../store/story/index";
import { fetchAllGods } from "../../store/god";
import ConfirmationModal from "../../common/ConfirmationModal";
import { staticLanguages } from "../../constants/languages";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";

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
  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  const [storyToDelete, setStoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [filters, setFilters] = useState({ language: "", god: "", page: 1 });
  const itemsPerPage = 10;

  const loadStories = useCallback(() => {
    dispatch(fetchStories({ ...filters, limit: itemsPerPage }))
      .unwrap()
      .catch((err) => toast.error(err?.message || "Failed to load stories."));
  }, [dispatch, filters, itemsPerPage]);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  useEffect(() => {
    if (godStatus === "idle") {
      dispatch(fetchAllGods());
    }
  }, [dispatch, godStatus]);

  const getLanguageNameById = (langId) =>
    staticLanguages.find((lang) => lang._id === langId)?.language || "N/A";

  const handleLanguageChange = (option) => {
    const value = option?.value || "";
    setFilters((prev) => ({ ...prev, language: value, page: 1 }));
  };

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

  const confirmDelete = async () => {
    if (!storyToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteStory(storyToDelete._id)).unwrap();
      toast.success(`Story "${storyToDelete.name}" deleted successfully.`);

      if (stories.length === 1 && filters.page > 1) {
        setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
      } else {
        loadStories();
      }
      setStoryToDelete(null);
    } catch (err) {
      toast.error(err?.message || "Failed to delete story.");
    } finally {
      setIsDeleting(false);
    }
  };

  const godOptions = [
    { value: "", label: "All Gods" },
    ...allGods.map((god) => ({ value: god._id, label: god.name })),
  ];

  const selectedLanguage = languageOptions.find(
    (opt) => opt.value === filters.language
  );
  const selectedGod = godOptions.find((opt) => opt.value === filters.god);

  return (
    <div className="card shadow-sm">
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

          <div className="mt-md-auto ms-md-auto">
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
                dataLength={stories.length}
                colSpan={7}
                loadingText="Loading stories..."
                emptyText="No stories Found."
              />
              {status === "succeeded" &&
                stories.map((storyItem) => (
                  <tr key={storyItem._id}>
                    <td className="fw-semibold">{storyItem?.name}</td>
                    <td>{storyItem?.god?.name}</td>
                    <td>{getLanguageNameById(storyItem?.language)}</td>
                    <td
                      style={{
                        maxWidth: "200px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={storyItem?.description.replace(/<[^>]+>/g, "")}
                    >
                      {storyItem?.description.replace(/<[^>]+>/g, "")}
                    </td>
                    <td>{storyItem?.sort}</td>
                    <td>
                      {storyItem?.isActive ? (
                        <span className="badge bg-success">Active</span>
                      ) : (
                        <span className="badge bg-secondary">Inactive</span>
                      )}
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary mr-2"
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
      </ConfirmationModal>
    </div>
  );
}
