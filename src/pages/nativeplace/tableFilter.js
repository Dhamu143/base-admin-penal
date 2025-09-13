import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import swal from "sweetalert";
import {
  appDeleteNativePlace,
  appGetAllNativePlace,
  appGetAllNativePlaceDropdown,
} from "../../store/nativeplace";
import PageLoader from "../../components/PageLoader/PageLoader";
import Paginate from "../../components/pagination/paginate";
import Select from "react-select";

function TableFilter() {
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();
  const nativeplace = useSelector(
    (state) => state?.nativeplaceReducer.nativeplace
  );
  console.log(nativeplace.data);
  const isloder = useSelector((state) => state?.nativeplaceReducer.isloder);
  const paginate = useSelector((state) => state.nativeplaceReducer.paginate);
  const isdeleted = useSelector(
    (state) => state?.nativeplaceReducer?.isdeleted
  );
  const [page, setPage] = useState(params.page || 1);
  const [selectedFilters, setSelectedFilters] = useState({
    nativeplaceDropdown: null,
  });
  const [activeFilters, setActiveFilters] = useState({});
  const nativeplaceDropdown = useSelector(
    (state) => state?.nativeplaceReducer.nativeplaceDropdown
  );

  // useEffect(() => {
  //   dispatch(appGetAllNativePlace({ page: page, limit: 10 }));
  //   navigate(`/native-place/${page}`);
  // }, [page, dispatch]);

  useEffect(() => {
    dispatch(appGetAllNativePlaceDropdown({ page: 1, limit: 1000 }));
  }, []);

  useEffect(() => {
    if (isdeleted) {
      dispatch(appGetAllNativePlace({ page: 1, limit: 10 }));
    }
  }, [isdeleted, dispatch, page]);

  const handleDeleteNativePlace = (id) => {
    swal({
      title: "Are you sure?",
      text: "You want to delete this native place?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        dispatch(appDeleteNativePlace(id));
      }
    });
  };

  useEffect(() => {
    const searchParams = {
      ...activeFilters,
      page,
      limit: 10,
    };
    // console.log(searchParams, "searchParams")
    dispatch(appGetAllNativePlace(searchParams));
    navigate(`/native-place/${page}`);
  }, [page, activeFilters]);

  const handleSearch = useCallback(() => {
    const filters = {};

    if (selectedFilters.nativeplaceDropdown) {
      filters.nativeplaceDropdown = selectedFilters.nativeplaceDropdown.value;
    }

    setActiveFilters(filters);
    setPage(1);
  }, [selectedFilters]);

  return (
    <>
      {isloder && <PageLoader />}
      <div className="card dataTables_wrapper">
        <div className="card-body">
          <div className="row">
            <div className="col-md-2">
              <div className="form-group">
                <label>Native Place (state)</label>
                <Select
                style={{textTransform:"capitalize"}}
                  options={
                    Array.isArray(nativeplaceDropdown)
                      ? nativeplaceDropdown.map((place) => ({
                          value: place._id,
                          label: place.name,
                        }))
                      : []
                  }
                  onChange={(option) => {
                    setSelectedFilters((prev) => ({
                      ...prev,
                      nativeplaceDropdown: option || [],
                    }));
                  }}
                  value={selectedFilters.nativeplaceDropdown}
                  placeholder="Select Native Place.."
                  getOptionLabel={(option) => option?.name || option?.label}
                  getOptionValue={(option) => option?._id || option?.value}
                  styles={{
                    option: (provided) => ({
                      ...provided,
                      textTransform: "capitalize",
                    })}}
                />
              </div>
            </div>

            <div
              className="d-flex"
              style={{ alignItems: "center", marginTop: "12px" }}
            >
              <button
                className="btn btn-primary mr-2"
                onClick={handleSearch}
                style={{ marginRight: "8px" }}
              >
                <em className="fas fa-search"></em> Search
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedFilters({
                    nativeplaceDropdown: null,
                  });
                  setPage(1);
                  setActiveFilters({});
                }}
              >
                <em className="fas fa-redo"></em> Reset
              </button>
            </div>
          </div>

          <div className="table-responsive bootgrid">
            <table className="table table-hover" id="bootgrid-command">
              <thead>
                <tr>
                  <th>Name</th>
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
              {nativeplace?.data &&
                nativeplace?.data.map((value, index) => {
                  return (
                    <tbody key={index}>
                      <tr>
                        <td style={{textTransform:"capitalize"}}>{value?.name}</td>

                        {/* <td>{value?.createdAt}</td> */}
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-info mr-2 command-edit"
                            data-row-id="10253"
                            onClick={() =>
                              navigate(`/native-place/edit/${value?._id}`)
                            }
                          >
                            <em className="fa fa-edit fa-fw"></em>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger command-delete"
                            data-row-id="10253"
                            onClick={() => handleDeleteNativePlace(value?._id)}
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
          {paginate && (
            <Paginate paginate={paginate} page={page} setPage={setPage} />
          )}
        </div>
      </div>
    </>
  );
}

export default TableFilter;
