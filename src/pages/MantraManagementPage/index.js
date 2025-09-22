import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";

// --- Mantra Actions ---
import { fetchMantras, deleteMantra } from "../../store/mantra/index";

// --- Reusable Components & Data ---
import { staticLanguages } from "../../constants/languages";
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination"; // ✨ NEW: Import pagination component

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

export default function MantraListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 🔄 MODIFIED: Destructure pagination from the state
  const { list: mantras, pagination, status, error } = useSelector(
    (state) => state.mantras
  );

  const [isSaving, setIsSaving] = useState(false);
  const [mantraToDelete, setMantraToDelete] = useState(null);
  const [filters, setFilters] = useState({ language: "" });

  const itemsPerPage = 1; // ✨ NEW: Define items per page

  // 🔄 MODIFIED: Centralized function to load mantras, now sends 'limit'
  const loadMantras = useCallback(
    (params = {}) => {
      // Assuming your API uses 'limit' based on previous examples
      dispatch(fetchMantras({ ...params, limit: itemsPerPage }))
        .unwrap()
        .catch((err) => toast.error(err || "Failed to load mantras."));
    },
    [dispatch, itemsPerPage]
  );

  // 🔄 MODIFIED: Load page 1 on initial component mount
  useEffect(() => {
    loadMantras({ page: 1 });
  }, [loadMantras]);

  const handleLanguageChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setFilters((prev) => ({ ...prev, language: value }));
    loadMantras({ language: value, page: 1 }); // Reset to page 1 on filter change
  };

  const handleResetFilters = () => {
    setFilters({ language: "" });
    loadMantras({ language: "", page: 1 });
  };

  // ✨ NEW: Handler for changing pages
  const handlePageChange = (newPage) => {
    loadMantras({ ...filters, page: newPage });
  };

  const getLanguageNameById = (langId) => {
    const language = staticLanguages.find((lang) => lang._id === langId);
    return language ? language.language : "N/A";
  };

  const confirmDelete = async () => {
    if (!mantraToDelete) return;
    setIsSaving(true);
    try {
      await dispatch(deleteMantra(mantraToDelete._id)).unwrap();
      toast.success(`Mantra "${mantraToDelete.name}" deleted successfully.`);

      // 🔄 MODIFIED: Smarter reload logic after delete
      const currentPage = pagination?.currentPage || 1;
      if (mantras.length === 1 && currentPage > 1) {
        loadMantras({ ...filters, page: currentPage - 1 });
      } else {
        loadMantras({ ...filters, page: currentPage });
      }

      setMantraToDelete(null);
    } catch (err) {
      toast.error(err || "Failed to delete mantra.");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedLanguage = languageOptions.find(
    (opt) => opt.value === filters.language
  );

  return (
    <>
      <style>{styles}</style>
      <div className="card shadow-sm">
        {/* Header and Filters (No changes needed) */}
        <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
          <h4 className="mb-0 text-primary-emphasis">🕉️ Mantra Management</h4>
          <button
            className="btn btn-labeled btn-success"
            type="button"
            onClick={() => navigate("/mantras/new")}
          >
            <span className="btn-label me-2">
              <i className="fas fa-plus"></i>
            </span>
            Add New Mantra
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
                <i className="fas fa-undo me-2"></i>Reset
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
                      <strong>Error:</strong> {error}
                    </td>
                  </tr>
                )}
                {status === "succeeded" && mantras.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-5">
                      No Mantras Found.
                    </td>
                  </tr>
                )}
                {status === "succeeded" &&
                  mantras.map((mantra) => (
                    <tr key={mantra._id}>
                      <td className="fw-bold">{mantra.name}</td>
                      <td>{mantra.master?.name || "N/A"}</td>
                      <td>{getLanguageNameById(mantra.language)}</td>
                      <td>
                        <span
                          className="truncate-text"
                          title={mantra.description.replace(/<[^>]+>/g, "")}
                        >
                          {mantra.description.replace(/<[^>]+>/g, "")}
                        </span>
                      </td>
                      <td>{mantra.sort}</td>
                      <td>
                        <span
                          className={`badge fs-6 ${
                            mantra.isActive
                              ? "text-bg-success"
                              : "text-bg-secondary"
                          }`}
                        >
                          {mantra.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() =>
                            navigate(`/mantras/edit/${mantra._id}`)
                          }
                          title="Edit"
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setMantraToDelete(mantra)}
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

        {/* ✨ --- NEW PAGINATION FOOTER --- ✨ */}
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
          show={mantraToDelete !== null}
          onClose={() => setMantraToDelete(null)}
          onConfirm={confirmDelete}
          title="Confirm Deletion"
          confirmText="Delete"
          isLoading={isSaving}
          confirmButtonVariant="danger"
        >
          <p className="fs-5 text-center">
            Are you sure you want to delete <br />
            <strong className="text-danger">{mantraToDelete?.name}</strong>?
          </p>
        </ConfirmationModal>
      </div>
    </>
  );
}
