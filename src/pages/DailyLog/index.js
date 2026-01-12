import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchDailyLogs, deleteDailyLog } from "../../store/dailylog/index";

import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";
import DynamicImage from "../../components/PostPreview/PostPreview";
export default function DailyLogListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const entireState = useSelector((state) => state);
  console.log("🔍 FULL REDUX STATE:", entireState);

  const { list: logs, pagination, status, error } = useSelector((state) => {
    return (
      state.dailyLog || {
        list: [],
        pagination: null,
        status: "idle",
        error: null,
      }
    );
  });

  console.log("📊 CURRENT LOGS STATE:", { logs, status, error });

  const [isDeleting, setIsDeleting] = useState(false);
  const [logToDelete, setLogToDelete] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch Logs
  const loadLogs = useCallback(() => {
    console.log(`🚀 Dispatching fetchDailyLogs for Page: ${page}`);
    dispatch(fetchDailyLogs({ page, limit }))
      .unwrap()
      .then((res) => console.log("✅ Fetch Success:", res))
      .catch((err) => {
        console.error("❌ Fetch Error:", err);
        toast.error(err?.message || "Failed to load Daily Logs.");
      });
  }, [dispatch, page]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Handle Delete
  const confirmDelete = async () => {
    if (!logToDelete) return;
    console.log("🗑️ Deleting Log ID:", logToDelete._id);

    setIsDeleting(true);
    try {
      await dispatch(deleteDailyLog(logToDelete._id)).unwrap();
      toast.success("Daily Log deleted successfully.");
      loadLogs(); // Refresh list
    } catch (err) {
      console.error("❌ Delete Error:", err);
      toast.error(err?.message || "Failed to delete log.");
    } finally {
      setIsDeleting(false);
      setLogToDelete(null);
    }
  };

  // If the reducer is not loading, render the UI
  return (
    <div className="card shadow-sm">
      {/* Header */}
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">Daily Log Management</h4>
        <button
          className="btn btn-labeled btn-success"
          onClick={() => navigate("/dailylog/new")}
        >
          <span className="btn-label me-2">
            <i className="fas fa-plus"></i>
          </span>
          Add New Log
        </button>
      </div>

      {/* Table */}
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
                status={status}
                error={error}
                dataLength={logs?.length || 0}
                colSpan={5}
                loadingText="Loading Daily Logs..."
                emptyText="No Daily Logs Found."
              />

              {status === "succeeded" &&
                logs?.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <DynamicImage
                        src={log?.image || "N/A"}
                        alt="Log"
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "5px",
                        }}
                      />
                    </td>
                    <td className="fw-bold">{log.title}</td>
                    <td style={{ maxWidth: "300px" }} className="text-truncate">
                      {log.description
                        ?.replace(/<[^>]+>/g, "")
                        .substring(0, 60)}
                      ...
                    </td>
                    <td>
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary mr-2"
                        onClick={() => navigate(`/dailylog/edit/${log._id}`)}
                      >
                        <i className="fas fa-pencil-alt"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setLogToDelete(log)}
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

      {/* Pagination */}
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

      {/* Delete Modal */}
      <ConfirmationModal
        show={!!logToDelete}
        onClose={() => setLogToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Daily Log"
        isLoading={isDeleting}
        confirmButtonVariant="danger"
      >
        Are you sure you want to delete <strong>{logToDelete?.title}</strong>?
      </ConfirmationModal>
    </div>
  );
}
