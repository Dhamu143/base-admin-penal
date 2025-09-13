import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useNavigate, useParams } from "react-router-dom";
import swal from "sweetalert";
import PageLoader from "../../components/PageLoader/PageLoader";
import Paginate from "../../components/pagination/paginate";
import Select from "react-select";
import { appAllGetHubs } from "../../store/hubs";
import { appGetAllSanstha } from "../../store/sanstha";
import { appAllGetFundrasing } from "../../store/fundrasing";
import ReceiptPDF from "../../components/filegenerate/filegenerate";

function TableFilter() {
  const dispatch = useDispatch();
  const params = useParams();
  // const navigate = useNavigate();

  const [page, setPage] = useState(params.page || 1);
//   const [dateRange, setDateRange] = useState([null, null]);
// const [startDate, endDate] = dateRange;
  // const [showUserModal, setShowUserModal] = useState(false);
  // const [rejectionReason, setRejectionReason] = useState("");
  // const [rejectionError, setRejectionError] = useState("");
  // const [rejectedId, setRejectedId] = useState(null);
  // const facilitylist = useSelector(
  //   (state) => state.facilitybookingReducer.facilitylist
  // );
  // const contribution = useSelector(
  //   (state) => state.contributionReducer.contribution
  // );
  // console.log(contribution);
  const paginate = useSelector((state) => state.fundrasingReducer.paginate);
  const isloder = useSelector((state) => state?.facilitybookingReducer.isloder);
  const hub = useSelector((state) => state?.hubReducer.hub);
  const sanstha = useSelector((state) => state?.sansthaReducer.sanstha);
  const fundrasing = useSelector(
    (state) => state?.fundrasingReducer.fundrasing
  );
  // console.log("fundrasing", fundrasing);
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({
    sanstha: null,
    hub: null,
    contributionType: null,
    startDate: null,
    endDate: null,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    // dispatch(appAllGetFundrasing({ page: 1, limit: 10 }));
    dispatch(appGetAllSanstha({ page: 1, limit: 1000 }));
    dispatch(appAllGetHubs({ page: 1, limit: 1000 }));
  }, []);

  useEffect(() => {
    const searchParams = {
      ...activeFilters,
      page,
      limit: 10,
    };
    console.log(searchParams);
    dispatch(appAllGetFundrasing(searchParams));
    // navigate(`/contribution/${page}`);
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
    if (selectedFilters.contributionType) {
      filters.contributionType = selectedFilters.contributionType;
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

  // const handleDeleteContribution = (id) => {
  //   swal({
  //     title: "Are you sure?",
  //     text: "You want to delete this Contribution?",
  //     icon: "warning",
  //     buttons: true,
  //     dangerMode: true,
  //   }).then((willDelete) => {
  //     if (willDelete) {
  //       dispatch(appDeleteContribution(id)).then(() => {
  //         dispatch(appAllGetContribution({ page: 1, limit: 10 }));
  //       });
  //     }
  //   });
  // };

  // const handleAcceptedContribution = (id) => {
  //   swal({
  //     title: "Are you sure?",
  //     text: "This issue has been resolved?",
  //     icon: "warning",
  //     buttons: true,
  //     dangerMode: true,
  //   }).then((willAccept) => {
  //     if (willAccept) {
  //       dispatch(appUpdateContribution({ id, status: "Accepted" })).then(() => {
  //         dispatch(appAllGetContribution({ page: 1, limit: 10 }));
  //       });
  //     }
  //   });
  // };

  // const handleRejectedContribution = (id) => {
  //   setRejectedId(id);
  //   setShowUserModal(true);
  // };
  // const hnadleSubmitRected = () => {
  //   if (!rejectionReason.trim()) {
  //     setRejectionError("Reason is required.");
  //     return;
  //   }
  //   setRejectionError("");
  //   dispatch(
  //     appUpdateContribution({
  //       id: rejectedId,
  //       rejectionreason: rejectionReason,
  //       status: "Rejected",
  //     })
  //   ).then(() => {
  //     dispatch(appAllGetContribution({ page: 1, limit: 10 }));
  //   });
  //   setShowUserModal(false);
  //   setRejectionReason("");
  //   setRejectedId(null);
  // };

  // const handleCloseModal = () => {
  //   setShowUserModal(false);
  //   setRejectionReason("");
  //   setRejectionError("");
  //   setRejectedId(null);
  // };

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
                <label>Contribution Type</label>
                <select
                  className="form-control"
                  name="contributionType"
                  value={selectedFilters.contributionType || ""}
                  onChange={(e) => {
                    setSelectedFilters((prev) => ({
                      ...prev,
                      contributionType: e.target.value || null,
                    }));
                  }}
                >
                  <option value="">Select Contribution Type</option>
                  <option value="Membership Subscription">
                    Membership Subscription
                  </option>
                  <option value="Boli Contributions">Boli Contributions</option>{" "}
                  <option value="Social Project Donations">
                    Social Project Donations
                  </option>{" "}
                  <option value="Voluntary Contribution">
                    Voluntary Contribution
                  </option>
                  <option value="Sales/Service Collections">
                    Sales/Service Collections
                  </option>
                    <option value="Facility Booking">
                   Facility Booking
                  </option>
                </select>
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
            prev.endDate && prev.endDate < value ? "" : prev.endDate,
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
                    endDate: null
                  });
                  setActiveFilters({});
                  setPage(1);
                  // dispatch(appAllGetContribution({ page: 1, limit: 10 }));
                }}
              >
                <em className="fas fa-redo"></em> Reset
              </button>
            </div>
            <div className="col text-right">
              <div style={{ fontSize: "18px" }}>
                Total Fundraising : ₹ {fundrasing?.totalAmount}
              </div>
            </div>
          </div>

          <div className="table-responsive bootgrid">
            <table className="table table-hover" id="bootgrid-command">
              <thead>
                <tr>
                  <th>Community</th>
                  <th>Sanstha</th>
                  <th>User</th>
                  <th>Contribution Type</th>
                  <th>Payment Screenshot</th>
                  <th>Online/Offline</th>
                  <th>Amount</th>
                  <th>Payment Date</th>
                  {/* <th>Status</th> */}
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
              {fundrasing?.data &&
                fundrasing?.data.map((value, index) => {
                  return (
                    <tbody key={index}>
                      <tr>
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
                          {value.userId.firstName} {value.userId.lastName}
                          <br />
                          <small>{value.userId.mobile}</small>
                        </td>
                        <td>
                          {/* <img
                              src={value.facility?.facilityLogo}
                              // src="/img/images.png"
                              alt="user"
                              style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                              }}
                            /> */}
                          <br />
                          {value.fundraisingType}
                        </td>
                        <td>
                          <img
                            src={value?.paymentScreenshot}
                            // src="/img/images.png"
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
                            <span className="badge badge-primary">Online</span>
                          ) : (
                            <span className="badge badge-primary">Offline</span>
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
                        <ReceiptPDF data={value?._id}/>
                          </td>
                         {/* <button
                              type="button"
                              className="btn btn-sm btn-primary command-delete"
                              // onClick={() =>
                                
                              // }
                            >
                            <i
                              className="fa fa-download"
                            ></i>
                            </button> */}
                       
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
      {/* {showUserModal && (
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
      )} */}
    </>
  );
}

export default TableFilter;
