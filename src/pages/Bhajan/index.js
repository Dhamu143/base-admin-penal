import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";

// --- Redux Actions ---
import { fetchGods, deleteGod } from "../../store/god/index";

// --- Static Data & Components ---
import { staticLanguages } from "../../constants/languages";
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";

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

const languageOptions = [
  { value: "", label: "All Languages" },
  ...staticLanguages.map((lang) => ({
    value: lang._id,
    label: `${lang.language} (${lang.nativeName})`,
  })),
];

export default function GodListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: gods, pagination, status, error } = useSelector(
    (state) => state.God
  );

  const [isDeleting, setIsDeleting] = useState(false);
  const [godToDelete, setGodToDelete] = useState(null);
  const [filters, setFilters] = useState({ language: "" });

  const itemsPerPage = 10;

  const loadGods = useCallback(
    (params = {}) => {
      dispatch(fetchGods({ ...params, limit: itemsPerPage }))
        .unwrap()
        .catch((err) => toast.error(err || "Failed to load gods."));
    },
    [dispatch]
  );

  useEffect(() => {
    loadGods({ page: 1 });
  }, [loadGods]);

  const handleLanguageChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setFilters({ language: value });
    loadGods({ language: value, page: 1 });
  };

  const handleResetFilters = () => {
    setFilters({ language: "" });
    loadGods({ language: "", page: 1 });
  };

  const handlePageChange = (newPage) => {
    loadGods({ ...filters, page: newPage });
  };

  const confirmDelete = async () => {
    if (!godToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteGod(godToDelete._id)).unwrap();
      toast.success(`God "${godToDelete.name}" deleted successfully.`);

      const currentPage = pagination?.currentPage || 1;
      if (gods.length === 1 && currentPage > 1) {
        loadGods({ ...filters, page: currentPage - 1 });
      } else {
        loadGods({ ...filters, page: currentPage });
      }

      setGodToDelete(null);
    } catch (err) {
      toast.error(err?.message || "An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedLanguage = languageOptions.find(
    (opt) => opt.value === filters.language
  );

  return (
    <div className="content-wrapper p-4">
      <style>{styles}</style>

      <div className="mb-4 d-flex align-items-center justify-content-between">
        <h4 className="mb-0 text-primary-emphasis">✨ God Management</h4>
        <button
          className="btn btn-labeled btn-success"
          type="button"
          onClick={() => navigate("/god-form")}
        >
          <span className="btn-label me-2">
            <em className="fas fa-plus"></em>
          </span>
          Add New God
        </button>
      </div>

      <div className="card shadow-sm">
        {/* Filters */}
        <div className="card-body border-bottom">
          <div className="d-flex flex-column flex-md-row align-items-md-center gap-3">
            <div style={{ minWidth: "300px" }}>
              <label className="form-label fw-bold small mb-1">
                Filter by Language
              </label>
              <Select
                options={languageOptions}
                value={selectedLanguage}
                onChange={handleLanguageChange}
                placeholder="Select Language..."
                isClearable
                classNamePrefix="react-select"
              />
            </div>
            <div className="mt-md-auto">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={handleResetFilters}
              >
                <i className="fas fa-undo me-2"></i>Reset
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Master</th>
                  <th>Language</th>
                  <th>Sort</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {status === "loading" && (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="spinner-border"></div>
                    </td>
                  </tr>
                )}
                {status === "failed" && (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-danger">
                      Error: {error}
                    </td>
                  </tr>
                )}
                {status === "succeeded" && gods.length > 0
                  ? gods.map((g) => (
                      <tr key={g._id}>
                        <td className="fw-bold">{g.name}</td>
                        <td>{g.master?.name || "N/A"}</td>
                        <td>
                          {staticLanguages.find((l) => l._id === g.language)
                            ?.nativeName || "N/A"}
                        </td>
                        <td>{g.sort}</td>
                        <td>
                          <span
                            className={`badge fs-6 ${
                              g.isActive
                                ? "text-bg-success"
                                : "text-bg-secondary"
                            }`}
                          >
                            {g.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => navigate(`/god-form/${g._id}`)}
                          >
                            <i className="fas fa-pencil-alt"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setGodToDelete(g)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  : status === "succeeded" && (
                      <tr>
                        <td colSpan="6" className="text-center py-5 text-muted">
                          No Gods Found
                        </td>
                      </tr>
                    )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
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

      {/* Delete Modal */}
      <ConfirmationModal
        show={godToDelete !== null}
        onClose={() => setGodToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        isLoading={isDeleting}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">{godToDelete?.name}</strong>?
        </p>
      </ConfirmationModal>
    </div>
  );
}
