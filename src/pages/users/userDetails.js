import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { appGetAllSanstha } from "../../store/sanstha";
import { appGetUserById } from "../../store/user";
import { appGetAllEvent, appGetEventDetails, appGetUserParticipantsEventDetails, setEmptyEvent } from "../../store/event";
import PostPreview from "../../components/PostPreview/PostPreview";
import { appAllGetFundrasing } from "../../store/fundrasing";
import ReceiptPDF from "../../components/filegenerate/filegenerate";

function UserDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const { id } = useParams();
  const isdeleted = useSelector((state) => state?.sansthaReducer?.isdeleted);
  // const paginate = useSelector((state) => state.sansthaReducer.paginate);
  const userDetails = useSelector((state) => state.usersReducer.userDetails);
  console.log("User Details:", userDetails);
  // const usersList = useSelector((state) => state?.usersReducer.users);
  // const sansthaList = useSelector((state) => state.sansthaReducer.sansthaList);
  const event = useSelector((state) => state?.eventReducer.event);
  const fundrasing = useSelector(
    (state) => state?.fundrasingReducer.fundrasing
  );
    const [page, setPage] = useState(params.page || 1);
    const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
    const eventParticipantUserDetails = useSelector((state) => state.eventReducer.eventParticipantUserDetails);
    const eventDetails = useSelector((state) => state.eventReducer.eventDetails);
    const participants = Array.isArray(eventParticipantUserDetails) ? eventParticipantUserDetails : [];
  

  useEffect(() => {
    dispatch(appGetUserById(id));
    dispatch(appGetAllEvent({ page: 1, limit: 10, userId: id }));
    dispatch(appAllGetFundrasing({ page: 1, limit: 1000, userId: id }));
  }, [dispatch, id]);

  useEffect(() => {
    if (isdeleted) {
      dispatch(appGetAllSanstha(page));
    }
  }, [isdeleted, dispatch, page]);

    const handleShowEventDetails = (eventId) => {
      dispatch(appGetEventDetails(eventId));
      dispatch(
        appGetUserParticipantsEventDetails({
          event: eventId,
          // status: "Accepted",
        })
      );
      setShowEventDetailsModal(true);
    };
  
    const handleCloseEventDetails = () => {
      setShowEventDetailsModal(false);
      dispatch(setEmptyEvent());
    };

  // const handleDeleteSanstha = (id) => {
  //   swal({
  //     title: "Are you sure?",
  //     text: "You want to delete this sanstha?",
  //     icon: "warning",
  //     buttons: true,
  //     dangerMode: true,
  //   }).then((willDelete) => {
  //     if (willDelete) {
  //       dispatch(appDeleteSanstha(id));
  //     }
  //   });
  // };

  // const handleJoinSanstha = (sansthaId) => {
  //   swal({
  //     title: "Are you sure?",
  //     text: "You want to join this sanstha?",
  //     icon: "warning",
  //     buttons: true,
  //     dangerMode: false,
  //   }).then((willJoin) => {
  //     if (willJoin) {
  //       const payload = {
  //         userId: userDetails?._id,
  //         sansthaId: sansthaId
  //       };
  //       dispatch(appJoinSanstha({
  //         ...payload,
  //         navigate: () => navigate(`/users/${id}`)
  //       }));
  //     }
  //   });
  // };

  // const handleLeaveSanstha = (sansthaId) => {
  //   swal({
  //     title: "Are you sure?",
  //     text: "You want to leave this sanstha?",
  //     icon: "warning",
  //     buttons: true,
  //     dangerMode: true,
  //   }).then((willLeave) => {
  //     if (willLeave) {
  //       dispatch(appLeaveSanstha({
  //         userId: userDetails?._id,
  //         sansthaId: sansthaId,
  //         navigate: () => navigate(`/users/${id}`)
  //       }));
  //     }
  //   });
  // };

  return (
    <div>
      <div
        className="carousel"
        id="carouselExampleCaptions"
        data-ride="carousel"
      >
        {/* <ol className="carousel-indicators">
          <li
            className="active"
            data-target="#carouselExampleCaptions"
            data-slide-to="0"
          ></li>
          <li data-target="#carouselExampleCaptions" data-slide-to="1"></li>
        </ol> */}
        <div className="carousel-inner">
          <div
            className="carousel-item active"
            style={{
              // backgroundImage: `url(${sponsor?.[0]?.image || "/img/profile-bg.jpg"})`,
              backgroundImage: "url(/img/download.jpeg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              height: "400px",
            }}
          >
            <div
              className="carousel-caption d-none d-md-block"
              style={{ color: "black" }}
            >
              <img
                className="img-thumbnail rounded-circle thumb128 mb-3"
                src={
                  userDetails?.profilePic
                    ? userDetails.profilePic
                    : "/img/user.jpg"
                }
                alt="User Profile"
              />
              <h3 className="m-0">
                {userDetails?.firstName} {userDetails?.lastName}
              </h3>
              <div>Mobile- {userDetails?.mobile}</div>
              <div>Community- {userDetails?.joinedHub?.name}</div>
            </div>
          </div>
        </div>
        {/* <a
          className="carousel-control-prev"
          href="#carouselExampleCaptions"
          role="button"
          data-slide="prev"
        >
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="sr-only">Previous</span>
        </a>
        <a
          className="carousel-control-next"
          href="#carouselExampleCaptions"
          role="button"
          data-slide="next"
        >
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="sr-only">Next</span>
        </a> */}
      </div>
      <div className="text-center mb-4">
        <div className="row card card-transparent" role="tabpanel">
          <ul className="nav nav-tabs nav-fill" role="tablist">
            <li className="nav-item" role="presentation">
              <a
                className="nav-link bb0 active bg-gray text-white"
                href="#users"
                aria-controls="users"
                role="tab"
                data-toggle="tab"
                aria-selected="true"
              >
                <em className="far fa-user fa-fw"></em> About
              </a>
            </li>
            <li className="nav-item" role="presentation">
              <a
                className="nav-link bb0 bg-gray text-white"
                href="#sanstha"
                aria-controls="sanstha"
                role="tab"
                data-toggle="tab"
                aria-selected="false"
              >
                <em className="far fa-building fa-fw"></em> Sanstha:{" "}
                {userDetails?.joinedSanstha.length || 0}
              </a>
            </li>
            <li className="nav-item" role="presentation">
              <a
                className="nav-link bb0 bg-gray text-white"
                href="#events"
                aria-controls="events"
                role="tab"
                data-toggle="tab"
                aria-selected="false"
              >
                <em className="far fa-calendar-alt fa-fw"></em> Events:{" "}
                {event?.data?.length || 0}
              </a>
            </li>
            <li className="nav-item" role="presentation">
              <a
                className="nav-link bb0 bg-gray text-white"
                href="#donation"
                aria-controls="donation"
                role="tab"
                data-toggle="tab"
                aria-selected="false"
              >
                <em className="fas fa-hand-holding-heart fa-fw"></em> Donation:{" "}
                {fundrasing?.data?.length || 0}
              </a>
            </li>
          </ul>
          <div className=" p-3">
            <div
              className="tab-content"
              style={{ borderWidth: "0 0 0 0", padding: "0" }}
            >
              {/* Users Tab */}
              <div
                className="tab-pane fade show active"
                id="users"
                role="tabpanel"
              >
                <div className="text-white mb-3">
                  {/* <h4 className="m-0"> Users</h4> */}
                </div>

                <div className="row align-items-stretch">
                  {/* Personal Details */}
                  <div className="col-md-4">
                    <div className="card card-default h-100">
                      <div
                        className="card-body"
                        style={{ color: "#656565", marginLeft: "10px" }}
                      >
                        <div
                          className="card-body d-flex flex-column align-items-center"
                          style={{ color: "#656565" }}
                        >
                          <h3 className="mt-0 mb-3 text-center">
                            Personal Details
                          </h3>
                          <ul
                            className="list-unstyled px-4"
                            style={{ textAlign: "left" }}
                          >
                            <li>
                              <h4>
                                <strong>Name:</strong> {userDetails?.firstName}{" "}
                                {userDetails?.lastName}
                              </h4>
                            </li>
                            {userDetails?.fatherName ? (
                              <li>
                                <p>
                                  <strong>Father Name:</strong>{" "}
                                  {userDetails?.fatherName}
                                </p>
                              </li>
                            ) : null}
                            {userDetails?.dob ? (
                              <li>
                                <p>
                                  <strong>DOB:</strong> {userDetails?.dob}
                                </p>
                              </li>
                            ) : null}
                            {userDetails?.goutra ? (
                              <li>
                                <p>
                                  <strong>Gotra:</strong> {userDetails?.goutra}
                                </p>
                              </li>
                            ) : null}
                            <li>
                              <p>
                                {/* <em className="fa fa-phone fa-fw mr-3"></em> */}
                                <strong>Mobile:</strong> {userDetails?.mobile}
                              </p>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address Details */}
                  <div className="col-md-4">
                    <div className="card card-default h-100">
                      <div className="card-body" style={{ color: "#656565" }}>
                        <div className="text-center">
                          <h3 className="mt-0">Address</h3>
                        </div>
                        <div className="text-center">
                          <em className="fa fa-home fa-fw mr-3"></em>Native
                          Address
                          <div>
                            {userDetails?.nativePlaceAddress},{" "}
                            {userDetails?.nativeArea}
                          </div>
                          <div>
                            {userDetails?.nativeBlock},{" "}
                            {userDetails?.nativeDistrict}{" "}
                            {userDetails?.nativePlacePincode}
                          </div>
                          <div>{userDetails?.nativeState}</div>
                          {/* <div>Gujarat</div> */}
                        </div>

                        <div className="text-center mt-3">
                          <em className="fa fa-home fa-fw mr-3"></em>Present
                          Address
                          <div>
                            {userDetails?.presentAddress},{" "}
                            {userDetails?.presentnativeArea}
                          </div>
                          <div>
                            {userDetails?.presentBlock},{" "}
                            {userDetails?.presentDistrict}{" "}
                            {userDetails?.presentPincode}
                          </div>
                          <div>{userDetails?.presentState}</div>
                          {/* <div>Gujarat</div> */}
                        </div>
                        {/* <ul className="list-unstyled px-4">
                          <li>
                            <em className="fa fa-home fa-fw mr-3"></em>
                            Native Address: {userDetails?.nativePlaceAddress}
                            {userDetails?.nativeArea
                              ? `, ${userDetails.nativeArea}`
                              : ""}
                            {userDetails?.nativePlacePincode
                              ? `, ${userDetails.nativePlacePincode}`
                              : ""}
                          </li>
                          <li>
                            <em className="fa fa-map-marker fa-fw mr-3"></em>
                            Present Address: {userDetails?.presentAddress}
                            {userDetails?.presentnativeArea
                              ? `, ${userDetails.presentnativeArea}`
                              : ""}
                            {userDetails?.presentPincode
                              ? `, ${userDetails.presentPincode}`
                              : ""}
                          </li>
                        </ul> */}
                      </div>
                    </div>
                  </div>

                  {/* Hub and Sanstha Details */}
                  <div className="col-md-4">
                    <div className="card card-default h-100">
                      <div className="card-body" style={{ color: "#656565" }}>
                        <div className="text-center">
                          <h3 className="mt-0">Community & Sansthas</h3>
                        </div>
                        <div className="row">
                          {/* Community Column */}
                          <div className="col-6 text-center">
                            <h4>Community</h4>
                            {userDetails?.joinedHub ? (
                              <div
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  navigate(
                                    `/community-setup/details/${userDetails.joinedHub._id}`
                                  )
                                }
                              >
                                <img
                                  src={userDetails?.joinedHub?.image}
                                  alt={userDetails?.joinedHub?.name}
                                  style={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                  }}
                                />
                                <div>{userDetails?.joinedHub?.name}</div>
                                <div>
                                  Joined:{" "}
                                  {new Date(
                                    userDetails?.joinedHubDate
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div>No Community Joined</div>
                            )}
                          </div>
                          {/* Sanstha Column */}
                          <div className="col-6 text-center">
                            <h4>Sanstha</h4>
                            {userDetails?.joinedSanstha &&
                            userDetails.joinedSanstha.length > 0 ? (
                              userDetails.joinedSanstha.map((sanstha, idx) => (
                                <div
                                  key={sanstha._id}
                                  className="mb-2"
                                  style={{ cursor: "pointer" }}
                                  onClick={() =>
                                    navigate(
                                      `/sanstha/details/${sanstha?.sanstha?._id}`
                                    )
                                  }
                                >
                                  <img
                                    src={sanstha?.sanstha?.image}
                                    alt={sanstha?.sanstha?.name}
                                    style={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: "50%",
                                      objectFit: "cover",
                                    }}
                                  />
                                  <div>{sanstha?.sanstha?.name}</div>
                                  {/* <div>
                                  Joined:{" "}
                                  {sanstha.sanstha.joinedSanstha
                                    ? new Date(sanstha.sanstha.joinedSanstha).toLocaleDateString()
                                    : "-"}
                                </div> */}
                                  <div>
                                    Joined:{" "}
                                    {userDetails.joinedSanstha &&
                                    userDetails.joinedSanstha.length > 0
                                      ? new Date(
                                          userDetails.joinedSanstha[0].joinedDate
                                        ).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                        })
                                      : "-"}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div>No Sanstha Joined</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* sanstha Tab */}
              <div className="tab-pane fade" id="sanstha" role="tabpanel">
                <div className="mb-3 mr-2 d-flex justify-content-between align-items-center">
                  <h4 className="ml-2">
                    Total Sanstha: {userDetails?.joinedSanstha.length || 0}
                  </h4>
                  {/* <button
                    className="btn btn-primary"
                    // onClick={handleAddNewSanstha}
                  >
                    <i className="far fa-plus"></i> Add New Sanstha
                  </button> */}
                </div>
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead className="">
                      <tr>
                        <th>Sr. No.</th>
                        {/* <th>Image</th> */}
                        <th>Sanstha</th>
                        {/* <th>Time</th>
                        <th>Location</th>
                        <th>Status</th> */}
                        <th>Join Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userDetails?.joinedSanstha?.length > 0 ? (
                        userDetails.joinedSanstha.map((sanstha, index) => (
                          <tr
                            key={index}
                            onClick={(e) => {
                              if (
                                !e.target.closest(".dropdown-menu") &&
                                !e.target.closest(".btn-link")
                              ) {
                                navigate(
                                  `/sanstha/details/${sanstha?.sanstha?._id}`
                                );
                              }
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            <td>{index + 1}</td>
                            <td>
                              <img
                                src={sanstha?.sanstha?.image}
                                alt="sanstha"
                                height={70}
                                width={70}
                              />
                              <br />
                              {sanstha?.sanstha?.name}
                            </td>
                            {/* <td>{sanstha.name}</td> */}
                            {/* <td>{sanstha.time}</td>
                            <td>{sanstha.location}</td>
                            <td>
                              <span className={`badge ${sanstha.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                                {sanstha.status || 'Active'}
                              </span>
                            </td> */}
                            {/* <td>
                              {sanstha?.sanstha.joinedSanstha?.find(
                                (js) => js.sanstha._id === sanstha._id
                              )
                                ? new Date(  
                                  sanstha?.sanstha.joinedSanstha.find(
                                      (js) => js.sanstha._id === sanstha._id
                                    ).joinedDate
                                  ).toLocaleDateString()
                                : "N/A"}
                            </td> */}
                            <td>
                              {new Date(sanstha?.joinedDate).toLocaleDateString(
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
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  navigate(
                                    `/sanstha/details/${sanstha?.sanstha?._id}`
                                  );
                                }}
                                className="btn btn-sm btn-primary mr-2"
                                title="Details"
                              >
                                <em className="fa fa-eye fa-fw"></em>
                              </button>
                              {/* <button className="btn btn-sm btn-primary mr-2" title="Edit">
                                <i className="far fa-edit"></i>
                              </button>
                              <button className="btn btn-sm btn-danger" title="Delete">
                                <i className="far fa-trash-alt"></i>
                              </button> */}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center">
                            No sanstha data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Events Tab */}
              <div className="tab-pane fade" id="events" role="tabpanel">
                <div className="mb-3 mr-2 d-flex justify-content-between align-items-center">
                  <h4 className="ml-2">
                    Total Events:{event?.data?.length || 0}
                  </h4>
                </div>
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead className="">
                      <tr>
                        <th>Sr. No.</th>
                        <th>Image</th>
                        <th>Event</th>
                        <th>Category</th>
                        <th>Community</th>
                        <th>Sanstha</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(event.data || []).map((value, index) => (
                        <tr key={value._id}>
                          <td>{index + 1}</td>
                          <PostPreview value={value} />
                          <td
                            className="text-capitalize"
                            style={{
                              maxWidth: "150px",
                              wordWrap: "break-word",
                              whiteSpace: "normal",
                            }}
                          >
                            {value.title}
                          </td>
                          <td>{value.category}</td>
                          <td
                            style={{
                              maxWidth: "150px",
                              wordWrap: "break-word",
                              whiteSpace: "normal",
                              textTransform: "capitalize",
                            }}
                          >
                            {value?.hub ? (
                              <>
                                {value.hub.image && (
                                  <img
                                    src={value.hub.image}
                                    alt="community"
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      borderRadius: "50%",
                                      objectFit: "cover",
                                    }}
                                  />
                                )}
                                <br />
                                {value.hub.name || "—"}
                              </>
                            ) : (
                              ""
                            )}
                          </td>
                          <td
                            style={{
                              maxWidth: "150px",
                              wordWrap: "break-word",
                              whiteSpace: "normal",
                              textTransform: "capitalize",
                            }}
                          >
                            {value?.sanstha ? (
                              <>
                                {value.sanstha.image && (
                                  <img
                                    src={value.sanstha.image}
                                    alt="sanstha"
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      borderRadius: "50%",
                                      objectFit: "cover",
                                    }}
                                  />
                                )}
                                <br />
                                {value.sanstha.name || "—"}
                              </>
                            ) : (
                              ""
                            )}
                          </td>
                          <td>
                            {new Date(value.startDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </td>
                          <td>
                            {new Date(value.endDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                value?.status === "Upcoming"
                                  ? "badge-warning"
                                  : value?.status === "Active"
                                  ? "badge-success"
                                  : value?.status === "Completed"
                                  ? "badge-danger"
                                  : "badge-light"
                              }`}
                            >
                              {value?.status || "N/A"}
                            </span>
                          </td>

                          <td>
                            {/* <button
                              className="btn btn-sm btn-info mr-2"
                              onClick={() => handleEditEvent(value?._id)}
                            >
                              <em className="fa fa-edit fa-fw"></em>
                            </button> */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleShowEventDetails(value?._id);
                              }}
                              className="btn btn-sm btn-primary mr-2"
                              title="Details"
                            >
                              <em className="fa fa-eye fa-fw"></em>
                            </button>
                            {/* <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteEvent(value._id)}
                            >
                              <em className="fa fa-trash fa-fw"></em>
                            </button> */}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Donation Tab */}
              <div className="tab-pane fade" id="donation" role="tabpanel">
                <div className="mb-3 mr-2 d-flex justify-content-between align-items-center">
                  {/* <h4 className="ml-2">
                    Total Donation: {fundrasing?.data?.length || 0}
                  </h4> */}
                </div>
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead className="">
                      <tr>
                        <th>Sr. No.</th>
                        <th>Community</th>
                        <th>Sanstha</th>
                        {/* <th>User</th> */}
                        <th>Contribution Type</th>
                        <th>Payment Screenshot</th>
                        <th>Online/Offline</th>
                        <th>Amount</th>
                        <th>Payment Date</th>
                        {/* <th>Status</th> */}
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fundrasing?.data?.length > 0 ? (
                        fundrasing.data.map((value, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                              {value?.hub ? (
                                <>
                                  {value.hub.image && (
                                    <img
                                      src={value.hub.image}
                                      alt="community"
                                      style={{
                                        width: "50px",
                                        height: "50px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                      }}
                                    />
                                  )}
                                  <br />
                                  {value?.hub?.name || "—"}
                                </>
                              ) : (
                                ""
                              )}
                            </td>
                            <td>
                              {value?.sansthaId ? (
                                <>
                                  {value.sansthaId.image && (
                                    <img
                                      src={value.sansthaId.image}
                                      alt="sanstha"
                                      style={{
                                        width: "50px",
                                        height: "50px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                      }}
                                    />
                                  )}
                                  <br />
                                  {value.sansthaId.name || "—"}
                                </>
                              ) : (
                                ""
                              )}
                            </td>
                            {/* <td>
                              {value?.userId?.profilePic ? (
                                <img
                                  src={value.userId.profilePic}
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
                              {value.userId.firstName} {value.userId.lastName}
                              <br />
                              <small>{value.userId.mobile}</small>
                            </td> */}
                            <td>
                          
                              <br />
                              {value.fundraisingType}
                            </td>
                            <td>
                              <img
                                src={value?.paymentScreenshot}
                             
                                alt="payment screenshot"
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  borderRadius: "50%",
                                }}
                              />
                            </td>
                            <td>
                              {value.isOnline}
                              {value?.isOnline === true ? (
                                <span className="badge badge-primary">
                                  Online
                                </span>
                              ) : (
                                <span className="badge badge-primary">
                                  Offline
                                </span>
                              )}
                            </td>
                            <td>
                              ₹
                              <span style={{ fontWeight: "bold" }}>
                                {value.amount}
                              </span>{" "}
                              <br />
                              {value?.offlinePaymentMode && (
                                <small>Mode: {value?.offlinePaymentMode}</small>
                              )}
                            </td>
                            <td>
                              {new Date(value?.updatedAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </td>
                            <td>
                              <ReceiptPDF data={value?._id} />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center">
                            No donations data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        {showEventDetailsModal && eventDetails && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
            marginTop: "35px",
          }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Event Details</h5>
                <button
                  type="button"
                  className="close"
                  onClick={handleCloseEventDetails}
                >
                  x
                </button>
              </div>

              <div
                className="modal-body"
                style={{ maxHeight: "70vh", overflowY: "auto" }}
              >
                <div className=" mb-3">
                  {eventDetails.file ? (
                    eventDetails.file.endsWith(".mp4") ? (
                      <video
                        controls
                        style={{
                          width: "70%",
                          maxHeight: "200px",
                          borderRadius: "10px",
                        }}
                        src={eventDetails.file}
                      />
                    ) : (
                      <img
                        src={eventDetails.file}
                        alt="Event"
                        style={{
                          width: "50%",
                          maxHeight: "100px",
                          borderRadius: "10px",
                          objectFit: "contain",
                        }}
                      />
                    )
                  ) : (
                    <p className="text-muted">No event file uploaded</p>
                  )}
                  <h5 className="modal-title">
                    <strong>Event:</strong> {eventDetails.title}
                  </h5>
                  <strong>Description:</strong>
                  <div
                    className=" p-2 mt-1"
                    dangerouslySetInnerHTML={{
                      __html: eventDetails.description,
                    }}
                  />
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Community:</strong>
                    {eventDetails.hub ? (
                      <div className="d-flex align-items-center mt-1">
                        <img
                          src={eventDetails?.hub?.image}
                          alt="Hub"
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            marginRight: "10px",
                          }}
                        />
                        <span>{eventDetails?.hub?.name}</span>
                      </div>
                    ) : (
                      <p className="text-muted">N/A</p>
                    )}
                  </div>
                  <div className="col-md-6">
                    {eventDetails.sanstha && (
                      <>
                        <strong>Sanstha:</strong>
                        <div className="d-flex align-items-center mt-1">
                          <img
                            src={eventDetails.sanstha.image}
                            alt="Sanstha"
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              marginRight: "10px",
                            }}
                          />
                          <span>{eventDetails.sanstha.name}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <p>
                      <strong>Category:</strong> {eventDetails.category}
                    </p>
                    {/* <p><strong>Status:</strong> {eventDetails.status}</p> */}
                  </div>
                  <div className="col-md-6">
                    <p>
                      <strong>Start Date:</strong>{" "}
                      {new Date(eventDetails.startDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                    <p>
                      <strong>End Date:</strong>{" "}
                      {new Date(eventDetails.endDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <strong>Location:</strong>
                  {eventDetails.locationType === "Physical" ? (
                    <div className="mt-1">
                      <div>
                        {eventDetails.nativePlaceAddress},{" "}
                        {eventDetails.nativeArea}
                      </div>
                      <div>
                        {eventDetails.nativeBlock},{" "}
                        {eventDetails.nativeDistrict},{" "}
                        {eventDetails.nativeState}{" "}
                        {eventDetails.nativePlacePincode}
                      </div>
                    </div>
                  ) : (
                    <a
                      href={eventDetails.virtualLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary"
                    >
                      {eventDetails.virtualLink}
                    </a>
                  )}
                </div>

                {eventDetails.payment_mode_enabled && (
                  <div className="mb-3">
                    <strong>UPI ID:</strong> {eventDetails.upi_id}
                  </div>
                )}

                <div className="row mb-3">
                  <div className="col-md-6">
                    <p>
                      <strong>RSVP Enabled:</strong>{" "}
                      {eventDetails.RSVP_Enabled ? "Yes" : "No"}
                    </p>
                    <p>
                      <strong>RSVP Limit:</strong> {eventDetails.RSVP_limit}
                    </p>
                    <p>
                      <strong>RSVP Deadline:</strong>{" "}
                      {eventDetails.RSVP_deadline
                        ? new Date(
                            eventDetails.RSVP_deadline
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>
                  <div className="col-md-6">
                    {eventDetails.Allow_Vlonteers && (
                      <p>
                        <strong>Volunteers Allowed:</strong>{" "}
                        {eventDetails.Allow_Vlonteers ? "Yes" : "No"}
                      </p>
                    )}
                    <p>
                      <strong>Waitlist Enabled:</strong>{" "}
                      {eventDetails.Waitlist_Enabled ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                {eventDetails.volunteers?.length > 0 && (
                  <div className="mb-3">
                    <strong>Volunteers:</strong>
                    <ul className="mt-1">
                      {eventDetails.volunteers.map((vol, volIndex) => (
                        <li key={vol._id || volIndex} className="mb-3">
                          <p className="font-semibold">
                            Role: {vol.role} | Remaining Count:{" "}
                            {vol.remaining_count}
                          </p>

                          {/* Display each user in this volunteer group */}
                          <div className="row mt-2">
                            {vol.userId.map((user) => (
                              <div
                                key={user._id}
                                className="flex items-center gap-3 p-2 bg-gray-100 rounded-lg"
                              >
                                <img
                                  src={user.profilePic || "/img/user.jpg"}
                                  alt={user.firstName}
                                  className="rounded-full object-cover"
                                  height={70}
                                  width={70}
                                />
                                <div>
                                  <p className="font-medium">
                                    {user.firstName} {user.lastName}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {user.mobile}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(eventDetails?.event_photo_upload) &&
                  eventDetails.event_photo_upload.length > 0 && (
                    <div className="mb-3">
                      <strong>Event Upload Photos:</strong>
                      <div className="mt-3 border-b pb-2">
                        <div className="row mt-2">
                          {eventDetails.event_photo_upload.map(
                            (photo, index) => (
                              <div key={index} className="flex flex-row gap-2">
                                {photo.type === "video/mp4" ? (
                                  <video
                                    controls
                                    style={{
                                      width: "100px",
                                      maxHeight: "100px",
                                      borderRadius: "10px",
                                      marginLeft: "5px",
                                    }}
                                    src={photo.url}
                                  />
                                ) : (
                                  <img
                                    src={photo.url}
                                    alt="event upload"
                                    style={{
                                      width: "100px",
                                      maxHeight: "100px",
                                      borderRadius: "10px",
                                      objectFit: "cover",
                                      marginLeft: "5px",
                                    }}
                                  />
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                {eventDetails?.boli_items?.length > 0 && (
                  <div className="mb-3">
                    <strong className="block mb-2">Boli Items:</strong>
                    <div className="row flex flex-col gap-6">
                      {eventDetails.boli_items.map((item, index) => (
                        <div
                          key={index}
                          className="p-3  rounded-lg  bg-white space-y-2"
                        >
                          <p>
                            <strong>Item Name:</strong> {item.item_name}
                          </p>
                          <p>
                            <strong>Amount Required:</strong> ₹
                            {item.amount_required}
                          </p>
                          <p>
                            <strong>Amount Received:</strong> ₹
                            {item.amount_received}
                          </p>

                          {Array.isArray(item.sponsored_by) &&
                          item.sponsored_by.length > 0 ? (
                            <div className="grid grid-cols-5 gap-4 mt-2">
                              {item.sponsored_by.map((sponsor, sIndex) => (
                                <div
                                  key={sIndex}
                                  className="flex flex-col items-center bg-gray-50 p-2 rounded"
                                >
                                  <img
                                    src={
                                      sponsor.userId?.profilePic ||
                                      "/img/user.jpg"
                                    }
                                    alt={sponsor.userId?.firstName || "Sponsor"}
                                    className=" object-cover"
                                    width={50}
                                    height={50}
                                  />
                                  <span className="text-sm text-center mt-1">
                                    {sponsor.userId?.firstName}{" "}
                                    {sponsor.userId?.lastName}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500">No sponsors yet.</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  {participants.length > 0 && (
                    <>
                      <h6 className="font-bold mb-3 text-green-600">Joinee</h6>
                      <div className="row mt-2">
                        {participants
                          .filter((p) => p.status === "Accepted")
                          .map((participant) => (
                            <div
                              key={participant.userId._id}
                              className="flex items-center gap-3 p-2 bg-gray-100 rounded-lg"
                            >
                              <img
                                src={
                                  participant?.userId?.profilePic ||
                                  "/img/user.jpg"
                                }
                                alt={participant?.userId?.firstName}
                                className="rounded-full object-cover"
                                height={70}
                                width={70}
                              />
                              <div>
                                <p className="font-medium">
                                  {participant.userId.firstName}{" "}
                                  {participant.userId.lastName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {participant.userId.mobile}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* Rejected Section */}
                      {participants.some((p) => p.status === "Rejected") && (
                        <>
                          <h6 className="font-bold mb-3 text-red-600 mt-6">
                            Rejected Participants
                          </h6>
                          <div className="row mt-2 ml-3">
                            {participants
                              .filter((p) => p.status === "Rejected")
                              .map((participant) => (
                                <div
                                  key={participant.userId._id}
                                  className="flex items-center gap-3 p-2 bg-gray-100 rounded-lg"
                                >
                                  <img
                                    src={
                                      participant.userId.profilePic ||
                                      "/img/user.jpg"
                                    }
                                    alt={participant.userId.firstName}
                                    className="rounded-full object-cover"
                                    height={70}
                                    width={70}
                                  />
                                  <div>
                                    <p className="font-semibold">
                                      {participant.userId.firstName}{" "}
                                      {participant.userId.lastName}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {participant.userId.mobile}
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={handleCloseEventDetails}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    
  );
}
export default UserDetails;
