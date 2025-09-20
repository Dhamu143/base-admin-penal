import React from "react";
import Pagination from "react-bootstrap/Pagination";

const CustomPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}) => {
  if (totalPages <= 1) return null; // No pagination needed

  // --- Calculations for "Showing X to Y of Z" text ---
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // --- Logic to generate a window of page numbers with ellipses ---
  const getPageItems = () => {
    const pageWindow = 2; // How many pages to show around the current page
    const pages = [];

    // Always show the first page
    if (currentPage > pageWindow + 1) {
      pages.push(
        <Pagination.Item key={1} onClick={() => onPageChange(1)}>
          {1}
        </Pagination.Item>
      );
      if (currentPage > pageWindow + 2) {
        pages.push(<Pagination.Ellipsis key="start-ellipsis" />);
      }
    }

    // Determine the range of pages to display
    const startPage = Math.max(1, currentPage - pageWindow);
    const endPage = Math.min(totalPages, currentPage + pageWindow);

    for (let number = startPage; number <= endPage; number++) {
      pages.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => onPageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    // Always show the last page
    if (currentPage < totalPages - pageWindow) {
      if (currentPage < totalPages - pageWindow - 1) {
        pages.push(<Pagination.Ellipsis key="end-ellipsis" />);
      }
      pages.push(
        <Pagination.Item
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    return pages;
  };

  return (
    <div className="row d-flex align-items-center">
      {/* Column for "Showing X to Y of Z" */}
      <div className="col-sm-12 col-md-5">
        <div className="dataTables_info">
          Showing {startItem} to {endItem} of {totalItems} entries
        </div>
      </div>

      {/* Column for the pagination controls */}
      <div className="col-sm-12 col-md-7 d-flex justify-content-end">
        <Pagination>
          <Pagination.Prev
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <em className="fa fa-caret-left"></em>
          </Pagination.Prev>

          {getPageItems()}

          <Pagination.Next
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <em className="fa fa-caret-right"></em>
          </Pagination.Next>
        </Pagination>
      </div>
    </div>
  );
};

export default CustomPagination;
