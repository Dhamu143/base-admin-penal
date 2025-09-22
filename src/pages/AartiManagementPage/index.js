import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import { fetchAartis, deleteAarti } from "../../store/aarti/index";
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

export default function AartiManagementPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: aartis, pagination, status, error } = useSelector(
    (state) => state.aartis
  );

  const [aartiToDelete, setAartiToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState({ language: "" });

  const itemsPerPage = 10;

  const loadAartis = useCallback(
    (params = {}) => {
      dispatch(fetchAartis({ ...filters, ...params, limit: itemsPerPage }))
        .unwrap()
        .catch((err) => toast.error(err?.message || "Failed to load aartis."));
    },
    [dispatch, itemsPerPage, filters]
  );

  useEffect(() => {
    loadAartis({ page: 1 });
  }, []); // Changed dependency to run only once on mount

  const handleLanguageChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setFilters((prev) => ({ ...prev, language: value }));
    loadAartis({ language: value, page: 1 });
  };

  const handleResetFilters = () => {
    setFilters({ language: "" });
    loadAartis({ language: "", page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage !== pagination?.currentPage) {
      loadAartis({ page: newPage });
    }
  };

  const confirmDelete = async () => {
    if (!aartiToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteAarti(aartiToDelete._id)).unwrap();
      toast.success(`Aarti "${aartiToDelete.name}" deleted successfully.`);

      const pageToFetch =
        aartis.length === 1 && pagination?.currentPage > 1
          ? pagination.currentPage - 1
          : pagination?.currentPage || 1;

      loadAartis({ page: pageToFetch });
      setAartiToDelete(null);
    } catch (err) {
      toast.error(err?.message || "Failed to delete aarti.");
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedLanguage = languageOptions.find(
    (opt) => opt.value === filters.language
  );

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">📜 Aarti Management</h4>
        <button
          className="btn btn-labeled btn-success"
          type="button"
          style={{ fontSize: "17px" }}
          onClick={() => navigate("/aarti/new")}
        >
          <span className="btn-label me-2">
            <i className="fas fa-plus"></i>
          </span>
          Add New Aarti
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

      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Name</th>
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
              {status === "succeeded" && aartis.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-5">
                    No Aartis Found.
                  </td>
                </tr>
              )}
              {status === "succeeded" &&
                aartis.map((aarti) => (
                  <tr key={aarti._id}>
                    <td className="fw-semibold">{aarti.name}</td>
                    <td>
                      {staticLanguages.find(
                        (lang) => lang._id === aarti.language
                      )?.language || "N/A"}
                    </td>
                    <td
                      style={{
                        maxWidth: "200px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      // ✅ --- FIX APPLIED HERE --- ✅
                      title={(aarti.description || "").replace(/<[^>]+>/g, "")}
                    >
                      {/* ✅ --- AND FIX APPLIED HERE --- ✅ */}
                      {(aarti.description || "").replace(/<[^>]+>/g, "")}
                    </td>
                    <td>{aarti.sort}</td>
                    <td>
                      <span
                        className={`badge fs-6 ${
                          aarti.isActive
                            ? "text-bg-success"
                            : "text-bg-secondary"
                        }`}
                      >
                        {aarti.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => navigate(`/aarti/${aarti._id}/edit`)}
                        title="Edit"
                      >
                        <i className="fas fa-pencil-alt"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setAartiToDelete(aarti)}
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
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            totalItems={pagination.totalRecords}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      <ConfirmationModal
        show={aartiToDelete !== null}
        onClose={() => setAartiToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={isDeleting}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">{aartiToDelete?.name}</strong>?
        </p>
      </ConfirmationModal>
    </div>
  );
}
