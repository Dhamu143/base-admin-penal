// src/pages/ringtone/RingtoneManagementPage.js
import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";

import { fetchRingtones, deleteRingtone } from "../../store/ringtone";
import { fetchAllGods } from "../../store/god";

import ConfirmationModal from "../../common/ConfirmationModal";
import { staticLanguages } from "../../constants/languages";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";

export default function RingtoneManagementPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: ringtones, pagination, status, error } = useSelector(
    (state) => state.ringtones
  );
  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  const [filters, setFilters] = useState({ language: "", god: "", page: 1 });
  const [ringtoneToDelete, setRingtoneToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const itemsPerPage = 10;

  const loadRingtones = useCallback(() => {
    dispatch(fetchRingtones({ ...filters, limit: itemsPerPage }))
      .unwrap()
      .catch((err) => toast.error(err || "Failed to load ringtones."));
  }, [dispatch, filters, itemsPerPage]);

  useEffect(() => {
    loadRingtones();
  }, [loadRingtones]);

  useEffect(() => {
    if (godStatus === "idle") dispatch(fetchAllGods());
  }, [dispatch, godStatus]);

  const handleLanguageChange = (option) =>
    setFilters((prev) => ({ ...prev, language: option?.value || "", page: 1 }));

  const handleGodChange = (option) =>
    setFilters((prev) => ({ ...prev, god: option?.value || "", page: 1 }));

  const handleReset = () => setFilters({ language: "", god: "", page: 1 });

  const handlePageChange = (page) => {
    if (page !== filters.page) setFilters((prev) => ({ ...prev, page }));
  };

  const confirmDelete = async () => {
    if (!ringtoneToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteRingtone(ringtoneToDelete._id)).unwrap();
      toast.success("Ringtone deleted successfully.");
      if (ringtones.length === 1 && filters.page > 1) {
        setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
      } else {
        loadRingtones();
      }
      setRingtoneToDelete(null);
    } catch (err) {
      toast.error(err || "Failed to delete ringtone.");
    } finally {
      setIsDeleting(false);
    }
  };

  const languageOptions = [
    { value: "", label: "All Languages" },
    ...staticLanguages.map((l) => ({
      value: l._id,
      label: `${l.language} (${l.nativeName})`,
    })),
  ];
  const godOptions = [
    { value: "", label: "All Gods" },
    ...allGods.map((g) => ({ value: g._id, label: g.name })),
  ];

  return (
    <div className="card shadow-sm">
      <div className="card-header d-flex justify-content-between">
        <h4 className="mb-0"> Ringtone Management</h4>
        <button
          className="btn btn-success"
          onClick={() => navigate("/ringtones/new")}
        >
          <i className="fas fa-plus me-2"></i> Add New Ringtone
        </button>
      </div>

      {/* Filters */}
      <div className="card-body border-bottom d-flex gap-3">
        <div style={{ minWidth: "250px", marginRight: "30px" }}>
          <label className="form-label small fw-bold">Language</label>
          <Select
            options={languageOptions}
            value={languageOptions.find((l) => l.value === filters.language)}
            onChange={handleLanguageChange}
            isClearable
          />
        </div>
        <div style={{ minWidth: "250px" }}>
          <label className="form-label small fw-bold">God</label>
          <Select
            options={godOptions}
            value={godOptions.find((g) => g.value === filters.god)}
            onChange={handleGodChange}
            isLoading={godStatus === "loading"}
            isDisabled={godStatus !== "succeeded"}
            isClearable
          />
        </div>
        <div className="mt-md-auto ms-md-auto">
          <button
            className="btn btn-outline-secondary w-100 p-2 ml-4"
            onClick={handleReset}
          >
            <i className="fas fa-undo mr-1"></i>Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card-body">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>File</th>
              <th>Description</th>
              <th>God</th>
              <th>Language</th>
              <th>Sort</th>
              <th>Free</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <TableStatus
              status={status}
              error={error}
              dataLength={ringtones.length}
              colSpan={8}
              loadingText="Loading ringtones..."
              emptyText="No ringtones found."
            />
            {status === "succeeded" &&
              ringtones.map((r) => (
                <tr key={r._id}>
                  <td>
                    <audio controls src={r.file} style={{ width: "150px" }} />
                  </td>
                  <td>{r.description}</td>
                  <td>{r.god?.name || "N/A"}</td>
                  <td>
                    {staticLanguages.find((l) => l._id === r.language)
                      ?.language || "N/A"}
                  </td>
                  <td>{r.sort}</td>
                  <td>
                    {r.isFree ? (
                      <span className="badge bg-info">Free</span>
                    ) : (
                      <span className="badge bg-warning">Paid</span>
                    )}
                  </td>
                  <td>
                    {r.isActive ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <span className="badge bg-secondary">Inactive</span>
                    )}
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-primary mr-2"
                      onClick={() => navigate(`/ringtones/edit/${r._id}`)}
                    >
                      <i className="fas fa-pencil-alt"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => setRingtoneToDelete(r)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination?.totalPages > 1 && (
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

      {/* Delete Confirmation */}
      <ConfirmationModal
        show={!!ringtoneToDelete}
        onClose={() => setRingtoneToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Ringtone?"
        confirmText="Delete"
        confirmButtonVariant="danger"
        isLoading={isDeleting}
      >
        <p className="text-center">
          Are you sure you want to delete{" "}
          <strong>{ringtoneToDelete?.description}</strong>?
        </p>
      </ConfirmationModal>
    </div>
  );
}
