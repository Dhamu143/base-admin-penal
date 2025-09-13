import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import swal from "sweetalert";
import Select from "react-select";
import PageLoader from "../../components/PageLoader/PageLoader";
import Paginate from "../../components/pagination/paginate";
import {
  appDeleteSanstha,
  appGetAllSanstha,
  appJoinSanstha,
  appLeaveSanstha,
  appSansthaAssignAdmin,
  appSansthRemoveAdmin,
} from "../../store/sanstha";
import { appGetAllCaste } from "../../store/caste";
import { appGetAllLanguage } from "../../store/language";
import { appGetAllReligion } from "../../store/religion";
import { appGetAllNativePlace } from "../../store/nativeplace";
import { appAllGetHubs } from "../../store/hubs";
import { appGetAllUser, appGetUserById } from "../../store/user";

function TableFilter() {
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();
  const sanstha = useSelector((state) => state?.sansthaReducer.sanstha);
  const isloder = useSelector((state) => state?.sansthaReducer.isloder);
  const paginate = useSelector((state) => state.sansthaReducer.paginate);
  // console.log(paginate)
  const isdeleted = useSelector((state) => state?.sansthaReducer?.isdeleted);
  const caste = useSelector((state) => state?.casteReducer.caste);
  // const hub = useSelector((state) => state?.hubReducer.hub);
  const religion = useSelector((state) => state?.religionReducer.religion);
  const language = useSelector((state) => state?.languageReducer.language);
  const nativeplace = useSelector(
    (state) => state?.nativeplaceReducer.nativeplace
  );
  const users = useSelector((state) => state?.usersReducer.users);
  // const userDetails = useSelector((state) => state?.usersReducer.userDetails);
  const [page, setPage] = useState(params.page || 1);
  const [filteredData, setFilteredData] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [currentSansthaId, setCurrentSansthaId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    religion: null,
    nativeplace: null,
    language: null,
    caste: null,
  });
  const [filteredHubList, setFilteredHubList] = useState([]);
  const [filteredCasteList, setFilteredCasteList] = useState([]);
  const [showRemoveUserModal, setShowRemoveUserModal] = useState(false);
  const [removeUserSansthaId, setRemoveUserSansthaId] = useState(null);
  const [selectedUserToRemove, setSelectedUserToRemove] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showAssignAdminModal, setShowAssignAdminModal] = useState(false);
  const [assignAdminSansthaId, setAssignAdminSansthaId] = useState(null);
  const [selectedAdminUser, setSelectedAdminUser] = useState(null);
  const [showRemoveAdminModal, setShowRemoveAdminModal] = useState(false);
  const [removeAdminSansthaId, setRemoveAdminSansthaId] = useState(null);
  const hubDropdown = useSelector((state) => state?.hubReducer.hubDropdown);

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
      if (selectedFilters.caste) {
        filters.caste = selectedFilters.caste.value;
      }
      if (selectedFilters.hubDropdown) {
        searchParams.hubDropdown = [selectedFilters.hubDropdown.value];
      }

      dispatch(appGetAllSanstha(searchParams));
    }
  }, [isdeleted, dispatch]);
  useEffect(() => {
    dispatch(appGetAllCaste({ page: 1, limit: 1000 }));
    dispatch(appGetAllLanguage({ page: 1, limit: 1000 }));
    dispatch(appGetAllReligion({ page: 1, limit: 1000 }));
    dispatch(appGetAllNativePlace({ page: 1, limit: 1000 }));
    dispatch(appAllGetHubs({ page: 1, limit: 1000, isDropdown: true }));
    dispatch(appGetAllUser({ page: 1, limit: 1000 }));
    // dispatch(appGetAllUser({ page: 1, limit: 1000, hubId: hubid, sansthaId: id, joinuser:true  }));

    // dispatch(appGetUserById(id));
  }, []);

  // Create options for dropdown
  useEffect(() => {
    if (caste) {
      const options = caste.map((item) => ({
        value: item._id,
        label: item.name,
        language: item.language?.[0]?.name,
        nativeplace: item.nativeplace?.[0]?.name,
        religion: item.religion?.name,
      }));
      setFilteredData(options);
    }
  }, [caste]);

  const handleDeleteSanstha = (id) => {
    swal({
      title: "Are you sure?",
      text: "You want to delete this sanstha?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        dispatch(appDeleteSanstha(id));
      }
    });
  };

  useEffect(() => {
    const searchParams = {
      ...activeFilters,
      page,
      limit: 10,
    };
    dispatch(appGetAllSanstha(searchParams));
    navigate(`/sanstha/${page}`);
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
    if (selectedFilters.caste) {
      filters.caste = selectedFilters.caste.value;
    }
    if (selectedFilters.hubDropdown) {
      filters.hubDropdown = selectedFilters.hubDropdown.value;
    }

    setActiveFilters(filters);
    setPage(1);
  }, [selectedFilters]);

  // useEffect(() => {
  //   if (!Array.isArray(hubDropdown)) return;

  //   const filtered = hubDropdown.filter(hub =>
  //     (!selectedFilters.religion || hub.religion?._id === selectedFilters.religion.value) &&
  //     (!selectedFilters.nativeplace || (Array.isArray(hub.nativeplace) && hub.nativeplace.some(np => np._id === selectedFilters.nativeplace.value))) &&
  //     (!selectedFilters.language || (Array.isArray(hub.language) && hub.language.some(l => l._id === selectedFilters.language.value))) &&
  //     (!selectedFilters.caste || (
  //       (Array.isArray(hub.caste) && hub.caste.some(c => c._id === selectedFilters.caste.value)) ||
  //       (hub.caste && typeof hub.caste === 'object' && hub.caste._id === selectedFilters.caste.value)
  //     ))
  //   );

  //   setFilteredHubList(filtered);
  //   setSelectedFilters(prev => ({ ...prev, hubDropdown: null }));
  // }, [
  //   selectedFilters.religion,
  //   selectedFilters.nativeplace,
  //   selectedFilters.language,
  //   selectedFilters.caste,
  //   hubDropdown
  // ]);
  // useEffect(() => {
  //   if (!Array.isArray(hubDropdown)) return;

  //   const filtered = hubDropdown.filter(hub =>
  //     (!selectedFilters.religion || hub.religion?._id === selectedFilters.religion.value) &&
  //     (!selectedFilters.nativeplace || (Array.isArray(hub.nativeplace) && hub.nativeplace.some(np => np._id === selectedFilters.nativeplace.value))) &&
  //     (!selectedFilters.language || (Array.isArray(hub.language) && hub.language.some(l => l._id === selectedFilters.language.value))) &&
  //     (!selectedFilters.caste || (
  //       (Array.isArray(hub.caste) && hub.caste.some(c => c._id === selectedFilters.caste.value)) ||
  //       (hub.caste && typeof hub.caste === 'object' && hub.caste._id === selectedFilters.caste.value)
  //     ))
  //   );
  //   setFilteredCasteList(filtered)
  //   setFilteredHubList(filtered);
  //   setSelectedFilters(prev => ({ ...prev, hubDropdown: null }));
  // }, [
  //   selectedFilters.religion,
  //   selectedFilters.nativeplace,
  //   selectedFilters.language,
  //   selectedFilters.caste,
  //   hubDropdown
  // ]);

  useEffect(() => {
    if (Array.isArray(caste)) {
      let filtered = caste;

      if (selectedFilters.religion) {
        filtered = filtered.filter(
          (c) => c.religion && c.religion._id === selectedFilters.religion.value
        );
      }
      if (selectedFilters.nativeplace) {
        filtered = filtered.filter(
          (c) =>
            Array.isArray(c.nativeplace) &&
            c.nativeplace.some(
              (place) => place._id === selectedFilters.nativeplace.value
            )
        );
      }
      if (selectedFilters.language) {
        filtered = filtered.filter(
          (c) =>
            Array.isArray(c.language) &&
            c.language.some(
              (lang) => lang._id === selectedFilters.language.value
            )
        );
      }
      setFilteredCasteList(filtered);
    }
  }, [
    selectedFilters.religion,
    selectedFilters.nativeplace,
    selectedFilters.language,
    caste,
  ]);

  useEffect(() => {
    if (!Array.isArray(hubDropdown)) return;

    const filtered = hubDropdown.filter(
      (hub) =>
        (!selectedFilters.religion ||
          hub.religion?._id === selectedFilters.religion.value) &&
        (!selectedFilters.nativeplace ||
          (Array.isArray(hub.nativeplace) &&
            hub.nativeplace.some(
              (np) => np._id === selectedFilters.nativeplace.value
            ))) &&
        (!selectedFilters.language ||
          (Array.isArray(hub.language) &&
            hub.language.some(
              (l) => l._id === selectedFilters.language.value
            ))) &&
        (!selectedFilters.caste ||
          (Array.isArray(hub.caste) &&
            hub.caste.some((c) => c._id === selectedFilters.caste.value)) ||
          (hub.caste &&
            typeof hub.caste === "object" &&
            hub.caste._id === selectedFilters.caste.value))
    );
    setFilteredHubList(filtered);
    setSelectedFilters((prev) => ({ ...prev, hubDropdown: null }));
  }, [
    selectedFilters.religion,
    selectedFilters.nativeplace,
    selectedFilters.language,
    selectedFilters.caste,
    hubDropdown,
  ]);

  const handleAssignUser = (sansthaId) => {
    console.log(sansthaId);
    const selectedSanstha = Array.isArray(sanstha)
      ? sanstha.find((s) => s._id === sansthaId)
      : null;
    console.log(selectedSanstha);
    const hubId = selectedSanstha?.hub?._id || selectedSanstha?.hub || null;
    console.log(hubId);
    console.log(sansthaId, "sansthaId");
    setCurrentSansthaId(sansthaId);
    setModalTitle("Add User");
    setShowUserModal(true);
    dispatch(
      appGetAllUser({
        page: 1,
        limit: 1000,
        hub: hubId,
        sansthaId: sansthaId,
        joinuser: true,
      })
    );
  };

  // const handleJoinSanstha = () => {
  //   if (selectedUser) {
  //     const payload = {
  //       userId: selectedUser.value,
  //       sansthaId: currentSansthaId,
  //     };
  //     console.log("Join Sanstha Payload:", payload);
  //     dispatch(appJoinSanstha(payload)).then(() => {
  //       dispatch(appGetAllSanstha({page,limit: 10}));
  //     })
  //     setShowUserModal(false);
  //     setSelectedUser(null);
  //     setModalTitle("");
  //   }
  // };
  const handleJoinSanstha = () => {
    if (selectedUsers && selectedUsers.length > 0) {
      const joinPromises = selectedUsers.map((user) => {
        const payload = {
          userId: user.value,
          sansthaId: currentSansthaId,
        };
        // console.log(payload)
        dispatch(appJoinSanstha(payload)).then(() => {
          dispatch(appGetAllSanstha({ page, limit: 10 }));
          setShowUserModal(false);
          setSelectedUsers([]);
          setModalTitle("");
        });
      });
      // Promise.all(joinPromises).then(() => {
      //   dispatch(appGetAllSanstha({ page, limit: 10 }));
      //   setShowUserModal(false);
      //   setSelectedUsers([]);
      //   setModalTitle("");
      // });
    }
  };

  // const handleRemoveSanstha = (sansthaId) => {
  //   swal({
  //     title: "Are you sure?",
  //     text: "You want to remove the user from this sanstha?",
  //     icon: "warning",
  //     buttons: true,
  //     dangerMode: true,
  //   }).then((willDelete) => {
  //     if (willDelete) {
  //       if (sanstha) {
  //         const selectedSanstha = Array.isArray(sanstha)
  //           ? sanstha.find((s) => s._id === sansthaId)
  //           : sanstha;
  //         if (selectedSanstha?.users?.[0]) {
  //           const payload = {
  //             userId: selectedSanstha.users[0],
  //             sansthaId: sansthaId
  //           };
  //           dispatch(appLeaveSanstha(payload));
  //         } else {
  //           swal("No user to remove!", { icon: "info" });
  //         }
  //       }
  //     }
  //   });
  // };

  const handleRemoveSanstha = (sansthaId) => {
    setRemoveUserSansthaId(sansthaId);
    setShowRemoveUserModal(true);
    setSelectedUserToRemove(null);
  };

  const handleCloseModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
    setSelectedUsers([]);
    setModalTitle("");
  };

  const handleAssignAdmin = (sansthaId) => {
    setAssignAdminSansthaId(sansthaId);
    setShowAssignAdminModal(true);
    setSelectedAdminUser(null);
  };

  const handleConfirmAssignAdmin = () => {
    if (assignAdminSansthaId && selectedAdminUser) {
      dispatch(
        appSansthaAssignAdmin({
          sansthaId: assignAdminSansthaId,
          userId: selectedAdminUser.value,
        })
      ).then(() => {
        dispatch(appGetAllSanstha({ page, limit: 10 }));
        setShowAssignAdminModal(false);
        setAssignAdminSansthaId(null);
        setSelectedAdminUser(null);
      });
    }
  };

  const handleRemoveAdmin = (sansthaId, userId) => {
    console.log(sansthaId);
    console.log(userId);
    swal({
      title: "Are you sure?",
      text: "You want to remove sanstha admin?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        dispatch(
          appSansthRemoveAdmin({
            sansthaId: sansthaId,
            userId: userId,
          })
        ).then(() => {
          dispatch(appGetAllSanstha({ page, limit: 10 }));
          setShowRemoveAdminModal(false);
          setRemoveAdminSansthaId(null);
        });
      }
    });
  };

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
                  style={{ textTransform: "capitalize" }}
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
                />
              </div>
            </div>

            <div className="col-md-2">
              <div className="form-group">
                <label>Native Place</label>
                <Select
                  style={{ textTransform: "capitalize" }}
                  options={
                    Array.isArray(nativeplace.data)
                      ? nativeplace.data.map((place) => ({
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
                />
              </div>
            </div>

            <div className="col-md-2">
              <div className="form-group">
                <label>Language</label>
                <Select
                  style={{ textTransform: "capitalize" }}
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
                      caste: option,
                    }));
                  }}
                  value={selectedFilters.caste}
                  placeholder="Select Caste.."
                  getOptionLabel={(option) => option.label}
                  getOptionValue={(option) => option.value}
                />
              </div>
            </div>

            <div className="col-md-2">
              <div className="form-group">
                <label>Community</label>
                <Select
                  options={
                    Array.isArray(filteredHubList)
                      ? filteredHubList.map((hub) => ({
                          value: hub._id,
                          label: hub.name,
                        }))
                      : []
                  }
                  onChange={(option) => {
                    setSelectedFilters((prev) => ({
                      ...prev,
                      hubDropdown: option,
                    }));
                  }}
                  value={selectedFilters.hubDropdown}
                  placeholder="Select Community.."
                  getOptionLabel={(option) => option.label}
                  getOptionValue={(option) => option.value}
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
                    religion: null,
                    nativeplace: null,
                    language: null,
                    caste: null,
                    hubDropdown: null,
                  });
                  setPage(1);
                  setActiveFilters({});
                  // dispatch(appGetAllSanstha({ page, limit: 10 }));
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
                  {/* <th>Sanstha Image</th> */}
                  <th>Sanstha</th>
                  <th data-column-id="received" data-order="desc">
                    Community & Caste
                  </th>
                  {/* <th data-column-id="received" data-order="desc">
                    Community
                  </th> */}
                  <th data-column-id="received" data-order="desc">
                    Total Members
                  </th>
                  <th data-column-id="received" data-order="desc">
                    Language
                  </th>
                  {/* <th data-column-id="received" data-order="desc">
                    Native Place
                  </th> */}
                  <th data-column-id="received" data-order="desc">
                    Religion
                  </th>
                  <th data-column-id="received" data-order="desc">
                    Admin
                  </th>
                  {/* <th data-column-id="received" data-order="desc">
                   Aadhar Front Side
                  </th>
                  <th data-column-id="received" data-order="desc">
                    Aadhar Back Side
                  </th> */}
                  <th data-column-id="received" data-order="desc">
                    Sanstha Type
                  </th>
                  <th data-column-id="received" data-order="desc">
                    Sanstha Act
                  </th>
                  <th data-column-id="received" data-order="desc">
                    Registered
                  </th>
                  {/* <th data-column-id="received" data-order="desc">
                    Sanstha Pancard
                  </th>
                  <th data-column-id="received" data-order="desc">
                    Sanstha Certificate
                  </th> */}
                  <th data-column-id="received" data-order="desc">
                    Active
                  </th>
                  <th data-column-id="received" data-order="desc">
                    verified
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
                {sanstha &&
                  sanstha.map((value, index) => (
                    <tr
                      onClick={(e) => {
                        // Prevent navigation if clicking in the action column (last column)
                        if (
                          e.target.closest("td:last-child") ||
                          e.target.closest("button") ||
                          e.target.closest(".btn")
                        ) {
                          return;
                        }
                        navigate(`/sanstha/details/${value?._id}`);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <td
                        style={{
                          maxWidth: "100px",
                          wordWrap: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        {value?.image ? (
                          <img
                            src={value.image}
                            alt="sanstha"
                            style={{
                              width: "50px",
                              height: "50px",
                              borderRadius: "50%",
                            }}
                          />
                        ) : (
                          <img
                            src="/img/default-placeholder.jpg"
                            alt="sanstha"
                            style={{
                              width: "50px",
                              height: "50px",
                              borderRadius: "50%",
                            }}
                          />
                        )}
                        <br />
                        {value?.name}
                      </td>
                      <td
                        style={{
                          maxWidth: "100px",
                          wordWrap: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        <span>{value?.hub?.name}</span>
                        <br />
                        <small>{value?.caste?.name}</small>
                      </td>
                      <td>{value?.users.length}</td>
                      <td style={{textTransform:"capitalize"}}>
                        {value?.language?.map((lang, i) => (
                          <span key={i}>
                            {lang.name}
                            {i < value.language.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </td>
                      {/* <td
                        style={{
                          maxWidth: "150px",
                          wordWrap: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        {value?.nativeplace?.map((place, i) => (
                          <span key={i}>
                            {place.name}
                            {i < value.nativeplace.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </td> */}
                      <td style={{textTransform:"capitalize"}}>{value?.religion?.name}</td>
                      <td>
                        {value?.admin?.firstName} {value?.admin?.lastName}
                        <br />
                        <small>{value?.admin?.mobile}</small>
                        <br />
                        <small>
                          {value?.adminJoinedDate
                            ? new Date(
                                value.adminJoinedDate
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "-"}
                        </small>
                      </td>

                      <td
                        style={{
                          maxWidth: "150px",
                          wordWrap: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        {value?.sansthaType}
                      </td>
                      <td
                        style={{
                          maxWidth: "150px",
                          wordWrap: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        {value?.Act}
                      </td>
                      <td>
                        {value?.registrationNumber}
                        <br />
                        {value?.registrationDate && (
                          <small>
                            {new Date(
                              value?.registrationDate
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </small>
                        )}
                      </td>
                      {/* <td>{value?.sansthaPanCardImage && <img src={value?.sansthaPanCardImage} alt="pancard" height={50} width={50}/>}</td>
                        <td>{value?.sansthaCertificate && <img src={value?.sansthaCertificate} alt="Certificate" height={50} width={50}/>}</td> */}
                      <td>
                        {value?.active ? (
                          <span className="badge badge-success">Active</span>
                        ) : (
                          <span className="badge badge-danger">Inactive</span>
                        )}
                      </td>
                      <td>
                        {value?.verified ? (
                          <>
                            <img
                              src="/img/check.png"
                              alt="Verified"
                              title="Verified"
                              height={30}
                              width={30}
                            />
                          </>
                        ) : (
                          <>
                            <img
                              src="/img/uncheck.jpeg"
                              alt="Not Verified"
                              title="Not Verified"
                              height={30}
                              width={30}
                            />
                          </>
                        )}
                      </td>
                      <td>
                        <div
                          className="btn-group"
                          style={{ position: "absolute" }}
                        >
                          <button
                            className="btn btn-link"
                            data-toggle="dropdown"
                            aria-expanded="false"
                            style={{ position: "relative", zIndex: 1 }}
                          >
                            <em className="fa fa-ellipsis-v fa-lg"></em>
                          </button>
                          <div
                            className="dropdown-menu dropdown-menu-right-forced animated fadeInLeft"
                            role="menu"
                            x-placement="bottom-start"
                            style={{
                              position: "relative",
                              top: "100%",
                              left: "0",
                              zIndex: 1000,
                              minWidth: "200px",
                              marginTop: "5px",
                              maxHeight: "fit-content",
                              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                              overflow: "visible",
                            }}
                          >
                            <a
                              className="dropdown-item"
                              href=""
                              onClick={() =>
                                navigate(`/sanstha/edit/${value?._id}`)
                              }
                            >
                              <em className="fa fa-edit fa-fw"></em>
                              <span> Edit</span>
                            </a>
                            <a
                              className="dropdown-item"
                              href=""
                              onClick={() =>
                                navigate(`/sanstha/details/${value?._id}`)
                              }
                            >
                              <em className="fa fa-eye fa-fw"></em>
                              <span> Details</span>
                            </a>
                            {value?.active && (
                              <a
                                className="dropdown-item"
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleAssignUser(value?._id);
                                }}
                              >
                                <em className="fa fa-user-shield fa-fw"></em>
                                <span> Add User</span>
                              </a>)}
                            <a
                              className="dropdown-item text-danger"
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRemoveSanstha(value?._id);
                              }}
                            >
                              <em className="fa fa-user-minus fa-fw"></em>
                              <span> Remove User</span>
                            </a>

                            {!value?.admin ? (
                              <a
                                className="dropdown-item"
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleAssignAdmin(value?._id);
                                }}
                              >
                                <em className="fa fa-user-shield fa-fw"></em>
                                <span> Assign Admin</span>
                              </a>
                            ) : (
                              <a
                                className="dropdown-item text-danger"
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleRemoveAdmin(value._id, value.admin._id);
                                }}
                              >
                                <em className="fa fa-user-minus fa-fw"></em>
                                <span> Remove Admin</span>
                              </a>
                            )}
                            <a
                              className="dropdown-item text-danger"
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteSanstha(value?._id);
                              }}
                            >
                              <em className="fa fa-trash fa-fw"></em>
                              <span> Delete</span>
                            </a>
                          </div>
                        </div>
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

      {showRemoveUserModal && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
            top: "50px",
          }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Remove User</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowRemoveUserModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select User to Remove</label>
                  <Select
                    // options={(() => {
                    //   const selectedSanstha = Array.isArray(sanstha)
                    //     ? sanstha.find((s) => s._id === removeUserSansthaId)
                    //     : sanstha;
                    //   return selectedSanstha && selectedSanstha.users
                    //     ? selectedSanstha.users.map((user) => {
                    //         if (typeof user === "object") {
                    //           return {
                    //             value: user._id,
                    //             label: `${user.firstName ||
                    //               ""} ${user.lastName || ""} (${user.mobile ||
                    //               ""})`,
                    //           };
                    //         }
                    //         return {
                    //           value: user,
                    //           label: user,
                    //         };
                    //       })
                    //     : [];
                    // })()}
                    options={(() => {
                      const selectedSanstha = Array.isArray(sanstha)
                        ? sanstha.find((s) => s._id === removeUserSansthaId)
                        : sanstha;

                      return selectedSanstha && selectedSanstha.users
                        ? selectedSanstha.users
                            .filter((user) => {
                              if (Array.isArray(user.adminOfSanstha)) {
                                return !user.adminOfSanstha.some(
                                  (admin) =>
                                    admin.sanstha === selectedSanstha._id
                                );
                              }
                              return true;
                            })
                            .map((user) => {
                              if (typeof user === "object") {
                                return {
                                  value: user._id,
                                  label: `${user.firstName ||
                                    ""} ${user.lastName || ""} (${user.mobile ||
                                    ""})`,
                                };
                              }
                              return {
                                value: user,
                                label: user,
                              };
                            })
                        : [];
                    })()}
                    onChange={(option) => {
                      setSelectedUserToRemove(option);
                    }}
                    // onChange={(option) => {
                    //   setSelectedUserToRemove(option);
                    //   if (option && option.value) {
                    //     // dispatch(appGetUserById(option.value));
                    //   }
                    // }}
                    value={selectedUserToRemove}
                    placeholder="Select User..."
                    getOptionLabel={(option) => option?.label || ""}
                    getOptionValue={(option) => option?.value || ""}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRemoveUserModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    if (selectedUserToRemove && removeUserSansthaId) {
                      const payload = {
                        userId: selectedUserToRemove.value,
                        sansthaId: removeUserSansthaId,
                      };
                      dispatch(appLeaveSanstha(payload)).then(() => {
                        dispatch(appGetAllSanstha({ page, limit: 10 }));
                      });
                      setShowRemoveUserModal(false);
                      setRemoveUserSansthaId(null);
                      setSelectedUserToRemove(null);
                    }
                  }}
                  disabled={!selectedUserToRemove}
                >
                  Remove User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUserModal && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
            top: "50px",
          }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modalTitle}</h5>
                <button
                  type="button"
                  className="close"
                  onClick={handleCloseModal}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select User</label>
                  <Select
                    options={
                      Array.isArray(users)
                        ? users
                            .filter((s) => s.joinedHub)
                            .map((s) => ({
                              value: s._id,
                              label: `${s.firstName} ${s.lastName ||
                                ""} (${s.mobile || ""})`,
                              hub: s.joinedHub,
                            }))
                        : []
                    }
                    // options={
                    //   modalTitle === "Assign User"
                    //     ? Array.isArray(newUser)
                    //       ? newUser.map((user) => ({
                    //           value: user._id,
                    //           label: `${user.firstName} ${user.lastName} (${user.mobile})`,
                    //           mobile: user.mobile,
                    //         }))
                    //       : []
                    //     : Array.isArray(users)
                    //     ? users
                    //         .filter(
                    //           (user) =>
                    //             user.joinedHub &&
                    //             user.joinedHub._id === currentHubId
                    //         )
                    //         .map((user) => ({
                    //           value: user._id,
                    //           label: `${user.firstName} ${user.lastName} (${user.mobile})`,
                    //           mobile: user.mobile,
                    //         }))
                    //     : []
                    // }
                    onChange={setSelectedUsers}
                    value={selectedUsers}
                    isMulti={modalTitle === "Add User"}
                    closeMenuOnSelect={modalTitle !== "Add User"}
                    // onChange={setSelectedUser}
                    // value={selectedUser}
                    placeholder="Select User..."
                    getOptionLabel={(option) => option?.label || ""}
                    getOptionValue={(option) => option?.value || ""}
                    filterOption={(option, inputValue) => {
                      const label = option?.label || "";
                      const input = inputValue.toLowerCase();
                      return label.toLowerCase().includes(input);
                    }}
                  />
                  {/* <Select
              options={
                (() => {
                  const selectedSanstha = Array.isArray(sanstha)
                    ? sanstha.find((s) => s._id === removeUserSansthaId)
                    : sanstha;
                  return selectedSanstha && selectedSanstha.users
                    ? selectedSanstha.users.map((u) => ({
                        value: typeof u === "object" ? u._id : u,
                        label: typeof u === "object" ? u.firstName : u,
                      }))
                    : [];
                })()
              }
              onChange={setSelectedUserToRemove}
              value={selectedUserToRemove}
              placeholder="Select User..."
              getOptionLabel={(option) => option?.label || ""}
              getOptionValue={(option) => option?.value || ""}
            /> */}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleJoinSanstha}
                >
                  {modalTitle}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAssignAdminModal && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
            top: "50px",
          }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign Admin</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowAssignAdminModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select User to Assign as Admin</label>
                  <Select
                    options={(() => {
                      const selectedSanstha = Array.isArray(sanstha)
                        ? sanstha.find((s) => s._id === assignAdminSansthaId)
                        : sanstha;
                      return selectedSanstha && selectedSanstha.users
                        ? selectedSanstha.users.map((user) => {
                            if (typeof user === "object") {
                              return {
                                value: user._id,
                                label: `${user.firstName ||
                                  ""} ${user.lastName || ""} (${user.mobile ||
                                  ""})`,
                              };
                            }
                            return {
                              value: user,
                              label: user,
                            };
                          })
                        : [];
                    })()}
                    onChange={setSelectedAdminUser}
                    value={selectedAdminUser}
                    placeholder="Select User..."
                    getOptionLabel={(option) => option?.label || ""}
                    getOptionValue={(option) => option?.value || ""}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAssignAdminModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmAssignAdmin}
                  disabled={!selectedAdminUser}
                >
                  Assign Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TableFilter;
