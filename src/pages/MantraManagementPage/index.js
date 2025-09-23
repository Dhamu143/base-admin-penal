import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";

// --- Redux Actions ---
import { fetchMantras, deleteMantra } from "../../store/mantra/index";
// ✨ NEW: Added import to fetch the list of Gods for the filter
import { fetchAllGods } from "../../store/god";

// --- Reusable Components & Data ---
import { staticLanguages } from "../../constants/languages";
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";

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

  const { list: mantras, pagination, status, error } = useSelector(
    (state) => state.mantras
  );
  // ✨ NEW: Selecting God list and status for the new filter
  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  const [isDeleting, setIsDeleting] = useState(false);
  const [mantraToDelete, setMantraToDelete] = useState(null);

  // 🔄 MODIFIED: Centralized filters state now includes 'god' and 'page'.
  const [filters, setFilters] = useState({ language: "", god: "", page: 1 });
  const itemsPerPage = 10; // You can adjust this value

  // 🔄 MODIFIED: loadMantras now reads from the unified 'filters' state.
  const loadMantras = useCallback(() => {
    dispatch(fetchMantras({ ...filters, limit: itemsPerPage }))
      .unwrap()
      .catch((err) => toast.error(err?.message || "Failed to load mantras."));
  }, [dispatch, filters, itemsPerPage]);

  // 🔄 MODIFIED: This useEffect now handles all data loading based on filter changes.
  useEffect(() => {
    loadMantras();
  }, [loadMantras]);

  // ✨ NEW: This useEffect fetches the master list of gods, but only once.
  useEffect(() => {
    if (godStatus === "idle") {
      dispatch(fetchAllGods());
    }
  }, [dispatch, godStatus]);

  const getLanguageNameById = (langId) =>
    staticLanguages.find((lang) => lang._id === langId)?.language || "N/A";

  // ✨ NEW: Helper function to get God's name from the list.
  const getGodNameById = (godId) =>
    allGods.find((g) => g._id === godId)?.name || "N/A";

  // 🔄 MODIFIED: Handlers now ONLY update state. The useEffect handles fetching.
  const handleLanguageChange = (option) => {
    const value = option?.value || "";
    setFilters((prev) => ({ ...prev, language: value, page: 1 }));
  };

  // ✨ NEW: Handler for the new God filter.
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

  // 🔄 MODIFIED: Deletion logic now correctly reloads or navigates pages.
  const confirmDelete = async () => {
    if (!mantraToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteMantra(mantraToDelete._id)).unwrap();
      toast.success(`Mantra "${mantraToDelete.name}" deleted successfully.`);

      if (mantras.length === 1 && filters.page > 1) {
        setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
      } else {
        loadMantras();
      }
      setMantraToDelete(null);
    } catch (err) {
      toast.error(err?.message || "Failed to delete mantra.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ✨ NEW: Options for the God filter dropdown.
  const godOptions = [
    { value: "", label: "All Gods" },
    ...allGods.map((god) => ({ value: god._id, label: god.name })),
  ];

  const selectedLanguage = languageOptions.find(
    (opt) => opt.value === filters.language
  );
  // ✨ NEW: Find the currently selected god option.
  const selectedGod = godOptions.find((opt) => opt.value === filters.god);

  return (
    <>
      <style>{styles}</style>
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
          <h4 className="mb-0 text-primary-emphasis">🕉️ Mantra Management</h4>
          <button
            className="btn btn-labeled btn-success"
            type="button"
            style={{ fontSize: "17px" }}
            onClick={() => navigate("/mantras/new")}
          >
            <span className="btn-label me-2">
              <i className="fas fa-plus"></i>
            </span>
            Add New Mantra
          </button>
        </div>

        {/* 🔄 MODIFIED: Filter section with new God filter and consistent layout */}
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

            {/* ✨ NEW: God Filter Select component */}
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
                <TableStatus
                  status={status}
                  error={error}
                  dataLength={mantras.length}
                  colSpan={7}
                  loadingText="Loading mantras..."
                  emptyText="No mantras Found."
                />
                {status === "succeeded" &&
                  mantras.map((mantra) => (
                    <tr key={mantra._id}>
                      <td
                        style={{
                          maxWidth: "100px",
                        }}
                      >
                        {mantra.name}
                      </td>
                      {/* 🔄 MODIFIED: Using helper function to get God name */}
                      <td>{mantra.god.name}</td>
                      <td>{getLanguageNameById(mantra.language)}</td>
                      <td
                        style={{
                          maxWidth: "400px",
                        }}
                      >
                        <span
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
                          className="btn btn-sm btn-outline-primary mr-2"
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

        {/* 🔄 MODIFIED: Pagination now reads from the unified filters state */}
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
          show={mantraToDelete !== null}
          onClose={() => setMantraToDelete(null)}
          onConfirm={confirmDelete}
          title="Confirm Deletion"
          confirmText="Delete"
          isLoading={isDeleting}
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
