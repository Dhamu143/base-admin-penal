import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUserPremiumHistory } from "../../hooks/useUserPremium";
import PageHeader from "../../common/PageHeader";

export default function UserPremiumHistoryPage() {
  const { userId } = useParams();
  const navigate   = useNavigate();

  const { data: history = [], isLoading, isError } = useUserPremiumHistory(userId);

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    }) : "—";

  const isExpired = (endDate) =>
    endDate && new Date(endDate) < new Date();

  if (isLoading) return <div className="text-center p-5">Loading history...</div>;
  if (isError)   return <div className="text-center p-5 text-danger">Failed to load history.</div>;

  const user = history[0]?.user;

  return (
    <div className="content-wrapper p-4">
      <PageHeader
        breadcrumbTitle="Premium Users"
        breadcrumbLink="/premium/users"
        currentTitle="Subscription History"
      />

      {/* User Info Card */}
      {user && (
        <div className="card shadow-sm mb-4 border-0 bg-primary-subtle">
          <div className="card-body d-flex align-items-center gap-3 p-3">
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-4"
              style={{ width: 52, height: 52, flexShrink: 0 }}
            >
              {user.firstName?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <div className="fw-bold fs-5">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-muted">{user.mobile}</div>
              <div className="text-muted small">{user._id}</div>
            </div>
            <div className="ms-auto">
              <span className="badge bg-warning-subtle text-warning-emphasis px-3 py-2 fs-6">
                <i className="fas fa-crown me-1"></i>
                {history.filter((h) => h.isActive).length > 0 ? "Premium Active" : "No Active Plan"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-light p-3">
          <h5 className="mb-0">
            <i className="fas fa-history me-2 text-primary"></i>
            Subscription History
            <span className="badge bg-secondary ms-2">{history.length}</span>
          </h5>
        </div>
        <div className="card-body p-0">
          {history.length === 0 ? (
            <div className="text-center text-muted py-5">No subscription history found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Plan</th>
                    <th>Duration</th>
                    <th>Price Paid</th>
                    <th>Discount</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Granted By</th>
                    <th>Payment Ref</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, index) => (
                    <tr key={item._id}>
                      <td className="text-muted small">{index + 1}</td>
                      <td>
                        <span className="badge bg-warning-subtle text-warning-emphasis px-2 py-1">
                          <i className="fas fa-crown me-1" style={{ fontSize: 11 }}></i>
                          {item.planName || "—"}
                        </span>
                      </td>
                      <td>
                        {item.durationType === "lifetime"
                          ? <span className="badge bg-success-subtle text-success">Lifetime</span>
                          : `${item.durationValue} ${item.durationType}(s)`}
                      </td>
                      <td className="fw-semibold">
                        {item.pricePaid != null ? `₹${item.pricePaid}` : "—"}
                      </td>
                      <td>
                        {item.discountApplied > 0 ? (
                          <span className="text-success">-₹{item.discountApplied}</span>
                        ) : "—"}
                      </td>
                      <td>{formatDate(item.startDate)}</td>
                      <td>
                        {item.endDate ? (
                          <span className={isExpired(item.endDate) ? "text-danger" : "text-success"}>
                            {formatDate(item.endDate)}
                          </span>
                        ) : (
                          <span className="badge bg-success-subtle text-success">Lifetime</span>
                        )}
                      </td>
                      <td>
                        {item.grantedByAdmin ? (
                          <span className="badge bg-info-subtle text-info">Admin</span>
                        ) : (
                          <span className="badge bg-secondary-subtle text-secondary">Purchase</span>
                        )}
                      </td>
                      <td>
                        <span className="text-muted small font-monospace">
                          {item.paymentReference || "—"}
                        </span>
                      </td>
                      <td>
                        {item.isActive && !isExpired(item.endDate) ? (
                          <span className="badge bg-success-subtle text-success">Active</span>
                        ) : isExpired(item.endDate) ? (
                          <span className="badge bg-danger-subtle text-danger">Expired</span>
                        ) : (
                          <span className="badge bg-secondary-subtle text-secondary">Cancelled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3">
        <button className="btn btn-outline-secondary" onClick={() => navigate("/premium/users")}>
          <i className="fas fa-arrow-left me-2"></i>Back to Premium Users
        </button>
      </div>
    </div>
  );
}