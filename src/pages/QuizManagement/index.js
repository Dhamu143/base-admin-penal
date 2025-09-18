import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify"; // 1. IMPORT TOAST

// Redux Actions
import {
  fetchQuizzes,
  addQuiz,
  updateQuiz,
  deleteQuiz,
} from "../../store/quiz"; // Make sure this path is correct
import { fetchGods } from "../../store/godmaster";
import { fetchGods as fetchgods } from "../../store/god";

// Constants
import { staticLanguages } from "../../constants/languages";
import ConfirmationModal from "../../common/ConfirmationModal";

export default function QuizManagement() {
  const dispatch = useDispatch();

  // --- Get Data from Redux Store ---
  const { list: quizzes, status, error } = useSelector(
    (state) => state.quizzes
  );
  const { list: godMasterList } = useSelector((state) => state.gods);
  const { list: GodList } = useSelector((state) => state.God);

  // --- Component State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizToDelete, setQuizToDelete] = useState(null);

  // --- Form State ---
  const initialFormState = {
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correctanswer: "",
    sort: "",
    language: "",
    master: "",
    god: "",
    isActive: true,
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- Fetch initial data ---
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchQuizzes());
    }
    dispatch(fetchGods());
    dispatch(fetchgods());
  }, [dispatch, status]);

  // --- Helper functions ---
  const getNameById = (id, list) =>
    list.find((item) => item._id === id)?.name || "N/A";
  const getMasterNameById = (id) => getNameById(id, godMasterList);
  const getGodNameById = (id) => getNameById(id, GodList);

  const handleOpenModal = (quiz = null) => {
    if (quiz) {
      setEditingQuiz(quiz);
      setFormData({
        question: quiz.question || "",
        option1: quiz.options?.[0] || "",
        option2: quiz.options?.[1] || "",
        option3: quiz.options?.[2] || "",
        option4: quiz.options?.[3] || "",
        correctanswer: quiz.correctanswer || "",
        sort: quiz.sort || 1,
        language: quiz.language || "6560d27b0bc4a38928599a48",
        master: quiz.master || "",
        god: quiz.god || "",
        isActive: quiz.isActive !== undefined ? quiz.isActive : true,
      });
    } else {
      setEditingQuiz(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      question: formData.question,
      options: [
        formData.option1,
        formData.option2,
        formData.option3,
        formData.option4,
      ].filter((opt) => opt),
      correctanswer: formData.correctanswer,
      sort: formData.sort,
      language: formData.language,
      master: formData.master,
      god: formData.god,
      isActive: formData.isActive,
    };

    try {
      const isEditing = !!editingQuiz;
      const action = isEditing
        ? updateQuiz({ id: editingQuiz._id, ...payload })
        : addQuiz(payload);

      await dispatch(action).unwrap();

      // 2. ADD SUCCESS TOAST
      toast.success(
        isEditing ? "Quiz updated successfully!" : "Quiz added successfully!"
      );

      handleCloseModal();
    } catch (err) {
      // 2. REPLACE ALERT WITH ERROR TOAST
      const errorMessage =
        typeof err === "string" ? err : "An error occurred while saving.";
      toast.error(errorMessage);
      console.error("Save Quiz Error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!quizToDelete) return;
    setIsSaving(true);
    try {
      await dispatch(deleteQuiz(quizToDelete._id)).unwrap();

      // 3. ADD SUCCESS TOAST FOR DELETE
      toast.success(`Quiz "${quizToDelete.question}" was deleted.`);

      setQuizToDelete(null);
    } catch (err) {
      // 3. REPLACE ALERT WITH ERROR TOAST
      const errorMessage =
        typeof err === "string" ? err : "Failed to delete the quiz.";
      toast.error(errorMessage);
      console.error("Delete Quiz Error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // --- JSX Rendering ---
  return (
    <>
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center p-3">
          <h4 className="mb-0">❓ Quiz Management</h4>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <i className="fas fa-plus me-2"></i> Add New Quiz
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
                      <td className="fw-bold">{quiz.question}</td>
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
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => handleOpenModal(quiz)}
                          title="Edit Quiz"
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setQuizToDelete(quiz)}
                          title="Delete Quiz"
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
      </div>

      {isModalOpen && (
        <div className="modal fade show" style={{ display: "block" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <form onSubmit={handleSaveQuiz}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingQuiz ? "Edit Quiz" : "Add New Quiz"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                  ></button>
                </div>
                <div className="modal-body">
                  {/* Question */}
                  <div className="mb-3">
                    <label className="form-label">Question</label>
                    <input
                      type="text"
                      name="question"
                      className="form-control"
                      value={formData.question}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  {/* Options */}
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <label>Option 1</label>
                      <input
                        type="text"
                        name="option1"
                        className="form-control"
                        value={formData.option1}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label>Option 2</label>
                      <input
                        type="text"
                        name="option2"
                        className="form-control"
                        value={formData.option2}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label>Option 3</label>
                      <input
                        type="text"
                        name="option3"
                        className="form-control"
                        value={formData.option3}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label>Option 4</label>
                      <input
                        type="text"
                        name="option4"
                        className="form-control"
                        value={formData.option4}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                  </div>
                  {/* Correct Answer */}
                  <div className="mb-3">
                    <label className="form-label">Correct Answer</label>
                    <input
                      type="text"
                      name="correctanswer"
                      className="form-control"
                      value={formData.correctanswer}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  {/* Dropdowns */}
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label className="form-label">Language</label>
                      <select
                        name="language"
                        className="form-select"
                        value={formData.language}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="" disabled>
                          -- Select Language --
                        </option>
                        {staticLanguages.map((lang) => (
                          <option key={lang._id} value={lang._id}>
                            {lang.nativeName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Master</label>
                      <select
                        name="master"
                        className="form-select"
                        value={formData.master}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="" disabled>
                          -- Select Master --
                        </option>
                        {godMasterList.map((m) => (
                          <option key={m._id} value={m._id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">God</label>
                      <select
                        name="god"
                        className="form-select"
                        value={formData.god}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="" disabled>
                          -- Select God --
                        </option>
                        {GodList.map((god) => (
                          <option key={god._id} value={god._id}>
                            {god.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {/* Sort & Status */}
                  <div className="row">
                    <div className="col-md-6">
                      <label className="form-label">Sort Order</label>
                      <input
                        type="number"
                        name="sort"
                        className="form-control"
                        value={formData.sort}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 d-flex align-items-end">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="isActive"
                          id="isActive"
                          checked={formData.isActive}
                          onChange={handleFormChange}
                        />
                        <label className="form-check-label" htmlFor="isActive">
                          Active
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        show={quizToDelete !== null}
        onClose={() => setQuizToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={isSaving}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">{quizToDelete?.question}</strong>?
        </p>
        <p className="text-muted text-center">This action cannot be undone.</p>
      </ConfirmationModal>
    </>
  );
}
