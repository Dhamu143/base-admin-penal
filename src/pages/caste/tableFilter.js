import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import swal from "sweetalert";
import Select from "react-select";
import PageLoader from "../../components/PageLoader/PageLoader";
import Paginate from "../../components/pagination/paginate";
import { appDeleteCaste, appGetAllCaste } from "../../store/caste";
import { appGetAllLanguage } from "../../store/language";
import { appGetAllReligion } from "../../store/religion";
import { appGetAllNativePlace } from "../../store/nativeplace";
import { appAllGetHubs } from "../../store/hubs";

function TableFilter() {
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();
  const caste = useSelector((state) => state?.casteReducer.caste);
  const dropdownCasteList = useSelector((state) => state?.casteReducer.dropdownCasteList);
  const isloder = useSelector((state) => state?.casteReducer.isloder);
  const paginate = useSelector((state) => state.casteReducer.paginate);
  const isdeleted = useSelector((state) => state?.casteReducer?.isdeleted);
  const religion = useSelector((state) => state?.religionReducer.religion);
  const language = useSelector((state) => state?.languageReducer.language);
  const nativeplace = useSelector((state) => state?.nativeplaceReducer.nativeplace);
  const [page, setPage] = useState(params.page || 1);
  // const [filteredData, setFilteredData] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({
    religion: null,
    nativeplace: null,
    language: null,
    dropdownCasteList: null,
  });
  const [filteredCasteList, setFilteredCasteList] = useState([]);

  // Effect for paginated table data
  // useEffect(() => {
  //   dispatch(appGetAllCaste({page, limit: 10}));
  //   navigate(`/caste/${page}`);
  // }, [page, navigate]);

  // Effect for dropdown data
  useEffect(() => {
    dispatch(appGetAllCaste({page: 1, limit: 1000, isDropdown: true}));
    dispatch(appGetAllLanguage({page: 1, limit: 1000})); 
    dispatch(appGetAllReligion({page: 1, limit: 1000})); 
    dispatch(appGetAllNativePlace({page: 1, limit: 1000})); 
  }, []);

  // Add effect to refresh data after deletion

  useEffect(() => {
    if (isdeleted) {
      const searchParams = {
        page,
        limit: 10,
      };
      const filters = {};
        if (selectedFilters.religion) {
          filters.religion = selectedFilters.religion.value;
        }
        if (selectedFilters.nativeplace) {
          filters.nativeplace = selectedFilters.nativeplace.value;
        }
        if (selectedFilters.language) {
          filters.language = selectedFilters.language.value;
        }
        if (selectedFilters.dropdownCasteList) {
          filters.caste = selectedFilters.dropdownCasteList.value;
        }
      dispatch(appGetAllCaste(searchParams));
    }
  }, [isdeleted, dispatch]);

  // Create options for dropdown
  // useEffect(() => {
  //   if (caste) {
  //     const options = caste.map((item) => ({
  //       value: item._id,
  //       label: item.name,
  //       language: item.language?.[0]?.name,
  //       nativeplace: item.nativeplace?.[0]?.name,
  //       religion: item.religion?.name,
  //     }));
  //     setFilteredData(options);
  //   }
  // }, [caste]);

  const handleDeleteCaste = (id) => {
    swal({
      title: "Are you sure?",
      text: "You want to delete this caste?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        dispatch(appDeleteCaste(id));
      }
    });
  };

  useEffect(() => {
    if (Array.isArray(dropdownCasteList)) {
      let filtered = dropdownCasteList;
  
      if (selectedFilters.religion) {
        filtered = filtered.filter(
          (caste) => caste.religion?._id === selectedFilters.religion.value
        );
      }
      if (selectedFilters.nativeplace) {
        filtered = filtered.filter(
          (caste) =>
            Array.isArray(caste.nativeplace) &&
            caste.nativeplace.some(
              (place) => place._id === selectedFilters.nativeplace.value
            )
        );
      }
      if (selectedFilters.language) {
        filtered = filtered.filter(
          (caste) =>
            Array.isArray(caste.language) &&
            caste.language.some(
              (lang) => lang._id === selectedFilters.language.value
            )
        );
      }
  
      setFilteredCasteList(filtered); 
  
      // Reset caste selection if any filter changes
      setSelectedFilters((prev) => ({
        ...prev,
        dropdownCasteList: null,
      }));
      // console.log(filtered)
    }
  }, [selectedFilters.religion, selectedFilters.nativeplace, selectedFilters.language, dropdownCasteList]);
  
  useEffect(() => {
    const searchParams = {
      ...activeFilters,
      page,
       limit: 10,
      //  isDropdown: true
    };
    // console.log(searchParams)
    // dispatch(appGetAllCaste(searchParams));
    dispatch(appGetAllCaste(searchParams));
    navigate(`/caste/${page}`);
  }, [page, activeFilters]);
  
  const handleSearch = useCallback(() => {
    const filters = {};
    if (selectedFilters.religion) {
      filters.religion = selectedFilters.religion.value;
    }
    if (selectedFilters.nativeplace) {
      filters.nativeplace = selectedFilters.nativeplace.value;
    }
    if (selectedFilters.language) {
      filters.language = selectedFilters.language.value;
    }
    if (selectedFilters.dropdownCasteList) {
      filters.caste = selectedFilters.dropdownCasteList.value;
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
                <label>Religion</label>
                <Select
                  options={
                    Array.isArray(religion)
                      ? religion.map((rel) => ({
                          value: rel._id,
                          label: rel.name,
                        }))
                      : []
                  }
                  onChange={(option) => {
                    setSelectedFilters((prev) => ({
                      ...prev,
                      religion: option,
                    }));
                  }}
                  value={selectedFilters.religion}
                  placeholder="Select Religion.."
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

            <div className="col-md-2">
              <div className="form-group">
                <label>Native Place</label>
                <Select
                  options={
                    Array.isArray(nativeplace?.data)
                      ? nativeplace?.data.map((place) => ({
                          value: place._id,
                          label: place.name,
                        }))
                      : []
                  }
                  onChange={(option) => {
                    setSelectedFilters((prev) => ({
                      ...prev,
                      nativeplace: option,
                    }));
                  }}
                  value={selectedFilters.nativeplace}
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

            <div className="col-md-2">
              <div className="form-group">
                <label>Language</label>
                <Select
                  options={
                    Array.isArray(language)
                      ? language.map((lang) => ({
                          value: lang._id,
                          label: lang.name,
                        }))
                      : []
                  }
                  onChange={(option) => {
                    setSelectedFilters((prev) => ({
                      ...prev,
                      language: option,
                    }));
                  }}
                  value={selectedFilters.language}
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

          <div className="col-md-2">
              <div className="form-group">
                <label>Caste</label>
                <Select
                  options={
                    Array.isArray(filteredCasteList)
                      ? filteredCasteList.map((caste) => ({
                          value: caste._id,
                          label: caste.name,
                        }))
                      : []
                  }
                  onChange={(option) => {
                    setSelectedFilters((prev) => ({
                      ...prev,
                      dropdownCasteList: option,
                    }));
                  }}
                  value={selectedFilters.dropdownCasteList}
                  placeholder="Select Caste.."
                  getOptionLabel={(option) => option.label}
                  getOptionValue={(option) => option.value}
                />
              </div>
            </div>

            <div className="col-md-4 d-flex" style={{alignItems: 'center', marginTop: '12px'}}>
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
                    religion: null,
                    nativeplace: null,
                    language: null,
                    dropdownCasteList: null,
                  });
                  setActiveFilters({});
                  setPage(1);
                  // dispatch(appGetAllCaste({ page, limit: 10 }));
                }}
              >
                <em className="fas fa-redo"></em> Reset
              </button>
            </div>
          </div>

          <div className="table-responsive bootgrid mt-3">
            <table className="table table-hover" id="bootgrid-command">
              <thead>
                <tr>
                  <th>Caste Name</th>
                  <th data-column-id="received" data-order="desc">
                    Language
                  </th>
                  <th data-column-id="received" data-order="desc">
                    Native Place
                  </th>
                  <th data-column-id="received" data-order="desc">
                    Religion
                  </th>
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
              <tbody>
                {caste &&
                  caste.map((value, index) => (
                    <tr key={index}>
                      <td>{value?.name}</td>
                      <td style={{textTransform:"capitalize"}}>
                        {value?.language?.map((lang, i) => (
                          <span key={i}>
                            {lang.name}
                            {i < value.language.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </td>
                      <td style={{ maxWidth: '150px', wordWrap: 'break-word', whiteSpace: 'normal' ,textTransform:"capitalize"}}>
                        {value?.nativeplace?.map((place, i) => (
                          <span key={i}>
                            {place.name}
                            {i < value.nativeplace.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </td>
                      <td style={{textTransform:"capitalize"}}>{value?.religion?.name}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-info mr-2 command-edit"
                          onClick={() => navigate(`/caste/edit/${value?._id}`)}
                        >
                          <em className="fa fa-edit fa-fw"></em>
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-danger command-delete"
                          onClick={() => handleDeleteCaste(value?._id)}
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
