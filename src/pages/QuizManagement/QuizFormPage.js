import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";

// --- Redux Actions ---
import { fetchQuizzes, addQuiz, updateQuiz } from "../../store/quiz";
import { fetchGods } from "../../store/godmaster";
import { fetchGods as fetchgods } from "../../store/god";
import { staticLanguages } from "../../constants/languages";

export default function QuizFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  // --- Redux State ---
  const { list: quizzes, status } = useSelector((state) => state.quizzes);
  const { list: godMasterList } = useSelector((state) => state.gods);
  const { list: GodList } = useSelector((state) => state.God);

  // --- Component State ---
  const [formData, setFormData] = useState({
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
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // --- Effects ---
  useEffect(() => {
    if (status === "idle") dispatch(fetchQuizzes());
    dispatch(fetchGods());
    dispatch(fetchgods());

    if (id && quizzes.length > 0) {
      const quiz = quizzes.find((q) => q._id === id);
      if (quiz) {
        setFormData({
          question: quiz.question || "",
          option1: quiz.options?.[0] || "",
          option2: quiz.options?.[1] || "",
          option3: quiz.options?.[2] || "",
          option4: quiz.options?.[3] || "",
          correctanswer: quiz.correctanswer || "",
          sort: quiz.sort || 0,
          language: quiz.language || "",
          master: quiz.master || "",
          god: quiz.god || "",
          isActive: quiz.isActive !== undefined ? quiz.isActive : true,
        });
      }
    }
  }, [id, quizzes, dispatch, status]);

  // --- Validation ---
  const validateForm = () => {
    const newErrors = {};
    const {
      question,
      option1,
      option2,
      option3,
      option4,
      correctanswer,
      language,
      master,
      god,
      sort,
    } = formData;
    if (!question.trim()) newErrors.question = "Question is required.";
    if (!option1.trim()) newErrors.option1 = "Option 1 is required.";
    if (!option2.trim()) newErrors.option2 = "Option 2 is required.";
    if (!option3.trim()) newErrors.option3 = "Option 3 is required.";
    if (!option4.trim()) newErrors.option4 = "Option 4 is required.";
    if (!correctanswer)
      newErrors.correctanswer = "Please select a correct answer.";
    if (!language) newErrors.language = "Language is required.";
    if (!master) newErrors.master = "Master is required.";
    if (!god) newErrors.god = "God is required.";
    if (sort === "" || isNaN(sort))
      newErrors.sort = "Sort order must be a number.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);

    const payload = {
      question: formData.question,
      options: [
        formData.option1,
        formData.option2,
        formData.option3,
        formData.option4,
      ],
      correctanswer: formData.correctanswer,
      sort: Number(formData.sort),
      language: formData.language,
      master: formData.master,
      god: formData.god,
      isActive: formData.isActive,
    };

    try {
      const action = id ? updateQuiz({ id, ...payload }) : addQuiz(payload);
      await dispatch(action).unwrap();
      toast.success(
        id ? "Quiz updated successfully!" : "Quiz added successfully!"
      );
      navigate("/quiz");
    } catch (err) {
      toast.error(err?.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => {
      const updated = { ...prev, [name]: newValue };
      // If an option is updated, check if the correct answer is still valid
      if (
        name.startsWith("option") &&
        updated.correctanswer &&
        ![
          updated.option1,
          updated.option2,
          updated.option3,
          updated.option4,
        ].includes(updated.correctanswer)
      ) {
        updated.correctanswer = ""; // Reset if no longer valid
      }
      return updated;
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // Create a dynamic list of options for the correct answer dropdown
  const answerOptions = [
    formData.option1,
    formData.option2,
    formData.option3,
    formData.option4,
  ]
    .filter((opt) => opt.trim() !== "")
    .map((opt) => ({ value: opt, label: opt }));

  return (
    <div className="content-wrapper p-4">
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <div>
          <span
            style={{ cursor: "pointer", color: "#0d6efd" }}
            onClick={() => navigate("/quiz")}
          >
            Quizzes
          </span>{" "}
          / <span>{id ? "Edit Quiz" : "New Quiz"}</span>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => navigate("/quiz")}
        >
          <i className="fas fa-arrow-left me-2"></i> Back
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            {/* --- Section 1: Content --- */}
            <h5 className="mb-4 text-primary">Quiz Content</h5>
            <div className="mb-3">
              <label className="form-label fw-bold">
                Question <span className="text-danger">*</span>
              </label>
              <textarea
                name="question"
                rows="3"
                className={`form-control ${
                  errors.question ? "is-invalid" : ""
                }`}
                value={formData.question}
                onChange={handleFormChange}
              ></textarea>
              {errors.question && (
                <div className="invalid-feedback">{errors.question}</div>
              )}
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  Option 1 <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="option1"
                  className={`form-control ${
                    errors.option1 ? "is-invalid" : ""
                  }`}
                  value={formData.option1}
                  onChange={handleFormChange}
                />
                {errors.option1 && (
                  <div className="invalid-feedback">{errors.option1}</div>
                )}
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  Option 2 <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="option2"
                  className={`form-control ${
                    errors.option2 ? "is-invalid" : ""
                  }`}
                  value={formData.option2}
                  onChange={handleFormChange}
                />
                {errors.option2 && (
                  <div className="invalid-feedback">{errors.option2}</div>
                )}
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  Option 3 <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="option3"
                  className={`form-control ${
                    errors.option3 ? "is-invalid" : ""
                  }`}
                  value={formData.option3}
                  onChange={handleFormChange}
                />
                {errors.option3 && (
                  <div className="invalid-feedback">{errors.option3}</div>
                )}
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  Option 4 <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="option4"
                  className={`form-control ${
                    errors.option4 ? "is-invalid" : ""
                  }`}
                  value={formData.option4}
                  onChange={handleFormChange}
                />
                {errors.option4 && (
                  <div className="invalid-feedback">{errors.option4}</div>
                )}
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">
                Correct Answer <span className="text-danger">*</span>
              </label>
              <Select
                options={answerOptions}
                value={
                  answerOptions.find(
                    (opt) => opt.value === formData.correctanswer
                  ) || null
                }
                onChange={(opt) =>
                  setFormData((p) => ({ ...p, correctanswer: opt.value }))
                }
                isDisabled={answerOptions.length < 1}
                placeholder="Select from the options above..."
              />
              {errors.correctanswer && (
                <div className="text-danger small mt-1">
                  {errors.correctanswer}
                </div>
              )}
            </div>
            <hr className="my-4" />

            {/* --- Section 2: Settings --- */}
            <h5 className="mb-4 text-primary">Categorization & Settings</h5>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">
                  Language <span className="text-danger">*</span>
                </label>
                <Select
                  options={staticLanguages.map((l) => ({
                    value: l._id,
                    label: l.nativeName,
                  }))}
                  value={
                    staticLanguages
                      .filter((l) => l._id === formData.language)
                      .map((l) => ({ value: l._id, label: l.nativeName }))[0] ||
                    null
                  }
                  onChange={(opt) =>
                    setFormData((p) => ({ ...p, language: opt.value }))
                  }
                />
                {errors.language && (
                  <div className="text-danger small mt-1">
                    {errors.language}
                  </div>
                )}
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">
                  Master <span className="text-danger">*</span>
                </label>
                <Select
                  options={godMasterList.map((g) => ({
                    value: g._id,
                    label: g.name,
                  }))}
                  value={
                    godMasterList
                      .filter((g) => g._id === formData.master)
                      .map((g) => ({ value: g._id, label: g.name }))[0] || null
                  }
                  onChange={(opt) =>
                    setFormData((p) => ({ ...p, master: opt.value }))
                  }
                />
                {errors.master && (
                  <div className="text-danger small mt-1">{errors.master}</div>
                )}
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">
                  God <span className="text-danger">*</span>
                </label>
                <Select
                  options={GodList.map((g) => ({
                    value: g._id,
                    label: g.name,
                  }))}
                  value={
                    GodList.filter((g) => g._id === formData.god).map((g) => ({
                      value: g._id,
                      label: g.name,
                    }))[0] || null
                  }
                  onChange={(opt) =>
                    setFormData((p) => ({ ...p, god: opt.value }))
                  }
                />
                {errors.god && (
                  <div className="text-danger small mt-1">{errors.god}</div>
                )}
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  Sort Order <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  name="sort"
                  className={`form-control ${errors.sort ? "is-invalid" : ""}`}
                  value={formData.sort}
                  onChange={handleFormChange}
                />
                {errors.sort && (
                  <div className="invalid-feedback">{errors.sort}</div>
                )}
              </div>
              <div className="col-md-6 d-flex align-items-center pt-3">
                <div className="form-check form-switch fs-5">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleFormChange}
                  />
                  <label className="form-check-label">Active</label>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary mr-2"
                onClick={() => navigate("/quiz")}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : (
                  <i className="fas fa-save me-2"></i>
                )}
                {"  "}
                {id ? "Update Quiz" : "Create Quiz"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
