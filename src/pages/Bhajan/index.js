import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";

// --- Redux Actions ---
import { fetchBhajans, deleteBhajan } from "../../store/bhajan/index";
// ✨ NEW: Added import to fetch the list of Gods for the filter
import { fetchAllGods } from "../../store/god";

// --- Static Data & Components ---
import { staticLanguages } from "../../constants/languages";
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";

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

export default function BhajanListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: bhajans, pagination, status, error } = useSelector(
    (state) => state.bhajans
  );
  // ✨ NEW: Selecting God list and status for the new filter
  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  const [isDeleting, setIsDeleting] = useState(false);
  const [bhajanToDelete, setBhajanToDelete] = useState(null);

  // 🔄 MODIFIED: Centralized filters state now includes 'god' and 'page'.
  const [filters, setFilters] = useState({ language: "", god: "", page: 1 });
  const itemsPerPage = 10; // You can adjust this value

  // 🔄 MODIFIED: loadBhajans is now simpler and reads from the unified 'filters' state.
  const loadBhajans = useCallback(() => {
    dispatch(fetchBhajans({ ...filters, limit: itemsPerPage }))
      .unwrap()
      .catch((err) => toast.error(err?.message || "Failed to load bhajans."));
  }, [dispatch, filters, itemsPerPage]);

  // 🔄 MODIFIED: This useEffect now handles all data loading and triggers on any filter change.
  useEffect(() => {
    loadBhajans();
  }, [loadBhajans]);

  // ✨ NEW: This useEffect fetches the master list of gods, but only once.
  useEffect(() => {
    if (godStatus === "idle") {
      dispatch(fetchAllGods());
    }
  }, [dispatch, godStatus]);

  // 🔄 MODIFIED: Handlers now ONLY update state. The useEffect handles the data fetching.
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
    if (!bhajanToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteBhajan(bhajanToDelete._id)).unwrap();
      toast.success(`Bhajan "${bhajanToDelete.name}" deleted successfully.`);

      if (bhajans.length === 1 && filters.page > 1) {
        setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
      } else {
        loadBhajans();
      }
      setBhajanToDelete(null);
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
    <div className="card shadow-sm">
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">🎶 Bhajan Management</h4>
        <button
          className="btn btn-labeled btn-success"
          type="button"
          style={{ fontSize: "17px" }}
          onClick={() => navigate("/bhajans/new")}
        >
          <span className="btn-label me-2">
            <i className="fas fa-plus"></i>
          </span>
          Add New Bhajan
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
                {/* ✨ NEW: Added God column */}
                <th>God</th>
                <th>Description</th>
                <th>Language</th>
                <th>Sort</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <TableStatus
                status={status}
                error={error}
                dataLength={bhajans.length}
                colSpan={7}
                loadingText="Loading bhajans..."
                emptyText="No bhajans Found."
              />
              {status === "succeeded" &&
                bhajans.map((b) => (
                  <tr key={b._id}>
                    <td className="fw-bold">
                      <span className="truncate-text" title={b.name}>
                        {b.name}
                      </span>
                    </td>
                    {/* ✨ NEW: Displaying God's name */}
                    <td>{b.god.name}</td>
                    <td>
                      {staticLanguages.find((l) => l._id === b.language)
                        ?.nativeName || "N/A"}
                    </td>
                    <td style={{ maxWidth: "200px" }}>
                      {b.description.replace(/<[^>]+>/g, "")}
                    </td>
                    <td>{b.sort}</td>
                    <td>
                      <span
                        className={`badge fs-6 ${
                          b.isActive ? "text-bg-success" : "text-bg-secondary"
                        }`}
                      >
                        {b.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary mr-2"
                        title="Edit"
                        onClick={() => navigate(`/bhajans/edit/${b._id}`)}
                      >
                        <i className="fas fa-pencil-alt"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        title="Delete"
                        onClick={() => setBhajanToDelete(b)}
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
        show={bhajanToDelete !== null}
        onClose={() => setBhajanToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        isLoading={isDeleting}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete the bhajan: <br />
          <strong className="text-danger">{bhajanToDelete?.name}</strong>?
        </p>
      </ConfirmationModal>
    </div>
  );
}
