// src/components/UserManagement/UserFilterBar.js

import React from "react";

const premiumOptions = [
  { value: "all", label: "All Users" },
  { value: "yes", label: "Premium Only" },
  { value: "no", label: "Non-Premium" },
];

export default function UserFilterBar({
  filters,
  uniqueRashis,
  onFilterChange,
  onDropdownChange,
  onReset,
}) {
  const selectedPremiumLabel = premiumOptions.find(
    (opt) => opt.value === filters.premiumStatus
  )?.label;

  return (
    <div className="card-body border-bottom">
      <div className="row g-3 align-items-end">
        {/* Search Input */}
        <div className="col-md-4 col-sm-12">
          <label htmlFor="searchTerm" className="form-label fw-medium">
            Search by Name
          </label>
          <div className="input-group">
            <span className="input-group-text">
              <em className="fas fa-search"></em>
            </span>
            <input
              type="text"
              className="form-control"
              id="searchTerm"
              name="searchTerm"
              placeholder="e.g., John Doe"
              value={filters.searchTerm}
              onChange={onFilterChange}
            />
          </div>
        </div>

        {/* Rashi Filter */}
        <div className="col-md-3 col-sm-6">
          <label htmlFor="rashi" className="form-label fw-medium">
            Rashi
          </label>
          <div className="dropdown">
            <button
              className="btn btn-light border dropdown-toggle w-100 d-flex justify-content-between align-items-center"
              type="button"
              id="rashi"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <span className="text-truncate">
                <em className="fas fa-moon me-2 text-primary"></em>
                {filters.rashi || "All Rashis"}
              </span>
            </button>
            <ul className="dropdown-menu w-100" aria-labelledby="rashi">
              <li>
                <button
                  className={`dropdown-item ${!filters.rashi ? "active" : ""}`}
                  onClick={() => onDropdownChange("rashi", "")}
                >
                  All Rashis
                </button>
              </li>
              {uniqueRashis.map((rashi) => (
                <li key={rashi}>
                  <button
                    className={`dropdown-item ${
                      filters.rashi === rashi ? "active" : ""
                    }`}
                    onClick={() => onDropdownChange("rashi", rashi)}
                  >
                    {rashi}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Premium Status Filter */}
        <div className="col-md-3 col-sm-6">
          <label htmlFor="premiumStatus" className="form-label fw-medium">
            Premium Status
          </label>
          <div className="dropdown">
            <button
              className="btn btn-light border dropdown-toggle w-100 d-flex justify-content-between align-items-center"
              type="button"
              id="premiumStatus"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <span className="text-truncate">
                <em className="fas fa-star me-2 text-warning"></em>
                {selectedPremiumLabel}
              </span>
            </button>
            <ul className="dropdown-menu w-100" aria-labelledby="premiumStatus">
              {premiumOptions.map((option) => (
                <li key={option.value}>
                  <button
                    className={`dropdown-item ${
                      filters.premiumStatus === option.value ? "active" : ""
                    }`}
                    onClick={() =>
                      onDropdownChange("premiumStatus", option.value)
                    }
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Reset Button */}
        <div className="col-md-2 col-sm-12 text-md-end">
          <button className="btn btn-outline-secondary w-100" onClick={onReset}>
            <em className="fas fa-sync-alt me-2"></em>Reset
          </button>
        </div>
      </div>
    </div>
  );
}
