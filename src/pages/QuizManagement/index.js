import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

import {
  useQuizzes,
  useDeleteQuiz,
  useUpdateQuiz
} from "../../hooks/useQuiz";

import { fetchAllGods } from "../../store/god";
import { staticLanguages } from "../../constants/languages";

import FilterBar from "../../common/FilterBar";
import { useFilters } from "../../hooks/useFilters";
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";

export default function QuizListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const itemsPerPage = 10;

  const {
    filters,
    handleFilterChange,
    handlePageChange,
    resetFilters,
  } = useFilters(1);

  const { data, isLoading, isError, error } = useQuizzes({
    ...filters,
    limit: itemsPerPage
  });

  const quizzes = data?.data || [];
  const pagination = data?.pagination || null;

  const deleteMutation = useDeleteQuiz();
  const updateMutation = useUpdateQuiz();

  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  const [quizToDelete, setQuizToDelete] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    if (godStatus === "idle") {
      dispatch(fetchAllGods());
    }
  }, [dispatch, godStatus]);


  const handleReset = () => {
    resetFilters();
    queryClient.invalidateQueries(["quizzes"]);
    toast.info("Filters reset and list refreshed");
  };

  const handleStatusToggle = async (quiz) => {
    if (togglingId === quiz._id) return;
    setTogglingId(quiz._id);
    const newStatus = !quiz.isActive;

    try {
      await updateMutation.mutateAsync({ id: quiz._id, isActive: newStatus });
      toast.success(
        `Quiz status updated to ${newStatus ? "Active" : "Inactive"}`
      );
    } catch (err) {
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!quizToDelete) return;
    try {
      await deleteMutation.mutateAsync(quizToDelete._id);

      if (quizzes.length === 1 && filters.page > 1) {
        handlePageChange(filters.page - 1);
      }

      setQuizToDelete(null);
    } catch (err) {
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

      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">Quiz Management</h4>
        <div>
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
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
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
                status={isLoading ? "loading" : isError ? "failed" : "succeeded"}
                error={error}
                dataLength={quizzes.length}
                colSpan={6}
                loadingText="Loading quizzes..."
                emptyText="No quizzes Found."
              />
              {!isLoading && !isError && Array.isArray(quizzes) &&
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
        isLoading={deleteMutation.isPending}
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