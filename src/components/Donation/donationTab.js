import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import swal from "sweetalert";
import PageLoader from "../PageLoader/PageLoader";
import {
  appAcceptsansthaMembership,
  appDeletesansthaMembership,
  appPendingMembershipList,
  appRejctedsansthaMembership,
} from "../../store/sanstha";

function DonationTab({ sansthaDetails }) {
  // console.log(sansthaDetails)
  const dispatch = useDispatch();
  // const navigate = useNavigate();
  const id = useParams();
  // const params = useParams();
  // const [page, setPage] = useState(params.page || 1);
  const [showUserModal, setShowUserModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState("");
  const [rejectedId, setRejectedId] = useState(null);

  const pendingMembershipList = useSelector(
    (state) => state.sansthaReducer.pendingMembershipList
  );
  //  console.log(pendingMembershipList)
  useEffect(() => {
    dispatch(appPendingMembershipList(id));
  }, []);

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
          dispatch(appPendingMembershipList(id));
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
            dispatch(appPendingMembershipList(id));
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
      dispatch(appPendingMembershipList(id));
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
    <div>
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              {/* <th>Requested Date</th> */}
              <th>User</th>
              <th data-column-id="sender">Mobile number </th>
              <th>Membership Type</th>
              <th data-column-id="received" data-order="desc">
                Documents
              </th>
              {/* {activeTab === "requestedcommunity" && (
                    <th data-column-id="received" data-order="desc">
                      New Requested Community
                    </th>
                  )} */}
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
          {pendingMembershipList?.map((item) => (
            <tbody>
              <tr>
                {/* <td>
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td> */}
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
                    <>
                      <button
                        type="button"
                        className="btn btn-sm btn-green command-delete ml-1 mr-1"
                        data-row-id="10253"
                        onClick={() => handleAcceptedsansthaMembership(item)}
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
                    </>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-sm btn-danger command-delete"
                      data-row-id="10253"
                      onClick={() => handleDeletesansthaMembership(item?._id)}
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
    </div>
  );
}

export default DonationTab;
