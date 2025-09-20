import React, { useState, useEffect } from "react";
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

  const itemsPerPage = 10;

  const loadStutis = (params = {}) => {
    dispatch(fetchStutis({ ...params, pageSize: itemsPerPage }))
      .unwrap()
      .catch((err) => toast.error(err || "Failed to load stutis."));
  };

  useEffect(() => {
    loadStutis({ page: 1 });
  }, [dispatch]);

  const handlePageChange = (newPage) =>
    loadStutis({ ...filters, page: newPage });

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteStuti(itemToDelete._id)).unwrap();
      toast.success(`Stuti "${itemToDelete.name}" deleted successfully.`);
      loadStutis({ ...filters, page: pagination?.currentPage || 1 });
      setItemToDelete(null);
    } catch (err) {
      toast.error(err || "Failed to delete stuti.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">Stuti Management</h4>
        <button
          className="btn btn-success"
          type="button"
          onClick={() => navigate("/stuti/new")}
        >
          <i className="fas fa-plus me-2"></i>
          Add New Stuti
        </button>
      </div>

      {/* Body for table */}
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
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              )}
              {status === "succeeded" &&
                stutis.map((item) => (
                  <tr key={item._id}>
                    <td className="fw-semibold">{item.name}</td>
                    <td>{item.language?.language || "N/A"}</td>
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
                        onClick={() => navigate(`/stuti/${item._id}/edit`)}
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

      {/* Pagination and Delete Modal */}
      {pagination && pagination.totalPages > 1 && (
        <div className="card-footer">
          <CustomPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <ConfirmationModal
        show={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        isLoading={isDeleting}
      >
        <p>
          Are you sure you want to delete <strong>{itemToDelete?.name}</strong>?
        </p>
      </ConfirmationModal>
    </div>
  );
}
