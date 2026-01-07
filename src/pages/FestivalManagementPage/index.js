import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import { fetchFestivals, deleteFestival } from "../../store/festival/index";
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

export default function FestivalListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: festivals, pagination, status, error } = useSelector(
    (state) => state.festivals
  );

  const { masterList: allGods = [], masterStatus: godStatus } = useSelector(
    (state) => state.God || {}
  );

  const [isDeleting, setIsDeleting] = useState(false);
  const [festivalToDelete, setFestivalToDelete] = useState(null);

  const [filters, setFilters] = useState({ language: "", god: "", page: 1 });
  const itemsPerPage = 10;

  const loadFestivals = useCallback(() => {
    dispatch(fetchFestivals({ ...filters, limit: itemsPerPage }))
      .unwrap()
      .catch((err) => toast.error(err?.message || "Failed to load festivals."));
  }, [dispatch, filters, itemsPerPage]);

  useEffect(() => {
    loadFestivals();
  }, [loadFestivals]);

  useEffect(() => {
    if (godStatus === "idle") {
      dispatch(fetchAllGods());
    }
  }, [dispatch, godStatus]);

  const getLanguageNameById = (langId) =>
    staticLanguages.find((lang) => lang._id === langId)?.nativeName || "N/A";

  const handleLanguageChange = (option) => {
    const value = option?.value || "";
    setFilters((prev) => ({ ...prev, language: value, page: 1 }));
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
    if (!festivalToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteFestival(festivalToDelete._id)).unwrap();
      toast.success(
        `Festival "${festivalToDelete.name}" deleted successfully.`
      );

      if (festivals.length === 1 && filters.page > 1) {
        setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
      } else {
        loadFestivals();
      }
      setFestivalToDelete(null);
    } catch (err) {
      toast.error(err?.message || "Failed to delete the festival.");
    } finally {
      setIsDeleting(false);
    }
  };

  const godOptions = [
    { value: "", label: "All Gods" },
    ...(allGods || []).map((god) => ({ value: god._id, label: god.name })),
  ];

  const selectedLanguage = languageOptions.find(
    (opt) => opt.value === filters.language
  );
  const selectedGod = godOptions.find((opt) => opt.value === filters.god);

  return (
    <>
      <style>{styles}</style>
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
          <h4 className="mb-0 text-primary-emphasis">🎉 Festival Management</h4>
          <button
            className="btn btn-labeled btn-success"
            type="button"
            style={{ fontSize: "17px" }}
            onClick={() => navigate("/festivals/new")}
          >
            <span className="btn-label me-2">
              <i className="fas fa-plus"></i>
            </span>
            Add New Festival
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
                  <th>Sort Order</th>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Language</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <TableStatus
                  status={status}
                  error={error}
                  dataLength={festivals.length}
                  colSpan={7}
                  loadingText="Loading festivals..."
                  emptyText="No festivals Found."
                />
                {status === "succeeded" &&
                  festivals.map((festival) => (
                    <tr key={festival._id}>
                      <td>{festival?.sort}</td>
                      <td className="fw-bold">{festival?.name}</td>
                      <td>{festival?.date}</td>
                      <td>{getLanguageNameById(festival?.language)}</td>
                        <td
                        style={{
                          maxWidth: "400px",
                        }}
                      >
                        <span
                          title={festival.description.replace(/<[^>]+>/g, "")}
                        >
                          {festival.description.replace(/<[^>]+>/g, "")}
                        </span>
                      </td>

                      <td>
                        {festival.isActive ? (
                          <span className="badge bg-success">Active</span>
                        ) : (
                          <span className="badge bg-secondary">Inactive</span>
                        )}
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary mr-2"
                          onClick={() =>
                            navigate(`/festivals/edit/${festival._id}`)
                          }
                          title="Edit"
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setFestivalToDelete(festival)}
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
              currentPage={filters.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              totalItems={pagination.totalRecords}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </div>

      <ConfirmationModal
        show={festivalToDelete !== null}
        onClose={() => setFestivalToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={isDeleting}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">{festivalToDelete?.name}</strong>?
        </p>
      </ConfirmationModal>
    </>
  );
}
