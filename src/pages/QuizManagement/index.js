import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";

// --- Redux Actions & Components ---
import { fetchQuizzes, deleteQuiz } from "../../store/quiz";
import { fetchAllGods } from "../../store/god";
import { staticLanguages } from "../../constants/languages";
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";

const languageOptions = [
  { value: "", label: "All Languages" },
  ...staticLanguages.map((lang) => ({
    value: lang._id,
    label: `${lang.language} (${lang.nativeName})`,
  })),
];

export default function QuizListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: quizzes, pagination, status, error } = useSelector(
    (state) => state.quizzes
  );
  // ✨ NEW: Selecting God list and status for the new filter
  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  const [isDeleting, setIsDeleting] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  // 🔄 MODIFIED: Centralized filters state now includes 'god' and 'page'.
  const [filters, setFilters] = useState({ language: "", god: "", page: 1 });
  const itemsPerPage = 10; // You can adjust this value

  // 🔄 MODIFIED: loadQuizzes now reads from the unified 'filters' state.
  const loadQuizzes = useCallback(() => {
    dispatch(fetchQuizzes({ ...filters, limit: itemsPerPage }))
      .unwrap()
      .catch((err) => toast.error(err?.message || "Failed to load quizzes."));
  }, [dispatch, filters, itemsPerPage]);

  // 🔄 MODIFIED: This useEffect now handles all data loading based on filter changes.
  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  // ✨ NEW: This useEffect fetches the master list of gods, but only once.
  useEffect(() => {
    if (godStatus === "idle") {
      dispatch(fetchAllGods());
    }
  }, [dispatch, godStatus]);

  const getLanguageNameById = (langId) =>
    staticLanguages.find((l) => l._id === langId)?.nativeName || "N/A";

  // 🔄 MODIFIED: Handlers now ONLY update state. The useEffect handles fetching.
  const handleLanguageChange = (option) => {
    const value = option?.value || "";
    setFilters((prev) => ({ ...prev, language: value, page: 1 }));
  };

  // ✨ NEW: Handler for the new God filter.
  const handleGodChange = (option) => {
    const value = option?.value || "";
    setFilters((prev) => ({ ...prev, god: value, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({ language: "", god: "", page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage !== filters.page) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  // 🔄 MODIFIED: Deletion logic now correctly reloads or navigates pages.
  const confirmDelete = async () => {
    if (!quizToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteQuiz(quizToDelete._id)).unwrap();
      toast.success(`Quiz question was deleted.`);

      if (quizzes.length === 1 && filters.page > 1) {
        setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
      } else {
        loadQuizzes();
      }
      setQuizToDelete(null);
    } catch (err) {
      toast.error(err?.message || "Failed to delete the quiz.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ✨ NEW: Options for the God filter dropdown.
  const godOptions = [
    { value: "", label: "All Gods" },
    ...allGods.map((god) => ({ value: god._id, label: god.name })),
  ];

  const selectedLanguage = languageOptions.find(
    (opt) => opt.value === filters.language
  );
  // ✨ NEW: Find the currently selected god option.
  const selectedGod = godOptions.find((opt) => opt.value === filters.god);

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

      {/* 🔄 MODIFIED: Filter section with new God filter and consistent layout */}
      <div className="card-body border-bottom">
        <div className="d-flex flex-column flex-md-row align-items-md-center">
          <div className="me-md-4 mb-3 mb-md-0" style={{ minWidth: "250px" }}>
            <label className="form-label fw-bold small mb-1">
              Filter by Language
            </label>
            <Select
              placeholder="Select Language..."
              options={languageOptions}
              value={selectedLanguage}
              onChange={handleLanguageChange}
              isClearable
              classNamePrefix="react-select"
            />
          </div>

          {/* ✨ NEW: God Filter Select component */}
          <div className="ml-4" style={{ minWidth: "250px" }}>
            <label className="form-label fw-bold small mb-1">
              Filter by God
            </label>
            <Select
              placeholder="Select God..."
              options={godOptions}
              value={selectedGod}
              onChange={handleGodChange}
              isClearable
              isLoading={godStatus === "loading"}
              isDisabled={godStatus !== "succeeded"}
              classNamePrefix="react-select"
            />
          </div>

          <div className="mt-md-auto ms-md-auto">
            <button
              className="btn btn-outline-secondary w-100 p-2 ml-4"
              onClick={handleResetFilters}
            >
              <i className="fas fa-undo mr-1"></i>Reset
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
              <TableStatus
                status={status}
                error={error}
                dataLength={quizzes.length}
                colSpan={7}
                loadingText="Loading quizzes..."
                emptyText="No quizzes Found."
              />
              {status === "succeeded" &&
                quizzes.map((quiz) => (
                  <tr key={quiz._id}>
                    <td style={{ maxWidth: "200px" }}>{quiz.question}</td>
                    <td>{quiz.correctanswer}</td>
                    <td>{getLanguageNameById(quiz.language)}</td>
                    <td>{quiz.god.name}</td>
                    <td>
                      {quiz.isActive ? (
                        <span className="badge bg-success">Active</span>
                      ) : (
                        <span className="badge bg-secondary">Inactive</span>
                      )}
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary mr-2"
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

      {/* 🔄 MODIFIED: Pagination now reads from the unified filters state */}
      {pagination && pagination.totalPages > 1 && (
        <div className="card-footer">
          <CustomPagination
            currentPage={filters.page}
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
