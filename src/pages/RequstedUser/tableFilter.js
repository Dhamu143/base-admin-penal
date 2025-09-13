import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import swal from "sweetalert";
import {
  appAcceptsansthaMembership,
  appDeletesansthaMembership,
  appGetAllSanstha,
  appRejctedsansthaMembership,
} from "../../store/sanstha";
import Paginate from "../../components/pagination/paginate";
import Select from "react-select";
import { appAllGetHubs } from "../../store/hubs";
import { appPendingMembership } from "../../store/pendingmembers";

function TableFilter() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const id = useParams();
  const params = useParams();
  const [showUserModal, setShowUserModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState("");
  const [rejectedId, setRejectedId] = useState(null);
  const [page, setPage] = useState(params.page || 1);
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({
    sanstha: null,
    hub: null,
    startDate: null,
    endDate: null,
  });
  const [error, setError] = useState("");
  const hub = useSelector((state) => state?.hubReducer.hub);
  const sanstha = useSelector((state) => state?.sansthaReducer.sanstha);
  const paginate = useSelector(
    (state) => state.PendingMembershipReducer.paginate
  );
  console.log(paginate);
  const pendingMembership = useSelector(
    (state) => state.PendingMembershipReducer.pendingMembership
  );
  // console.log(pendingMembership)
  useEffect(() => {
    // dispatch(appPendingMembership({page: page, limit: 10}));
    dispatch(appGetAllSanstha({ page: 1, limit: 1000 }));
    dispatch(appAllGetHubs({ page: 1, limit: 1000 }));
  }, [page]);
  useEffect(() => {
    const searchParams = {
      ...activeFilters,
      page,
      limit: 10,
    };
    // console.log(searchParams)
    dispatch(appPendingMembership(searchParams));
    navigate(`/requsteduser/${page}`);
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

  const handleDeletesansthaMembership = (membershipId) => {
    console.log(membershipId);
    swal({
      title: "Are you sure?",
      text: "You want to delete this Sanstha Membership?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        dispatch(
          appDeletesansthaMembership({
            //   sansthaId: sansthaDetails?._id,
            id: membershipId,
          })
        ).then(() => {
          dispatch(appPendingMembership({ page: 1, limit: 10 }));
        });
      }
    });
  };

  const handleRejectedsansthaMembership = (id) => {
    setRejectedId(id);
    setShowUserModal(true);
  };

  const handleAcceptedsansthaMembership = (item) => {
    console.log(item);
    swal({
      title: "Are you sure?",
      text: "Are you sure you want to approve this membership request?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willAccept) => {
      if (willAccept) {
        dispatch(appAcceptsansthaMembership({ membershipId: item?._id })).then(
          () => {
            dispatch(appPendingMembership({ page: 1, limit: 10 }));
          }
        );
      }
    });
  };

  const hnadleSubmitRected = () => {
    if (!rejectionReason.trim()) {
      setRejectionError("Reason is required.");
      return;
    }
    setRejectionError("");
    dispatch(
      appRejctedsansthaMembership({
        membershipId: rejectedId,
        rejectionreason: rejectionReason,
      })
    ).then(() => {
      dispatch(appPendingMembership({ page: 1, limit: 10 }));
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
                  value={selectedFilters.startDate || ""}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedFilters((prev) => ({
                      ...prev,
                      startDate: value,
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
                  // dispatch(appAllGetFacilityBooking({ page: 1, limit: 10 }));
                }}
              >
                <em className="fas fa-redo"></em> Reset
              </button>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th>Community</th>
                  <th>Sanstha</th>
                  <th>User</th>
                  <th data-column-id="sender">Mobile number </th>
                  <th>Membership Type</th>
                  <th>Amount</th>
                  <th data-column-id="received" data-order="desc">
                    Documents
                  </th>
                  <th data-column-id="received" data-order="desc">
                    Apply Date
                  </th>
                  <th>Existing Member</th>
                  <th data-column-id="received" data-order="desc">
                    Status
                  </th>
                  <th data-column-id="received" data-order="desc">
                    Resolve Date
                  </th>
                  <th
                    data-column-id="commands"
                    data-formatter="commands"
                    data-sortable="false"
                  >
                    Action
                    <div></div>
                  </th>
                </tr>
              </thead>
              {pendingMembership.data?.map((item) => (
                <tbody>
                  <tr>
                    <td>
                      <img
                        src={item?.hub?.image}
                        alt="hub"
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                        }}
                      />
                      <br />
                      {item?.hub?.name}
                    </td>
                    <td>
                      {" "}
                      <img
                        src={item?.sansthaId?.image}
                        alt="user"
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                        }}
                      />
                      <br />
                      {item?.sansthaId?.name}
                    </td>
                    <td>
                      {item?.userId?.profilePic ? (
                        <img
                          src={item?.userId?.profilePic}
                          alt="user"
                          height={50}
                          width={50}
                        />
                      ) : (
                        <img
                          src="/img/user.jpg"
                          alt="user"
                          height={50}
                          width={50}
                        />
                      )}
                      <br />
                      {item?.userId?.firstName} {item?.userId?.lastName}
                    </td>

                    <td> {item?.userId?.mobile}</td>
                    <td> {item?.membershipType}</td>
                    <td>
                      {" "}
                      ₹{" "}
                      <span style={{ fontWeight: "bold" }}>{item?.amount}</span>
                    </td>
                    <td>
                      {item?.paymentScreenshot && (
                        <img
                          className="ml-2"
                          src={item?.paymentScreenshot}
                          alt="user"
                          height={50}
                          width={50}
                        />
                      )}

                      {item?.membershipCard && (
                        <img
                          className="ml-2"
                          src={item?.membershipCard}
                          alt="user"
                          height={50}
                          width={50}
                        />
                      )}
                      {item?.membershipFeeReceipt && (
                        <img
                          className="ml-2"
                          src={item?.membershipFeeReceipt}
                          alt="user"
                          height={50}
                          width={50}
                        />
                      )}
                      {item?.otherDocuments && (
                        <img
                          className="ml-2"
                          src={item?.otherDocuments}
                          alt="user"
                          height={50}
                          width={50}
                        />
                      )}
                    </td>
                    <td>
                      {item.updatedAt &&
                        new Date(item.updatedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                    </td>
                    <td>
                      {(item?.existingMember === true ||
                        item?.existingMember === "true") && (
                        <span className="badge badge-primary">Yes</span>
                      )}
                      {(item?.existingMember === false ||
                        item?.existingMember === "false") && (
                        <span className="badge badge-primary">No</span>
                      )}
                    </td>

                    <td>
                      {item?.status === "Pending" && (
                        <span className="badge badge-primary">Pending</span>
                      )}
                      {item?.status === "Accepted" && (
                        <span className="badge badge-success">Accepted</span>
                      )}
                      {item?.status === "Rejected" && (
                        <span className="badge badge-danger">Rejected</span>
                      )}
                    </td>
                    <td>
                      {item.resolveDate &&
                        new Date(item.resolveDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                    </td>
                    <td>
                      {item.status === "Pending" ? (
                        <div style={{ display: "flex", gap: "5px" }}>
                          <button
                            type="button"
                            className="btn btn-sm btn-green command-delete"
                            data-row-id="10253"
                            onClick={() =>
                              handleAcceptedsansthaMembership(item)
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
                            data-row-id="10253"
                            onClick={() =>
                              handleRejectedsansthaMembership(item?._id)
                            }
                          >
                            <i className="fa fa-ban" aria-hidden="true">
                              {" "}
                              Reject
                            </i>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-sm btn-danger command-delete"
                          data-row-id="10253"
                          onClick={() =>
                            handleDeletesansthaMembership(item?._id)
                          }
                        >
                          <em className="fa fa-trash fa-fw"></em>
                        </button>
                      )}
                    </td>
                  </tr>
                </tbody>
              ))}
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
