import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { usePlans, useDeletePlan, useUpdatePlan } from "../../hooks/usePremium";
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";

const DURATION_LABELS = {
  day: "Day(s)", week: "Week(s)", month: "Month(s)",
  year: "Year(s)", lifetime: "Lifetime",
};

const itemsPerPage = 10;

export default function PremiumListPage() {
  const navigate = useNavigate();
  const [filters,       setFilters]       = useState({ page: 1, limit: itemsPerPage, all: "true" });
  const [planToDelete,  setPlanToDelete]  = useState(null);
  const [togglingId,    setTogglingId]    = useState(null);

  const { data, isLoading, isError, error, isFetching } = usePlans(filters);
  const plans      = data?.data       || [];
  const pagination = data?.pagination || null;

  const deleteMutation = useDeletePlan();
  const updateMutation = useUpdatePlan();

  const handlePageChange = (newPage) => setFilters((prev) => ({ ...prev, page: newPage }));

  const handleStatusToggle = async (plan) => {
    if (togglingId === plan._id) return;
    setTogglingId(plan._id);
    try {
      await updateMutation.mutateAsync({ id: plan._id, isActive: !plan.isActive });
      toast.success(`"${plan.name}" is now ${!plan.isActive ? "Active" : "Inactive"}`);
    } catch {
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!planToDelete) return;
    try {
      await deleteMutation.mutateAsync(planToDelete._id);
      if (plans.length === 1 && filters.page > 1) handlePageChange(filters.page - 1);
      setPlanToDelete(null);
    } catch {}
  };

  const formatPrice = (price) => (price != null ? `₹${price.toLocaleString("en-IN")}` : "—");

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">Premium Plans</h4>
        <button
          className="btn btn-labeled btn-success"
          style={{ fontSize: "17px" }}
          onClick={() => navigate("/premium/new")}
        >
          <span className="btn-label me-2"><i className="fas fa-plus"></i></span>
          Add New Plan
        </button>
      </div>

      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Banner</th>
                <th>Plan Name</th>
                <th>Duration</th>
                <th>Price</th>
                <th>Discounted</th>
                {/* ── NEW: Features column ── */}
                <th>Features</th>
                <th>Sort</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <TableStatus
                status={isLoading || isFetching ? "loading" : isError ? "failed" : "succeeded"}
                error={error} dataLength={plans.length} colSpan={9}
                loadingText="Loading plans..." emptyText="No premium plans found."
              />

              {!isLoading && !isError && plans.map((plan) => (
                <tr key={plan._id} className={isFetching ? "opacity-50" : ""}>

                  {/* Banner */}
                  <td>
                    {plan.banner ? (
                      <img src={plan.banner} alt={plan.name}
                        style={{ width: 60, height: 40, objectFit: "cover", borderRadius: 6 }} />
                    ) : (
                      <span className="text-muted small">No banner</span>
                    )}
                  </td>

                  {/* Name + Recommended badge */}
                  <td>
                    <div className="fw-semibold">{plan.name}</div>
                    {plan.isRecommended && (
                      <span className="badge bg-warning text-dark mt-1" style={{ fontSize: 10 }}>
                        ⭐ Recommended
                      </span>
                    )}
                  </td>

                  {/* Duration */}
                  <td>
                    {plan.durationType === "lifetime"
                      ? "Lifetime"
                      : `${plan.durationValue || 1} ${DURATION_LABELS[plan.durationType] || plan.durationType}`}
                  </td>

                  {/* Price */}
                  <td>{formatPrice(plan.price)}</td>

                  {/* Discounted Price */}
                  <td>
                    {plan.discountPrice != null ? (
                      <span className="text-success fw-semibold">{formatPrice(plan.discountPrice)}</span>
                    ) : <span className="text-muted">—</span>}
                  </td>

                  {/* ── Features tags ── */}
                  <td style={{ maxWidth: 220 }}>
                    {plan.features && plan.features.length > 0 ? (
                      <div className="d-flex flex-wrap gap-1">
                        {plan.features.slice(0, 3).map((f, i) => (
                          <span
                            key={i}
                            className="badge"
                            style={{
                              backgroundColor: "#fff3cd", color: "#856404",
                              border: "1px solid #ffc107", borderRadius: 20,
                              fontSize: 11, fontWeight: 600,
                            }}
                          >
                            {f}
                          </span>
                        ))}
                        {plan.features.length > 3 && (
                          <span
                            className="badge bg-secondary-subtle text-secondary"
                            style={{ borderRadius: 20, fontSize: 11 }}
                            title={plan.features.slice(3).join(", ")}
                          >
                            +{plan.features.length - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted small">—</span>
                    )}
                  </td>

                  {/* Sort Order */}
                  <td>{plan.sortOrder}</td>

                  {/* Active toggle */}
                  <td>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input" type="checkbox"
                        checked={plan.isActive} disabled={togglingId === plan._id}
                        onChange={() => handleStatusToggle(plan)} style={{ cursor: "pointer" }}
                      />
                      <label className="form-check-label small ms-1">
                        {togglingId === plan._id ? (
                          <span className="spinner-border spinner-border-sm text-secondary" />
                        ) : plan.isActive ? "Active" : "Inactive"}
                      </label>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="text-center">
                    <button className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => navigate(`/premium/edit/${plan._id}`)} title="Edit">
                      <i className="fas fa-pencil-alt"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-danger"
                      onClick={() => setPlanToDelete(plan)} title="Delete">
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
            currentPage={filters.page} totalPages={pagination.totalPages}
            onPageChange={handlePageChange} totalItems={pagination.totalRecords}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      <ConfirmationModal
        show={planToDelete !== null} onClose={() => setPlanToDelete(null)}
        onConfirm={confirmDelete} title="Confirm Deletion" confirmText="Delete"
        isLoading={deleteMutation.isPending} confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">{planToDelete?.name}</strong>?
        </p>
      </ConfirmationModal>
    </div>
  );
}