import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import swal from "sweetalert";
import PageLoader from "../../components/PageLoader/PageLoader";
import Paginate from "../../components/pagination/paginate";
import Select from "react-select";
import { appAllGetHubs } from "../../store/hubs";
import { appGetAllSanstha } from "../../store/sanstha";
import {
  appAllGetSocialProjectBooking,
  appDeleteSocialProjectBooking,
  appUpdateSocialProjectBooking,
} from "../../store/socialprojectbooking";

function TableFilter() {
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();

  const [page, setPage] = useState(params.page || 1);
  const [showUserModal, setShowUserModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState("");
  const [rejectedId, setRejectedId] = useState(null);
  const { socialrojectbookinglist } = useSelector((state) => state.socialprojectbookingReducer);
  const paginate = useSelector((state) => state.socialprojectbookingReducer.paginate);
  const isloder = useSelector((state) => state?.socialprojectbookingReducer.isloder);
  const hub = useSelector((state) => state?.hubReducer.hub);
  const sanstha = useSelector((state) => state?.sansthaReducer.sanstha);
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({
    sanstha: null,
    hub: null,
    startDate: null,
    endDate: null,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    dispatch(appGetAllSanstha({ page: 1, limit: 1000 }));
    dispatch(appAllGetHubs({ page: 1, limit: 1000 }));
    dispatch(appAllGetSocialProjectBooking({ page: 1, limit: 10 }));
  }, []);

  useEffect(() => {
    const searchParams = {
      ...activeFilters,
      page,
      limit: 10,
    };
    // console.log(searchParams)
    dispatch(appAllGetSocialProjectBooking(searchParams));
    navigate(`/socialproject-donation/${page}`);
  }, [page, activeFilters]);

  const handleSearch = useCallback(() => {
    if (selectedFilters.startDate && !selectedFilters.endDate) {
      setError("Please select an end date.");
      return;
    }

    setError("");
    const filters = {};
    if (selectedFilters.hub) {
      filters.hub = selectedFilters.hub.value;
    }
    if (selectedFilters.sanstha) {
      filters.sanstha = selectedFilters.sanstha.value;
    }
    if (selectedFilters.startDate) {
      filters.startDate = selectedFilters.startDate;
    }
    if (selectedFilters.endDate) {
      filters.endDate = selectedFilters.endDate;
    }
    setActiveFilters(filters);
    setPage(1);
  }, [selectedFilters]);

  const handleDeleteSocialProjectBooking = (id) => {
    swal({
      title: "Are you sure?",
      text: "You want to delete this Social Project Booking?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        dispatch(appDeleteSocialProjectBooking(id)).then(() => {
          dispatch(appAllGetSocialProjectBooking({ page: 1, limit: 10 }));
        });
      }
    });
  };

  const handleAcceptedSocialProjectBooking = (id) => {
    swal({
      title: "Are you sure?",
      text: "This issue has been resolved?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willAccept) => {
      if (willAccept) {
        dispatch(
          appUpdateSocialProjectBooking({ id, status: "Accepted" })
        ).then(() => {
          dispatch(appAllGetSocialProjectBooking({ page: 1, limit: 10 }));
        });
      }
    });
  };

  const handleRejectedSocialProjectBooking = (id) => {
    setRejectedId(id);
    setShowUserModal(true);
  };
  const hnadleSubmitRected = () => {
    if (!rejectionReason.trim()) {
      setRejectionError("Reason is required.");
      return;
    }
    setRejectionError("");
    dispatch(
      appUpdateSocialProjectBooking({
        id: rejectedId,
        rejectionreason: rejectionReason,
        status: "Rejected",
      })
    ).then(() => {
      dispatch(appAllGetSocialProjectBooking({ page: 1, limit: 10 }));
    });
    setShowUserModal(false);
    setRejectionReason("");
    setRejectedId(null);
  };

  const handleCloseModal = () => {
    setShowUserModal(false);
    setRejectionReason("");
    setRejectionError("");
    setRejectedId(null);
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
                  // onChange={handleHubChange}
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
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  max={new Date().toISOString().split("T")[0]}
                  value={selectedFilters.startDate || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedFilters((prev) => ({
                      ...prev,
                      startDate: value,
                      // Clear endDate if it's before the new startDate
                      endDate:
                        prev.endDate && prev.endDate < value
                          ? ""
                          : prev.endDate,
                    }));
                  }}
                />
              </div>
            </div>

            <div className="col-md-2">
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  className="form-control"
                  min={selectedFilters.startDate || ""}
                  max={new Date().toISOString().split("T")[0]}
                  value={selectedFilters.endDate || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedFilters((prev) => ({
                      ...prev,
                      endDate: value,
                    }));
                    if (value) {
                      setError("");
                    }
                  }}
                />
                {error && <span className="text-danger">{error}</span>}
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
                    sanstha: null,
                    hub: null,
                    startDate: null,
                    endDate: null,
                  });
                  setActiveFilters({});
                  setPage(1);
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
                  <th>User</th>
                  <th>Social Project</th>
                  <th>Payment Screenshot</th>
                  <th>Online/Offline</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
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
              {socialrojectbookinglist?.data &&
                socialrojectbookinglist?.data.map((value, index) => {
                  return (
                    <tbody key={index}>
                      <tr>
                        <td>
                          {value?.hub ? (
                            <>
                              <img
                                src={value.hub.image}
                                alt="Community"
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  borderRadius: "50%",
                                }}
                              />
                              <br />
                              {value.hub.name}
                            </>
                          ) : null}
                        </td>
                        <td>
                          {value?.sansthaId ? (
                            <>
                              <img
                                src={value.sansthaId.image}
                                alt="sanstha"
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  borderRadius: "50%",
                                }}
                              />
                              <br />
                              {value.sansthaId.name}
                            </>
                          ) : null}
                        </td>
                        <td>
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
                          {value?.userId?.firstName} {value?.userId?.lastName}
                          <br />
                          <small>{value?.userId?.mobile}</small>
                        </td>
                        <td>{value?.project?.title}</td>
                        <td>
                          <img
                            src={value.paymentScreenshot}
                            // src="/img/images.png"
                            alt="paymentscreenshot"
                            style={{
                              width: "50px",
                              height: "50px",
                              borderRadius: "50%",
                            }}
                          />
                          <br />
                          {value.facility?.facilityName}
                        </td>
                        <td>
                          {value.isOffline}
                          {value?.isOffline === true ? (
                            <span className="badge badge-primary">Offline</span>
                          ) : (
                            <span className="badge badge-primary">Online</span>
                          )}
                        </td>
                        <td>
                          ₹
                          <span style={{ fontWeight: "bold" }}>
                            {value.amount}
                          </span>{" "}
                          <br />
                          {value?.paymentMode && (
                            <small>Mode: {value?.paymentMode}</small>
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
                          {value?.status === "Pending" && (
                            <span className="badge badge-primary">Pending</span>
                          )}
                          {value?.status === "Accepted" && (
                            <span className="badge badge-success">
                              Accepted
                            </span>
                          )}
                          {value?.status === "Rejected" && (
                            <span className="badge badge-danger">Rejected</span>
                          )}
                        </td>
                        <td>
                          {value.status === "Pending" && (
                            <div style={{ display: "flex", gap: "5px" }}>
                              <button
                                type="button"
                                className="btn btn-sm btn-green command-delete"
                                onClick={() =>
                                  handleAcceptedSocialProjectBooking(value?._id)
                                }
                              >
                                <i className="fa fa-check" aria-hidden="true">
                                  {" "}
                                  Accept
                                </i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-danger command-delete"
                                onClick={() =>
                                  handleRejectedSocialProjectBooking(value?._id)
                                }
                              >
                                <i className="fa fa-ban" aria-hidden="true">
                                  {" "}
                                  Reject
                                </i>
                              </button>
                            </div>
                          )}
                          {value.status === "Rejected" && (
                            <button
                              type="button"
                              className="btn btn-sm btn-danger command-delete"
                              onClick={() =>
                                handleDeleteSocialProjectBooking(value?._id)
                              }
                            >
                              <em className="fa fa-trash fa-fw"></em>
                            </button>
                          )}
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
                <h5 className="modal-title"> Rejection </h5>
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
                  <label>Reason of rejection</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows="3"
                  />
                  {rejectionError && (
                    <div style={{ color: "red", marginTop: "5px" }}>
                      {rejectionError}
                    </div>
                  )}
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
                  onClick={hnadleSubmitRected}
                  // disabled={!rejectionReason.trim()}
                >
                  Submit
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
