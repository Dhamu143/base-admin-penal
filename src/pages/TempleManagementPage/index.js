import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select"; // 🔄 ADDED: Import Select component
import { fetchTemples, deleteTemple } from "../../store/temple";
import { fetchAllGods } from "../../store/god";
import { staticLanguages } from "../../constants/languages";
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";

// 🔄 ADDED: Options for the language filter dropdown
const languageOptions = [
  { value: "", label: "All Languages" },
  ...staticLanguages.map((lang) => ({
    value: lang._id,
    label: `${lang.language} (${lang.nativeName})`,
  })),
];

export default function TempleListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: temples, pagination, status, error } = useSelector(
    (state) => state.temple
  );
  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  const [templeToDelete, setTempleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // 🔄 ADDED: Loading state for delete
  const [filters, setFilters] = useState({ language: "" });
  const itemsPerPage = 10; // 🔥 Show 10 per page

  const loadTemples = useCallback(
    (params = {}) => {
      // Pass all filters and pagination params to the fetch action
      dispatch(fetchTemples({ ...filters, ...params, limit: itemsPerPage }))
        .unwrap()
        .catch((err) => toast.error(err?.message || "Failed to load temples."));
    },
    [dispatch, itemsPerPage, filters] // 🔄 MODIFIED: Added filters as a dependency
  );

  useEffect(() => {
    loadTemples({ page: 1 });
    if (godStatus === "idle") {
      dispatch(fetchAllGods());
    }
  }, [dispatch, godStatus]); // 🔄 MODIFIED: Removed loadTemples to prevent extra calls on filter change

  const getGodNameById = (godId) =>
    allGods.find((g) => g._id === godId)?.name || "N/A";

  const getLanguageName = (langId) =>
    staticLanguages.find((l) => l._id === langId)?.language || "N/A";

  // 🔄 ADDED: Handler for language filter change
  const handleLanguageChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setFilters({ language: value });
    loadTemples({ language: value, page: 1 }); // Refetch from page 1
  };

  // 🔄 ADDED: Handler to reset filters
  const handleResetFilters = () => {
    setFilters({ language: "" });
    loadTemples({ language: "", page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage !== pagination?.currentPage) {
      loadTemples({ page: newPage });
    }
  };

  // 🔄 MODIFIED: Improved deletion logic to handle pagination correctly
  const confirmDelete = async () => {
    if (!templeToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteTemple(templeToDelete._id)).unwrap();
      toast.success(`Temple "${templeToDelete.name}" deleted successfully.`);

      // If the last item on a page is deleted, go to the previous page
      const pageToFetch =
        temples.length === 1 && pagination?.currentPage > 1
          ? pagination.currentPage - 1
          : pagination?.currentPage || 1;

      loadTemples({ page: pageToFetch });
      setTempleToDelete(null);
    } catch (err) {
      toast.error(err?.message || "Failed to delete temple.");
    } finally {
      setIsDeleting(false);
    }
  };

  // 🔄 ADDED: Find the selected option object for the Select component's value
  const selectedLanguage = languageOptions.find(
    (opt) => opt.value === filters.language
  );

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">🛕 Temple Management</h4>
        <button
          className="btn btn-labeled btn-success"
          type="button"
          style={{ fontSize: "17px" }}
          onClick={() => navigate("/temples/new")}
        >
          <span className="btn-label me-2">
            <i className="fas fa-plus"></i>
          </span>
          Add New Temple
        </button>
      </div>

      {/* 🔄 ADDED: Filter section */}
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
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>God</th>
                <th>Language</th>
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
                  <td colSpan="6" className="text-center py-5 text-danger">
                    <strong>Error:</strong> {error}
                  </td>
                </tr>
              )}
              {status === "succeeded" && temples.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-5">
                    No Temples Found.
                  </td>
                </tr>
              )}
              {status === "succeeded" &&
                temples.map((temple) => (
                  <tr key={temple._id}>
                    <td>
                      {temple.files ? (
                        <img
                          src={temple.files}
                          alt={temple.name}
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
                    <td className="fw-semibold">{temple.name}</td>
                    <td>{getGodNameById(temple.god)}</td>
                    <td>{getLanguageName(temple.language)}</td>
                    <td>
                      <span
                        className={`badge fs-6 ${
                          temple.isActive
                            ? "text-bg-success"
                            : "text-bg-secondary"
                        }`}
                      >
                        {temple.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => navigate(`/temples/edit/${temple._id}`)}
                        title="Edit"
                      >
                        <i className="fas fa-pencil-alt"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setTempleToDelete(temple)}
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
            totalItems={pagination.totalRecords}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <ConfirmationModal
        show={templeToDelete !== null}
        onClose={() => setTempleToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={isDeleting}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete the temple: <br />
          <strong className="text-danger">{templeToDelete?.name}</strong>?
        </p>
      </ConfirmationModal>
    </div>
  );
}
