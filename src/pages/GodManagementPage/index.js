import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

import CustomPagination from "../../common/Pagination";
import ConfirmationModal from "../../common/ConfirmationModal";
import DynamicImage from "../../components/PostPreview/PostPreview";

import { staticLanguages } from "../../constants/languages";
import { fetchGods, fetchAllGods, deleteGod } from "../../store/god/index";
import { TableStatus } from "../../components/TableStatus";

export default function GodTablePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    list: gods,
    status,
    masterList,
    masterStatus,
    error,
    currentPage,
    totalPages,
    totalItems,
  } = useSelector((state) => state.God);

  const [filters, setFilters] = useState({ language: "" });
  const [godToDelete, setGodToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const itemsPerPage = 10;

  const languageOptions = [
    { value: "", label: "All Languages" },
    ...staticLanguages.map((l) => ({
      value: l._id,
      label: `${l.language} (${l.nativeName})`,
    })),
  ];

  const selectedLanguage = languageOptions.find(
    (opt) => opt.value === filters.language
  );

  // --- Fetch master list of gods for dropdowns
  useEffect(() => {
    if (masterStatus === "idle") dispatch(fetchAllGods());
  }, [dispatch, masterStatus]);

  // --- Function to fetch paginated gods
  const loadGods = useCallback(
    (page = 1) => {
      dispatch(
        fetchGods({
          page,
          limit: itemsPerPage,
          language: filters.language,
        })
      )
        .unwrap()
        .catch((err) => toast.error(err || "Failed to load gods."));
    },
    [dispatch, filters.language]
  );

  // --- Load first page or on filter change
  useEffect(() => {
    loadGods(1);
  }, [loadGods]);

  // --- Filter handlers
  const handleLanguageChange = (option) => {
    setFilters({ language: option?.value || "" });
    loadGods(1);
  };

  const handleResetFilters = () => {
    setFilters({ language: "" });
    loadGods(1);
  };

  // --- Delete handler
  const handleDelete = async () => {
    if (!godToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteGod(godToDelete._id)).unwrap();
      toast.success("God deleted successfully.");

      // Adjust page if last item on page deleted
      const pageToFetch =
        gods.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      loadGods(pageToFetch);

      setGodToDelete(null);
    } catch (err) {
      toast.error(err?.message || "Error deleting god.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="card shadow-sm">
      {/* Header */}
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">✨ God Management</h4>
        <button
          className="btn btn-success"
          onClick={() => navigate("/god-form")}
        >
          <em className="fas fa-plus me-2"></em> Add New God
        </button>
      </div>

      {/* Filters */}
      <div className="card-body border-bottom d-flex gap-3 align-items-center">
        <div style={{ minWidth: "300px" }}>
          <Select
            placeholder="Select Language..."
            options={languageOptions}
            value={selectedLanguage}
            onChange={handleLanguageChange}
            isClearable
          />
        </div>
        <button
          className="btn btn-outline-secondary ml-4"
          onClick={handleResetFilters}
        >
          <span className="mr-1">
            <i className="fas fa-undo me-2"></i>
          </span>
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Master</th>
                <th>Sort Order</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <TableStatus
                status={status}
                error={error}
                dataLength={gods.length}
                colSpan={7}
                loadingText="Loading gods..."
                emptyText="No gods Found."
              />
              {status === "succeeded" &&
                gods.map((god) => (
                  <tr key={god._id}>
                    <td>
                      <DynamicImage
                        src={god.featureimage || god.master?.featureimage}
                        alt={god.name}
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    </td>
                    <td>{god.name}</td>
                    <td>{god.master?.name || "None"}</td>
                    <td>{god.sort}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-secondary mr-2"
                        onClick={() => navigate(`/god-form/${god._id}`)}
                      >
                        <em className="fas fa-pencil-alt"></em>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setGodToDelete(god)}
                      >
                        <em className="fas fa-trash"></em>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalItems > itemsPerPage && (
        <div className="card-footer">
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={loadGods}
          />
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        show={godToDelete !== null}
        onClose={() => setGodToDelete(null)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={isDeleting}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete{" "}
          <strong className="text-danger">{godToDelete?.name}</strong>?
        </p>
        <p className="text-muted text-center">This action cannot be undone.</p>
      </ConfirmationModal>
    </div>
  );
}
