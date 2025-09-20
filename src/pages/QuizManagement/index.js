import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";

// --- Redux Actions & Components ---
import { fetchQuizzes, deleteQuiz } from "../../store/quiz";
import { fetchAllGods } from "../../store/god"; // Use the correct action for the full god list
import { staticLanguages } from "../../constants/languages";
import ConfirmationModal from "../../common/ConfirmationModal";

export default function QuizListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // --- Redux State ---
  const { list: quizzes, status, error } = useSelector(
    (state) => state.quizzes
  );
  // ✨ CORRECTED: Fetching the full list of gods for displaying names
  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  // --- Component State ---
  const [isDeleting, setIsDeleting] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  // ✨ NEW: State for the language filter
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  useEffect(() => {
    // Fetch initial data if not already present
    if (status === "idle") {
      dispatch(fetchQuizzes());
    }
    // ✨ CORRECTED: Fetch the full god list if needed
    if (godStatus === "idle") {
      dispatch(fetchAllGods());
    }
  }, [dispatch, status, godStatus]);

  // --- Data Transformation & Filtering ---

  // Helper function to create a lookup map for faster name retrieval
  const createNameMap = (list) =>
    new Map(list.map((item) => [item._id, item.name || item.nativeName]));

  const godNameMap = useMemo(() => createNameMap(allGods), [allGods]);
  const languageNameMap = useMemo(() => createNameMap(staticLanguages), []);

  // ✨ NEW: Filter quizzes based on the selected language
  const filteredQuizzes = useMemo(() => {
    if (!selectedLanguage) {
      return quizzes; // Return all quizzes if no filter is applied
    }
    return quizzes.filter((quiz) => quiz.language === selectedLanguage.value);
  }, [selectedLanguage, quizzes]);

  const confirmDelete = async () => {
    if (!quizToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteQuiz(quizToDelete._id)).unwrap();
      toast.success(`Quiz question was deleted.`);
      setQuizToDelete(null);
    } catch (err) {
      toast.error(err?.message || "Failed to delete the quiz.");
    } finally {
      setIsDeleting(false);
    }
  };

  const languageOptions = [
    { value: "", label: "All Languages" },
    ...staticLanguages.map((lang) => ({
      value: lang._id,
      label: lang.nativeName,
    })),
  ];

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
          <span className="btn-label me-2">
            <i className="fas fa-plus"></i>
          </span>
          Add New Quiz
        </button>
      </div>

      {/* --- Filter Section --- */}
      <div className="card-body border-bottom">
        <div className="d-flex flex-column flex-md-row align-items-md-center gap-3">
          <div style={{ minWidth: "300px" }}>
            <label className="form-label fw-bold small mb-1">
              Filter by Language
            </label>
            <Select
              placeholder="Select Language..."
              options={languageOptions}
              value={selectedLanguage}
              onChange={setSelectedLanguage}
              isClearable={true}
              classNamePrefix="react-select"
            />
          </div>
          <div className="mt-md-auto">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={() => setSelectedLanguage(null)}
            >
              <i className="fas fa-undo me-2"></i>Reset
            </button>
          </div>
        </div>
      </div>

      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Question</th>
                <th>Correct Answer</th>
                <th>Language</th>
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
                filteredQuizzes.map((quiz) => (
                  <tr key={quiz._id}>
                    <td
                      className="fw-bold"
                      style={{
                        maxWidth: "300px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={quiz.question}
                    >
                      {quiz.question}
                    </td>
                    <td>{quiz.correctanswer}</td>
                    {/* ✨ ADDED Language Column */}
                    <td>{languageNameMap.get(quiz.language) || "N/A"}</td>
                    {/* ✨ CORRECTED God Column */}
                    <td>{godNameMap.get(quiz.god) || "N/A"}</td>
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
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => navigate(`/quizzes/edit/${quiz._id}`)}
                        title="Edit"
                      >
                        <i className="fas fa-pencil-alt"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setQuizToDelete(quiz)}
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
          <strong className="text-danger" style={{ wordBreak: "break-word" }}>
            {quizToDelete?.question}
          </strong>
        </p>
      </ConfirmationModal>
    </div>
  );
}
