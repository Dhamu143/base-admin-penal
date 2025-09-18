// src/components/UserManagement/index.js

import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

// Child Components
import UserFilterBar from "./UserFilterBar";
import UserTable from "./UserTable";
import ConfirmationModal from "../../common/ConfirmationModal";

// Redux Thunks
import { fetchUsers, deleteUser } from "../../store/user2/index"; // Adjust path if needed

export default function UserManagement() {
  const dispatch = useDispatch();

  // --- Redux State ---
  const { list: users, status, error } = useSelector((state) => state.users);

  // --- Component State ---
  const [isDeleting, setIsDeleting] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [filters, setFilters] = useState({
    searchTerm: "",
    rashi: "",
    premiumStatus: "all", // 'all', 'yes', 'no'
  });

  // Fetch initial data
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchUsers());
    }
  }, [status, dispatch]);

  // --- Filtering Logic ---
  const uniqueRashis = useMemo(() => {
    if (!users) return [];
    const rashiSet = new Set(users.map((user) => user.rashi).filter(Boolean));
    return Array.from(rashiSet).sort();
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = user.firstName
        ? user.firstName.toLowerCase().includes(filters.searchTerm.toLowerCase())
        : true;
      const matchesRashi = filters.rashi ? user.rashi === filters.rashi : true;
      const matchesPremium =
        filters.premiumStatus === "all"
          ? true
          : filters.premiumStatus === "yes"
          ? user.premium
          : !user.premium;
      return matchesSearch && matchesRashi && matchesPremium;
    });
  }, [users, filters]);

  // --- Handlers ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: "",
      rashi: "",
      premiumStatus: "all",
    });
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteUser(userToDelete._id)).unwrap();
      toast.success(`User "${userToDelete.firstName}" deleted successfully!`);
      setUserToDelete(null);
    } catch (err) {
      const errorMessage = typeof err === "string" ? err : "Failed to delete the user.";
      toast.error(errorMessage);
      console.error("Failed to delete user:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex flex-wrap justify-content-between align-items-center p-3">
          <h4 className="mb-0 text-primary-emphasis">👥 User Management</h4>
          <span className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill fs-6">
            Showing {filteredUsers.length} of {users.length} users
          </span>
        </div>

        <UserFilterBar
          filters={filters}
          uniqueRashis={uniqueRashis}
          onFilterChange={handleFilterChange}
          onDropdownChange={handleDropdownChange}
          onReset={resetFilters}
        />

        <div className="card-body">
          <UserTable
            users={filteredUsers}
            status={status}
            error={error}
            totalUserCount={users.length}
            onDeleteClick={handleDeleteClick}
          />
        </div>
      </div>

      <ConfirmationModal
        show={userToDelete !== null}
        onClose={() => setUserToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={isDeleting}
        confirmButtonVariant="danger"
      >
        <div className="text-center">
            <p className="fs-5 mb-1">
                Are you sure you want to permanently delete
            </p>
            <p className="h5 text-danger">{userToDelete?.firstName}?</p>
            <p className="text-muted mt-2">This action cannot be undone.</p>
        </div>
      </ConfirmationModal>
    </>
  );
}