import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";

// --- Bhajan Actions ---
import { fetchBhajans, deleteBhajan } from "../../store/bhajan/index";

// --- Static Data & Components ---
import { staticLanguages } from "../../constants/languages";
import ConfirmationModal from "../../common/ConfirmationModal";

const styles = `
  .truncate-text {
    max-width: 250px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    vertical-align: middle;
  }
`;

// Prepare options for react-select
const languageOptions = [
  { value: "", label: "All Languages" },
  ...staticLanguages.map((lang) => ({
    value: lang._id,
    label: `${lang.language} (${lang.nativeName})`,
  })),
];

export default function BhajanListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: bhajans, status, error } = useSelector(
    (state) => state.bhajans
  );

  const [isDeleting, setIsDeleting] = useState(false);
  const [bhajanToDelete, setBhajanToDelete] = useState(null);
  const [filters, setFilters] = useState({ language: "" });

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchBhajans());
    }
  }, [status, dispatch]);

  const filteredBhajans = useMemo(() => {
    if (!filters.language) {
      return bhajans;
    }
    return bhajans.filter((bhajan) => bhajan.language === filters.language);
  }, [bhajans, filters.language]);

  const getLanguageNameById = (langId) => {
    const language = staticLanguages.find((lang) => lang._id === langId);
    return language ? language.nativeName : "N/A";
  };

  const handleLanguageChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setFilters((prev) => ({ ...prev, language: value }));
  };

  const handleResetFilters = () => {
    setFilters({ language: "" });
  };

  const confirmDelete = async () => {
    if (!bhajanToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteBhajan(bhajanToDelete._id)).unwrap();
      toast.success(`Bhajan "${bhajanToDelete.name}" deleted successfully.`);
      setBhajanToDelete(null);
    } catch (err) {
      console.error("Failed to delete bhajan:", err);
      toast.error(err?.message || "An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedLanguage = languageOptions.find(
    (opt) => opt.value === filters.language
  );

  return (
    <div className="content-wrapper p-4">
      <style>{styles}</style>
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <h4 className="mb-0 text-primary-emphasis">🎶 Bhajan Management</h4>
        <button
          className="btn btn-labeled btn-success"
          type="button"
          style={{ fontSize: "17px" }}
          onClick={() => navigate("/bhajans/new")}
        >
          <span className="btn-label me-2">
            <em className="fas fa-plus"></em>
          </span>
          Add New Bhajan
        </button>
      </div>

      <div className="card shadow-sm">
        {/* Filter Section */}
        <div className="card-body border-bottom">
          <div className="row g-3 align-items-center">
            <div style={{ minWidth: "300px" }}>
              <div className="col-md-10">
                <Select
                  placeholder="Filter by language..."
                  options={languageOptions}
                  value={selectedLanguage}
                  onChange={handleLanguageChange}
                  isClearable={true}
                />
              </div>
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-secondary w-20"
                onClick={handleResetFilters}
              >
                <span className="mr-1">
                  {" "}
                  <i className="fas fa-undo me-2"></i>
                </span>
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>God</th>
                  <th>Language</th>
                  <th>Description</th>
                  <th>Sort</th>
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
                      Error: {error}
                    </td>
                  </tr>
                )}
                {status === "succeeded" && filteredBhajans.length > 0 ? (
                  filteredBhajans.map((b) => (
                    <tr key={b._id}>
                      <td className="fw-bold">{b.name}</td>
                      <td>{b.god?.name || "N/A"}</td>
                      <td>{getLanguageNameById(b.language)}</td>
                      <td>
                        <span
                          className="truncate-text"
                          title={b.description.replace(/<[^>]+>/g, "")}
                          dangerouslySetInnerHTML={{ __html: b.description }}
                        ></span>
                      </td>
                      <td>{b.sort}</td>
                      <td>
                        <span
                          className={`badge fs-6 ${
                            b.isActive ? "text-bg-success" : "text-bg-secondary"
                          }`}
                        >
                          {b.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => navigate(`/bhajans/edit/${b._id}`)}
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setBhajanToDelete(b)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : status === "succeeded" ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      No Bhajans Found
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmationModal
        show={bhajanToDelete !== null}
        onClose={() => setBhajanToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={isDeleting}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">{bhajanToDelete?.name}</strong>?
        </p>
        <p className="text-muted text-center">This action cannot be undone.</p>
      </ConfirmationModal>
    </div>
  );
}
