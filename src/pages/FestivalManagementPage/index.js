import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";

// --- Festival Actions ---
import { fetchFestivals, deleteFestival } from "../../store/festival/index";

// --- Reusable Components & Data ---
import { staticLanguages } from "../../constants/languages";
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";

// --- Prepare options for react-select ---
const languageOptions = [
  { value: "", label: "All Languages" },
  ...staticLanguages.map((lang) => ({
    value: lang._id,
    label: `${lang.language} (${lang.nativeName})`,
  })),
];

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

export default function FestivalListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: festivals, pagination, status, error } = useSelector(
    (state) => state.festivals
  );

  const [isDeleting, setIsDeleting] = useState(false);
  const [festivalToDelete, setFestivalToDelete] = useState(null);
  const [filters, setFilters] = useState({ language: "" });

  const itemsPerPage = 1;

  const loadFestivals = useCallback(
    (params = {}) => {
      // 🔄 MODIFIED: Changed 'pageSize' to 'limit' to match your other working APIs
      dispatch(fetchFestivals({ ...params, limit: itemsPerPage }))
        .unwrap()
        .catch((err) => toast.error(err || "Failed to load festivals."));
    },
    [dispatch, itemsPerPage]
  );

  useEffect(() => {
    loadFestivals({ page: 1 });
  }, [loadFestivals]);

  const getLanguageNameById = (langId) => {
    const language = staticLanguages.find((lang) => lang._id === langId);
    return language ? language.nativeName : "N/A";
  };

  const handleLanguageChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setFilters((prev) => ({ ...prev, language: value }));
    loadFestivals({ language: value, page: 1 });
  };

  const handleResetFilters = () => {
    setFilters({ language: "" });
    loadFestivals({ language: "", page: 1 });
  };

  const handlePageChange = (newPage) =>
    loadFestivals({ ...filters, page: newPage });

  const confirmDelete = async () => {
    if (!festivalToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteFestival(festivalToDelete._id)).unwrap();
      toast.success(
        `Festival "${festivalToDelete.name}" deleted successfully.`
      );

      // 🔄 MODIFIED: Better UX when deleting the last item on a page
      const currentPage = pagination?.currentPage || 1;
      if (festivals.length === 1 && currentPage > 1) {
        loadFestivals({ ...filters, page: currentPage - 1 });
      } else {
        loadFestivals({ ...filters, page: currentPage });
      }

      setFestivalToDelete(null);
    } catch (err) {
      toast.error(err?.message || "Failed to delete the festival.");
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedLanguage = languageOptions.find(
    (opt) => opt.value === filters.language
  );

  return (
    <>
      <style>{styles}</style>
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
          <h4 className="mb-0 text-primary-emphasis">🎉 Festival Management</h4>
          <button
            className="btn btn-labeled btn-success"
            type="button"
            onClick={() => navigate("/festivals/new")}
          >
            <span className="btn-label me-2">
              <i className="fas fa-plus"></i>
            </span>
            Add New Festival
          </button>
        </div>

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
                <span className="me-2">
                  <i className="fas fa-undo"></i>
                </span>
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>God</th>
                  <th>Language</th>
                  <th>Description</th>
                  <th>Sort Order</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {status === "loading" && (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="spinner-border text-primary"></div>
                    </td>
                  </tr>
                )}
                {status === "failed" && (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-danger">
                      <i className="fas fa-exclamation-triangle me-2"></i>{" "}
                      Error: {error}
                    </td>
                  </tr>
                )}
                {status === "succeeded" && festivals.length > 0
                  ? festivals.map((festival) => (
                      <tr key={festival._id}>
                        <td className="fw-bold">{festival.name}</td>
                        <td>{festival.god?.name || "N/A"}</td>
                        <td>{getLanguageNameById(festival.language)}</td>
                        <td>
                          <span
                            className="truncate-text"
                            title={festival.description.replace(/<[^>]+>/g, "")}
                          >
                            {festival.description.replace(/<[^>]+>/g, "")}
                          </span>
                        </td>
                        <td>{festival.sort}</td>
                        <td>
                          <span
                            className={`badge fs-6 ${
                              festival.isActive
                                ? "text-bg-success"
                                : "text-bg-secondary"
                            }`}
                          >
                            {festival.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() =>
                              navigate(`/festivals/edit/${festival._id}`)
                            }
                            title="Edit"
                          >
                            <i className="fas fa-pencil-alt"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setFestivalToDelete(festival)}
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  : status === "succeeded" && (
                      <tr>
                        <td colSpan="7" className="text-center py-5 text-muted">
                          No Festivals Found.
                        </td>
                      </tr>
                    )}
              </tbody>
            </table>
          </div>
        </div>

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
      </div>

      <ConfirmationModal
        show={festivalToDelete !== null}
        onClose={() => setFestivalToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={isDeleting}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">{festivalToDelete?.name}</strong>?
        </p>
      </ConfirmationModal>
    </>
  );
}
