import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import swal from "sweetalert";
import PageLoader from "../../components/PageLoader/PageLoader";
import Paginate from "../../components/pagination/paginate";
import {
  appAllGetRequestedHubs,
  appDeleteRequestedHub,
  appUpdateRequsted,
} from "../../store/requestedhub";

function TableFilter() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const [page, setPage] = useState(params.page || 1);
  const [activeTab, setActiveTab] = useState("communitycasterequsted");
  const [showUserModal, setShowUserModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState("");
  const [rejectedId, setRejectedId] = useState(null);
  const [acceptedId, setAcceptedId] = useState(null);
  const [modalType, setModalType] = useState("");

  const requestedhub = useSelector(
    (state) => state.requestedhubReducer.requestedhub
  );
  const paginate = useSelector((state) => state.requestedhubReducer.paginate);
  const isloder = useSelector((state) => state.requestedhubReducer.isloder);
  const isdeleted = useSelector((state) => state.requestedhubReducer.isdeleted);

  // useEffect(() => {
  //   dispatch(appAllGetRequestedHubs({ page }));
  //   navigate(`/hub-requested/${page}`);
  // }, [page, isdeleted]);

  useEffect(() => {
    if (activeTab === "communitycasterequsted") {
      dispatch(appAllGetRequestedHubs({ hubswitchrequested: false }));
    } else if (activeTab === "requestedcommunity") {
      dispatch(appAllGetRequestedHubs({ hubswitchrequested: true }));
    }
    navigate(`/hub-requested/${page}`);
  }, [ activeTab]);

  const handleDeleteRequestedHub = (id) => {
    swal({
      title: "Are you sure?",
      text: "You want to delete this requested community?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        dispatch(appDeleteRequestedHub(id));
      }
    });
  };

  const handleAcceptedRequestedHub = (id) => {
    swal({
      title: "Are you sure?",
      text: "This issue has been resolved?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willAccept) => {
      if (willAccept) {
        dispatch(appUpdateRequsted({ id, status: "Accepted" })).then(() => {
          if (activeTab === "communitycasterequsted") {
            dispatch(appAllGetRequestedHubs({ hubswitchrequested: false }));
          } else if (activeTab === "requestedcommunity") {
            dispatch(appAllGetRequestedHubs({ hubswitchrequested: true }));
          }
        });
      }
    });
  };

  const handleRejectedRequestedHub = (id) => {
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
      appUpdateRequsted({
        id: rejectedId,
        rejectionreason: rejectionReason,
        status: "Rejected",
      })
    ).then(() => {
      if (activeTab === "communitycasterequsted") {
        dispatch(appAllGetRequestedHubs({ hubswitchrequested: false }));
      } else if (activeTab === "requestedcommunity") {
        dispatch(appAllGetRequestedHubs({ hubswitchrequested: true }));
      }
    });
    setShowUserModal(false);
    setRejectionReason("");
    setRejectedId(null);
  };

const handleSubmitReason = () => {
  if (!rejectionReason.trim()) {
    setRejectionError("Reason is required.");
    return;
  }
  setRejectionError("");

  let payload = {};

  if (activeTab === "communitycasterequsted") {
    payload = {
      id: acceptedId,
      acceptanceReason: rejectionReason,
      status: "Accepted",
    };
  } else if (activeTab === "requestedcommunity") {
    payload = {
      id: rejectedId,
      rejectionreason: rejectionReason, 
      status: "Rejected",
    };
  }

  dispatch(appUpdateRequsted(payload)).then(() => {
    if (activeTab === "communitycasterequsted") {
      dispatch(appAllGetRequestedHubs({ hubswitchrequested: false }));
    } else if (activeTab === "requestedcommunity") {
      dispatch(appAllGetRequestedHubs({ hubswitchrequested: true }));
    }
  });

  setShowUserModal(false);
  setRejectionReason("");
  setRejectedId(null);
  setAcceptedId(null);
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
      <div className="text-center mb-4">
        <div className="row card card-transparent" role="tabpanel">
          <ul
            className="nav nav-tabs nav-fill"
            role="tablist"
            style={{
              overflowX: "auto",
              overflowY: "hidden",
              whiteSpace: "nowrap",
              flexWrap: "nowrap",
              maxWidth: "100%",
              WebkitOverflowScrolling: "touch",
              display: "flex",
              // gap: "0.5rem",
            }}
          >
            <li className="nav-item" role="presentation">
              <a
                style={{ padding: "12px 50px" }}
                className={`nav-link bb0 bg-gray text-white ${
                  activeTab === "communitycasterequsted" ? "active" : ""
                }`}
                href="#communitycasterequsted"
                aria-controls="communitycasterequsted"
                role="tab"
                data-toggle="tab"
                aria-selected={activeTab === "communitycasterequsted"}
                onClick={() => setActiveTab("communitycasterequsted")}
              >
                <em className="far fa-file-alt fa-fw"></em> Community & Caste
                Requested
              </a>
            </li>
            <li className="nav-item" role="presentation">
              <a
                style={{ padding: "12px 50px" }}
                className={`nav-link bb0 bg-gray text-white ${
                  activeTab === "requestedcommunity" ? "active" : ""
                }`}
                href="#requestedcommunity"
                aria-controls="requestedcommunity"
                role="tab"
                data-toggle="tab"
                aria-selected={activeTab === "requestedcommunity"}
                onClick={() => setActiveTab("requestedcommunity")}
              >
                <em className="far fa-file-alt fa-fw"></em> Requested to switch
                Community
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="card dataTables_wrapper" id="communitycasterequsted">
        <div className="card-body">
          <div className="table-responsive bootgrid">
            <table className="table table-hover" id="bootgrid-command">
              <thead>
                <tr>
                  <th>Requested Date</th>
                  <th>User</th>
                  {/* <th>Mobile Number</th> */}
                  <th data-column-id="sender">Caste Name</th>
                  {/* {activeTab === "communitycasterequsted" && (
                    <th data-column-id="received" data-order="desc">
                      Other Community
                    </th>
                  )} */}
                  <th data-column-id="received" data-order="desc">
                    Language 
                    {/* <br/> Native Place
                    <br/> Religion  */}
                  </th>
                  <th data-column-id="received" data-order="desc">
                    Native Place
                  </th>
                  <th data-column-id="received" data-order="desc">
                    Religion Name
                  </th>
                  <th data-column-id="received" data-order="desc">
                    Note
                  </th>
                  <th data-column-id="received" data-order="desc">
                    New Requested 
                    Community
                  </th>
                  {activeTab === "requestedcommunity" && (
                    <th data-column-id="received" data-order="desc">
                      New Requested Community
                    </th>
                  )}

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

              {requestedhub?.map((item) => (
                <tbody>
                  <tr>
                    <td>
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td>
                      {item?.user?.profilePic ? (
                        <img
                          src={item?.user?.profilePic}
                          alt="user"
                          height={50}
                          width={50}
                        />
                      ) : (
                        // null
                        <img
                          src="/img/user.jpg"
                          alt="user"
                          height={50}
                          width={50}
                        />
                      )}
                      <br />
                      {item?.user?.firstName} {item?.user?.lastName}
                      <br />
                      {item?.user?.mobile}
                    </td>
                    {/* <td>{item?.user?.mobile}</td> */}

                    <td>{item?.caste}</td>
                    {/* {activeTab === "communitycasterequsted" && (
                      <td>
                         {item?.otherCommunityName}
                      </td>
                    )} */}
                    <td>{item?.language}
                      {/* <br/>{item?.nativeplace}<br/>{item?.religion} */}
                      </td>
                    <td>{item?.nativeplace}</td>
                    <td>{item?.religion}</td>
                    <td>{item?.significance}</td>
                    <td>
                      {" "}
                      {/* <img
                        src={item?.newHub?.image}
                        alt="community"
                        height={50}
                        width={50}
                      />
                       <br />  */}
                     {item?.otherCommunityName}
                    </td>
                    {activeTab === "requestedcommunity" && (
                      <td>
                        <img
                          src={item?.newHub?.image}
                          alt="community"
                          height={50}
                          width={50}
                        />
                        <br /> {item?.newHub?.name}
                      </td>
                    )}

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
  {activeTab === "communitycasterequsted" ? (
    <>
  {item.status === "Pending" ? (
    <>
     <button
  type="button"
  className="btn btn-sm btn-success ml-1 mr-1"
  onClick={() => {
    setAcceptedId(item?._id);
    setModalType("Resolved");
    setShowUserModal(true);
  }}
>
  <i className="fa fa-check" aria-hidden="true"> Resolved</i>
</button>
    </>
  ) : (
    <>
      <button
        type="button"
        className="btn btn-sm btn-danger"
        onClick={() => handleDeleteRequestedHub(item?._id)}
      >
        <em className="fa fa-trash fa-fw"></em>
      </button>
    </>

  )}
  </>
  ) : item.status === "Pending" ? (
    <>
      <button
        type="button"
        className="btn btn-sm btn-green ml-1 mr-1"
        onClick={() => handleAcceptedRequestedHub(item?._id)}
      >
        <i className="fa fa-check" aria-hidden="true"> Accept</i>
      </button>

      <button
  type="button"
  className="btn btn-sm btn-danger"
  onClick={() => {
    setRejectedId(item?._id);
     setModalType("Rejected");
    setShowUserModal(true);
  }}
>
  <i className="fa fa-ban" aria-hidden="true"> Reject</i>
</button>

    </>
  ) : (
    <button
      type="button"
      className="btn btn-sm btn-danger"
      onClick={() => handleDeleteRequestedHub(item?._id)}
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
          {/* {paginate && (
            <Paginate paginate={paginate} page={page} setPage={setPage} />
          )} */}
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
                <h5 className="modal-title">   {modalType === "Resolved" ? "Resolution" : "Rejection"}</h5>
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
                  <label>  {modalType === "Resolved"
        ? "Reason for resolution"
        : "Reason for rejection"}</label>
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
                  onClick={handleSubmitReason}
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
