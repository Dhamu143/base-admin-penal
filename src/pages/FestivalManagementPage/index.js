import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
// import { useQueryClient } from "@tanstack/react-query";

import {
  useFestivals,
  useDeleteFestival,
  useUpdateFestival
} from "../../hooks/useFestival";

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

export default function FestivalListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const queryClient = useQueryClient();

  const [filters, setFilters] = useState({ language: "", page: 1 });
  const [festivalToDelete, setFestivalToDelete] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const itemsPerPage = 10;
  const { data, isLoading, isError, error, isFetching } = useFestivals({
    ...filters,
    limit: itemsPerPage,
  });

  const festivals = data?.data || [];
  const pagination = data?.pagination || null;

  const deleteMutation = useDeleteFestival();
  const updateMutation = useUpdateFestival();

  const { masterStatus: godStatus } = useSelector(
    (state) => state.God || {}
  );

  useEffect(() => {
    if (godStatus === "idle") dispatch(fetchAllGods());
  }, [dispatch, godStatus]);

  // Handlers
  const handleStatusToggle = async (festival) => {
    if (togglingId === festival._id) return;
    setTogglingId(festival._id);
    try {
      await updateMutation.mutateAsync({
        id: festival._id,
        isActive: !festival.isActive
      });
      toast.success(`Festival "${festival.name}" status updated.`);
    } catch (err) {
      toast.error("Failed to update status.");
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!festivalToDelete) return;
    try {
      await deleteMutation.mutateAsync(festivalToDelete._id);
      if (festivals.length === 1 && filters.page > 1) {
        setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
      }
      setFestivalToDelete(null);
      toast.success("Festival deleted.");
    } catch (err) {
      toast.error("Delete failed.");
    }
  };

  // const handleManualRefresh = () => {
  //   queryClient.invalidateQueries(["festivals"]);
  //   toast.success("List refreshed!");
  // };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">Festival Management</h4>
        <div>

          <button
            className="btn btn-success"
            onClick={() => navigate("/festivals/new")}
          >
            <i className="fas fa-plus mr-2"></i> Add New Festival
          </button>
        </div>
      </div>

      <div className="card-body border-bottom">
        <div className="d-flex align-items-center gap-3">
          <div style={{ minWidth: "250px", marginRight: "15px" }}>
            <Select
              options={languageOptions}
              value={languageOptions.find(o => o.value === filters.language)}
              onChange={(opt) => setFilters({ ...filters, language: opt?.value || "", page: 1 })}
              placeholder="Filter by Language"
            />
          </div>
          <button
            className="btn btn-outline-secondary"
            onClick={() => setFilters({ language: "", page: 1 })}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Sort</th>
                <th>Name</th>
                <th>Language</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <TableStatus
                status={isLoading || isFetching ? "loading" : isError ? "failed" : "succeeded"}
                error={error}
                dataLength={festivals.length}
                colSpan={5}
                loadingText="Loading festivals..."
                emptyText="No festivals Found."
              />
              {!isLoading && festivals.map((item) => (
                <tr key={item._id} className={isFetching ? "opacity-50" : ""}>
                  <td>{item.sort}</td>
                  <td className="fw-bold">{item.name}</td>
                  <td>{staticLanguages.find(l => l._id === item.language)?.nativeName || "N/A"}</td>
                  <td>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={item.isActive}
                        disabled={togglingId === item._id}
                        onChange={() => handleStatusToggle(item)}
                        style={{ cursor: "pointer" }}
                      />
                      <label className="ms-2 small form-check-label">
                        {togglingId === item._id ? (
                          <span className="spinner-border spinner-border-sm text-secondary"></span>
                        ) : item.isActive ? "Active" : "Inactive"}
                      </label>
                    </div>
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-primary mr-2"
                      onClick={() => navigate(`/festivals/edit/${item._id}`)}
                      title="Edit"
                    >
                      <i className="fas fa-pencil-alt"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => setFestivalToDelete(item)}
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

      {pagination?.totalPages > 1 && (
        <div className="card-footer">
          <CustomPagination
            currentPage={filters.page}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setFilters({ ...filters, page: p })}
            totalItems={pagination.totalRecords}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      <ConfirmationModal
        show={!!festivalToDelete}
        onClose={() => setFestivalToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
        title="Delete Festival"
        confirmButtonVariant="danger"
      >
        <p className="text-center">
          Are you sure you want to delete <br />
          <strong>{festivalToDelete?.name}</strong>?
        </p>
      </ConfirmationModal>
    </div>
  );
}