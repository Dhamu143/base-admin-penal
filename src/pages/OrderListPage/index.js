import React, { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useOrders } from "../../hooks/useOrder"; 
import FilterBar from "../../common/FilterBar";
import { useFilters } from "../../hooks/useFilters";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";

export default function OrderManagementPage() {
  const queryClient = useQueryClient();
  const itemsPerPage = 10;

  const {
    filters,
    handleFilterChange,
    handlePageChange,
    resetFilters,
  } = useFilters(1);

  const apiFilters = useMemo(() => {
    return {
      ...filters,
      limit: itemsPerPage,
    };
  }, [filters, itemsPerPage]);

  const { data, isLoading, isError, error, isFetching } = useOrders(apiFilters);
  const orders = data?.data || [];
  const pagination = data?.pagination || null;

  const handleReset = () => {
    resetFilters();
    queryClient.invalidateQueries(["orders"]);
    toast.info("Filters reset");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Success":
        return "badge bg-success";
      case "Pending":
        return "badge bg-warning text-dark";
      case "Failed":
        return "badge bg-danger";
      default:
        return "badge bg-secondary";
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">Transaction Orders</h4>
        <div>
          <button
            className="btn btn-outline-primary"
            onClick={() => queryClient.invalidateQueries(["orders"])}
            disabled={isFetching}
          >
            <i className={`fas fa-sync-alt ${isFetching ? "fa-spin" : ""} me-2`}></i>
            Refresh
          </button>
        </div>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Date</th>
                <th>User Info</th>
                <th>Plan Name</th>
                <th>Amount</th>
                <th>Payment ID</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <TableStatus
                status={isLoading || isFetching ? "loading" : isError ? "failed" : "succeeded"}
                error={error}
                dataLength={orders.length}
                colSpan={6}
                loadingText="Loading orders..."
                emptyText="No orders found."
              />
              
              {!isLoading && Array.isArray(orders) &&
                orders.map((order) => (
                  <tr key={order._id} className={isFetching ? "opacity-50" : ""}>
                    
                    <td>
                      <div className="fw-semibold">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </div>
                      <small className="text-muted">
                        {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </small>
                    </td>

                    <td>
                      <div className="fw-semibold text-dark">
                        {order.user?.firstName ? `${order.user.firstName} ${order.user.lastName || ""}` : "Unknown User"}
                      </div>
                      <small className="text-muted">
                        {order.user?.mobile || order.user?.email || "No contact"}
                      </small>
                    </td>

                    <td className="fw-semibold text-primary">
                      {order.plan?.name || "Unknown Plan"}
                    </td>

                    <td className="fw-bold text-success">
                      ₹{order.amountPaid}
                    </td>

                    <td>
                      {order.razorpayPaymentId ? (
                        <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#6c757d" }}>
                          {order.razorpayPaymentId}
                        </span>
                      ) : (
                        <span className="text-muted fst-italic">-</span>
                      )}
                    </td>

                    <td>
                      <span className={getStatusBadge(order.status)}>
                        {order.status}
                      </span>
                    </td>

                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="card-footer bg-white">
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
  );
}