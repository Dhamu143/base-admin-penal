import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUserPremiumList, useCancelPremium } from "../../hooks/useUserPremium";
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";

const itemsPerPage = 10;

export default function UserPremiumListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ page: 1, limit: itemsPerPage, search: "" });
  const [search, setSearch] = useState("");
  const [userToCancel, setUserToCancel] = useState(null);

  const { data, isLoading, isError, error, isFetching } = useUserPremiumList(filters);
  const users = data?.data || [];
  const pagination = data?.pagination || null;

  const cancelMutation = useCancelPremium();

  const handleSearch = () => setFilters((prev) => ({ ...prev, search, page: 1 }));

  const handleReset = () => {
    setSearch("");
    setFilters({ page: 1, limit: itemsPerPage, search: "" });
    toast.info("Filters reset");
  };

  const handlePageChange = (newPage) => setFilters((prev) => ({ ...prev, page: newPage }));

  const confirmCancel = async () => {
    if (!userToCancel) return;
    try {
      await cancelMutation.mutateAsync(userToCancel._id);
      setUserToCancel(null);
    } catch (err) {}
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    }) : "—";

  const isExpired = (endDate) => endDate && new Date(endDate) < new Date();

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">Premium Users</h4>
        <button
          className="btn btn-labeled btn-success"
          style={{ fontSize: "17px" }}
          onClick={() => navigate("/premium/grant")}
        >
          <span className="btn-label me-2"><i className="fas fa-crown"></i></span>
          Grant Premium
        </button>
      </div>

      {/* Search */}
      <div className="card-header bg-white border-bottom px-3 py-2">
        <div className="row g-2 align-items-center">
          <div className="col-md-4">
            <div className="input-group">
              <input type="text" className="form-control"
                placeholder="Search by name or mobile..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button className="btn btn-outline-primary" onClick={handleSearch}>
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>
          <div className="col-auto">
            <button className="btn btn-outline-secondary" onClick={handleReset}>
              <i className="fas fa-times me-1"></i> Reset
            </button>
          </div>
        </div>
      </div>

      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>User</th>
                <th>Mobile</th>
                <th>Plan</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Granted By</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <TableStatus
                status={isLoading || isFetching ? "loading" : isError ? "failed" : "succeeded"}
                error={error} dataLength={users.length} colSpan={8}
                loadingText="Loading premium users..." emptyText="No premium users found."
              />
              {!isLoading && !isError && users.map((item) => (
                <tr key={item._id} className={isFetching ? "opacity-50" : ""}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle bg-primary-subtle text-primary-emphasis d-flex align-items-center justify-content-center fw-bold"
                        style={{ width: 36, height: 36, fontSize: 14, flexShrink: 0 }}>
                        {item.user?.firstName?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="fw-semibold">{item.user?.firstName} {item.user?.lastName}</div>
                        <div className="text-muted small">{item.user?._id}</div>
                      </div>
                    </div>
                  </td>
                  <td>{item.user?.mobile || "—"}</td>
                  <td>
                    <span className="badge bg-warning-subtle text-warning-emphasis px-2 py-1">
                      <i className="fas fa-crown me-1" style={{ fontSize: 11 }}></i>
                      {item.planName || "—"}
                    </span>
                  </td>
                  <td>{formatDate(item.startDate)}</td>
                  <td>
                    {item.endDate ? (
                      <span className={isExpired(item.endDate) ? "text-danger" : "text-success"}>
                        {formatDate(item.endDate)}
                        {isExpired(item.endDate) && (
                          <span className="badge bg-danger-subtle text-danger ms-1">Expired</span>
                        )}
                      </span>
                    ) : (
                      <span className="badge bg-success-subtle text-success">Lifetime</span>
                    )}
                  </td>
                  <td>
                    {item.grantedByAdmin
                      ? <span className="badge bg-info-subtle text-info">Admin</span>
                      : <span className="badge bg-secondary-subtle text-secondary">Purchase</span>}
                  </td>
                  <td>
                    {item.isActive && !isExpired(item.endDate)
                      ? <span className="badge bg-success-subtle text-success">Active</span>
                      : <span className="badge bg-danger-subtle text-danger">Inactive</span>}
                  </td>
                  <td className="text-center">
                    <button className="btn btn-sm btn-outline-primary me-2" title="View History"
                      onClick={() => navigate(`/premium/users/${item.user?._id}/history`)}>
                      <i className="fas fa-history"></i>
                    </button>
                    {item.isActive && !isExpired(item.endDate) && (
                      <button className="btn btn-sm btn-outline-danger" title="Cancel Premium"
                        onClick={() => setUserToCancel(item.user)}>
                        <i className="fas fa-ban"></i>
                      </button>
                    )}
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
        show={userToCancel !== null} onClose={() => setUserToCancel(null)}
        onConfirm={confirmCancel} title="Cancel Premium"
        confirmText="Cancel Premium" isLoading={cancelMutation.isPending}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to cancel premium for <br />
          <strong className="text-danger">
            {userToCancel?.firstName} {userToCancel?.lastName}
          </strong>?
        </p>
      </ConfirmationModal>
    </div>
  );
}