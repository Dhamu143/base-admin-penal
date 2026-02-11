import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import ConfirmationModal from "../../common/ConfirmationModal";
import { TableStatus } from "../../components/TableStatus";

import { fetchAdminPosts, verifyPost, deletePost } from "../../store/post";
import CustomPagination from "../../common/Pagination";

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
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentTab, setCurrentTab] = useState("pending");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  const { list: posts, status, error, totalPages, totalCount } = useSelector(
    (state) => state.posts
  );

  const loadPosts = useCallback(() => {
    dispatch(fetchAdminPosts({ status: currentTab, page, limit }))
      .unwrap()
      .catch((err) => toast.error(err));
  }, [dispatch, currentTab, page, limit]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    setPage(1);
  };

  const handleApprove = async (post) => {
    try {
      await dispatch(verifyPost({ id: post._id, isVerified: true })).unwrap();
      toast.success("Post Approved Successfully! ");
      loadPosts();
    } catch (err) {
      toast.error(err || "Failed to approve post.");
    }
  };

  const handleUnpublish = async (post) => {
    try {
      await dispatch(verifyPost({ id: post._id, isVerified: false })).unwrap();
      toast.warning("Post Unpublished (Moved to Pending). ⚠️");
      loadPosts();
    } catch (err) {
      toast.error(err || "Failed to unpublish post.");
    }
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    setIsProcessing(true);
    try {
      await dispatch(deletePost(postToDelete._id)).unwrap();
      toast.success("Post deleted successfully. 🗑️");
      setPostToDelete(null);
      loadPosts();
    } catch (err) {
      toast.error(err || "Failed to delete post.");
    } finally {
      setIsProcessing(false);
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

          {/* TABS */}
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
                  status={status}
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

                {status === "succeeded" &&
                  posts.map((post) => (
                    <tr key={post._id}>
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
                        <div className="text-muted small truncate-desc">
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
                              title="Approve Post"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                          )}
                          {post.isVerified && (
                            <button
                              className="btn btn-sm btn-outline-warning mr-2"
                              onClick={() => handleUnpublish(post)}
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

        {status === "succeeded" && posts.length > 0 && (
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
          isLoading={isProcessing}
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
