import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";

// --- Redux Actions & Components ---
import { fetchSloks, deleteSlok } from "../../store/sloks/index";
// ✨ NEW: Import action to fetch gods
import { fetchAllGods } from "../../store/god";
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

export default function SlokListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: sloks, pagination, status, error } = useSelector(
    (state) => state.sloks
  );
  // ✨ NEW: Selecting God list and status for the new filter
  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  const [isDeleting, setIsDeleting] = useState(false);
  const [slokToDelete, setSlokToDelete] = useState(null);

  // 🔄 MODIFIED: Centralized filters state now includes 'god' and 'page'.
  const [filters, setFilters] = useState({ language: "", god: "", page: 1 });
  const itemsPerPage = 10; // You can adjust this value

  // 🔄 MODIFIED: loadSloks now reads from the unified 'filters' state.
  const loadSloks = useCallback(() => {
    dispatch(fetchSloks({ ...filters, limit: itemsPerPage }))
      .unwrap()
      .catch((err) => toast.error(err?.message || "Failed to load slokas."));
  }, [dispatch, filters, itemsPerPage]);

  // 🔄 MODIFIED: This useEffect now handles all data loading based on filter changes.
  useEffect(() => {
    loadSloks();
  }, [loadSloks]);

  // ✨ NEW: This useEffect fetches the master list of gods, but only once.
  useEffect(() => {
    if (godStatus === "idle") {
      dispatch(fetchAllGods());
    }
  }, [dispatch, godStatus]);

  const getLanguageNameById = (langId) =>
    staticLanguages.find((l) => l._id === langId)?.language || "N/A";

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
    if (!slokToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteSlok(slokToDelete._id)).unwrap();
      toast.success(`Sloka "${slokToDelete.name}" deleted successfully.`);

      if (sloks.length === 1 && filters.page > 1) {
        setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
      } else {
        loadSloks();
      }
      setSlokToDelete(null);
    } catch (err) {
      toast.error(err?.message || "An error occurred while deleting.");
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
      <style>{`
        .truncate-text { max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: inline-block; vertical-align: middle; }
      `}</style>
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
          <h4 className="mb-0 text-primary-emphasis">🕉️ Sloka Management</h4>
          <button
            className="btn btn-labeled btn-success"
            type="button"
            style={{ fontSize: "17px" }}
            onClick={() => navigate("/sloks/new")}
          >
            <span className="btn-label me-2">
              <em className="fas fa-plus"></em>
            </span>
            Add New Sloka
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
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>God</th>
                  <th>Language</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Sort</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <TableStatus
                  status={status}
                  error={error}
                  dataLength={sloks.length}
                  colSpan={7}
                  loadingText="Loading sloks..."
                  emptyText="No sloks Found."
                />
                {status === "succeeded" &&
                  sloks.map((slok) => (
                    <tr key={slok._id}>
                      <td style={{ maxWidth: "150px" }}>{slok.name}</td>
                      <td>{slok.god.name}</td>
                      <td>{getLanguageNameById(slok.language)}</td>
                      <td>
                        <p style={{ maxWidth: "270px" }}>
                          {slok.description.replace(/<[^>]+>/g, "")}
                        </p>
                      </td>
                      <td>
                        <span
                          className={`badge fs-6 ${
                            slok.isFree ? "text-bg-info" : "text-bg-warning"
                          }`}
                        >
                          {slok.isFree ? "Free" : "Premium"}
                        </span>
                      </td>
                      <td>{slok.sort}</td>
                      <td>
                        <span
                          className={`badge fs-6 ${
                            slok.isActive
                              ? "text-bg-success"
                              : "text-bg-secondary"
                          }`}
                        >
                          {slok.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary mr-2"
                          onClick={() => navigate(`/sloks/edit/${slok._id}`)}
                          title="Edit"
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setSlokToDelete(slok)}
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
              totalItems={pagination.totalRecords}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        <ConfirmationModal
          show={slokToDelete !== null}
          onClose={() => setSlokToDelete(null)}
          onConfirm={confirmDelete}
          title="Confirm Deletion"
          confirmText="Delete"
          isLoading={isDeleting}
          confirmButtonVariant="danger"
        >
          <p className="fs-5 text-center">
            Are you sure you want to delete <br />
            <strong className="text-danger">{slokToDelete?.name}</strong>?
          </p>
        </ConfirmationModal>
      </div>
    </>
  );
}
