import Pagination from "react-bootstrap/Pagination";
import React, { useEffect, useState } from "react";

function Paginate({ paginate, page, setPage }) {
  const [end, setEnd] = useState("");
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(paginate?.totalDocs / paginate?.limit); i++) {
    pageNumbers.push(i);
  }

  useEffect(() => {
    var end = paginate?.totalDocs;
    if (paginate?.limit < paginate?.totalDocs) {
      end = paginate?.limit * page;
      if (end > paginate?.totalDocs) {
        end = paginate?.totalDocs;
      }
    }
    setEnd(end);
  }, [paginate, page]);

  const onPageChange = (page) => (event) => {
    event.preventDefault();
    setPage(page);
  };

  const getPageNumbers = () => {
    const totalPages = pageNumbers.length;
    const currentPage = page;
    const pageWindow = 2; 
    
    let startPage = Math.max(1, currentPage - pageWindow);
    let endPage = Math.min(totalPages, currentPage + pageWindow);
    
    if (startPage === 1) {
      endPage = Math.min(5, totalPages);
    }
    if (endPage === totalPages) {
      startPage = Math.max(1, totalPages - 4);
    }
    
    return pageNumbers.slice(startPage - 1, endPage);
  };

  return (
    <>
      <div className="row">
        <div className="col-sm-12 col-md-5">
          <div
            className="dataTables_info"
            id="datatable1_info"
            role="status"
            aria-live="polite"
          >
            Showing {paginate?.pagingCounter} to {end} of {paginate?.totalDocs}{" "}
            entries
          </div>
        </div>
        <div className="col-sm-12 col-md-7">
          <div className="dataTables_paginate paging_simple_numbers">
            <Pagination>
              <Pagination.Prev
                onClick={() => setPage((prevPage) => +prevPage - 1)}
                className={`paginate_button page-item previous ${
                  paginate?.hasPrevPage === false ? "disabled" : ""
                }`}
              >
                <em className="fa fa-caret-left"></em>
              </Pagination.Prev>
              {getPageNumbers().map((number) => {
                return (
                  <Pagination.Item
                    key={number}
                    onClick={onPageChange(number)}
                    className={`paginate_button page-item ${
                      page == number ? "active" : ""
                    } `}
                  >
                    {number}
                  </Pagination.Item>
                );
              })}
              <Pagination.Next
                onClick={() => setPage((prevPage) => +prevPage + 1)}
                className={`paginate_button page-item next ${
                  paginate?.hasNextPage === false ? "disabled" : ""
                }`}
              >
                <em className="fa fa-caret-right"></em>
              </Pagination.Next>
            </Pagination>
          </div>
        </div>
      </div>
    </>
  );
}

export default Paginate;
