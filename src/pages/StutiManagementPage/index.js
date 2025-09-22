import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import { fetchStutis, deleteStuti } from "../../store/stuti/index";
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

export default function StutiManagementPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: stutis, pagination, status, error } = useSelector(
    (state) => state.stuti
  );

  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState({ language: "" });

  const itemsPerPage = 1;

  // 🔄 MODIFIED: Wrapped in useCallback and changed 'pageSize' to 'limit'
  const loadStutis = useCallback(
    (params = {}) => {
      dispatch(fetchStutis({ ...params, limit: itemsPerPage }))
        .unwrap()
        .catch((err) => toast.error(err?.message || "Failed to load stutis."));
    },
    [dispatch, itemsPerPage]
  );

  useEffect(() => {
    loadStutis({ page: 1 });
  }, [loadStutis]); // 🔄 MODIFIED: Correct dependency

  const handleLanguageChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setFilters({ language: value });
    loadStutis({ language: value, page: 1 });
  };

  const handleResetFilters = () => {
    setFilters({ language: "" });
    loadStutis({ language: "", page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage !== pagination?.currentPage) {
      loadStutis({ page: newPage });
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteStuti(itemToDelete._id)).unwrap();
      toast.success(`Stuti "${itemToDelete.name}" deleted successfully.`);

      const pageToFetch =
        stutis.length === 1 && pagination?.currentPage > 1
          ? pagination.currentPage - 1
          : pagination?.currentPage || 1;

      loadStutis({ page: pageToFetch });
      setItemToDelete(null);
    } catch (err) {
      toast.error(err?.message || "Failed to delete stuti.");
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
        <h4 className="mb-0 text-primary-emphasis">📜 Stuti Management</h4>
        <button
          className="btn btn-labeled btn-success"
          type="button"
          style={{ fontSize: "17px" }}
          onClick={() => navigate("/stuti/new")}
        >
          <span className="btn-label me-2">
            <i className="fas fa-plus"></i>
          </span>
          Add New Stuti
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
                <th>God</th>
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
                  <td colSpan="6" className="text-center py-5 text-danger">
                    <strong>Error:</strong> {error}
                  </td>
                </tr>
              )}
              {status === "succeeded" && stutis.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-5">
                    No Stutis Found.
                  </td>
                </tr>
              )}
              {status === "succeeded" &&
                stutis.map((item) => (
                  <tr key={item._id}>
                    <td className="fw-semibold">{item.name}</td>
                    <td>
                      {staticLanguages.find(
                        (lang) => lang._id === item.language
                      )?.language || "N/A"}
                    </td>
                    <td>{item.god?.name || "N/A"}</td>
                    <td>{item.sort}</td>
                    <td>
                      <span
                        className={`badge fs-6 ${
                          item.isActive
                            ? "text-bg-success"
                            : "text-bg-secondary"
                        }`}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => navigate(`/stuti/edit/${item._id}`)}
                        title="Edit"
                      >
                        <i className="fas fa-pencil-alt"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setItemToDelete(item)}
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
        show={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={isDeleting}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">{itemToDelete?.name}</strong>?
        </p>
      </ConfirmationModal>
    </div>
  );
}
