import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import swal from "sweetalert";
import PageLoader from "../../components/PageLoader/PageLoader";
import Paginate from "../../components/pagination/paginate";
import Select from "react-select";
import { appGetAllSanstha } from "../../store/sanstha";
import { appAllGetHubs } from "../../store/hubs";
import PostPreview from "../../components/PostPreview/PostPreview";
import {
  appDeleteEvent,
  appGetAllEvent,
  appGetEventDetails,
  appGetUserParticipantsEventDetails,
  setEmptyEvent,
} from "../../store/event";

function TableFilter() {
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();
  //const post = useSelector((state) => state?.postReducer.post);
  const event = useSelector((state) => state?.eventReducer.event);
  // console.log(event)
  const isloder = useSelector((state) => state?.eventReducer.isloder);
  const paginate = useSelector((state) => state.eventReducer.paginate);
  const isdeleted = useSelector((state) => state?.eventReducer?.isdeleted);
  const { hub } = useSelector((state) => state.hubReducer);
  const { sanstha } = useSelector((state) => state.sansthaReducer);
  const eventDetails = useSelector((state) => state.eventReducer.eventDetails);
  console.log(eventDetails);
  const eventParticipantUserDetails = useSelector(
    (state) => state.eventReducer.eventParticipantUserDetails
  );
  console.log(eventParticipantUserDetails);
  const participants = Array.isArray(eventParticipantUserDetails)
  ? eventParticipantUserDetails
  : [];

  const [page, setPage] = useState(params.page || 1);
  const [selectedFilters, setSelectedFilters] = useState({
    hub: null,
    sanstha: null,
    categoryOptions: null,
    status: "",
  });
  const [activeFilters, setActiveFilters] = useState({});
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  // const [selectedEventDetails, setSelectedEventDetails] = useState(null);

  const categoryOptions = [
    { value: "Cultural", label: "Cultural" },
    { value: "Religious", label: "Religious" },
    { value: "Wedding", label: "Wedding" },
    { value: "General Meeting", label: "General Meeting" },
    { value: "Medical Camp", label: "Medical Camp" },
    { value: "Workshop", label: "Workshop" },
    { value: "Sports", label: "Sports" },
    { value: "Talent Show", label: "Talent Show" },
    { value: "Donation Drive", label: "Donation Drive" },
    { value: "Matrimonial Meet", label: "Matrimonial Meet" },
    { value: "Family Gathering", label: "Family Gathering" },
    { value: "Felicitation", label: "Felicitation" },
    { value: "Blood Donation Camp", label: "Blood Donation Camp" },
    { value: "Free Eye Checkup", label: "Free Eye Checkup" },
    { value: "Housewarming", label: "Housewarming" },
    { value: "Anniversary", label: "Anniversary" },
    { value: "Personal Puja", label: "Personal Puja" },
  ];

  useEffect(() => {
    dispatch(appGetAllEvent({ page: 1, limit: 10 }));
    navigate(`/event/${page}`);
  }, [page, dispatch]);

  useEffect(() => {
    dispatch(appGetAllSanstha({ page: 1, limit: 1000 }));
    dispatch(appAllGetHubs({ page: 1, limit: 1000 }));
  }, [page]);

  useEffect(() => {
    if (isdeleted) {
      dispatch(appGetAllEvent({ page: 1, limit: 10 }));
    }
  }, [isdeleted, dispatch, page]);

  const handleDeleteEvent = (id) => {
    swal({
      title: "Are you sure?",
      text: "You want to delete this Event?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        dispatch(appDeleteEvent(id)).then(() => {
          dispatch(appGetAllEvent({ page: 1, limit: 10 }));
        });
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
    dispatch(appGetAllEvent(searchParams));
    navigate(`/event/${page}`);
  }, [page, activeFilters]);

  const handleSearch = useCallback(() => {
    const filters = {};
    if (selectedFilters.hub) {
      filters.hub = selectedFilters.hub.value;
    }
    if (selectedFilters.sanstha) {
      filters.sanstha = selectedFilters.sanstha.value;
    }
    if (selectedFilters.categoryOptions) {
      filters.categoryOptions = selectedFilters.categoryOptions.value;
    }
    if (selectedFilters.status) {
      filters.status = selectedFilters.status;
    }
    setActiveFilters(filters);
    setPage(1);
  }, [selectedFilters]);

  const handleShowEventDetails = (eventId) => {
    console.log(eventId);
    dispatch(appGetEventDetails(eventId));
    dispatch(
      appGetUserParticipantsEventDetails({
        event: eventId,
        // status: "Accepted",
      })
    );
    // setSelectedEventDetails(eventDetails);
    setShowEventDetailsModal(true);
  };

  const handleCloseEventDetails = () => {
  setShowEventDetailsModal(false);
  dispatch(setEmptyEvent());
};


  return (
    <>
      {isloder && <PageLoader />}
      <div className="card dataTables_wrapper">
        <div className="card-body">
          <div className="row">
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
                  onChange={(option) => {
                    setSelectedFilters((prev) => ({
                      ...prev,
                      hub: option,
                    }));
                  }}
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
                  // onChange={handleSansthaChange}
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
                  onChange={(option) => {
                    setSelectedFilters((prev) => ({
                      ...prev,
                      sanstha: option,
                    }));
                  }}
                  value={selectedFilters.sanstha}
                  placeholder="Select Sanstha.."
                  getOptionLabel={(option) => option?.name || option?.label}
                  getOptionValue={(option) => option?._id || option?.value}
                />
              </div>
            </div>
            <div className="col-md-2">
              <label>Category </label>
              <Select
                name="category"
                options={categoryOptions}
                onChange={(option) => {
                  setSelectedFilters((prev) => ({
                    ...prev,
                    categoryOptions: option,
                  }));
                }}
                value={selectedFilters.categoryOptions}
                placeholder="Select category..."
              />
            </div>
            <div className="col-md-2">
              <div className="form-group">
                <label>Status</label>
                <select
                  className="form-control"
                  name="status"
                  value={selectedFilters.status}
                  onChange={(e) => {
                    setSelectedFilters((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }));
                  }}
                >
                  <option value="">Select status</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
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
                    categoryOptions: null,
                      status: "",
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
                  <th>Community</th>
                  <th>Sanstha</th>
                  {/* <th>Event</th> */}
                  <th>Event</th>
                  {/* <th>Description </th> */}
                  <th>Category </th>
                  <th>Status</th>
                  {/* <th>Location </th> */}
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th
                    data-column-id="commands"
                    data-formatter="commands"
                    data-sortable="false"
                  >
                    <div></div>
                  </th>
                </tr>
              </thead>
              {event.data &&
                event.data.map((value, index) => {
                  return (
                    <tbody key={index}>
                      <tr>
                        <td style={{
                              maxWidth: "150px",
                              wordWrap: "break-word",
                              whiteSpace: "normal",
                              textTransform: "capitalize",
                            }}>
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
                        <td style={{
                              maxWidth: "150px",
                              wordWrap: "break-word",
                              whiteSpace: "normal",
                              textTransform: "capitalize",
                            }}>
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
                        <td  style={{
                            maxWidth: "150px",
                            wordWrap: "break-word",
                            whiteSpace: "normal",
                             textTransform: "capitalize",
                          }}>
                           <PostPreview value={value} />
                          {/* <img
                            src={value?.file}
                            alt="event"
                            style={{
                              width: "50px",
                              height: "50px",
                              borderRadius: "50%",
                            }}
                          /> */}
                          {/* <br /> */}
                          <span
                          >
                            {value.title}
                          </span>
                        </td>
                        {/* <td
                          style={{
                            maxWidth: "150px",
                            wordWrap: "break-word",
                            whiteSpace: "normal",
                            textTransform: "capitalize",
                          }}
                        >
                          {value?.title}
                        </td> */}
                        {/* <td>{value.description}</td> */}
                        <td>{value.category}</td>

                        {/* <td>
                          {event.data.locationType == "Physical" ? (
                            <>
                              {value?.nativePlaceAddress && value?.nativeArea && (
                                <>
                                  {value.nativePlaceAddress}, {value.nativeArea}
                                </>
                              )}
                              <br />
                              {value?.nativeBlock &&
                                value?.nativeDistrict &&
                                value?.nativeState &&
                                value?.nativePlacePincode && (
                                  <>
                                    <span>
                                      {value.nativeBlock},{" "}
                                      {value.nativeDistrict},{" "}
                                      {value.nativeState}{" "}
                                      {value.nativePlacePincode}
                                    </span>
                                  </>
                                )}
                            </>
                          ) : (
                            <>{value?.virtualLink}</>
                          )}
                        </td> */}
                        <td>  <span
                            className={`badge ${
                              value?.status === "Upcoming"
                                ? "badge-warning  "
                                : value?.status === "Active"
                                ? "badge-success"
                                : value?.status === "Completed"
                                ? "badge-danger"
                                : "badge-light"
                            }`}
                          >
                            {value?.status || "N/A"}
                          </span></td>
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
                          {new Date(value.endDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>

                        {/* <td className="text-center align-middle">
                          {value?.userId ? (
                            <>
                              {value?.userId && (
                                <img
                                  src={value.userId.profilePic}
                                  alt="user"
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                  }}
                                />
                              )}
                              <br />
                              {value.userId.firstName} {value.userId.lastName}
                            </>
                          ) : (
                            <span> Admin</span>
                          )}
                        </td> */}

                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-info mr-2 command-edit"
                            data-row-id="10253"
                            onClick={() =>
                              navigate(`/event/edit/${value?._id}`)
                            }
                          >
                            <em className="fa fa-edit fa-fw"></em>
                          </button>
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
                          <button
                            type="button"
                            className="btn btn-sm btn-danger command-delete"
                            data-row-id="10253"
                            onClick={() => handleDeleteEvent(value?._id)}
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
                                      width: "150px",
                                      maxHeight: "150px",
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
                                      width: "150px",
                                      maxHeight: "150px",
                                      borderRadius: "10px",
                                      objectFit: "cover",
                                      marginLeft: "5px",
                                    }}
                                  />
                                )}
                              </div>
                            )
                          )}
                          {/* {eventDetails.event_photo_upload.map((photo, index) => (
                <div key={index} className="col-md-3 mb-3">
                  <div 
                    className="card" 
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      const syntheticEvent = {
                        target: {
                          closest: () => document.querySelector(`[data-index="${index}"]`)
                        }
                      };
                      
                      const previewElement = document.querySelector(`[data-index="${index}"]`);
                      if (previewElement) {
                        previewElement.click();
                      }
                    }}
                  >
                    {photo.type === "video/mp4" || photo.url?.endsWith(".mp4") || photo.url?.endsWith(".webm") ? (
                      <video 
                        style={{ 
                          width: "100%", 
                          height: "200px", 
                          borderRadius: "5px", 
                          objectFit: "cover" 
                        }} 
                        src={photo.url} 
                        muted
                      />
                    ) : (
                      <img 
                        src={photo.url} 
                        alt="event upload" 
                        style={{ 
                          width: "100%", 
                          height: "200px", 
                          borderRadius: "5px", 
                          objectFit: "cover" 
                        }} 
                      />
                    )}
                    <div className="card-body">
                      <p className="card-text">
                        {photo.caption || `Photo ${index + 1}`}
                      </p>
                    </div>
                    
                    <div style={{ display: "none" }}>
                      <PostPreview 
                        value={{ 
                          file: photo.url, 
                           caption: photo.caption 
                        }} 
                      />
                    </div>
                  </div>
                </div>
              ))} */}
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
              <>
              <div
                key={participant.userId._id}
                className="flex items-center gap-3 p-2 bg-gray-100 rounded-lg"
              >
                <img
                  src={participant?.userId?.profilePic || "/img/user.jpg"}
                  alt={participant?.userId?.firstName}
                  className="rounded-full object-cover"
                  height={70}
                  width={70}
                />
                <div>
                  <p className="font-medium">
                    {participant.userId.firstName} {participant.userId.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {participant.userId.mobile}
                  </p>
                </div>
              </div>
              </>
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
                    src={participant.userId.profilePic || "/img/user.jpg"}
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

                {/* <div className="text-muted mt-3">
            <small>Created: {new Date(eventDetails.createdAt).toLocaleString()}</small>
            <br />
            <small>Updated: {new Date(eventDetails.updatedAt).toLocaleString()}</small>
          </div> */}
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
    </>
  );
}

export default TableFilter;
