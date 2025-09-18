import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

// Redux Actions for Article
import {
  fetchArticles,
  addArticle,
  updateArticle,
  deleteArticle,
} from "../../store/Articles/index";

// Redux Actions for God Master List
import { fetchGods } from "../../store/godmaster/index";
import { fetchGods as fetchgods } from "../../store/god/index";

// Import the static languages array
import { staticLanguages } from "../../constants/languages";
import ConfirmationModal from "../../common/ConfirmationModal";

const styles = `
  .truncate-text {
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    vertical-align: middle;
  }
`;

export default function ArticleManagementPage() {
  const dispatch = useDispatch();

  const { list: articles, status, error } = useSelector(
    (state) => state.articles
  );
  const { list: gods, status: godStatus } = useSelector((state) => state.gods);
  const { list: Gods, status: GodStatus } = useSelector((state) => state.God);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [errors, setErrors] = useState({});

  const initialFormState = {
    title: "",
    shortdesc: "",
    longdesc: "",
    sort: "",
    isActive: "",
    isFree: "",
    master: "",
    language: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (status === "idle") dispatch(fetchArticles());
    if (godStatus === "idle") dispatch(fetchGods());
    if (GodStatus === "idle") dispatch(fetchgods());
  }, [status, godStatus, GodStatus, dispatch]);

  const getLanguageNameById = (langId) => {
    const language = staticLanguages.find((lang) => lang._id === langId);
    return language ? language.nativeName : "N/A";
  };
  // Get god name by ID
  const getGodNameById = (godId) => {
    const god = Gods.find((g) => g._id === godId);
    return god ? god.name : "N/A";
  };

  const handleOpenModal = (article = null) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        id: article._id,
        title: article.title || "",
        shortdesc: article.shortdesc || "",
        longdesc: article.longdesc || "",
        sort: article.sort || 0,
        isActive: article.isActive,
        isFree: article.isFree !== undefined ? article.isFree : true,
        master: article.master?._id || article.master || "",
        language: article.language?._id || article.language || "",
      });
    } else {
      setEditingArticle(null);
      setFormData(initialFormState);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingArticle(null);
    setFormData(initialFormState);
    setErrors({});
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Article title is required.";
    if (!formData.master) newErrors.master = "Please select a God.";
    if (!formData.language) newErrors.language = "Please select a language.";
    if (!formData.shortdesc.trim())
      newErrors.shortdesc = "Short description is required.";
    if (!formData.longdesc.trim())
      newErrors.longdesc = "Full article content is required.";
    if (formData.sort === "" || isNaN(formData.sort)) {
      newErrors.sort = "Sort order must be a valid number.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveArticle = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const action = editingArticle
        ? updateArticle({ id: editingArticle._id, ...formData })
        : addArticle(formData);
      await dispatch(action).unwrap();

      const successMessage = editingArticle
        ? "Article updated successfully! ✍️"
        : "Article added successfully! ✨";
      toast.success(successMessage);

      handleCloseModal();
    } catch (err) {
      console.error("Failed to save article:", err);
      toast.error(err?.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!articleToDelete) return;
    setIsSaving(true);
    try {
      await dispatch(deleteArticle(articleToDelete._id)).unwrap();
      toast.success(`Article "${articleToDelete.title}" deleted successfully.`);
      setArticleToDelete(null);
    } catch (err) {
      console.error("Failed to delete article:", err);
      toast.error(err?.message || "Failed to delete article.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
          <h4 className="mb-0 text-primary-emphasis">📰 Article Management</h4>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <i className="fas fa-plus me-2"></i> Add New Article
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  {/* <th>God</th> */}
                  <th>Language</th>
                  <th>Sort</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {status === "loading" && (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="spinner-border text-primary"></div>
                    </td>
                  </tr>
                )}
                {status === "failed" && (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-danger">
                      <i className="fas fa-exclamation-triangle me-2"></i>{" "}
                      Error: {error}
                    </td>
                  </tr>
                )}
                {status === "succeeded" && articles.length > 0
                  ? articles.map((article) => (
                      <tr key={article._id}>
                        <td className="fw-bold">
                          <span className="truncate-text" title={article.title}>
                            {article.title}
                          </span>
                        </td>
                        {/* <td>
                          {getGodNameById(article.master || article.Gods)}
                        </td> */}

                        <td>{getLanguageNameById(article.language)}</td>
                        <td>{article.sort}</td>
                        <td>
                          <span
                            className={`badge fs-6 ${
                              article.isFree
                                ? "text-bg-info"
                                : "text-bg-warning"
                            }`}
                          >
                            {article.isFree ? "Free" : "Premium"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge fs-6 ${
                              article.isActive
                                ? "text-bg-success"
                                : "text-bg-secondary"
                            }`}
                          >
                            {article.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-outline-secondary me-2"
                            onClick={() => handleOpenModal(article)}
                            title="Edit"
                          >
                            <i className="fas fa-pencil-alt"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setArticleToDelete(article)}
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  : status === "succeeded" && (
                      <tr>
                        <td colSpan="7" className="text-center py-5 text-muted">
                          No Articles Found.
                        </td>
                      </tr>
                    )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content shadow-lg">
                <form onSubmit={handleSaveArticle} noValidate>
                  <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title">
                      <i className="fas fa-edit me-2"></i>
                      {editingArticle
                        ? `Edit: ${editingArticle.title}`
                        : "Add New Article"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={handleCloseModal}
                    ></button>
                  </div>
                  <div
                    className="modal-body p-4"
                    style={{ maxHeight: "65vh", overflowY: "auto" }}
                  >
                    <p className="text-muted small">
                      Fields marked with <span className="text-danger">*</span>{" "}
                      are required.
                    </p>
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label fw-bold">
                        Article Title <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.title ? "is-invalid" : ""
                        }`}
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleFormChange}
                        placeholder="Enter a clear and concise title"
                      />
                      {errors.title && (
                        <div className="invalid-feedback">{errors.title}</div>
                      )}
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="master" className="form-label fw-bold">
                          God <span className="text-danger">*</span>
                        </label>
                        <select
                          id="master"
                          name="master"
                          className={`form-select ${
                            errors.master ? "is-invalid" : ""
                          }`}
                          value={formData.master}
                          onChange={handleFormChange}
                        >
                          <option value="" disabled>
                            -- Select a God-Master --
                          </option>
                          {gods.map((god) => (
                            <option key={god._id} value={god._id}>
                              {god.name}
                            </option>
                          ))}
                        </select>
                        {errors.master && (
                          <div className="invalid-feedback">
                            {errors.master}
                          </div>
                        )}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="Gods" className="form-label fw-bold">
                          God <span className="text-danger">*</span>
                        </label>
                        <select
                          id="Gods"
                          name="Gods"
                          className={`form-select ${
                            errors.Gods ? "is-invalid" : ""
                          }`}
                          value={formData.Gods}
                          onChange={handleFormChange}
                        >
                          <option value="" disabled>
                            -- Select a God --
                          </option>
                          {Gods.map((god) => (
                            <option key={god._id} value={god._id}>
                              {god.name}
                            </option>
                          ))}
                        </select>
                        {errors.Gods && (
                          <div className="invalid-feedback">{errors.Gods}</div>
                        )}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="language"
                          className="form-label fw-bold"
                        >
                          Language <span className="text-danger">*</span>
                        </label>
                        <select
                          id="language"
                          name="language"
                          className={`form-select ${
                            errors.language ? "is-invalid" : ""
                          }`}
                          value={formData.language}
                          onChange={handleFormChange}
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
                        {errors.language && (
                          <div className="invalid-feedback">
                            {errors.language}
                          </div>
                        )}
                      </div>
                    </div>{" "}
                    <div className="mb-3">
                      <label htmlFor="longdesc" className="form-label fw-bold">
                        Full Article Content{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className={`form-control ${
                          errors.longdesc ? "is-invalid" : ""
                        }`}
                        id="longdesc"
                        name="longdesc"
                        value={formData.longdesc}
                        onChange={handleFormChange}
                        rows="8"
                        placeholder="Enter the main content of the article here..."
                      ></textarea>
                      {errors.longdesc && (
                        <div className="invalid-feedback">
                          {errors.longdesc}
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="shortdesc" className="form-label fw-bold">
                        Short Description (Preview){" "}
                        <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className={`form-control ${
                          errors.shortdesc ? "is-invalid" : ""
                        }`}
                        id="shortdesc"
                        name="shortdesc"
                        value={formData.shortdesc}
                        onChange={handleFormChange}
                        rows="3"
                        placeholder="A brief summary that appears in lists"
                      ></textarea>
                      {errors.shortdesc && (
                        <div className="invalid-feedback">
                          {errors.shortdesc}
                        </div>
                      )}
                    </div>
                    <hr className="my-4" />
                    <div className="row align-items-end">
                      <div className="col-md-4 mb-3">
                        <label htmlFor="sort" className="form-label fw-bold">
                          Sort Order <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className={`form-control ${
                            errors.sort ? "is-invalid" : ""
                          }`}
                          id="sort"
                          name="sort"
                          value={formData.sort}
                          onChange={handleFormChange}
                        />
                        {errors.sort && (
                          <div className="invalid-feedback">{errors.sort}</div>
                        )}
                      </div>
                      <div className="col-md-4 mb-3">
                        <div className="form-check form-switch fs-5">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="isFree"
                            name="isFree"
                            checked={formData.isFree}
                            onChange={handleFormChange}
                          />
                          <label className="form-check-label" htmlFor="isFree">
                            Free Article
                          </label>
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <div className="form-check form-switch fs-5">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="isActive"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleFormChange}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="isActive"
                          >
                            Active Status
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer bg-light border-top">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseModal}
                      disabled={isSaving}
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      <ConfirmationModal
        show={articleToDelete !== null}
        onClose={() => setArticleToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={isSaving}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">{articleToDelete?.title}</strong>?
        </p>
        <p className="text-muted text-center">This action cannot be undone.</p>
      </ConfirmationModal>
    </>
  );
}
