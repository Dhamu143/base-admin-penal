import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import swal from "sweetalert";

import PageLoader from "../../components/PageLoader/PageLoader";
import Paginate from "../../components/pagination/paginate";
import Select from "react-select";
import {
  appAllGetComplianceDate,
  appDeleteComplianceDate,
} from "../../store/compliancesDate";

function TableFilter() {
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();
  const { isloder, compliancesDate: compliancesDate } = useSelector((state) => state?.complianceDateReducer);
  // console.log(compliancesDate)

  useEffect(() => {
    dispatch(appAllGetComplianceDate());

  }, []);

  // useEffect(() => {
  //   if (isdeleted) {
  //     dispatch(appGetAllNativePlace({ page: 1, limit: 10 }));
  //   }
  // }, [isdeleted, dispatch, page]);

  const handleDeleteComplianceDate = (id) => {
    swal({
      title: "Are you sure?",
      text: "You want to delete this Compliance Date?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        dispatch(appDeleteComplianceDate(id));
      }
    });
  };

  // useEffect(() => {
  //   const searchParams = {
  //     ...activeFilters,
  //     page,
  //     limit: 10,
  //   };
  //   dispatch(appGetAllNativePlace(searchParams));
  //   navigate(`/native-place/${page}`);
  // }, [page, activeFilters]);

  // const handleSearch = useCallback(() => {
  //   const filters = {};

  //   if (selectedFilters.nativeplaceDropdown) {
  //     filters.nativeplaceDropdown = selectedFilters.nativeplaceDropdown.value;
  //   }

  //   setActiveFilters(filters);
  //   setPage(1);
  // }, [selectedFilters]);

  return (
    <>
      {isloder && <PageLoader />}
      <div className="card dataTables_wrapper">
        <div className="card-body">
          <div className="table-responsive bootgrid">
            <table className="table table-hover" id="bootgrid-command">
              <thead>
                <tr>
                  <th>Compliances</th>
                  <th>Document Date</th>
                  <th>Document Due date</th>

                  {/* <th data-column-id="received" data-order="desc">
                    createdAt
                  </th> */}
                  <th
                    data-column-id="commands"
                    data-formatter="commands"
                    data-sortable="false"
                  >
                    <div></div>
                  </th>
                </tr>
              </thead>
              {compliancesDate &&
                compliancesDate.map((value, index) => {
                  return (
                    <tbody key={index}>
                      <tr>
                        <td>{value?.name}</td>
                        <td>
                          {new Date(value?.documentdate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </td>
                        <td>
                          {new Date(value.documentDuedate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-info mr-2 command-edit"
                            data-row-id="10253"
                            onClick={() =>
                              navigate(`/compliance/edit/${value?._id}`)
                            }
                          >
                            <em className="fa fa-edit fa-fw"></em>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger command-delete"
                            data-row-id="10253"
                            onClick={() =>
                              handleDeleteComplianceDate(value?._id)
                            }
                          >
                            <em className="fa fa-trash fa-fw"></em>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  );
                })}
            </table>
          </div>
          {/* {paginate && (
            <Paginate paginate={paginate} page={page} setPage={setPage} />
          )} */}
        </div>
      </div>
    </>
  );
}

export default TableFilter;
