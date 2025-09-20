import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { fetchTemples, deleteTemple } from "../../store/temple";
import { fetchAllGods } from "../../store/god/index";
import { staticLanguages } from "../../constants/languages";
import ConfirmationModal from "../../common/ConfirmationModal";
import DynamicImage from "../../components/PostPreview/PostPreview";

export default function TempleListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // --- Redux Store ---
  const { list: temples, status, error } = useSelector((state) => state.temple);
  const { masterList: allGods, masterStatus: godStatus } = useSelector(
    (state) => state.God
  );

  // --- Local State ---
  const [isDeleting, setIsDeleting] = useState(false);
  const [templeToDelete, setTempleToDelete] = useState(null);
  const [filters, setFilters] = useState({
    language: "",
    god: "",
  });

  // --- Data Fetching ---
  const loadTemples = (params = {}) => {
    dispatch(fetchTemples(params))
      .unwrap()
      .catch((err) => {
        toast.error(err?.message || "Failed to load temples.");
      });
  };

  useEffect(() => {
    loadTemples();
    if (godStatus === "idle") {
      dispatch(fetchAllGods());
    }
  }, [dispatch, godStatus]);

  // Filters the god dropdown based on the selected language.
  const filteredGodsForDropdown = useMemo(() => {
    if (!filters.language) {
      return allGods; // If no language is selected, show all gods
    }
    return allGods.filter((god) => god.language === filters.language);
  }, [filters.language, allGods]);

  // --- Handlers ---
  // When language changes, the god filter is reset.
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      if (name === "language") {
        newFilters.god = ""; // Reset god filter when language changes
      }
      return newFilters;
    });
  };

  const handleSearch = () => {
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v)
    );
    loadTemples(activeFilters);
  };

  const handleResetFilters = () => {
    setFilters({ language: "", god: "" });
    loadTemples();
  };

  const confirmDelete = async () => {
    if (!templeToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteTemple(templeToDelete._id)).unwrap();
      toast.success(`Temple "${templeToDelete.name}" deleted successfully.`);
      loadTemples(filters);
    } catch (err) {
      toast.error(err?.message || "An error occurred while deleting.");
    } finally {
      setTempleToDelete(null);
      setIsDeleting(false);
    }
  };

  // --- Render helpers ---
  const renderTableContent = () => {
    if (status === "loading") {
      return (
        <tr>
          <td colSpan="7" className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </td>
        </tr>
      );
    }

    if (status === "failed") {
      return (
        <tr>
          <td colSpan="7" className="text-center py-5 text-danger">
            <strong>Error:</strong> {error}
          </td>
        </tr>
      );
    }

    if (temples.length === 0) {
      return (
        <tr>
          <td colSpan="7" className="text-center py-5 text-muted">
            No Temples Found
          </td>
        </tr>
      );
    }

    return temples.map((temple) => (
      <tr key={temple._id}>
        <td>
          <DynamicImage
            // ✨ UPDATED: Using 'featureimage' for the temple image source
            src={temple.featureimage || "/placeholder.jpg"}
            alt={temple.name}
            style={{
              width: "60px",
              height: "60px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
        </td>
        <td className="fw-bold">{temple.name}</td>
        <td
          style={{
            maxWidth: "200px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={temple.address}
        >
          {temple.address}
        </td>
        <td>{temple.rating ? `⭐ ${temple.rating}` : "-"}</td>
        <td>
          {temple.openTime && temple.closeTime
            ? `${temple.openTime} - ${temple.closeTime}`
            : "-"}
        </td>
        <td>
          <span
            className={`badge fs-6 ${
              temple.isFamous ? "text-bg-success" : "text-bg-secondary"
            }`}
          >
            {temple.isFamous ? "Yes" : "No"}
          </span>
        </td>
        <td className="text-center">
          <button
            className="btn btn-sm btn-outline-secondary me-2"
            title="Edit"
            onClick={() => navigate(`/temple/edit/${temple._id}`)}
          >
            <i className="fas fa-pencil-alt"></i>
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            title="Delete"
            onClick={() => setTempleToDelete(temple)}
          >
            <i className="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    ));
  };

  // --- UI ---
  return (
    <div className="card shadow-sm">
      {/* Header */}
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">🕌 Temple Management</h4>
        <button
          className="btn btn-labeled btn-success"
          style={{ fontSize: "17px" }}
          onClick={() => navigate("/temple/new")}
        >
          <span className="btn-label me-2">
            <i className="fas fa-plus"></i>
          </span>
          Add New Temple
        </button>
      </div>

      {/* Filter Section */}
      <div className="card-body border-bottom">
        <div className="row g-3">
          <div className="col-md-6">
            <select
              className="form-control"
              name="language"
              value={filters.language}
              onChange={handleFilterChange}
            >
              <option value="">All Languages</option>
              {staticLanguages.map((lang) => (
                <option key={lang._id} value={lang._id}>
                  {lang.language} ({lang.nativeName})
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <select
              className="form-control"
              name="god"
              value={filters.god}
              onChange={handleFilterChange}
              disabled={godStatus !== "succeeded"} // Disable if gods are not loaded
            >
              <option value="">All Gods</option>
              {filteredGodsForDropdown.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 d-flex gap-2">
          <button className="btn btn-primary" onClick={handleSearch}>
            <i className="fas fa-search me-2"></i>Search
          </button>
          <button className="btn btn-secondary" onClick={handleResetFilters}>
            <i className="fas fa-undo me-2"></i>Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Address</th>
                <th>Rating</th>
                <th>Timings</th>
                <th>Famous</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>{renderTableContent()}</tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        show={!!templeToDelete}
        onClose={() => setTempleToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        isLoading={isDeleting}
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete <br />
          <strong className="text-danger">{templeToDelete?.name}</strong>?
        </p>
      </ConfirmationModal>
    </div>
  );
}
