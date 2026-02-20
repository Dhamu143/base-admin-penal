import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// import { useQueryClient } from "@tanstack/react-query";

import { useDailyLogs, useDeleteDailyLog } from "../../hooks/useDailyLog";
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";
import DynamicImage from "../../components/PostPreview/PostPreview";

export default function DailyLogListPage() {
  const navigate = useNavigate();
  // const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, error } = useDailyLogs({ page, limit });
  const logs = data?.data || [];
  const pagination = data?.pagination || null;

  const deleteMutation = useDeleteDailyLog();
  const [logToDelete, setLogToDelete] = useState(null);

  const confirmDelete = async () => {
    if (!logToDelete) return;
    try {
      await deleteMutation.mutateAsync(logToDelete._id);
      setLogToDelete(null);
      toast.success("Log deleted successfully");
    } catch (err) {
      toast.error("Failed to delete log");
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">Daily Log Management</h4>
        <button
          className="btn btn-labeled btn-success"
          onClick={() => navigate("/dailylog/new")}
        >
          <span className="btn-label me-2"><i className="fas fa-plus"></i></span>
          Add New Log
        </button>
      </div>

      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Description</th>
                <th>Created At</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <TableStatus
                status={isLoading ? "loading" : isError ? "failed" : "succeeded"}
                error={error}
                dataLength={logs.length}
                colSpan={5}
                loadingText="Loading Daily Logs..."
                emptyText="No Daily Logs Found."
              />

              {!isLoading && !isError && logs.map((log) => (
                <tr key={log._id}>
                  <td>
                    <DynamicImage
                      src={log?.image || "N/A"}
                      alt="Log"
                      style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "5px" }}
                    />
                  </td>
                  <td className="fw-bold">{log.title}</td>
                  <td className="text-truncate" style={{ maxWidth: "300px" }}>
                    {log.description?.replace(/<[^>]+>/g, "").substring(0, 60)}...
                  </td>
                  <td>{log.createdAt ? new Date(log.createdAt).toLocaleDateString() : "N/A"}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-primary mr-2"
                      onClick={() => navigate(`/dailylog/edit/${log._id}`, { state: { logData: log } })}
                      title="Edit"
                    >
                      <i className="fas fa-pencil-alt"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => setLogToDelete(log)}
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
            currentPage={page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            totalItems={pagination.totalRecords}
            itemsPerPage={limit}
          />
        </div>
      )}

      <ConfirmationModal
        show={!!logToDelete}
        onClose={() => setLogToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Daily Log"
        isLoading={deleteMutation.isPending}
        confirmButtonVariant="danger"
      >
        <p className="text-center mb-0">
          Are you sure you want to delete <strong>{logToDelete?.title}</strong>?
        </p>
      </ConfirmationModal>
    </div>
  );
}