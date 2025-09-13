import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import swal from "sweetalert";
import {
  appAllGetHubs,
  appDeleteHub,
  appAssignUser,
  appAssignHubtoUser,
  appMakeHubAdmin,
  appRemoveUserorAdminHub,
} from "../../store/hubs";
import PageLoader from "../../components/PageLoader/PageLoader";
import Paginate from "../../components/pagination/paginate";
import { appGetAllLanguage } from "../../store/language";
import { appGetAllReligion } from "../../store/religion";
import { appGetAllNativePlace } from "../../store/nativeplace";
import Select from "react-select";
import { appGetAllCaste } from "../../store/caste";
import { appGetAllUser, appGetNewUser } from "../../store/user";

function TableFilter() {
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();
  const religion = useSelector((state) => state?.religionReducer.religion);
  const language = useSelector((state) => state?.languageReducer.language);
  const nativeplace = useSelector((state) => state?.nativeplaceReducer.nativeplace);
  const hubs = useSelector((state) => state?.hubReducer.hub);
  const caste = useSelector((state) => state?.casteReducer.caste);
  const isloder = useSelector((state) => state?.hubReducer.isloder);
  const paginate = useSelector((state) => state.hubReducer.paginate);
  const isdeleted = useSelector((state) => state?.hubReducer?.isdeleted);
  const [page, setPage] = useState(params.page || 1);
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({
    religion: null,
    nativeplace: null,
    language: null,
    caste: null,
    hubDropdown: null,
  });
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRemoveUserModal, setShowRemoveUserModal] = useState(false);
  const [removeUserHubId, setRemoveUserHubId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentHubId, setCurrentHubId] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [filteredHubList, setFilteredHubList] = useState([]);
  const [filteredCatsteList, setFilteredCasteList] = useState([]);
  const users = useSelector((state) => state?.usersReducer.users);
  // console.log(users)
  const hubDropdown = useSelector((state) => state?.hubReducer.hubDropdown);
  const newUser = useSelector((state) => state?.usersReducer.newUser);
  // console.log(newUser);

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
        filters.hubDropdown = selectedFilters.hubDropdown.value;
      }
      // console.log(searchParams)
      dispatch(appAllGetHubs(searchParams));
    }
  }, [isdeleted, dispatch]);

  useEffect(() => {
    dispatch(appGetAllLanguage({ page: 1, limit: 1000 }));
    dispatch(appGetAllReligion({ page: 1, limit: 1000 }));
    dispatch(appGetAllNativePlace({ page: 1, limit: 1000 }));
    dispatch(appGetAllCaste({ page: 1, limit: 1000 }));
    dispatch(appGetAllUser({ page: 1, limit: 1000 }));
    dispatch(appAllGetHubs({ page: 1, limit: 1000, isDropdown: true }));
    dispatch(appGetNewUser({ page: 1, limit: 1000 }));
  }, []);

  const handleDeleteHub = (id) => {
    swal({
      title: "Are you sure?",
      text: "You want to delete this community?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        dispatch(appDeleteHub(id));
      }
    });
  };

  useEffect(() => {
    const searchParams = {
      ...activeFilters,
      page,
      limit: 10,
    };
    // console.log(searchParams)
    dispatch(appAllGetHubs(searchParams));
    navigate(`/community-setup/${page}`);
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

  const handleAssignAdmin = (hubId) => {
    setCurrentHubId(hubId);
    setModalTitle("Assign Admin");
    setShowUserModal(true);
  };

  const handleAssignUser = (hubId) => {
    // console.log(hubId, "hubId");
    setCurrentHubId(hubId);
    setModalTitle("Assign User");
    setShowUserModal(true);
  };

  const handleRemoveAdmin = (hub) => {
    // console.log(hub)
    swal({
      title: "Are you sure?",
      text: "You want to remove the admin from this community?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willRemove) => {
      if (willRemove) {
         dispatch(appRemoveUserorAdminHub({ hubId : hub._id, userId: hub.admin._id, admin: true})).then(() => {
           dispatch(appAllGetHubs({ page: page, limit: 10 }));
           dispatch(appGetAllUser({ page: 1, limit: 1000 }));
         });
      }
    });
  };

  const handleRemoveUser = (hubId) => {
    setRemoveUserHubId(hubId);
    setModalTitle("Remove User");
    setShowRemoveUserModal(true);
  };
  const handleRemoveUserSubmit = () => {
    if (!selectedUser || !removeUserHubId) return;
    const payload = {
      userId: selectedUser.value,
      hubId: removeUserHubId,
    };
    console.log(payload, "paylod")
    dispatch(appRemoveUserorAdminHub(payload)) 
      .then(() => {
        dispatch(appAllGetHubs({ page: page, limit: 10 }));
         dispatch(appGetAllUser({ page: 1, limit: 1000 }));
        setShowRemoveUserModal(false);
        setSelectedUser(null);
        setRemoveUserHubId(null);
      });
  };

  const handleUserSubmitt = () => {
    if (!selectedUser) return;

    if (modalTitle === "Assign Admin") {
      const user = Array.isArray(selectedUser) ? selectedUser[0] : selectedUser;
      if (!user) return;
      const adminpayload = {
        userId: user.value,
        hubId: currentHubId,
      };
      console.log(adminpayload, "adminpayload");
      dispatch(appMakeHubAdmin(adminpayload)).then(() => {
        dispatch(appAllGetHubs({ page: page, limit: 10 }));
        dispatch(appGetAllUser({ page: 1, limit: 1000 }));
      })
    } else {
      const usersArray = Array.isArray(selectedUser)
        ? selectedUser
        : [selectedUser];
      usersArray.forEach((user) => {
        const payload = {
          userId: user.value,
          hubId: currentHubId,
        };
        dispatch(appAssignHubtoUser(payload)).then(() => {
          dispatch(appAllGetHubs({ page: page, limit: 10 }));
          dispatch(appGetAllUser({ page: 1, limit: 1000 }));
        });
        console.log(payload, "payload");
      });
    }

    setShowUserModal(false);
    setSelectedUser(null);
    setModalTitle("");
  };


  const handleCloseModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
    setModalTitle("");
  };



  return (
    <>
      {isloder && <PageLoader />}
      <div className="card card-default mb-3">
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
                      religion: option || [],
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
                      nativeplace: option || [],
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
                      language: option || [],
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
                    Array.isArray(filteredCatsteList)
                      ? filteredCatsteList.map((caste) => ({
                          value: caste._id,
                          label: caste.name,
                        }))
                      : []
                  }
                  onChange={(option) => {
                    setSelectedFilters((prev) => ({
                      ...prev,
                      caste: option || [],
                    }));
                  }}
                  value={selectedFilters.caste}
                  placeholder="Select Caste.."
                  getOptionLabel={(option) => option?.name || option?.label}
                  getOptionValue={(option) => option?._id || option?.value}
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
                  // dispatch(appAllGetHubs({ page: 1, limit: 10 }));
                  // navigate("/community-setup/1");
                }}
              >
                <em className="fas fa-redo"></em> Reset
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="card dataTables_wrapper">
        <div className="card-body">
          <div className="table-responsive bootgrid">
            <table className="table table-hover" id="bootgrid-command">
              <thead>
                <tr>
                  {/* <th>Image</th> */}
                  <th>Name</th>
                  <th data-column-id="received" data-order="desc">
                    Language
                  </th>
                  <th data-column-id="received" data-order="desc">
                    Native Place
                  </th>
                  <th data-column-id="received" data-order="desc">
                    Religion
                  </th>
                  <th data-column-id="received" data-order="desc">
                    Caste
                  </th>
                  <th data-column-id="received" data-order="desc">
                    Total Users
                  </th>
                  <th
                    // style={{ textAlign: "center" }}
                    data-column-id="received"
                    data-order="desc"
                  >
                    Admin
                  </th>
                  <th data-column-id="received" data-order="desc">
                    Created Date
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
              {hubs?.data &&
                hubs?.data.map((value, index) => {
                  return (
                    <tbody key={index}>
                      <tr
                        onClick={(e) => {
                          // Only navigate if not clicking on dropdown
                          if (
                            !e.target.closest(".dropdown-menu") &&
                            !e.target.closest(".btn-link")
                          ) {
                            navigate(`/community-setup/details/${value?._id}`);
                          }
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <td   style={{
                            maxWidth: "200px",
                            wordWrap: "break-word",
                            whiteSpace: "normal",
                          }}>
                          {value?.image ? (
                            <img
                              src={value.image}
                              // src="/img/images.png"
                              alt="hub"
                              style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                              }}
                            />
                          ) : (
                            <img
                              src="/img/images.png"
                              alt="hub"
                              style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                              }}
                            />
                          )}
                          <br /> {value?.name}
                        </td>
                        {/* <td
                          style={{
                            maxWidth: "100px",
                            wordWrap: "break-word",
                            whiteSpace: "normal",
                          }}
                        >
                          {value?.name}
                        </td> */}
                        <td style={{
                            maxWidth: "200px",
                            wordWrap: "break-word",
                            whiteSpace: "normal",
                            textTransform:"capitalize"
                          }}>
                          {value?.language?.map((place, i) => (
                            <span key={i}>
                              {place.name}
                              {i < value.language.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </td>
                        <td
                          style={{
                            maxWidth: "150px",
                            wordWrap: "break-word",
                            whiteSpace: "normal",
                            textTransform:"capitalize"
                          }}
                        >
                          {value?.nativeplace?.map((place, i) => (
                            <span key={i}>
                              {place.name}
                              {i < value.nativeplace.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </td>
                        <td style={{textTransform:"capitalize"}}>{value?.religion?.name}</td>
                        <td>{value?.caste?.name}</td>

                        <td>{value?.users?.length || 0}</td>
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
                                  // hour: '2-digit',
                                  // minute: '2-digit'
                                })
                              : "-"}
                          </small>
                        </td>
                        <td>
                          {value?.createdAt
                            ? new Date(value.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  // hour: '2-digit',
                                  // minute: '2-digit'
                                }
                              )
                            : "-"}
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
                                  navigate(
                                    `/community-setup/edit/${value?._id}`
                                  )
                                }
                              >
                                <em className="fa fa-edit fa-fw"></em>
                                <span> Edit</span>
                              </a>
                              <a
                                className="dropdown-item"
                                href=""
                                onClick={() =>
                                  navigate(
                                    `/community-setup/details/${value?._id}`
                                  )
                                }
                              >
                                <em className="fa fa-eye fa-fw"></em>
                                <span> Details</span>
                              </a>
                              <a
                                className="dropdown-item"
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleAssignUser(value?._id);
                                }}
                              >
                                <em className="fa fa-user-plus fa-fw"></em>
                                <span> Assign User</span>
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
                                     handleRemoveAdmin(value);
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
                                    handleRemoveUser(value?._id);
                                }}
                              >
                                <em className="fa fa-user-minus fa-fw"></em>
                                <span> Remove User</span>
                              </a>
                              <a
                                className="dropdown-item text-danger"
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteHub(value?._id);
                                }}
                              >
                                <em className="fa fa-trash fa-fw"></em>
                                <span> Delete</span>
                              </a>
                            </div>
                          </div>
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

      {/* User Assignment Modal */}
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
                      modalTitle === "Assign User"
                        ? Array.isArray(newUser)
                          ? newUser.map((user) => ({
                              value: user._id,
                              label: `${user.firstName} ${user.lastName} (${user.mobile})`,
                              mobile: user.mobile,
                            }))
                          : []
                        : Array.isArray(users)
                        ? users
                            .filter(
                              (user) =>
                                user.joinedHub &&
                                user.joinedHub._id === currentHubId
                            )
                            .map((user) => ({
                              value: user._id,
                              label: `${user.firstName} ${user.lastName} (${user.mobile})`,
                              mobile: user.mobile,
                            }))
                        : []
                    }
                    isMulti={modalTitle === "Assign User"}
                    onChange={setSelectedUser}
                    value={selectedUser}
                    placeholder="Select User..."
                    getOptionLabel={(option) => option.label}
                    getOptionValue={(option) => option.value}
                    closeMenuOnSelect={modalTitle !== "Assign User"}
                    filterOption={(option, inputValue) => {
                      const label = option?.label || "";
                      const mobile = option?.mobile || "";
                      const input = inputValue.toLowerCase();
                      return (
                        label.toLowerCase().includes(input) ||
                        mobile.toLowerCase().includes(input)
                      );
                    }}
                  />
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
                  onClick={handleUserSubmitt}
                >
                  {modalTitle}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            onClick={() => {
              setShowRemoveUserModal(false);
              setSelectedUser(null);
            }}
          >
            <span>&times;</span>
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Select User to Remove</label>
            <Select
              options={
                Array.isArray(users) 
                  ? users
                      .filter(
                        (user) =>
                          user.joinedHub &&
                          user.joinedHub._id === removeUserHubId &&
                          (!user.adminOfHubs || user.adminOfHubs._id !== removeUserHubId)
                      )
                      .map((user) => ({
                        value: user._id,
                        label: `${user.firstName} ${user.lastName} (${user.mobile})`,
                        mobile: user.mobile,
                      }))
                  : []
              }
              onChange={setSelectedUser}
              value={selectedUser}
              placeholder="Select User..."
              getOptionLabel={(option) => option.label}
              getOptionValue={(option) => option.value}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setShowRemoveUserModal(false);
              setSelectedUser(null);
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleRemoveUserSubmit}
            disabled={!selectedUser}
          >
            Remove
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
