import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";

import {
  useWallpapers,
  useDeleteWallpaper,
  useUpdateWallpaper,
} from "../../hooks/useWallpaper";

import { useGods } from "../../hooks/useGodmaster";
import { useFilters } from "../../hooks/useFilters";
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";
import DynamicImage from "../../components/PostPreview/PostPreview";

export default function WallpaperListPage() {
  const navigate = useNavigate();
  const itemsPerPage = 10;

  const {
    filters,
    handlePageChange,
    resetFilters,
  } = useFilters(1);

  const [godFilter, setGodFilter] = useState("");

  const apiFilters = useMemo(() => {
    return {
      ...filters,
      limit: itemsPerPage,
      god: godFilter, 
      godId: undefined,
    };
  }, [filters, itemsPerPage, godFilter]);

  const { data, isLoading, isError, error, isFetching } = useWallpapers(apiFilters);

  const wallpapers = data?.data || [];
  const pagination = data?.pagination || null;

  const deleteMutation = useDeleteWallpaper();
  const updateMutation = useUpdateWallpaper();

  const { data: godsResponse, isLoading: isLoadingGods } = useGods(1, 500);

  const [wallpaperToDelete, setWallpaperToDelete] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const handleReset = () => {
    resetFilters();
    setGodFilter("");
    toast.info("Filters reset and list refreshed");
  };

  const handleStatusToggle = async (wallpaper) => {
    if (togglingId === wallpaper._id) return;
    setTogglingId(wallpaper._id);
    const newStatus = !wallpaper.isActive;

    try {
      await updateMutation.mutateAsync({ id: wallpaper._id, isActive: newStatus });
      toast.success(`Wallpaper status updated to ${newStatus ? "Active" : "Inactive"}`);
    } catch (err) {
      // Error handled in hook
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!wallpaperToDelete) return;
    try {
      await deleteMutation.mutateAsync(wallpaperToDelete._id);

      if (wallpapers.length === 1 && filters.page > 1) {
        handlePageChange(filters.page - 1);
      }

      setWallpaperToDelete(null);
    } catch (err) {
      // Error handled in hook
    }
  };

  // Safely extract the God Master array
  let godsList = [];
  if (Array.isArray(godsResponse?.data?.data)) {
    godsList = godsResponse.data.data;
  } else if (Array.isArray(godsResponse?.data)) {
    godsList = godsResponse.data;
  }

  const godSelectOptions = [
    { value: "", label: "All God Masters" },
    ...godsList.map((god) => ({ value: god._id, label: god.name }))
  ];

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">Wallpaper Management</h4>
        <div>
          <button
            className="btn btn-labeled btn-success"
            style={{ fontSize: "17px" }}
            onClick={() => navigate("/wallpaper/new")}
          >
            <span className="btn-label mr-2">
              <i className="fas fa-plus"></i>
            </span>
            Add New Wallpaper
          </button>
        </div>
      </div>

      <div className="card-body">
        
        {/* Filter Section */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 bg-white p-3 border rounded shadow-sm">
          <h6 className="mb-0 fw-semibold text-secondary mb-2 mb-md-0 text-dark">
            <i className="fas fa-filter mr-2"></i>Filter Wallpapers
          </h6>
          
          <div className="d-flex align-items-center gap-2">
            <label className="fw-semibold mb-0 text-nowrap text-muted">God Master:</label>
            
            {/* 4. Implement React-Select exactly like your OrdersPage */}
            <Select
              options={godSelectOptions}
              value={godSelectOptions.find(option => option.value === godFilter) || godSelectOptions[0]}
              onChange={(selectedOption) => {
                setGodFilter(selectedOption ? selectedOption.value : "");
                handlePageChange(1); // Reset to page 1 on filter change
              }}
              isDisabled={isLoadingGods}
              menuPortalTarget={document.body}
              menuPosition={'fixed'}
              styles={{
                control: (baseStyles) => ({
                  ...baseStyles,
                  minWidth: '220px',
                  borderColor: '#dee2e6',
                  boxShadow: 'none',
                  '&:hover': { borderColor: '#adb5bd' }
                }),
                option: (baseStyles, state) => ({
                  ...baseStyles,
                  backgroundColor: state.isSelected ? '#0d6efd' : state.isFocused ? '#e9ecef' : 'white',
                  color: state.isSelected ? 'white' : 'black',
                }),
                menuPortal: base => ({ ...base, zIndex: 9999 })
              }}
            />

            {/* Clear Filter Button */}
            {godFilter && (
              <button 
                className="btn btn-outline-danger text-nowrap ms-2" 
                onClick={handleReset}
                title="Clear Filter"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Image</th>
                <th>God Master</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <TableStatus
                status={isLoading || isFetching ? "loading" : isError ? "failed" : "succeeded"}
                error={error}
                dataLength={wallpapers.length}
                colSpan={4}
                loadingText="Loading wallpapers..."
                emptyText="No Wallpapers Found."
              />
              {!isLoading && !isError && Array.isArray(wallpapers) &&
                wallpapers.map((wallpaper) => (
                  <tr key={wallpaper._id} className={isFetching ? "opacity-50" : ""}>
                    <td>
                      {wallpaper.image ? (
                        <DynamicImage
                          src={wallpaper.image}
                          alt="Wallpaper Preview"
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />
                      ) : (
                        <div
                          className="d-flex justify-content-center align-items-center bg-light"
                          style={{ width: "60px", height: "60px", borderRadius: "8px" }}
                        >
                          <i className="fas fa-image text-muted"></i>
                        </div>
                      )}
                    </td>
                    <td className="fw-semibold text-primary">{wallpaper.god?.name || "N/A"}</td>
                    <td>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={wallpaper.isActive}
                          disabled={togglingId === wallpaper._id}
                          onChange={() => handleStatusToggle(wallpaper)}
                          style={{ cursor: "pointer" }}
                        />
                        <label className="form-check-label small ms-1">
                          {togglingId === wallpaper._id ? (
                            <span className="spinner-border spinner-border-sm text-secondary"></span>
                          ) : wallpaper.isActive ? (
                            <span className="text-success fw-medium">Active</span>
                          ) : (
                            <span className="text-danger fw-medium">Inactive</span>
                          )}
                        </label>
                      </div>
                    </td>

                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary mr-2"
                        onClick={() => navigate(`/wallpaper/edit/${wallpaper._id}`)}
                        title="Edit"
                      >
                        <i className="fas fa-pencil-alt"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setWallpaperToDelete(wallpaper)}
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
            currentPage={filters.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalRecords}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmationModal
        show={wallpaperToDelete !== null}
        onClose={() => setWallpaperToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete this wallpaper?
        </p>
      </ConfirmationModal>
    </div>
  );
}