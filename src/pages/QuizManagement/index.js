import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import FilterBar from "../../common/FilterBar";
import { useFilters } from "../../hook/useFilters";
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";

import { fetchQuizzes, deleteQuiz, updateQuiz } from "../../store/quiz";
import { fetchAllGods } from "../../store/god";
import { staticLanguages } from "../../constants/languages";

export default function QuizListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const itemsPerPage = 10;

  const {
    filters,
    handleFilterChange,
    handlePageChange,
    resetFilters,
  } = useFilters(1);

  const { list: quizzes, pagination, status, error } = useSelector(
    (state) => state.quizzes
  );
  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  const [isDeleting, setIsDeleting] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // Load Data
  const loadQuizzes = useCallback(() => {
    dispatch(fetchQuizzes({ ...filters, limit: itemsPerPage }))
      .unwrap()
      .catch((err) => toast.error(err?.message || "Failed to load quizzes."));
  }, [dispatch, filters, itemsPerPage]);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  useEffect(() => {
    if (godStatus === "idle") {
      dispatch(fetchAllGods());
    }
  }, [dispatch, godStatus]);

  // Actions
  const handleStatusToggle = async (quiz) => {
    if (togglingId === quiz._id) return;

    setTogglingId(quiz._id);
    const newStatus = !quiz.isActive;

    try {
      await dispatch(
        updateQuiz({ id: quiz._id, isActive: newStatus })
      ).unwrap();
      toast.success(
        `Quiz status updated to ${newStatus ? "Active" : "Inactive"}`
      );
    } catch (err) {
      toast.error(err?.message || "Failed to update status.");
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!quizToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteQuiz(quizToDelete._id)).unwrap();
      toast.success(`Quiz question was deleted.`);

      if (quizzes.length === 1 && filters.page > 1) {
        handlePageChange(filters.page - 1);
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

  const getLanguageNameById = (langId) =>
    staticLanguages.find((l) => l._id === langId)?.nativeName || "N/A";

  const godOptions = [
    { value: "", label: "All Gods" },
    ...allGods.map((god) => ({ value: god._id, label: god.name })),
  ];

  return (
    <div className="card shadow-sm">
      {/* Header */}
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">Quiz Management</h4>
        <button
          className="btn btn-labeled btn-success"
          style={{ fontSize: "17px" }}
          onClick={() => navigate("/quizzes/new")}
        >
          <span className="btn-label me-2">
            <i className="fas fa-plus"></i>
          </span>
          Add New Quiz
        </button>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        godOptions={godOptions}
        godStatus={godStatus}
      />

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
                colSpan={6}
                loadingText="Loading quizzes..."
                emptyText="No quizzes Found."
              />
              {status === "succeeded" &&
                quizzes.map((quiz) => (
                  <tr key={quiz._id}>
                    <td style={{ maxWidth: "200px" }}>{quiz.question}</td>
                    <td>{quiz.correctanswer}</td>
                    <td>{getLanguageNameById(quiz.language)}</td>
                    <td>{quiz.god?.name}</td>

                    <td>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={quiz.isActive}
                          disabled={togglingId === quiz._id}
                          onChange={() => handleStatusToggle(quiz)}
                          style={{ cursor: "pointer" }}
                        />
                        <label className="form-check-label small ms-1">
                          {togglingId === quiz._id ? (
                            <span className="spinner-border spinner-border-sm text-secondary"></span>
                          ) : quiz.isActive ? (
                            "Active"
                          ) : (
                            "Inactive"
                          )}
                        </label>
                      </div>
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

      {/* Pagination */}
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

      {/* Confirmation Modal */}
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
