import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";

// --- Redux Actions & Components ---
import { fetchQuizzes, deleteQuiz } from "../../store/quiz";
import { fetchAllGods } from "../../store/god";
import { staticLanguages } from "../../constants/languages";
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination"; // ✨ NEW: Import pagination

export default function QuizListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 🔄 MODIFIED: Get pagination data from the store
  const { list: quizzes, pagination, status, error } = useSelector(
    (state) => state.quizzes
  );
  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  const [isDeleting, setIsDeleting] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [filters, setFilters] = useState({ language: "" }); // 🔄 MODIFIED: Using a filter object

  const itemsPerPage = 1;

  // ✨ NEW: Centralized function to load data from the server
  const loadQuizzes = useCallback(
    (params = {}) => {
      dispatch(fetchQuizzes({ ...params, limit: itemsPerPage }))
        .unwrap()
        .catch((err) => toast.error(err?.message || "Failed to load quizzes."));
    },
    [dispatch]
  );

  useEffect(() => {
    loadQuizzes({ page: 1 }); // Load page 1 on initial mount
    if (godStatus === "idle") {
      dispatch(fetchAllGods());
    }
  }, [dispatch, godStatus, loadQuizzes]);

  // --- Data Transformation ---
  const godNameMap = useMemo(
    () => new Map(allGods.map((item) => [item._id, item.name])),
    [allGods]
  );
  const languageNameMap = useMemo(
    () => new Map(staticLanguages.map((item) => [item._id, item.nativeName])),
    []
  );

  // 🗑️ REMOVED: Client-side filtering with useMemo is no longer needed.

  // 🔄 MODIFIED: Filter handlers now trigger a server refetch
  const handleLanguageChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setFilters({ language: value });
    loadQuizzes({ language: value, page: 1 }); // Reset to page 1
  };

  const handleResetFilters = () => {
    setFilters({ language: "" });
    loadQuizzes({ language: "", page: 1 });
  };

  // ✨ NEW: Handler for changing pages
  const handlePageChange = (newPage) => {
    loadQuizzes({ ...filters, page: newPage });
  };

  const confirmDelete = async () => {
    if (!quizToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteQuiz(quizToDelete._id)).unwrap();
      toast.success(`Quiz question was deleted.`);

      // 🔄 MODIFIED: Smarter reload logic after delete
      const currentPage = pagination?.currentPage || 1;
      if (quizzes.length === 1 && currentPage > 1) {
        loadQuizzes({ ...filters, page: currentPage - 1 });
      } else {
        loadQuizzes({ ...filters, page: currentPage });
      }
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

  const selectedLanguage = languageOptions.find(
    (opt) => opt.value === filters.language
  );

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">❓ Quiz Management</h4>
        <button
          className="btn btn-labeled btn-success"
          type="button"
          onClick={() => navigate("/quizzes/new")}
        >
          <span className="btn-label me-2">
            <i className="fas fa-plus"></i>
          </span>
          Add New Quiz
        </button>
      </div>

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
              onChange={handleLanguageChange}
              isClearable={true}
              classNamePrefix="react-select"
            />
          </div>
          <div className="mt-md-auto">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={handleResetFilters}
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

              {/* 🔄 MODIFIED: Map over 'quizzes' directly */}
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
                      title={quiz.question}
                    >
                      {quiz.question}
                    </td>
                    <td>{quiz.correctanswer}</td>
                    <td>{languageNameMap.get(quiz.language) || "N/A"}</td>
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

      {/* ✨ --- NEW PAGINATION FOOTER --- ✨ */}
      {pagination && pagination.totalPages > 1 && (
        <div className="card-footer">
          <CustomPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            totalItems={pagination.totalRecords}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

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
