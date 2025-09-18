// src/components/UserManagement/UserTable.js

import React from "react";
import UserTableRow from "./UserTableRow";

const TableStatusMessage = ({ icon, color, message, colSpan }) => (
  <tr>
    <td colSpan={colSpan} className="text-center py-5">
      <div className={`d-flex flex-column align-items-center text-${color}`}>
        <em className={`fas ${icon} fa-3x mb-3`}></em>
        <p className="h5">{message}</p>
      </div>
    </td>
  </tr>
);

const LoadingState = ({ colSpan }) => (
  <tr>
    <td colSpan={colSpan} className="text-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-2 text-muted">Fetching Users...</p>
    </td>
  </tr>
);

export default function UserTable({
  users,
  status,
  error,
  totalUserCount,
  onDeleteClick,
}) {
  const renderTableContent = () => {
    if (status === "loading") {
      return <LoadingState colSpan="6" />;
    }

    if (status === "failed") {
      return (
        <TableStatusMessage
          icon="fa-exclamation-triangle"
          color="danger"
          message={error || "Something went wrong"}
          colSpan="6"
        />
      );
    }

    if (status === "succeeded" && users.length > 0) {
      return users.map((user) => (
        <UserTableRow
          key={user._id}
          user={user}
          onDeleteClick={onDeleteClick}
        />
      ));
    }

    if (status === "succeeded") {
      const message =
        totalUserCount > 0
          ? "No users match the current filters."
          : "No users have been created yet.";
      return (
        <TableStatusMessage
          icon="fa-search"
          color="muted"
          message={message}
          colSpan="6"
        />
      );
    }

    return null; // Should not happen
  };

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead className="table-light">
          <tr>
            <th style={{ width: "60px" }}>Profile</th>
            <th>User Info</th>
            <th>Rashi</th>
            <th className="text-center">Premium</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>{renderTableContent()}</tbody>
      </table>
    </div>
  );
}
