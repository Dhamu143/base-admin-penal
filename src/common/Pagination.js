import React from "react";
import Pagination from "react-bootstrap/Pagination";

const CustomPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}) => {
  if (totalPages <= 1) {
    return null; // Don't show pagination if there's only one page
  }

  // --- Calculations for "Showing X to Y of Z" text ---
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // --- A simpler, more robust logic for generating page numbers ---
  const getPageItems = () => {
    const pageItems = [];
    const neighbours = 1; // How many pages to show on each side of the current page
    const totalNumbers = neighbours * 2 + 3; // e.g., 1 ... 4 [5] 6 ... 10
    const totalButtons = totalNumbers + 2; // Including ellipses

    if (totalPages > totalButtons) {
      const startPage = Math.max(2, currentPage - neighbours);
      const endPage = Math.min(totalPages - 1, currentPage + neighbours);

      pageItems.push(
        <Pagination.Item
          key={1}
          active={currentPage === 1}
          onClick={() => onPageChange(1)}
        >
          1
        </Pagination.Item>
      );

      if (startPage > 2) {
        pageItems.push(<Pagination.Ellipsis key="start-ellipsis" />);
      }

      for (let i = startPage; i <= endPage; i++) {
        pageItems.push(
          <Pagination.Item
            key={i}
            active={currentPage === i}
            onClick={() => onPageChange(i)}
          >
            {i}
          </Pagination.Item>
        );
      }

      if (endPage < totalPages - 1) {
        pageItems.push(<Pagination.Ellipsis key="end-ellipsis" />);
      }

      pageItems.push(
        <Pagination.Item
          key={totalPages}
          active={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    } else {
      // If there are fewer pages than the max buttons, show all of them
      for (let i = 1; i <= totalPages; i++) {
        pageItems.push(
          <Pagination.Item
            key={i}
            active={currentPage === i}
            onClick={() => onPageChange(i)}
          >
            {i}
          </Pagination.Item>
        );
      }
    }

    return pageItems;
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
          />
          {getPageItems()}
          <Pagination.Next
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </div>
    </div>
  );
};

export default CustomPagination;
