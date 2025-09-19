import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // MODIFICATION: For navigation
import { toast } from "react-toastify";

// --- Redux Actions & Components ---
import { fetchQuizzes, deleteQuiz } from "../../store/quiz";
import { fetchGods } from "../../store/godmaster";
import { fetchGods as fetchgods } from "../../store/god";
import ConfirmationModal from "../../common/ConfirmationModal";

// MODIFICATION: Renamed component for clarity
export default function QuizListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // MODIFICATION: Initialize navigate hook

  const { list: quizzes, status, error } = useSelector(
    (state) => state.quizzes
  );
  const { list: godMasterList } = useSelector((state) => state.gods);
  const { list: GodList } = useSelector((state) => state.God);

  const [isDeleting, setIsDeleting] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  useEffect(() => {
    // Fetch initial data if not already present
    if (status === "idle") {
      dispatch(fetchQuizzes());
    }
    if (godMasterList.length === 0) dispatch(fetchGods());
    if (GodList.length === 0) dispatch(fetchgods());
  }, [dispatch, status, godMasterList.length, GodList.length]);

  const getNameById = (id, list) =>
    list.find((item) => item._id === id)?.name || "N/A";
  const getMasterNameById = (id) => getNameById(id, godMasterList);
  const getGodNameById = (id) => getNameById(id, GodList);

  const confirmDelete = async () => {
    if (!quizToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteQuiz(quizToDelete._id)).unwrap();
      toast.success(`Quiz "${quizToDelete.question}" was deleted.`);
      setQuizToDelete(null);
    } catch (err) {
      toast.error(err?.message || "Failed to delete the quiz.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">❓ Quiz Management</h4>
        <button
          className="btn btn-labeled btn-success"
          type="button"
          style={{ fontSize: "17px" }}
          onClick={() => navigate("/quizzes/new")}
        >
          <span className="btn-label">
            <em className="fas fa-plus"></em>
          </span>
          Add New Quiz
        </button>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Question</th>
                <th>Correct Answer</th>
                <th>Master</th>
                <th>God</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {status === "loading" && (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="spinner-border"></div>
                  </td>
                </tr>
              )}
              {status === "failed" && (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-danger">
                    Error: {error}
                  </td>
                </tr>
              )}
              {status === "succeeded" &&
                quizzes.map((quiz) => (
                  <tr key={quiz._id}>
                    <td
                      className="fw-bold"
                      style={{
                        maxWidth: "300px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {quiz.question}
                    </td>
                    <td>{quiz.correctanswer}</td>
                    <td>{getMasterNameById(quiz.master)}</td>
                    <td>{getGodNameById(quiz.god)}</td>
                    <td>
                      <span
                        className={`badge fs-6 ${
                          quiz.isActive
                            ? "text-bg-success"
                            : "text-bg-secondary"
                        }`}
                      >
                        {quiz.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="text-center">
                      {/* MODIFICATION: Edit button navigates to the form page with the ID */}
                      <button
                        className="btn btn-sm btn-outline-secondary me-2 mr-2"
                        onClick={() => navigate(`/quizzes/edit/${quiz._id}`)}
                      >
                        <i className="fas fa-pencil-alt"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setQuizToDelete(quiz)}
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

      <ConfirmationModal
        show={quizToDelete !== null}
        onClose={() => setQuizToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        isLoading={isDeleting}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete this quiz? <br />
          <strong className="text-danger">{quizToDelete?.question}</strong>
        </p>
      </ConfirmationModal>
    </div>
  );
}
