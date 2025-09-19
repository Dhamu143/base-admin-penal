import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // MODIFICATION: Import useNavigate

// --- Mantra Actions ---
import { fetchMantras, deleteMantra } from "../../store/mantra/index";

// --- Reusable Components & Data ---
import { staticLanguages } from "../../constants/languages";
import ConfirmationModal from "../../common/ConfirmationModal";

// MODIFICATION: Using a CSS class for truncation for better maintainability
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
export default function MantraListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // MODIFICATION: Initialize navigate

  const { list: mantras, status, error } = useSelector(
    (state) => state.mantras
  );

  const [isSaving, setIsSaving] = useState(false);
  const [mantraToDelete, setMantraToDelete] = useState(null);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchMantras());
    }
  }, [status, dispatch]);

  const getLanguageNameById = (langId) => {
    const language = staticLanguages.find((lang) => lang._id === langId);
    return language ? language.nativeName : "N/A";
  };

  const confirmDelete = async () => {
    if (!mantraToDelete) return;
    setIsSaving(true);
    try {
      await dispatch(deleteMantra(mantraToDelete._id)).unwrap();
      setMantraToDelete(null);
    } catch (err) {
      console.error("Failed to delete the mantra:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
          <h4 className="mb-0 text-primary-emphasis">🕉️ Mantra Management</h4>
          <button
            className="btn btn-labeled btn-success"
            type="button"
            style={{ fontSize: "17px" }}
            onClick={() => navigate("/mantras/new")}
          >
            <span className="btn-label">
              <em className="fas fa-plus"></em>
            </span>
            Add New Mantra
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
                {status === "succeeded" && mantras.length > 0
                  ? mantras.map((mantra) => (
                      <tr key={mantra._id}>
                        <td className="fw-bold">{mantra.name}</td>
                        <td>{mantra.master?.name || "N/A"}</td>
                        <td>{getLanguageNameById(mantra.language)}</td>
                        <td>
                          <span
                            className="truncate-text"
                            title={mantra.description}
                            dangerouslySetInnerHTML={{
                              __html: mantra.description,
                            }}
                          ></span>
                        </td>
                        <td>{mantra.sort}</td>
                        <td>
                          <span
                            className={`badge fs-6 ${
                              mantra.isActive
                                ? "text-bg-success"
                                : "text-bg-secondary"
                            }`}
                          >
                            {mantra.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="text-center">
                          {/* MODIFICATION: Edit button now navigates to the dedicated form page */}
                          <button
                            className="btn btn-sm btn-outline-secondary me-2 mr-2"
                            onClick={() =>
                              navigate(`/mantras/edit/${mantra._id}`)
                            }
                            title="Edit"
                          >
                            <i className="fas fa-pencil-alt"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setMantraToDelete(mantra)}
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
                          No Mantras Found.
                        </td>
                      </tr>
                    )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmationModal
        show={mantraToDelete !== null}
        onClose={() => setMantraToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={isSaving}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">{mantraToDelete?.name}</strong>?
        </p>
        <p className="text-muted text-center">This action cannot be undone.</p>
      </ConfirmationModal>
    </>
  );
}
