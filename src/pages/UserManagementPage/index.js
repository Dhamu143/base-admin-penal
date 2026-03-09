import React, { useState } from "react";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { useUsers, useDeleteUser } from "../../hooks/useUsers";
import CustomPagination from "../../common/Pagination";
import ConfirmationModal from "../../common/ConfirmationModal";
import DynamicImage from "../../components/PostPreview/PostPreview";
import { TableStatus } from "../../components/TableStatus";

export default function UserTablePage() {
  const queryClient = useQueryClient(); 

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading, isError, error } = useUsers(currentPage, itemsPerPage);

  const users = data?.users || [];
  const pagination = data?.pagination || null;

  const deleteMutation = useDeleteUser();

  const [userToDelete, setUserToDelete] = useState(null);

  const handleManualRefresh = () => {
    queryClient.invalidateQueries(["users"]);
    toast.success("User list refreshed!");
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteMutation.mutateAsync(userToDelete._id);

      if (users.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }

      setUserToDelete(null);
    } catch (err) {
      // Error
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">User Management</h4>
        <div>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handleManualRefresh}
            title="Refresh List"
          >
            <i className="fas fa-sync-alt me-1"></i> Refresh
          </button>
        </div>
      </div>

      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Gender</th>
                <th>Rashi</th>
                <th>Location</th>
                <th className="text-center">Status</th>
                <th>Joined On</th>
                <th>Device ID</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <TableStatus
                status={isLoading ? "loading" : isError ? "failed" : "succeeded"}
                error={error}
                dataLength={users.length}
                colSpan={10}
                loadingText="Loading users..."
                emptyText="No users found."
              />

              {!isLoading && !isError && Array.isArray(users) &&
                users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <DynamicImage
                        src={user.profilePic || "/img/user.jpg"}
                        alt={user.firstName}
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    </td>
                    <td>
                      {user.firstName} {user.lastName}
                      {!user.firstName && !user.lastName && (
                        <span className="text-muted small">(No Name)</span>
                      )}
                    </td>

                    <td>
                      <div>
                        {user.email || <span className="text-muted">-</span>}
                      </div>
                      <div className="small text-muted">
                        {user.mobile || "-"}
                      </div>
                    </td>
                    <td>{user.gender || "N/A"}</td>
                    <td>{user.rashi || "N/A"}</td>

                    <td>
                      {user.location?.coordinates?.length === 2 ? (
                        <a
                          href={`http://maps.google.com/maps?q=${user.location.coordinates[1]},${user.location.coordinates[0]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          View
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="text-center">
                      {user.premium ? (
                        <span className="badge bg-warning text-dark">
                          Premium
                        </span>
                      ) : (
                        <span className="badge bg-secondary">Basic</span>
                      )}
                    </td>

                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="text-truncate" style={{ maxWidth: "100px" }}>
                      {user.deviceid}
                    </td>

                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setUserToDelete(user)}
                        title="Delete User"
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
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalRecords}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <ConfirmationModal
        show={userToDelete !== null}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete{" "}
          <strong className="text-danger">
            {userToDelete?.firstName} {userToDelete?.lastName}
          </strong>
          ?
        </p>
        <p className="text-muted text-center small">
          This action cannot be undone.
        </p>
      </ConfirmationModal>
    </div>
  );
}