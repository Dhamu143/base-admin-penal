import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // MODIFICATION: Import useNavigate

// --- Festival Actions ---
import { fetchFestivals, deleteFestival } from "../../store/festival/index";

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

// MODIFICATION: Renamed for clarity
export default function FestivalListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // MODIFICATION: Initialize navigate

  const { list: festivals, status, error } = useSelector(
    (state) => state.festivals
  );

  const [isSaving, setIsSaving] = useState(false);
  const [festivalToDelete, setFestivalToDelete] = useState(null);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchFestivals());
    }
  }, [status, dispatch]);

  const getLanguageNameById = (langId) => {
    const language = staticLanguages.find((lang) => lang._id === langId);
    return language ? language.nativeName : "N/A";
  };

  const confirmDelete = async () => {
    if (!festivalToDelete) return;
    setIsSaving(true);
    try {
      await dispatch(deleteFestival(festivalToDelete._id)).unwrap();
      setFestivalToDelete(null);
    } catch (err) {
      console.error("Failed to delete the festival:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
          <h4 className="mb-0 text-primary-emphasis">🎉 Festival Management</h4>
          <button
            className="btn btn-labeled btn-success"
            type="button"
            style={{ fontSize: "17px" }}
            onClick={() => navigate("/festivals/new")}
          >
            <span className="btn-label">
              <em className="fas fa-plus"></em>
            </span>
            Add New Festival
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
                  <th>Sort Order</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {status === "loading" && (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="spinner-border text-primary"></div>
                    </td>
                  </tr>
                )}
                {status === "failed" && (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-danger">
                      <i className="fas fa-exclamation-triangle me-2"></i>{" "}
                      Error: {error}
                    </td>
                  </tr>
                )}
                {status === "succeeded" && festivals.length > 0
                  ? festivals.map((festival) => (
                      <tr key={festival._id}>
                        <td className="fw-bold">{festival.name}</td>
                        <td>{festival.master?.name || "N/A"}</td>
                        <td>{getLanguageNameById(festival.language)}</td>
                        <td>
                          <span
                            className="truncate-text"
                            title={festival.description}
                          >
                            {festival.description}
                          </span>
                        </td>
                        <td>{festival.sort}</td>
                        <td>
                          <span
                            className={`badge fs-6 ${
                              festival.isActive
                                ? "text-bg-success"
                                : "text-bg-secondary"
                            }`}
                          >
                            {festival.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="text-center">
                          {/* MODIFICATION: Button now navigates to the form page for editing */}
                          <button
                            className="btn btn-sm btn-outline-secondary me-2 mr-2"
                            onClick={() =>
                              navigate(`/festivals/edit/${festival._id}`)
                            }
                            title="Edit"
                          >
                            <i className="fas fa-pencil-alt"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setFestivalToDelete(festival)}
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  : status === "succeeded" && (
                      <tr>
                        <td colSpan="7" className="text-center py-5 text-muted">
                          No Festivals Found.
                        </td>
                      </tr>
                    )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmationModal
        show={festivalToDelete !== null}
        onClose={() => setFestivalToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={isSaving}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">{festivalToDelete?.name}</strong>?
        </p>
        <p className="text-muted text-center">This action cannot be undone.</p>
      </ConfirmationModal>
    </>
  );
}
