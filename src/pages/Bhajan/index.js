import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // MODIFICATION: Import for navigation
import { toast } from "react-toastify";

// --- Bhajan Actions ---
import { fetchBhajans, deleteBhajan } from "../../store/bhajan/index";

// --- Static Data & Components ---
import { staticLanguages } from "../../constants/languages";
import ConfirmationModal from "../../common/ConfirmationModal";

const styles = `
  .truncate-text {
    max-width: 250px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    vertical-align: middle;
  }
`;

// MODIFICATION: Renamed component for clarity
export default function BhajanListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // MODIFICATION: Initialize navigate hook

  const { list: bhajans, status, error } = useSelector(
    (state) => state.bhajans
  );

  const [isDeleting, setIsDeleting] = useState(false);
  const [bhajanToDelete, setBhajanToDelete] = useState(null);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchBhajans());
    }
  }, [status, dispatch]);

  const getLanguageNameById = (langId) => {
    const language = staticLanguages.find((lang) => lang._id === langId);
    return language ? language.nativeName : "N/A";
  };

  const confirmDelete = async () => {
    if (!bhajanToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteBhajan(bhajanToDelete._id)).unwrap();
      toast.success(`Bhajan "${bhajanToDelete.name}" deleted successfully.`);
      setBhajanToDelete(null);
    } catch (err) {
      console.error("Failed to delete bhajan:", err);
      toast.error(err?.message || "An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
          <h4 className="mb-0 text-primary-emphasis">🎶 Bhajan Management</h4>
          {/* MODIFICATION: Button now navigates to the dedicated form page */}
          <button
            className="btn btn-labeled btn-success"
            type="button"
            style={{ fontSize: "17px" }}
            onClick={() => navigate("/bhajans/new")}
          >
            <span className="btn-label">
              <em className="fas fa-plus"></em>
            </span>
            Add New Bhajan
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>God (Master)</th>
                  <th>God</th>
                  <th>Language</th>
                  <th>Description</th>
                  <th>Sort</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {status === "loading" && (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="spinner-border text-primary"></div>
                    </td>
                  </tr>
                )}
                {status === "failed" && (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-danger">
                      Error: {error}
                    </td>
                  </tr>
                )}
                {status === "succeeded" && bhajans.length > 0
                  ? bhajans.map((b) => (
                      <tr key={b._id}>
                        <td className="fw-bold">{b.name}</td>
                        <td>{b.master?.name || "N/A"}</td>
                        <td>{b.god?.name || "N/A"}</td>
                        <td>{getLanguageNameById(b.language)}</td>
                        <td>
                          <span
                            className="truncate-text"
                            title={b.description}
                            dangerouslySetInnerHTML={{ __html: b.description }}
                          ></span>
                        </td>
                        <td>{b.sort}</td>
                        <td>
                          <span
                            className={`badge fs-6 ${
                              b.isActive
                                ? "text-bg-success"
                                : "text-bg-secondary"
                            }`}
                          >
                            {b.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="text-center">
                          {/* MODIFICATION: Edit button navigates to the form page with the Bhajan's ID */}
                          <button
                            className="btn btn-sm btn-outline-secondary me-2 mr-2"
                            onClick={() => navigate(`/bhajans/edit/${b._id}`)}
                          >
                            <i className="fas fa-pencil-alt"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setBhajanToDelete(b)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  : status === "succeeded" && (
                      <tr>
                        <td colSpan="8" className="text-center py-5 text-muted">
                          No Bhajans Found
                        </td>
                      </tr>
                    )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmationModal
        show={bhajanToDelete !== null}
        onClose={() => setBhajanToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={isDeleting}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">{bhajanToDelete?.name}</strong>?
        </p>
        <p className="text-muted text-center">This action cannot be undone.</p>
      </ConfirmationModal>
    </>
  );
}
