import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { fetchTemples, deleteTemple } from "../../store/temple";
import ConfirmationModal from "../../common/ConfirmationModal";
import DynamicImage from "../../components/PostPreview/PostPreview";

export default function TempleListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: temples, status, error } = useSelector((state) => state.temple);

  const [isDeleting, setIsDeleting] = useState(false);
  const [templeToDelete, setTempleToDelete] = useState(null);

  // Filters state
  const [selectedFilters, setSelectedFilters] = useState({
    name: "",
    language: "",
    god: "",
    godMaster: "",
  });

  // Extract unique options from current temples
  const nameOptions = useMemo(() => {
    const names = temples.map((t) => t.name).filter(Boolean);
    return [...new Set(names)];
  }, [temples]);

  const languageOptions = useMemo(() => {
    const langs = temples.map((t) => t.language).filter(Boolean);
    return [...new Set(langs)];
  }, [temples]);

  const godOptions = useMemo(() => {
    const gods = temples.map((t) => t.god).filter(Boolean);
    return [...new Set(gods)];
  }, [temples]);

  const godMasterOptions = useMemo(() => {
    const masters = temples.map((t) => t.godMaster).filter(Boolean);
    return [...new Set(masters)];
  }, [temples]);

  // Fetch temples with filters
  const loadTemples = useCallback(() => {
    dispatch(fetchTemples(selectedFilters));
  }, [dispatch, selectedFilters]);

  useEffect(() => {
    loadTemples();
  }, [loadTemples]);

  const confirmDelete = async () => {
    if (!templeToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteTemple(templeToDelete._id)).unwrap();
      toast.success(`Temple "${templeToDelete.name}" deleted successfully.`);
      setTempleToDelete(null);
    } catch (err) {
      toast.error(err?.message || "An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSelectedFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    loadTemples();
  };

  const handleResetFilters = () => {
    setSelectedFilters({
      name: "",
      language: "",
      god: "",
      godMaster: "",
    });
  };

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
          <span className="btn-label">
            <em className="fas fa-plus"></em>
          </span>
          Add New Temple
        </button>
      </div>

      {/* Filter Section */}
      <div className="card-body border-bottom">
        <div className="row g-3">
          {/* Name */}
          <div className="col-md-3">
            <select
              className="form-control"
              name="name"
              value={selectedFilters.name}
              onChange={handleFilterChange}
            >
              <option value="">All Names</option>
              {nameOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div className="col-md-3">
            <select
              className="form-control"
              name="language"
              value={selectedFilters.language}
              onChange={handleFilterChange}
            >
              <option value="">All Languages</option>
              {languageOptions.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* God */}
          <div className="col-md-3">
            <select
              className="form-control"
              name="god"
              value={selectedFilters.god}
              onChange={handleFilterChange}
            >
              <option value="">All Gods</option>
              {godOptions.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* God Master */}
          <div className="col-md-3">
            <select
              className="form-control"
              name="godMaster"
              value={selectedFilters.godMaster}
              onChange={handleFilterChange}
            >
              <option value="">All God Masters</option>
              {godMasterOptions.map((gm) => (
                <option key={gm} value={gm}>
                  {gm}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 d-flex gap-2">
          <button className="btn btn-primary" onClick={handleSearch}>
            Search
          </button>
          <button className="btn btn-secondary" onClick={handleResetFilters}>
            Reset
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
            <tbody>
              {status === "loading" && (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="spinner-border"></div>
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
              {status === "succeeded" && temples.length > 0
                ? temples.map((temple) => (
                    <tr key={temple._id}>
                      <td>
                        <DynamicImage
                          src={temple.files || "/placeholder.jpg"}
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
                            temple.isFamous
                              ? "text-bg-success"
                              : "text-bg-secondary"
                          }`}
                        >
                          {temple.isFamous ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => navigate(`/temple/edit/${temple._id}`)}
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setTempleToDelete(temple)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                : status === "succeeded" && (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        No Temples Found
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmationModal
        show={templeToDelete !== null}
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
