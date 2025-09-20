import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAartis, deleteAarti } from "../../store/aarti/index";
import ConfirmationModal from "../../common/ConfirmationModal";
import { staticLanguages } from "../../constants/languages";

export default function AartiManagementPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: aartis, status, error } = useSelector((state) => state.aartis);
  const [aartiToDelete, setAartiToDelete] = React.useState(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  useEffect(() => {
    if (status === "idle") dispatch(fetchAartis());
  }, [status, dispatch]);

  const confirmDelete = async () => {
    if (!aartiToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteAarti(aartiToDelete._id)).unwrap();
      setAartiToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="content-wrapper p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary"> Aarti Management</h2>

        <button
          className="btn btn-labeled btn-success"
          type="button"
          style={{ fontSize: "17px" }}
          onClick={() => navigate("/aarti/new")}
        >
          <span className="btn-label">
            <em className="fas fa-plus"></em>
          </span>
          New Aarti
        </button>
      </div>

      {/* Table Card */}
      <div className="card shadow-sm p-3">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Name</th>
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
                  <td colSpan="7" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              )}

              {status === "failed" && (
                <tr>
                  <td colSpan="7" className="text-center text-danger py-5">
                    Error: {error}
                  </td>
                </tr>
              )}

              {status === "succeeded" && aartis.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-5">
                    No Aartis Found.
                  </td>
                </tr>
              )}

              {status === "succeeded" &&
                aartis.map((aarti) => (
                  <tr key={aarti._id} className="align-middle">
                    <td className="fw-semibold">{aarti.name}</td>
                    <td>{aarti.master?.name || "N/A"}</td>
                    <td>
                      {staticLanguages.find(
                        (lang) => lang._id === aarti.language
                      )?.language || "N/A"}
                    </td>
                    <td>
                      <div title={aarti.description.replace(/<[^>]+>/g, "")}>
                        {aarti.description.replace(/<[^>]+>/g, "").length > 50
                          ? aarti.description
                              .replace(/<[^>]+>/g, "")
                              .slice(0, 50) + "..."
                          : aarti.description.replace(/<[^>]+>/g, "")}
                      </div>
                    </td>

                    <td>{aarti.sort}</td>
                    <td>
                      <span
                        className={`badge fs-6 ${
                          aarti.isActive ? "bg-success" : "bg-secondary"
                        }`}
                      >
                        {aarti.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary me-2 mr-2"
                        onClick={() => navigate(`/aarti/${aarti._id}/edit`)}
                        title="Edit"
                      >
                        <i className="fas fa-pencil-alt"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setAartiToDelete(aarti)}
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        show={aartiToDelete !== null}
        onClose={() => setAartiToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={isDeleting}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">{aartiToDelete?.name}</strong>?
        </p>
        <p className="text-muted text-center">This action cannot be undone.</p>
      </ConfirmationModal>
    </div>
  );
}
