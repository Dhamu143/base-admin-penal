import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import ConfirmationModal from "../../common/ConfirmationModal";
import { TableStatus } from "../../components/TableStatus";
import CustomPagination from "../../common/Pagination";

// 🔥 Import your React Query hooks
import { useAdminPosts, useVerifyPost, useDeletePost } from "../../hooks/usePosts";

const styles = `
  .img-thumbnail-custom {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #dee2e6;
  }
  .truncate-desc {
    max-width: 250px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export default function PostVerificationPage() {
  const navigate = useNavigate();

  const [currentTab, setCurrentTab] = useState("pending");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [postToDelete, setPostToDelete] = useState(null);
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error
  } = useAdminPosts({ status: currentTab, page, limit });

  const posts = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.total || 0;

  const tableStatus = isLoading || isFetching ? "loading" : isError ? "failed" : "succeeded";

  const verifyMutation = useVerifyPost();
  const deleteMutation = useDeletePost();

  const handleTabChange = (tab) => {
    if (tab !== currentTab) {
      setCurrentTab(tab);
      setPage(1);
    }
  };

  const handleApprove = async (post) => {
    try {
      await verifyMutation.mutateAsync({ id: post._id, isVerified: true });
      toast.success("Post Approved Successfully! ");
    } catch (err) {
      // Errors 
    }
  };

  const handleUnpublish = async (post) => {
    try {
      await verifyMutation.mutateAsync({ id: post._id, isVerified: false });
      toast.warning("Post Unpublished (Moved to Pending). ⚠️");
    } catch (err) {
      // Errors 
    }
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    try {
      await deleteMutation.mutateAsync(postToDelete._id);

      if (posts.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      }

      setPostToDelete(null);
    } catch (err) {
      // Errors 
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="card shadow-sm">
        <div className="card-header bg-white p-3 border-bottom-0">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h4 className="mb-0 text-primary-emphasis">
                <i className="fas fa-tasks mr-2"></i> Post Management
              </h4>
              <small className="text-muted">
                Manage verified and pending posts
              </small>
            </div>

            <button
              className="btn btn-sm btn-primary"
              onClick={() => navigate("/post/create")}
            >
              <i className="fas fa-plus me-2"></i> Create New Post
            </button>
          </div>

          <ul className="nav nav-tabs mt-3 card-header-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${currentTab === "pending"
                    ? "active fw-bold text-primary"
                    : "text-muted"
                  }`}
                onClick={() => handleTabChange("pending")}
              >
                Pending Requests
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${currentTab === "verified"
                    ? "active fw-bold text-success"
                    : "text-muted"
                  }`}
                onClick={() => handleTabChange("verified")}
              >
                Verified Posts
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-secondary">
                <tr>
                  <th className="ps-4">Image</th>
                  <th>Title / Description</th>
                  <th>God ID</th>
                  <th>Device ID</th>
                  <th>Date</th>
                  <th className="text-center">Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                <TableStatus
                  status={tableStatus}
                  error={error}
                  dataLength={posts.length}
                  colSpan={7}
                  loadingText="Fetching posts..."
                  emptyText={
                    currentTab === "pending"
                      ? "🎉 No pending posts! All caught up."
                      : "No verified posts found."
                  }
                />

                {!isLoading && !isError && Array.isArray(posts) &&
                  posts.map((post) => (
                    <tr key={post._id} className={isFetching ? "opacity-50" : ""}>
                      <td className="ps-4">
                        <a href={post.image} target="_blank" rel="noreferrer">
                          <img
                            src={post.image}
                            alt="Post"
                            className="img-thumbnail-custom shadow-sm"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/60?text=Err";
                            }}
                          />
                        </a>
                      </td>
                      <td>
                        <div className="fw-bold text-dark">
                          {post.title || "No Title"}
                        </div>
                        <div className="text-muted small truncate-desc" title={post.description}>
                          {post.description || "No description"}
                        </div>
                        {post.isAdmin && (
                          <span
                            className="badge bg-primary text-white mt-1"
                            style={{ fontSize: "0.65rem" }}
                          >
                            ADMIN POST
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {post.godId}
                        </span>
                      </td>
                      <td>
                        <small className="font-monospace text-muted">
                          {post.deviceId
                            ? post.deviceId.substring(0, 8) + "..."
                            : "N/A"}
                        </small>
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                      <td className="text-center">
                        {post.isVerified ? (
                          <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
                            Verified
                          </span>
                        ) : (
                          <span className="badge bg-warning bg-opacity-10 text-warning px-3 py-2 rounded-pill">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-2">
                          {!post.isVerified && (
                            <button
                              className="btn btn-sm btn-success mr-2"
                              onClick={() => handleApprove(post)}
                              disabled={verifyMutation.isPending}
                              title="Approve Post"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                          )}
                          {post.isVerified && (
                            <button
                              className="btn btn-sm btn-outline-warning mr-2"
                              onClick={() => handleUnpublish(post)}
                              disabled={verifyMutation.isPending}
                              title="Unpublish"
                            >
                              <i className="fas fa-ban"></i>
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setPostToDelete(post)}
                            title="Delete Post"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {tableStatus === "succeeded" && posts.length > 0 && (
          <div className="card-footer bg-white py-3">
            <CustomPagination
              currentPage={page}
              totalPages={totalPages || 1}
              onPageChange={(newPage) => setPage(newPage)}
              totalItems={totalCount || 0}
              itemsPerPage={limit}
            />
          </div>
        )}

        <ConfirmationModal
          show={postToDelete !== null}
          onClose={() => setPostToDelete(null)}
          onConfirm={confirmDelete}
          title="Delete Post?"
          confirmText="Yes, Delete"
          isLoading={deleteMutation.isPending}
          confirmButtonVariant="danger"
        >
          <div className="text-center">
            <p className="mb-2">Are you sure you want to delete this post?</p>
            {postToDelete && (
              <div className="alert alert-secondary d-inline-block p-2 mt-2">
                <small>{postToDelete.title || "Untitled Post"}</small>
              </div>
            )}
            <p className="text-muted small mt-2">
              This action cannot be undone.
            </p>
          </div>
        </ConfirmationModal>
      </div>
    </>
  );
}