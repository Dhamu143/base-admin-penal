import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";

// --- Redux Actions ---
import { fetchQuizzes, addQuiz, updateQuiz } from "../../store/quiz";
import { fetchAllGods } from "../../store/god";
import { staticLanguages } from "../../constants/languages";

// --- ADDED --- Import the upload service
import { uploadImage } from "../../services/uploadService";

export default function QuizFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  // --- Redux State ---
  const { list: quizzes, status: quizStatus } = useSelector(
    (state) => state.quizzes
  );
  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

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
    god: "",
    isActive: true,
    files: "", // --- ADDED --- State for the image URL
  });

  const [filteredGods, setFilteredGods] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // --- Effects ---

  // Fetches initial data reliably
  useEffect(() => {
    if (quizStatus === "idle") dispatch(fetchQuizzes());
    if (godStatus === "idle") dispatch(fetchAllGods());
  }, [quizStatus, godStatus, dispatch]);

  // Populates the form for editing
  useEffect(() => {
    if (id && quizzes.length > 0 && allGods.length > 0) {
      const quiz = quizzes.find((q) => q._id === id);
      if (quiz) {
        setFormData({
          question: quiz.question || "",
          option1: quiz.options?.[0] || "",
          option2: quiz.options?.[1] || "",
          option3: quiz.options?.[2] || "",
          option4: quiz.options?.[3] || "",
          correctanswer: quiz.correctanswer || "",
          sort: quiz.sort || "",
          language: quiz.language,
          god: quiz.god?._id || quiz.god,
          isActive: quiz.isActive !== undefined ? quiz.isActive : true,
          files: quiz.files || "", // --- ADDED --- Populate existing image
        });

        const godsByLang = allGods.filter((g) => g.language === quiz.language);
        setFilteredGods(godsByLang);
      }
    }
  }, [id, quizzes, allGods]);

  // --- Validation ---
  const validateForm = () => {
    const newErrors = {};
    const {
      question,
      option1,
      option2,
      correctanswer,
      language,
      god,
      sort,
    } = formData;
    if (!question.trim()) newErrors.question = "Question is required.";
    if (!option1.trim()) newErrors.option1 = "Option 1 is required.";
    if (!option2.trim()) newErrors.option2 = "Option 2 is required.";
    if (!correctanswer)
      newErrors.correctanswer = "Please select a correct answer.";
    if (!language) newErrors.language = "Language is required.";
    if (!god) newErrors.god = "God is required.";
    if (sort === "" || isNaN(sort))
      newErrors.sort = "Sort order must be a number.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- ADDED --- Event Handler for Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsSaving(true);
    try {
      const uploadedUrl = await uploadImage(file);
      setFormData((prev) => ({ ...prev, files: uploadedUrl }));
      toast.success("Image uploaded!");
    } catch {
      toast.error("Image upload failed.");
    } finally {
      setIsSaving(false);
    }
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
      ].filter((opt) => opt && opt.trim() !== ""),
      correctanswer: formData.correctanswer,
      sort: Number(formData.sort),
      language: formData.language,
      god: formData.god,
      isActive: formData.isActive,
      files: formData.files, // --- ADDED --- Include image URL in payload
    };

    try {
      const action = id ? updateQuiz({ id, data: payload }) : addQuiz(payload);

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

  // --- Other handlers (handleFormChange, handleSelectChange, etc.) remain the same ---

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => {
      const updated = { ...prev, [name]: newValue };
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
        updated.correctanswer = "";
      }
      return updated;
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSelectChange = (fieldName, option) => {
    const value = option ? option.value : "";
    setFormData((prev) => {
      const newState = { ...prev, [fieldName]: value };
      if (fieldName === "language") {
        newState.god = ""; // Reset god selection
        if (Array.isArray(allGods)) {
          const godsByLang = allGods.filter((g) => g.language === value);
          setFilteredGods(godsByLang);
        }
      }
      return newState;
    });
  };

  const getSelectedOption = (options, id) => {
    if (!id || !options) return null;
    return options.find((item) => item.value === id) || null;
  };

  const languageOptions = staticLanguages.map((l) => ({
    value: l._id,
    label: `${l.nativeName} (${l.language})`,
  }));
  const godOptions = filteredGods.map((g) => ({ value: g._id, label: g.name }));
  const answerOptions = [
    formData.option1,
    formData.option2,
    formData.option3,
    formData.option4,
  ]
    .filter((opt) => opt && opt.trim() !== "")
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

            {/* --- ADDED --- Image Upload Field */}
            <div className="mb-3">
              <label className="form-label fw-bold">Question Image</label>
              <input
                type="file"
                className="form-control"
                onChange={handleImageUpload}
                accept="image/*"
                disabled={isSaving}
              />
              {formData.files && (
                <img
                  src={formData.files}
                  alt="Preview"
                  className="img-fluid rounded mt-2"
                  style={{ maxHeight: "150px" }}
                />
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
                <label className="form-label fw-bold">Option 3</label>
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
                <label className="form-label fw-bold">Option 4</label>
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
                value={getSelectedOption(answerOptions, formData.correctanswer)}
                onChange={(opt) => handleSelectChange("correctanswer", opt)}
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
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  Language <span className="text-danger">*</span>
                </label>
                <Select
                  options={languageOptions}
                  value={getSelectedOption(languageOptions, formData.language)}
                  onChange={(option) => handleSelectChange("language", option)}
                  placeholder="Select Language..."
                />
                {errors.language && (
                  <div className="text-danger small mt-1">
                    {errors.language}
                  </div>
                )}
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  God <span className="text-danger">*</span>
                </label>
                <Select
                  options={godOptions}
                  value={getSelectedOption(godOptions, formData.god)}
                  onChange={(option) => handleSelectChange("god", option)}
                  placeholder={
                    formData.language
                      ? "Select God..."
                      : "Select Language first..."
                  }
                  isDisabled={!formData.language}
                  isLoading={godStatus === "loading"}
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
                className="btn btn-outline-secondary mr-3"
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
                  <i className="fas fa-save mr-2"></i>
                )}
                {id ? "Update Quiz" : "Create Quiz"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
