import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

import {
  useStories,
  useDeleteStory,
  useUpdateStory
} from "../../hooks/useStory";

import { fetchAllGods } from "../../store/god";
import { staticLanguages } from "../../constants/languages";

import FilterBar from "../../common/FilterBar";
import { useFilters } from "../../hooks/useFilters";
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";

export default function StoryManagementPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
      god: filters.godId || filters.god || "",
      godId: undefined,
    };
  }, [filters, itemsPerPage]);

  const { data, isLoading, isError, error, isFetching } = useStories(apiFilters);
  const stories = data?.data || [];
  const pagination = data?.pagination || null;

  const deleteMutation = useDeleteStory();
  const updateMutation = useUpdateStory();

  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  const [storyToDelete, setStoryToDelete] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    if (godStatus === "idle") {
      dispatch(fetchAllGods());
    }
  }, [dispatch, godStatus]);

  useEffect(() => {
    if (filters.page > 1 && (filters.godId || filters.god)) {
      handlePageChange(1);
    }
  }, [filters.godId, filters.god, filters.page, handlePageChange]);


  const handleReset = () => {
    resetFilters();
    queryClient.invalidateQueries(["stories"]);
    toast.info("Filters reset");
  };

  const handleStatusToggle = async (story) => {
    if (togglingId === story._id) return;
    setTogglingId(story._id);
    const newStatus = !story.isActive;

    try {
      await updateMutation.mutateAsync({ id: story._id, isActive: newStatus });
      toast.success(
        `Story "${story.name}" is now ${newStatus ? "Active" : "Inactive"}`
      );
    } catch (err) {
      // Error handled in hook
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!storyToDelete) return;
    try {
      await deleteMutation.mutateAsync(storyToDelete._id);

      if (stories.length === 1 && filters.page > 1) {
        handlePageChange(filters.page - 1);
      }

      setStoryToDelete(null);
    } catch (err) {
      // Error handled in hook
    }
  };

  const getLanguageNameById = (langId) =>
    staticLanguages.find((lang) => lang._id === langId)?.language || "N/A";

  const godOptions = [
    { value: "", label: "All Gods" },
    ...allGods.map((god) => ({ value: god._id, label: god.name })),
  ];

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">Story Management</h4>
        <div>
          <button
            className="btn btn-labeled btn-success"
            style={{ fontSize: "17px" }}
            onClick={() => navigate("/story/new")}
          >
            <span className="btn-label me-2">
              <i className="fas fa-plus"></i>
            </span>
            Add New Story
          </button>
        </div>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        godOptions={godOptions}
        godStatus={godStatus}
      />

      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Title</th>
                <th>God</th>
                <th>Language</th>
                <th>Description</th>
                <th>Sort</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <TableStatus
                status={isLoading || isFetching ? "loading" : isError ? "failed" : "succeeded"}
                error={error}
                dataLength={stories.length}
                colSpan={7}
                loadingText="Loading stories..."
                emptyText="No stories Found."
              />
              {!isLoading && Array.isArray(stories) &&
                stories.map((storyItem) => (
                  <tr key={storyItem._id} className={isFetching ? "opacity-50" : ""}>
                    <td className="fw-semibold">{storyItem?.name}</td>
                    <td>{storyItem?.god?.name}</td>
                    <td>{getLanguageNameById(storyItem?.language)}</td>
                    <td
                      style={{
                        maxWidth: "200px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={storyItem?.description.replace(/<[^>]+>/g, "")}
                    >
                      {storyItem?.description.replace(/<[^>]+>/g, "").substring(0, 50)}...
                    </td>
                    <td>{storyItem?.sort}</td>

                    <td>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={storyItem.isActive}
                          disabled={togglingId === storyItem._id}
                          onChange={() => handleStatusToggle(storyItem)}
                          style={{ cursor: "pointer" }}
                        />
                        <label className="form-check-label small ms-1">
                          {togglingId === storyItem._id ? (
                            <span className="spinner-border spinner-border-sm text-secondary"></span>
                          ) : storyItem.isActive ? (
                            "Active"
                          ) : (
                            "Inactive"
                          )}
                        </label>
                      </div>
                    </td>

                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary mr-2"
                        onClick={() => navigate(`/story/${storyItem._id}/edit`)}
                        title="Edit"
                      >
                        <i className="fas fa-pencil-alt"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setStoryToDelete(storyItem)}
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
            onPageChange={handlePageChange}
            totalItems={pagination.totalRecords}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      <ConfirmationModal
        show={storyToDelete !== null}
        onClose={() => setStoryToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">{storyToDelete?.name}</strong>?
        </p>
      </ConfirmationModal>
    </div>
  );
}