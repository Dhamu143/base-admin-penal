import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import { fetchTemples, deleteTemple } from "../../store/temple";
import { fetchAllGods } from "../../store/god";
import { staticLanguages } from "../../constants/languages";
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";
import DynamicImage from "../../components/PostPreview/PostPreview";

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
  const [isDeleting, setIsDeleting] = useState(false);

  // 🔄 MODIFIED: 'page' is now part of the filters state for a single source of truth.
  const [filters, setFilters] = useState({ language: "", god: "", page: 1 });
  const itemsPerPage = 10;

  // 🔄 MODIFIED: loadTemples is now simpler and doesn't need params.
  const loadTemples = useCallback(() => {
    dispatch(fetchTemples({ ...filters, limit: itemsPerPage }))
      .unwrap()
      .catch((err) => toast.error(err?.message || "Failed to load temples."));
  }, [dispatch, filters, itemsPerPage]);

  // 🔄 MODIFIED: This useEffect now correctly handles all data loading for temples.
  // It runs ONLY when the filters (language, god, or page) change.
  useEffect(() => {
    loadTemples();
  }, [loadTemples]);

  // This useEffect fetches the master list of gods, but only once.
  useEffect(() => {
    if (godStatus === "idle") {
      dispatch(fetchAllGods());
    }
  }, [dispatch, godStatus]);

  const getLanguageName = (langId) =>
    staticLanguages.find((l) => l._id === langId)?.language || "N/A";

  // 🔄 MODIFIED: Handlers now ONLY update state. The useEffect above handles fetching.
  const handleLanguageChange = (option) => {
    const value = option?.value || "";
    // When a filter changes, always reset to page 1.
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
    if (!templeToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteTemple(templeToDelete._id)).unwrap();
      toast.success(`Temple "${templeToDelete.name}" deleted successfully.`);

      // After deletion, if it was the last item on a page, update the page filter.
      // The useEffect will then automatically refetch the data.
      if (temples.length === 1 && filters.page > 1) {
        setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
      } else {
        // Otherwise, just reload the current page's data.
        loadTemples();
      }
      setTempleToDelete(null);
    } catch (err) {
      toast.error(err?.message || "Failed to delete temple.");
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
          <div className="mt-md-auto">
            <button
              className="btn btn-outline-secondary w-100 ml-4 p-2"
              onClick={handleResetFilters}
            >
              <i className="fas fa-undo mr-1"></i>Reset
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
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <TableStatus
                status={status}
                error={error}
                dataLength={temples.length}
                colSpan={7}
                loadingText="Loading temples..."
                emptyText="No temples Found."
              />
              {status === "succeeded" &&
                temples.map((temple) => (
                  <tr key={temple._id}>
                    <td>
                      {temple.files ? (
                        <DynamicImage
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
                    <td>{temple.god.name}</td>
                    <td>{getLanguageName(temple.language)}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary mr-2"
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
            // 🔄 MODIFIED: Read currentPage from the unified filters state
            currentPage={filters.page}
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
