import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

import { useChats, useDeleteChat } from "../../hooks/useChats";
import { useAllGods } from "../../hooks/useGod";

import FilterBar from "../../common/FilterBar";
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";

export default function ChatListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const itemsPerPage = 10;

  const [filters, setFilters] = useState({
    page: 1,
    limit: itemsPerPage,
    god: "",
    search: ""
  });

  const handleFilterChange = (key, value) => {
    let actualValue = value;
    if (value && typeof value === 'object' && 'value' in value) {
      actualValue = value.value;
    }
    setFilters(prev => ({
      ...prev,
      [key]: actualValue,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleReset = () => {
    setFilters({
      page: 1,
      limit: itemsPerPage,
      god: "",
      search: ""
    });
    queryClient.invalidateQueries(["chats"]);
    toast.info("Filters reset");
  };

  const apiFilters = useMemo(() => {
    return {
      ...filters,
      limit: itemsPerPage,
      god_id: filters.god || "", 
    };
  }, [filters, itemsPerPage]);

  const { data, isLoading, isError, error, isFetching } = useChats(apiFilters);
  const chats = data?.data || [];
  const pagination = data?.pagination || null;

  const deleteMutation = useDeleteChat();
  const { data: allGods = [], isLoading: isLoadingGods } = useAllGods();

  const [chatToDelete, setChatToDelete] = useState(null);

  const confirmDelete = async () => {
    if (!chatToDelete) return;
    try {
      await deleteMutation.mutateAsync(chatToDelete._id);
      if (chats.length === 1 && filters.page > 1) {
        handlePageChange(filters.page - 1);
      }
      setChatToDelete(null);
    } catch (err) {
      // Error handled in hook
    }
  };

  const getGodNameById = (id) => {
    const god = allGods.find((g) => g._id === id);
    return god ? god.name : "Unknown God";
  };

  const godOptions = [
    { value: "", label: "All Gods" },
    ...allGods.map((god) => ({ value: god._id, label: god.name })),
  ];

  return (
    <>
      <style>{`
        .truncate-text { 
          max-width: 350px; 
          white-space: nowrap; 
          overflow: hidden; 
          text-overflow: ellipsis; 
          display: inline-block; 
          vertical-align: middle; 
        }
      `}</style>

      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
          <h4 className="mb-0 text-primary-emphasis">Chat Question Management</h4>
          <div>
            <button
              className="btn btn-labeled btn-success"
              style={{ fontSize: "17px" }}
              onClick={() => navigate("/chats/new")}
            >
              <span className="btn-label me-2">
                <i className="fas fa-plus"></i>
              </span>
              Add New Chat Q&A
            </button>
          </div>
        </div>

        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          godOptions={godOptions}
          godStatus={isLoadingGods ? "loading" : "succeeded"}
        />

        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Question</th>
                  <th>Answer Preview</th>
                  <th>God</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <TableStatus
                  status={isLoading || isFetching ? "loading" : isError ? "failed" : "succeeded"}
                  error={error}
                  dataLength={chats.length}
                  colSpan={4}
                  loadingText="Loading chats..."
                  emptyText="No chats found."
                />
                {!isLoading && !isError && Array.isArray(chats) &&
                  chats.map((chat) => (
                    <tr key={chat._id} className={isFetching ? "opacity-50" : ""}>
                      <td style={{ maxWidth: "250px" }} className="fw-medium">
                        {chat?.question}
                      </td>
                      <td>
                        <span className="truncate-text" title={chat?.answer}>
                          {chat?.answer}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-info text-dark">
                          {getGodNameById(chat?.god_id)}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary mr-2"
                          onClick={() => navigate(`/chats/edit/${chat._id}`)}
                          title="Edit"
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setChatToDelete(chat)}
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
          show={chatToDelete !== null}
          onClose={() => setChatToDelete(null)}
          onConfirm={confirmDelete}
          title="Confirm Deletion"
          confirmText="Delete"
          isLoading={deleteMutation.isPending}
          confirmButtonVariant="danger"
        >
          <p className="fs-5 text-center">
            Are you sure you want to delete this Q&A entry? <br />
            <strong className="text-danger">"{chatToDelete?.question}"</strong>
          </p>
        </ConfirmationModal>
      </div>
    </>
  );
}