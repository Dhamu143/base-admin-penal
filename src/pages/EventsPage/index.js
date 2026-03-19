import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";

import {
  useEvents,
  useDeleteEvent,
  useUpdateEvent
} from "../../hooks/useEvents"; 

import { staticLanguages } from "../../constants/languages";
import ConfirmationModal from "../../common/ConfirmationModal";
import CustomPagination from "../../common/Pagination";
import { TableStatus } from "../../components/TableStatus";

const languageOptions = [
  { value: "", label: "All Languages" },
  ...staticLanguages.map((lang) => ({
    value: lang._id,
    label: `${lang.language} (${lang.nativeName})`,
  })),
];

const formatDate = (date) => {
  if (!date) return "N/A";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "N/A";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};

export default function EventListPage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({ language: "", page: 1 });
  const [eventToDelete, setEventToDelete] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const itemsPerPage = 10;

  const { data, isLoading, isError, error, isFetching } = useEvents({
    ...filters,
    limit: itemsPerPage,
  });

  const events = data?.data || [];
  const pagination = data?.pagination || null;

  const deleteMutation = useDeleteEvent();
  const updateMutation = useUpdateEvent();

  const handleStatusToggle = async (event) => {
    if (togglingId === event._id) return;
    setTogglingId(event._id);
    try {
      await updateMutation.mutateAsync({
        id: event._id,
        isActive: !event.isActive
      });
      toast.success(`Event "${event.title}" status updated.`);
    } catch (err) {
      toast.error("Failed to update status.");
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      await deleteMutation.mutateAsync(eventToDelete._id);

      if (events.length === 1 && filters.page > 1) {
        setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
      }

      setEventToDelete(null);
      toast.success("Event deleted successfully");
    } catch (err) {
      toast.error("Failed to delete event");
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
        <h4 className="mb-0 text-primary-emphasis">Event Management</h4>
        <div>
          <button
            className="btn btn-success"
            onClick={() => navigate("/events/new")}
          >
            <i className="fas fa-plus mr-2"></i> Add New Event
          </button>
        </div>
      </div>

      <div className="card-body border-bottom">
        <div className="d-flex align-items-center gap-3">
          <div style={{ minWidth: "250px", marginRight: "15px" }}>
            <Select
              options={languageOptions}
              value={languageOptions.find(o => o.value === filters.language)}
              onChange={(opt) => setFilters({ ...filters, language: opt?.value || "", page: 1 })}
              placeholder="Filter by Language"
            />
          </div>
          <button
            className="btn btn-outline-secondary"
            onClick={() => setFilters({ language: "", page: 1 })}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Dates</th>
                <th>Language</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <TableStatus
                status={isLoading || isFetching ? "loading" : isError ? "failed" : "succeeded"}
                error={error}
                dataLength={events.length}
                colSpan={6}
                loadingText="Loading events..."
                emptyText="No events Found."
              />
              {!isLoading && !isError && events.map((item) => (
                <tr key={item._id} className={isFetching ? "opacity-50" : ""}>
                  <td>
                    <img src={item.image} alt="event" style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                  </td>
                  <td className="fw-bold">{item.title}</td>
                  <td>
                    <div className="small"><strong>Start:</strong> {formatDate(item.startDate)}</div>
                    <div className="small"><strong>End:</strong> {formatDate(item.endDate)}</div>
                  </td>
                  <td>
                    {
                      staticLanguages.find(l => l._id === item.language)?.nativeName || "N/A"
                    }
                  </td>
                  <td>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={item.isActive}
                        disabled={togglingId === item._id}
                        onChange={() => handleStatusToggle(item)}
                        style={{ cursor: "pointer" }}
                      />
                      <label className="ms-2 small form-check-label">
                        {togglingId === item._id ? (
                          <span className="spinner-border spinner-border-sm text-secondary"></span>
                        ) : item.isActive ? "Active" : "Inactive"}
                      </label>
                    </div>
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-primary mr-2"
                      onClick={() => navigate(`/events/edit/${item._id}`)}
                      title="Edit"
                    >
                      <i className="fas fa-pencil-alt"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => setEventToDelete(item)}
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

      {pagination?.totalPages > 1 && (
        <div className="card-footer">
          <CustomPagination
            currentPage={filters.page}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setFilters({ ...filters, page: p })}
            totalItems={pagination.totalRecords}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      <ConfirmationModal
        show={!!eventToDelete}
        onClose={() => setEventToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
        title="Delete Event"
        confirmButtonVariant="danger"
      >
        <p className="text-center">
          Are you sure you want to delete <br />
          <strong>{eventToDelete?.title}</strong>?
        </p>
      </ConfirmationModal>
    </div>
  );
}