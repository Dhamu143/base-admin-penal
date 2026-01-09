import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import CustomPagination from "../../common/Pagination";
import ConfirmationModal from "../../common/ConfirmationModal";
import DynamicImage from "../../components/PostPreview/PostPreview";
import { TableStatus } from "../../components/TableStatus";

import { fetchUsers, deleteUser } from "../../store/user2/index";

export default function UserTablePage() {
  const dispatch = useDispatch();

  const {
    list: users,
    status,
    error,
    currentPage,
    totalPages,
    totalItems,
  } = useSelector((state) => state.users);

  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const itemsPerPage = 10;

  // --- Data Fetching ---
  const loadUsers = useCallback(
    (page = 1) => {
      dispatch(fetchUsers({ page, limit: itemsPerPage }))
        .unwrap()
        .catch((err) => toast.error(err || "Failed to load users."));
    },
    [dispatch]
  );

  useEffect(() => {
    loadUsers(1);
  }, [loadUsers]);

  // --- Delete Handler ---
  const handleDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteUser(userToDelete._id)).unwrap();
      toast.success("User deleted successfully.");

      const pageToFetch =
        users.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      loadUsers(pageToFetch);

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
        <h4 className="mb-0 text-primary-emphasis"> User Management</h4>
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
                <th>deviceid</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <TableStatus
                status={status}
                error={error}
                dataLength={users.length}
                colSpan={10}
                loadingText="Loading users..."
                emptyText="No users Found."
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
                      {user.firstName && user.lastName ? null : (
                        <span className="text-muted">(No Name)</span>
                      )}
                    </td>

                    <td>
                      <div>{user.email}</div>
                      <div className="small text-muted">{user.mobile}</div>
                    </td>
                    <td>{user.gender || "N/A"}</td>
                    <td>{user.rashi || "N/A"}</td>

                    <td>
                      {user.location?.coordinates?.length === 2 ? (
                        <a
                          href={`https://www.google.com/maps/?q=${user.location.coordinates[1]},${user.location.coordinates[0]}`}
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
                        <span
                          className="badge"
                          style={{
                            backgroundColor: "#FFD700",
                            color: "#000",
                            fontWeight: "600",
                          }}
                        >
                          Premium
                        </span>
                      ) : (
                        <span
                          className="badge"
                          style={{
                            backgroundColor: "#6c757d",
                            color: "#fff",
                            fontWeight: "600",
                          }}
                        >
                          Basic
                        </span>
                      )}
                    </td>

                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>{user.deviceid}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setUserToDelete(user)}
                      >
                        <em className="fas fa-trash"></em>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalItems > itemsPerPage && (
        <div className="card-footer">
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={loadUsers}
          />
        </div>
      )}

      {/* Delete Confirmation */}
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
          <strong className="text-danger">{`${userToDelete?.firstName} ${userToDelete?.lastName}`}</strong>
          ?
        </p>
        <p className="text-muted text-center">This action cannot be undone.</p>
      </ConfirmationModal>
    </div>
  );
}
