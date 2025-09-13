import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import swal from "sweetalert";
import Select from "react-select";
import PageLoader from "../../components/PageLoader/PageLoader";
import Paginate from "../../components/pagination/paginate";
import { appGetAllUser, appUpdateUser, appUpdateUserByAdmin } from "../../store/user";
import { appAllGetHubs } from "../../store/hubs";
import { appGetAllSanstha, appJoinSanstha } from "../../store/sanstha";

function TableFilter() {
  const dispatch = useDispatch();
  const params = useParams();
  const { id } = useParams();
  const navigate = useNavigate();
  const users = useSelector((state) => state?.usersReducer.users);
  const isloder = useSelector((state) => state?.usersReducer.isloder);
  const paginate = useSelector((state) => state.usersReducer.paginate);
  const isdeleted = useSelector((state) => state?.usersReducer?.isdeleted);
  const hub = useSelector((state) => state?.hubReducer.hub);
  const sanstha = useSelector((state) => state?.sansthaReducer.sanstha);
  // console.log(sanstha)
  const [page, setPage] = useState(params.page || 1);
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({
    hub: null,
  });
  const [searchType, setSearchType] = useState("firstName");
  const [search, setSearch] = useState("");
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [currentSansthaId, setCurrentSansthaId] = useState(null);
  const [selectedSanstha, setSelectedSanstha] = useState(null);

  useEffect(() => {
    if (isdeleted) {
      dispatch(appGetAllUser(page));
    }
  }, [isdeleted, dispatch, page]);
  useEffect(() => {
    dispatch(appAllGetHubs({ page: 1, limit: 1000 }));
  }, []);

  // const handleDeleteUser = (id) => {
  //   swal({
  //     title: "Are you sure?",
  //     text: "You want to delete this user?",
  //     icon: "warning",
  //     buttons: true,
  //     dangerMode: true,
  //   }).then((willDelete) => {
  //     if (willDelete) {
  //       dispatch(appDeleteUser(id));
  //     }
  //   });
  // };

  useEffect(() => {
    const searchParams = {
      ...activeFilters,
      page,
      limit: 10,
    };
    // console.log(searchParams)
    dispatch(appGetAllUser(searchParams));
    navigate(`/user/${page}`);
  }, [page, activeFilters]);

  const handleSearch = useCallback(() => {
    const filters = {};
    if (selectedFilters.hub) {
      filters.hub = selectedFilters.hub.value;
    }
    if (search) {
      filters[searchType] = search;
    }
    setActiveFilters(filters);
    setPage(1);
  }, [selectedFilters, search, searchType]);

  const handleReset = () => {
    setSelectedFilters({
      hub: null,
    });
    setSearch("");
    setSearchType("firstName");
    setPage(1);
    setActiveFilters({});
  };

  // const handleAssignUser = (userId) => {
  //   const selectedHubUser = Array.isArray(users)
  //     ? users.find((c) => c._id === userId)
  //     : users;
  //   const hubId = selectedHubUser?.joinedHub?._id;
  //   console.log(hubId);
  //   setCurrentSansthaId(userId);
  //   setModalTitle("Join Sanstha");
  //   setShowUserModal(true);
  //   if (hubId) {
  //     dispatch(appGetAllSanstha({ hub: hubId }));
  //   }
  // };

  const handleJoinSanstha = () => {
    if (selectedSanstha) {
      const payload = {
        userId: currentSansthaId,
        sansthaId: selectedSanstha.value,
      };
      console.log("Join Sanstha Payload:", payload);
      dispatch(appJoinSanstha(payload));
      // .then(() => {
      //   window.location.reload();
      // });
      setShowUserModal(false);
      setSelectedSanstha(null);
      setModalTitle("");
    }
  };

  // const handleRemoveSanstha = (userId) => {
  //       const user = users.find(u => u._id === userId);
  //       if (user?.joinedSanstha?.[0]) {
  //         console.log(user?.joinedSanstha?.[0])
  //         const payload = {
  //           userId: userId,
  //           sansthaId: user.joinedSanstha[0]._id
  //         };
  //         console.log("Leave Sanstha Payload:", payload);
  //         dispatch(appLeaveSanstha(payload))
  //       }
  // };

  const handleBlockUser = (userId, isCurrentlyBlocked) => {
    swal({
      title: `Are you sure?`,
      text: `Do you want to ${
        isCurrentlyBlocked ? "unblock" : "block"
      } this user?`,
      icon: "warning",
      buttons: true,
      dangerMode: isCurrentlyBlocked ? false : true,
    }).then((willUpdate) => {
      if (willUpdate) {
        dispatch(
          appUpdateUserByAdmin({
            id: userId,
            isUserBlocked: !isCurrentlyBlocked,
            navigate,
          })
        ).then(() => {
          dispatch(appGetAllUser({ page, limit: 10 }));
        });
      }
    });
  };

  const handleCloseModal = () => {
    setShowUserModal(false);
    setSelectedSanstha(null);
    setModalTitle("");
  };

  return (
    <>
      {isloder && <PageLoader />}
      <div className="card dataTables_wrapper">
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-12">
              <div className="d-flex align-items-end flex-wrap gap-3">
                {/* Hub Select */}
                <div style={{ minWidth: "200px", marginRight: "5px" }}>
                  <label className="form-label">Community</label>
                  <Select
                    options={
                      Array.isArray(hub.data)
                        ? hub.data.map((hub) => ({
                            value: hub._id,
                            label: hub.name,
                          }))
                        : []
                    }
                    onChange={(option) => {
                      setSelectedFilters((prev) => ({
                        ...prev,
                        hub: option,
                      }));
                    }}
                    value={selectedFilters.hub}
                    placeholder="Select Community..."
                    classNamePrefix="react-select"
                  />
                </div>

                {/* Search Form */}
                <form
                  className="flex-grow-1 container-md"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                  }}
                >
                  <div className="input-group">
                    <select
                      className="form-control"
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value)}
                    >
                      <option value="firstName">First Name</option>
                      <option value="lastName">Last Name</option>
                      <option value="mobile">Mobile</option>
                      <option value="email">Email</option>
                      <option value="goutra">Goutra</option>
                    </select>
                    <input
                      className="form-control"
                      type="text"
                      placeholder={`Search by ${searchType}...`}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className="input-group-append">
                      <button className="btn btn-info" type="submit">
                        <em className="fas fa-search me-1"></em> Search
                      </button>

                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={handleReset}
                      >
                        <em className="fas fa-redo me-1"></em> Reset
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="table-responsive bootgrid mt-3">
            <table className="table table-hover" id="bootgrid-command">
              <thead>
                <tr>
                  <th>User</th>
                  {/* <th data-column-id="received" data-order="desc">
                    Last Name
                  </th> */}
                  <th data-column-id="received" data-order="desc">
                    Mobile
                  </th>
                  <th data-column-id="received" data-order="desc">
                    Community
                  </th>
                  <th data-column-id="received" data-order="desc">
                    Native Address
                  </th>
                  <th data-column-id="received" data-order="desc">
                    Present Address
                  </th>
                  {/* <th data-column-id="received" data-order="desc">
                    Present Native Area
                  </th> */}
                  <th data-column-id="received" data-order="desc">
                    Platform Joined Date
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
                {users && users.length > 0 ? (
                  users.map((value, index) => (
                    <tr
                      key={index}
                      // onClick={(e) => {
                      //   if (
                      //     !e.target.closest(".dropdown-menu") &&
                      //     !e.target.closest(".btn-link")
                      //   ) {
                      //     navigate(`/user/details/${value?._id}`);
                      //   }
                      // }}
                      onClick={(e) => {
                        if (
                          e.target.closest(".dropdown-menu") ||
                          e.target.closest(".btn-link") ||
                          e.target.closest("button") ||
                          e.target.closest("td:last-child")
                        ) {
                          return;
                        }
                    
                        navigate(`/user/details/${value?._id}`);
                      }}
                      style={{
                        cursor: "pointer",
                        backgroundColor: value?.isUserBlocked
                          ? "#ffe6e6"
                          : "inherit",
                      }}
                    >
                      <td>
                          {value?.profilePic ? (
                            <img
                              src={value.profilePic}
                              // src="/img/images.png"
                              alt="user"
                              style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                              }}
                            />
                          ) : (
                            <img
                              src="/img/user.jpg"
                              alt="user"
                              style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                              }}
                            />
                          )}
                          <br />
                          {value.firstName} {value.lastName}
                      </td>
                      {/* <td>{value?.lastName}</td> */}
                      <td>{value?.mobile}</td>
                      <td>
                        {value?.joinedHub?.name}
                        <br />
                        {value.joinedHubDate && (
                          <small>
                            Joined Date-
                            {new Date(value.joinedHubDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </small>
                        )}
                      </td>
                      <td>
                        {value?.nativePlaceAddress && value?.nativeArea && (
                          <>
                            {value?.nativePlaceAddress}, {value?.nativeArea}
                          </>
                        )}

                        <br />
                        {value?.nativeBlock &&
                          value?.nativeDistrict &&
                          value?.nativeState &&
                          value?.nativePlacePincode && (
                            <>
                              <span>
                                {" "}
                                {value?.nativeBlock}, {value?.nativeDistrict} ,
                                {value?.nativeState} {value?.nativePlacePincode}
                              </span>
                            </>
                          )}
                        <br />
                      </td>
                      <td>
                        {value?.presentAddress && value?.presentnativeArea && (
                          <>
                            {value?.presentAddress}, {value?.presentnativeArea}
                          </>
                        )}
                        <br />
                        {value?.presentBlock &&
                          value?.presentDistrict &&
                          value?.presentState &&
                          value?.presentPincode && (
                            <>
                              <span>
                                {value?.presentBlock}, {value?.presentDistrict}{" "}
                                ,{value?.presentState} {value?.presentPincode}
                              </span>
                            </>
                          )}
                      </td>
                      {/* <td>{value?.presentnativeArea}</td> */}

                      <td>
                        {value?.createdAt
                          ? new Date(value.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
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
                            style={{
                              position: "relative",
                              zIndex: 1,
                              // padding: "0px",
                            }}
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
                                navigate(`/user/details/${value?._id}`)
                              }
                            >
                              <em className="fa fa-eye fa-fw"></em>
                              <span> Details</span>
                            </a>
                            <a
                              className="dropdown-item text-danger"
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleBlockUser(
                                  value?._id,
                                  value?.isUserBlocked
                                );
                              }}
                            >
                              <em
                                className={`fa ${
                                  value?.isUserBlocked ? "fa-unlock" : "fa-lock"
                                } fa-fw`}
                              ></em>
                              <span>
                                {value?.isUserBlocked ? " Unblock" : " Block"}{" "}
                                User
                              </span>
                            </a>

                            {/* {value?.joinedSanstha && value.joinedSanstha.length > 0 ? (
                                <a
                                  className="dropdown-item"
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRemoveSanstha(value?._id);
                                  }}
                                >
                                  <em className="fa fa-user-minus fa-fw"></em> 
                                  <span> Remove Sanstha</span>
                                </a>
                               ) : ( */}
                            {/* <a
                              className="dropdown-item"
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAssignUser(value?._id);
                              }}
                            >
                              <em className="fa fa-user-shield fa-fw"></em>
                              <span> Join Sanstha</span>
                            </a> */}
                            {/* )} */}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <div className="d-flex flex-column align-items-center">
                        <h5 className="text-muted">No Records Found</h5>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {paginate && (
            <Paginate paginate={paginate} page={page} setPage={setPage} />
          )}
        </div>
      </div>

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
                  <label>Select Sanstha</label>
                  <Select
                    // options={
                    //   Array.isArray(sanstha)
                    //     ? sanstha.map((s) => ({
                    //         value: s._id,
                    //         label: s.name,
                    //       }))
                    //     : []
                    // }
                    options={
                      Array.isArray(sanstha)
                        ? sanstha
                            .filter(
                              (s) =>
                                s.hub &&
                                s.hub._id ===
                                  users.find((u) => u._id === currentSansthaId)
                                    ?.joinedHub?._id
                            )
                            .map((s) => ({
                              value: s._id,
                              label: s.name,
                            }))
                        : []
                    }
                    onChange={setSelectedSanstha}
                    value={selectedSanstha}
                    placeholder="Select Sanstha..."
                    getOptionLabel={(option) => option?.name || option?.label}
                    getOptionValue={(option) => option?._id || option?.value}
                    filterOption={(option, inputValue) => {
                      const label = option?.label || "";
                      const input = inputValue.toLowerCase();
                      return label.toLowerCase().includes(input);
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
                  onClick={handleJoinSanstha}
                >
                  {modalTitle}
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
