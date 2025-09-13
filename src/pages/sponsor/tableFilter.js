import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import swal from "sweetalert";
import Select from "react-select";
import PageLoader from "../../components/PageLoader/PageLoader";
import Paginate from "../../components/pagination/paginate";
import { appGetAllCaste } from "../../store/caste";
import { appGetAllLanguage } from "../../store/language";
import { appGetAllReligion } from "../../store/religion";
// import { appGetAllNativePlace } from "../../store/nativeplace";
import { appAllGetHubs } from "../../store/hubs";
import { appDeleteSponsor, appGetAllSponsor } from "../../store/sponsor";
import { appGetAllSanstha } from "../../store/sanstha";
import { useFormik } from "formik";

function TableFilter() {
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();
  const isloder = useSelector((state) => state?.sponsorReducer.isloder);
  const paginate = useSelector((state) => state.sponsorReducer.paginate);
  const isdeleted = useSelector((state) => state?.sponsorReducer?.isdeleted);
  const sponsor = useSelector((state) => state?.sponsorReducer.sponsor);
  // const caste = useSelector((state) => state?.casteReducer.caste);
  const hub = useSelector((state) => state?.hubReducer.hub);
  const sanstha = useSelector((state) => state?.sansthaReducer.sanstha);
  // const religion = useSelector((state) => state?.religionReducer.religion);
  // const language = useSelector((state) => state?.languageReducer.language);
  // const nativeplace = useSelector((state) => state?.nativeplaceReducer.nativeplace);
  const [page, setPage] = useState(params.page || 1);
  // const [filteredData, setFilteredData] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({
    sanstha: null,
    hub: null,
    // caste: null,
  });

  useEffect(() => {
    if (isdeleted) {
      const searchParams = {
        page,
        limit: 10,
      };
      const filters = {};
      // if (selectedFilters.religion) {
      //   filters.religion = selectedFilters.religion.value;
      // }
      // if (selectedFilters.nativeplace) {
      //   filters.nativeplace = selectedFilters.nativeplace.value;
      // }
      // if (selectedFilters.language) {
      //   filters.language = selectedFilters.language.value;
      // }
      // if (selectedFilters.caste) {
      //   filters.caste = selectedFilters.caste.value;
      // }
      if (selectedFilters.sanstha) {
        filters.sanstha = selectedFilters.sanstha.value;
      }
      if (selectedFilters.hub) {
        filters.hub = [selectedFilters.hub.value];
      }

      dispatch(appGetAllSponsor(searchParams));
    }
  }, [isdeleted, dispatch]);
  useEffect(() => {
    // dispatch(appGetAllCaste({page:1, limit:1000}));
    // dispatch(appGetAllLanguage({page:1, limit:1000})); 
    // dispatch(appGetAllReligion({page:1, limit:1000})); 
    dispatch(appGetAllSanstha({page:1, limit:1000})); 
    dispatch(appAllGetHubs({page:1, limit:1000}))
  }, []);
  const formik = useFormik({
    initialValues: {
      hub: "",
      sanstha: "",
    },
    onSubmit: (values) => {
      // handle submit if needed
    },
  });

  const handleSansthaChange = (option) => {
    setSelectedFilters((prev) => ({
      ...prev,
      sanstha: option,
    }));
  };
  const handleHubChange = (option) => {
    setSelectedFilters((prev) => ({
      ...prev,
      hub: option,
    }));
    dispatch(appGetAllSanstha({ page: 1, limit: 1000, hub: option?.value }));
  };
  const handleDeleteSponsor = (id) => {
    swal({
      title: "Are you sure?",
      text: "You want to delete this sponsor?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        dispatch(appDeleteSponsor(id));
      }
    });
  };

  useEffect(() => {
    const isSearching = Object.keys(activeFilters).length > 0;
    const searchParams = {
      ...activeFilters,
      page,
      limit: 10,
      admin: true,
    };
    dispatch(appGetAllSponsor(searchParams));
    navigate(`/sponsor/${page}`);
  }, [page, activeFilters]);

  const handleSearch = useCallback(() => {
    let filters = { admin: true };
    const hasSanstha = !!selectedFilters.sanstha;
    const hasHub = !!selectedFilters.hub;

    if (hasSanstha && hasHub) {
      // Both selected: only sanstha
      filters.sanstha = selectedFilters.sanstha.value;
    } else if (hasSanstha) {
      // Only sanstha
      filters.sanstha = selectedFilters.sanstha.value;
    } else if (hasHub) {
      // Only hub
      filters.hub = selectedFilters.hub.value;
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

{/* <div className="col-md-2">
    <div className="form-group">
      <label>Caste</label>
      <Select
        options={
          Array.isArray(caste)
            ? caste.map((caste) => ({
                value: caste._id,
                label: caste.name,
              }))
            : []
        }
        onChange={(option) => {
          setSelectedFilters((prev) => ({
            ...prev,
            caste: option,
          }));
        }}
        value={selectedFilters.caste}
        placeholder="Select Caste.."
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
      />
    </div>
  </div> */}

  <div className="col-md-2">
    <div className="form-group">
      <label>Community</label>
      <Select
        options={
          Array.isArray(hub.data)
            ? hub.data.map((hub) => ({
                value: hub._id,
                label: hub.name,
              }))
            : []
        }
        // onChange={(option) => {
        //   setSelectedFilters((prev) => ({
        //     ...prev,
        //     hub: option,
        //   }));
        // }}
        onChange={handleHubChange}
        // value={
        //   Array.isArray(hub?.data)
        //     ? hub?.data
        //         .filter(
        //           (option) => option._id === formik?.values?.hub
        //         )
        //         .map((option) => ({
        //           value: option._id,
        //           label: option.name,
        //         }))[0]
        //     : null
        // }
        value={selectedFilters.hub}
        placeholder="Select Community.."
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
      />
    </div>
  </div>

  <div className="col-md-2">
    <div className="form-group">
      <label>Sanstha</label>
      <Select
        options={
          Array.isArray(sanstha)
            ? sanstha.map((sanstha) => ({
                value: sanstha._id,
                label: sanstha.name,
              }))
            : []
        }
        onChange={handleSansthaChange}
        // value={
        //   Array.isArray(sanstha)
        //     ? sanstha.filter(
        //         (option) => option._id === formik?.values?.sanstha
        //       ).map((option) => ({
        //         value: option._id,
        //         label: option.name,
        //       }))[0]
        //     : null
        // }
        // onChange={(option) => {
        //   setSelectedFilters((prev) => ({
        //     ...prev,
        //     sanstha: option,
        //   }));
        // }}
         value={selectedFilters.sanstha}
        placeholder="Select Sanstha.."
        getOptionLabel={(option) => option?.name || option?.label}
        getOptionValue={(option) => option?._id || option?.value}
      />
    </div>
  </div>


  <div className="d-flex" style={{alignItems: 'center', marginTop: '12px'}}>
    <button 
      className="btn btn-primary mr-2"
      onClick={handleSearch}
      style={{marginRight: '8px'}}
    >
      <em className="fas fa-search"></em> Search
    </button>
    <button 
      className="btn btn-secondary"
      onClick={() => {
        setSelectedFilters({
          sanstha: null,
          hub: null,
        });
        setActiveFilters({ admin: true });
        setPage(1);
        dispatch(appGetAllSponsor({ page: 1, limit: 10, admin: true }));
      }}
      // onClick={() => {
      //   setSelectedFilters({
      //     sanstha: null,
      //     hub: null,
      //   });
      //   setActiveFilters({ admin: true });
      //   setPage(1);
      //   dispatch(appGetAllSponsor({ page: 1, limit: 10 }));
      // }}
    >
      <em className="fas fa-redo"></em> Reset
    </button>
  </div>
</div>

          <div className="table-responsive bootgrid mt-3">
            <table className="table table-hover" id="bootgrid-command">
              <thead>
                <tr>
                <th>Sponsor Image</th>
                  <th>Sponsor Name</th>
                  <th data-column-id="received" data-order="desc">
                    Sanstha
                  </th>
                  <th data-column-id="received" data-order="desc">
                    Community
                  </th>
                  <th
                    data-column-id="commands"
                    data-formatter="commands"
                    data-sortable="false"
                  >
                    <div></div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sponsor &&
                  sponsor.map((value, index) => (
                    <tr key={index}>
                         <td>
                          {value?.image ? (
                            <img
                              src={value.image}
                              alt="sponsor"
                              style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                              }}
                            />
                          ) : (
                            <img
                              src="/img/images.png"
                              alt="sponsor"
                              style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                              }}
                            />
                          )}
                        </td>
                      <td>
                        {value?.user?.profilePic ? (
                            <img
                              src={value?.user?.profilePic}
                              alt="sponsor"
                              style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                              }}
                            />
                          ) : (
                            <img
                              src="/img/user.jpg"
                              alt="sponsor"
                              style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                              }}
                            />
                          )}
                        <br />{value?.user?.firstName}{value?.user?.lastName}</td>
                      <td>
                      {value?.sanstha?.name}
                      </td>
                      <td>
                      {value?.hub?.name}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-info mr-2 command-edit"
                          onClick={() => navigate(`/sponsor/edit/${value?._id}`)}
                        >
                          <em className="fa fa-edit fa-fw"></em>
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-danger command-delete"
                          onClick={() => handleDeleteSponsor(value?._id)}
                        >
                          <em className="fa fa-trash fa-fw"></em>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>

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
