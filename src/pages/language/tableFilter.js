import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import swal from "sweetalert";
import { appDeleteLanguage, appGetAllLanguage, appGetAllLanguageDropdown } from "../../store/language";
import PageLoader from "../../components/PageLoader/PageLoader";
import Paginate from "../../components/pagination/paginate";
import Select from "react-select";

function TableFilter() {
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();
  const language = useSelector((state) => state?.languageReducer.language);
  console.log(language)
  const languageDropdown = useSelector((state) => state?.languageReducer.languageDropdown);
  const isloder = useSelector((state) => state?.languageReducer.isloder);
  const paginate = useSelector((state) => state.languageReducer.paginate);
  const isdeleted = useSelector((state) => state?.languageReducer?.isdeleted);
  const [page, setPage] = useState(params.page || 1);
  const [selectedFilters, setSelectedFilters] = useState({
    languageDropdown: null,
  });
  const [activeFilters, setActiveFilters] = useState({});

  useEffect(() => { 
    dispatch(appGetAllLanguageDropdown({ page: 1, limit: 1000 })); 
  }, []);

  // useEffect(() => { 
  //   dispatch(appGetAllLanguage({page:page, limit:10}));
  //   navigate(`/language/${page}`);
  // }, [page, dispatch]);

  
  useEffect(() => {
    if (isdeleted) {
      dispatch(appGetAllLanguage({page:page, limit:10}));
    }
  }, [isdeleted, dispatch, page]);

  const handleDeleteLanguage = (id) => {
    swal({
      title: "Are you sure?",
      text: "You want to delete this language?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        dispatch(appDeleteLanguage(id));
      }
    });
  };

  useEffect(() => {
    const searchParams = {
      ...activeFilters,
      page,
      limit: 10,
    };
    dispatch(appGetAllLanguage(searchParams));
    navigate(`/language/${page}`);
  }, [page, activeFilters]);

  const handleSearch = useCallback(() => {
    const filters = {};
   
    if (selectedFilters.languageDropdown) {
      filters.languageDropdown = selectedFilters.languageDropdown.value;
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
                <label>Mother Tounge(Language)</label>
                <Select
                  options={
                    Array.isArray(languageDropdown)
                      ? languageDropdown.map((place) => ({
                          value: place._id,
                          label: place.name,
                        }))
                      : []
                  }
                  onChange={(option) => {
                    setSelectedFilters((prev) => ({
                      ...prev,
                      languageDropdown: option || [],
                    }));
                  }}
                  value={selectedFilters.languageDropdown}
                  placeholder="Select Language.."
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
                    languageDropdown: null,
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
              {language &&
                language.map((value, index) => {
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
                              navigate(
                                `/language/edit/${value?._id}`
                              )
                            }
                          >
                            <em className="fa fa-edit fa-fw"></em>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger command-delete"
                            data-row-id="10253"
                            onClick={() => handleDeleteLanguage(value?._id)}
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
