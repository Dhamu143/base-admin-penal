import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

// Common Components
import CustomPagination from "../../common/Pagination";
import ConfirmationModal from "../../common/ConfirmationModal";
import DynamicImage from "../../components/PostPreview/PostPreview";
import { TableStatus } from "../../components/TableStatus";

import { staticLanguages } from "../../constants/languages";

import { useGodsList, useDeleteGod } from "../../hooks/useGod"; 
export default function GodTablePage() {
  const navigate = useNavigate();
  const itemsPerPage = 10;

  const [page, setPage] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState(null); 
  const [godToDelete, setGodToDelete] = useState(null);

  const languageValue = selectedLanguage?.value || "";

  const {
    data,
    isLoading,
    isError,
    error
  } = useGodsList({
    page,
    limit: itemsPerPage,
    language: languageValue,
  });

  const gods = data?.data || []; 
  const pagination = data?.pagination || {};
  const totalItems = pagination.totalRecords || 0;
  const totalPages = pagination.totalPages || 0;

  const deleteMutation = useDeleteGod();

  const languageOptions = [
    { value: "", label: "All Languages" },
    ...staticLanguages.map((l) => ({
      value: l._id,
      label: `${l.language} (${l.nativeName})`,
    })),
  ];

  const getLanguageNameById = (langId) =>
    staticLanguages.find((l) => l._id === langId)?.nativeName || "N/A";

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLanguageChange = (option) => {
    setSelectedLanguage(option);
    setPage(1); 
  };

  const handleResetFilters = () => {
    setSelectedLanguage(null);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!godToDelete) return;

    deleteMutation.mutate(godToDelete._id, {
      onSuccess: () => {
        setGodToDelete(null);
        if (gods.length === 1 && page > 1) {
          setPage((prev) => prev - 1);
        }
      }
    });
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">God Management</h4>
        <button
          className="btn btn-success"
          onClick={() => navigate("/god-form")}
        >
          <em className="fas fa-plus me-2"></em> Add New God
        </button>
      </div>

      <div className="card-body border-bottom d-flex gap-3 align-items-center">
        <div style={{ minWidth: "300px" }}>
          <Select
            placeholder="Select Language..."
            options={languageOptions}
            value={selectedLanguage}
            onChange={handleLanguageChange}
            isClearable
          />
        </div>
        <button
          className="btn btn-outline-secondary ml-4"
          onClick={handleResetFilters}
        >
          <span className="mr-1">
            <i className="fas fa-undo me-2"></i>
          </span>
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Language</th>
                <th>Master</th>
                <th>Sort Order</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <TableStatus
                status={isLoading ? "loading" : isError ? "failed" : "succeeded"}
                error={error}
                dataLength={gods.length}
                colSpan={6}
                loadingText="Loading gods..."
                emptyText="No gods Found."
              />

              {!isLoading && !isError && gods.map((god) => (
                <tr key={god._id}>
                  <td>
                    <DynamicImage
                      src={god.featureimage || god.master?.featureimage}
                      alt={god.name}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  </td>
                  <td>{god.name}</td>
                  <td>{getLanguageNameById(god.language)}</td>
                  <td>{god.master?.name || "None"}</td>
                  <td>{god.sort}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-secondary mr-2"
                      onClick={() => navigate(`/god-form/${god._id}`)}
                    >
                      <em className="fas fa-pencil-alt"></em>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => setGodToDelete(god)}
                    >
                      <em className="fas fa-trash"></em>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalItems > itemsPerPage && (
        <div className="card-footer">
          <CustomPagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <ConfirmationModal
        show={godToDelete !== null}
        onClose={() => setGodToDelete(null)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        isLoading={deleteMutation.isPending} 
        confirmButtonVariant="danger"
      >
        <p className="fs-5 text-center">
          Are you sure you want to delete{" "}
          <strong className="text-danger">{godToDelete?.name}</strong>?
        </p>
        <p className="text-muted text-center">This action cannot be undone.</p>
      </ConfirmationModal>
    </div>
  );
}