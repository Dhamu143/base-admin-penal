import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import CustomPagination from "../../common/Pagination";
import ConfirmationModal from "../../common/ConfirmationModal";
import DynamicImage from "../../components/PostPreview/PostPreview";
import { TableStatus } from "../../components/TableStatus";

// Ensure this path matches your file structure
import { fetchUsers, deleteUser } from "../../store/user2/index";

export default function UserTablePage() {
  const dispatch = useDispatch();

  // Redux State
  const { list: users, status, error, pagination } = useSelector(
    (state) => state.users
  );

  // Local State for Deletion
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const itemsPerPage = 10;
  // Get current page from pagination or default to 1
  const currentPage = pagination?.currentPage || 1;

  // --- Data Fetching ---
  const loadUsers = useCallback(
    (page = 1) => {
      dispatch(fetchUsers({ page, limit: itemsPerPage }))
        .unwrap()
        .catch((err) => toast.error(err || "Failed to load users."));
    },
    [dispatch]
  );

  // Initial Load
  useEffect(() => {
    loadUsers(1);
  }, [loadUsers]);

  // --- Delete Logic ---
  const handleDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      // 1. Call the Redux Action
      await dispatch(deleteUser(userToDelete._id)).unwrap();
      toast.success("User deleted successfully.");

      // 2. Determine which page to fetch next
      // If we deleted the last item on the current page, go back one page
      const pageToFetch =
        users.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;

      // 3. Refresh the list
      loadUsers(pageToFetch);

      // 4. Close Modal
      setUserToDelete(null);
    } catch (err) {
      toast.error(err?.message || "Error deleting user.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="card shadow-sm">
      {/* Header */}
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">User Management</h4>
      </div>

      {/* Table */}
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
              {/* Table Status Handling (Loading, Error, Empty) */}
              <TableStatus
                status={status}
                error={error}
                dataLength={users.length}
                colSpan={10}
                loadingText="Loading users..."
                emptyText="No users found."
              />

              {status === "succeeded" &&
                users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <DynamicImage
                        src={user.featureimage || "/img/user.jpg"}
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
                          href={`https://www.google.com/maps?q=${user.location.coordinates[1]},${user.location.coordinates[0]}`}
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

                    {/* Delete Button */}
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

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="card-footer">
          <CustomPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalRecords}
            itemsPerPage={itemsPerPage}
            onPageChange={loadUsers}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        show={userToDelete !== null}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={isDeleting}
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
