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
import { appGetAllSanstha } from "../../store/sanstha";
import { appAllGetHubs } from "../../store/hubs";
import { appDeletePost, appGetAllPost } from "../../store/post";
import { appDeleteProjectCategory, appGetAllProjectCategory } from "../../store/projectcategory";

function TableFilter() {
    const dispatch = useDispatch();
    const params = useParams();
    const navigate = useNavigate();
    const isloder = useSelector((state) => state?.projectcategoryReducer.isloder);
    const paginate = useSelector((state) => state.projectcategoryReducer.paginate);
    const isdeleted = useSelector((state) => state?.projectcategoryReducer?.isdeleted);
    const [page, setPage] = useState(params.page || 1);
    const [selectedFilters, setSelectedFilters] = useState({
      category: null,
    });
    const [activeFilters, setActiveFilters] = useState({});
  const projectcategory = useSelector((state) => state?.projectcategoryReducer?.projectcategory);
  // console.log("projectcategory", projectcategory)
    // useEffect(() => { 
    //   dispatch(appGetAllProjectCategory({ page: 1, limit: 1000 })); 
    // }, []);
  
    useEffect(() => { 
      dispatch(appGetAllProjectCategory({page:1, limit:10}));
      navigate(`/project-category/${page}`);
    }, [page, dispatch]);
    
    useEffect(() => {
      if (isdeleted) {
        dispatch(appGetAllProjectCategory({page:1, limit:10}));
      }
    }, [isdeleted, dispatch, page]);
  
    const handleDeleteProjectCategory = (id) => {
      swal({
        title: "Are you sure?",
        text: "You want to delete this project category?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then((willDelete) => {
        if (willDelete) {
          dispatch(appDeleteProjectCategory(id))
          .then(()=> {
             dispatch(appGetAllProjectCategory({page:1, limit:10}));
          })
        }
      });
    };
  
    useEffect(() => {
      const searchParams = {
        ...activeFilters,
        page,
        limit: 10,
      };
      dispatch(appGetAllProjectCategory(searchParams));
      navigate(`/project-category/${page}`);
    }, [page, activeFilters]);
  
    const handleSearch = useCallback(() => {
      const filters = {};
     
      if (selectedFilters.category) {
        filters.category = selectedFilters.category.value;
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
                <label>Category</label>
                <Select
                  options={
                    Array.isArray(projectcategory.data)
                      ? projectcategory.data.map((category) => ({
                          value: category._id,
                          label: category.name,
                        }))
                      : []
                  }
                  onChange={(option) => {
                    setSelectedFilters((prev) => ({
                      ...prev,
                      category: option,
                    }));
                  }}
                  styles={{
                    option: (provided) => ({
                      ...provided,
                      textTransform: "capitalize",
                    })}}
                 value={selectedFilters.category}
                  placeholder="Select category.."
                  getOptionLabel={(option) => option?.name || option?.label}
                  getOptionValue={(option) => option?._id || option?.value}
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
                    hub: null,
                    sanstha: null,
                    category:null,
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
                {projectcategory.data &&
                  projectcategory.data.map((value, index) => {
                    return (
                      <tbody key={index}>
                        <tr>
                        <td style={{textTransform:"capitalize"}}>{value?.name}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-info mr-2 command-edit"
                              data-row-id="10253"
                              onClick={() =>
                                navigate(
                                  `/project-category/edit/${value?._id}`
                                )
                              }
                            >
                              <em className="fa fa-edit fa-fw"></em>
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger command-delete"
                              data-row-id="10253"
                              onClick={() => handleDeleteProjectCategory(value?._id)}
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
