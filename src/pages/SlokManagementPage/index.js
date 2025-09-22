// pages/SlokListPage.jsx

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";

import { fetchSloks, deleteSlok } from "../../store/sloks/index";
import { staticLanguages } from "../../constants/languages";
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination"; // ✨ NEW: Import pagination

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

  const [isDeleting, setIsDeleting] = useState(false);
  const [slokToDelete, setSlokToDelete] = useState(null);
  const [filters, setFilters] = useState({ language: "" }); // ✨ NEW: State for filters

  const itemsPerPage = 1; // ✨ NEW: Define items per page

  // 🔄 MODIFIED: Centralized function to load sloks with filters/pagination
  const loadSloks = (params = {}) => {
    const query = {
      ...filters, // Include existing filters
      limit: itemsPerPage,
      ...params, // Overwrite with new params (e.g., new page or filter)
    };
    dispatch(fetchSloks(query))
      .unwrap()
      .catch((err) => toast.error(err || "Failed to load slokas."));
  };

  // 🔄 MODIFIED: Use the new load function on mount
  useEffect(() => {
    loadSloks({ page: 1 });
  }, [dispatch]);

  // ✨ NEW: Handlers for the language filter
  const handleLanguageChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setFilters({ language: value });
    loadSloks({ language: value, page: 1 }); // Reset to page 1 on filter change
  };

  const handleResetFilters = () => {
    setFilters({ language: "" });
    loadSloks({ language: "", page: 1 });
  };

  // ✨ NEW: Handler for pagination
  const handlePageChange = (newPage) => {
    if (newPage !== pagination?.currentPage) {
      loadSloks({ page: newPage });
    }
  };

  const confirmDelete = async () => {
    if (!slokToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteSlok(slokToDelete._id)).unwrap();
      toast.success(`Sloka "${slokToDelete.name}" deleted successfully.`);
      // 🔄 MODIFIED: Refresh the list correctly after delete
      const pageToFetch =
        sloks.length === 1 && pagination?.currentPage > 1
          ? pagination.currentPage - 1
          : pagination?.currentPage || 1;
      loadSloks({ page: pageToFetch });
      setSlokToDelete(null);
    } catch (err) {
      toast.error(err?.message || "An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ✨ NEW: Helper for react-select value
  const selectedLanguage = languageOptions.find(
    (opt) => opt.value === filters.language
  );

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

        {/* ✨ --- NEW FILTERS SECTION --- ✨ */}
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
                {status === "loading" && (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="spinner-border text-primary"></div>
                    </td>
                  </tr>
                )}
                {status === "failed" && (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-danger">
                      Error: {error}
                    </td>
                  </tr>
                )}
                {status === "succeeded" && sloks.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      No Slokas Found
                    </td>
                  </tr>
                )}
                {status === "succeeded" &&
                  sloks.map((slok) => (
                    <tr key={slok._id}>
                      <td className="fw-bold">{slok.name}</td>
                      <td>{slok.master?.name || "N/A"}</td>
                      <td>{slok.language?.language || "N/A"}</td>
                      <td>
                        <span
                          className="truncate-text"
                          title={slok.description.replace(/<[^>]+>/g, "")}
                        >
                          {slok.description.replace(/<[^>]+>/g, "")}
                        </span>
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
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => navigate(`/sloks/edit/${slok._id}`)}
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setSlokToDelete(slok)}
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
          <p className="text-muted text-center">
            This action cannot be undone.
          </p>
        </ConfirmationModal>
      </div>
    </>
  );
}
