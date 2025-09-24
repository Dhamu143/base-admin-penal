import React from "react";
import DynamicImage from "../components/PostPreview/PostPreview";
import { TableStatus } from "./TableStatus";


export default function DataTable({
  data = [],
  columns = [],
  status = "idle",
  error = "",
  actions = [],
}) {
  const colSpan = columns.length + (actions.length > 0 ? 1 : 0);

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead className="table-light">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx}>{col.header}</th>
            ))}
            {actions.length > 0 && <th className="text-center">Actions</th>}
          </tr>
        </thead>
        <tbody>
          <TableStatus
            status={status}
            error={error}
            dataLength={data.length}
            colSpan={colSpan}
            loadingText="Loading records..."
            emptyText="No records found."
          />
          {status === "succeeded" &&
            data.map((row, rowIndex) => (
              <tr key={row._id || rowIndex}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="text-center">
                    {actions.map((action, idx) => (
                      <button
                        key={idx}
                        className={`btn btn-sm ${action.className} me-1`}
                        onClick={() => action.onClick(row)}
                        title={action.label}
                      >
                        {action.icon && <i className={action.icon}></i>}
                      </button>
                    ))}
                  </td>
                )}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
