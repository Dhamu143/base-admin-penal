// pages/SlokListPage.jsx

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // MODIFICATION: For navigation
import { toast } from "react-toastify";

// --- Slok Actions ---
import { fetchSloks, deleteSlok } from "../../store/sloks/index";

// --- Reusable Components & Data ---
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
export default function SlokListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // MODIFICATION: Initialize navigate hook

  const { list: sloks, status, error } = useSelector((state) => state.sloks);

  const [isDeleting, setIsDeleting] = useState(false);
  const [slokToDelete, setSlokToDelete] = useState(null);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchSloks());
    }
  }, [status, dispatch]);

  const getLanguageNameById = (langId) => {
    const language = staticLanguages.find((lang) => lang._id === langId);
    return language ? language.nativeName : "N/A";
  };

  const confirmDelete = async () => {
    if (!slokToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteSlok(slokToDelete._id)).unwrap();
      toast.success(`Sloka "${slokToDelete.name}" deleted successfully.`);
      setSlokToDelete(null);
    } catch (err) {
      console.error("Failed to delete the sloka:", err);
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
          <h4 className="mb-0 text-primary-emphasis">🕉️ Sloka Management</h4>
          {/* MODIFICATION: Button navigates to the form page */}

          <button
            className="btn btn-labeled btn-success"
            type="button"
            style={{ fontSize: "17px" }}
            onClick={() => navigate("/sloks/new")}
          >
            <span className="btn-label">
              <em className="fas fa-plus"></em>
            </span>
            Add New Sloka
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>God</th>
                  <th>Language</th>
                  <th>Description</th>
                  <th>Type</th>
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
                {status === "succeeded" && sloks.length > 0
                  ? sloks.map((slok) => (
                      <tr key={slok._id}>
                        <td className="fw-bold">{slok.name}</td>
                        <td>{slok.master?.name || "N/A"}</td>
                        <td>{getLanguageNameById(slok.language)}</td>
                        <td>
                          <span
                            className="truncate-text"
                            title={slok.description}
                            dangerouslySetInnerHTML={{
                              __html: slok.description,
                            }}
                          ></span>
                        </td>
                        <td>
                          <span
                            className={`badge fs-6 ${
                              slok.isFree ? "text-bg-info" : "text-bg-warning"
                            }`}
                          >
                            {slok.isFree ? "Free" : "Premium"}
                          </span>
                        </td>
                        <td>{slok.sort}</td>
                        <td>
                          <span
                            className={`badge fs-6 ${
                              slok.isActive
                                ? "text-bg-success"
                                : "text-bg-secondary"
                            }`}
                          >
                            {slok.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="text-center">
                          {/* MODIFICATION: Edit button navigates to the form page with the ID */}
                          <button
                            className="btn btn-sm btn-outline-secondary me-2 mr-2"
                            onClick={() => navigate(`/sloks/edit/${slok._id}`)}
                          >
                            <i className="fas fa-pencil-alt"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setSlokToDelete(slok)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  : status === "succeeded" && (
                      <tr>
                        <td colSpan="8" className="text-center py-5 text-muted">
                          No Slokas Found
                        </td>
                      </tr>
                    )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmationModal
        show={slokToDelete !== null}
        onClose={() => setSlokToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={isDeleting}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">{slokToDelete?.name}</strong>?
        </p>
        <p className="text-muted text-center">This action cannot be undone.</p>
      </ConfirmationModal>
    </>
  );
}
