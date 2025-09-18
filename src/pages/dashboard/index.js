import { Fragment, useContext, useEffect, useRef } from "react";
import { SocketContext } from "../../context/socket";
import { Link } from "react-router-dom";
import { appGetAllDashboard } from "../../store/dashboard";
import { useDispatch, useSelector } from "react-redux";

function Dashboard() {
  const socket = useContext(SocketContext);
  const dispatch = useDispatch();
  const dashboard = useSelector((state) => state?.dashboardReducer.dashboard);

  useEffect(() => {
    socket.connect();
    dispatch(appGetAllDashboard());
  }, []);

  return (
    <>
      <div className="content-wrapper">
        <div className="content-heading">
          <div className="d-flex align-items-center">
            <div className="mr-auto">
              <div className="">Dashboard</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row m-3">
        <div className="col-xl-3 col-lg-6 col-md-12 mb-4">
          <Link to="/user" style={{ textDecoration: "none" }}>
            <div
              className="dashboard-card bg-pink-light h-100"
              style={{ minHeight: "160px" }}
            >
              <div className="card-body h-100 d-flex flex-column justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="h2 mb-0">{dashboard?.userCount || 0}</div>
                    <div className="text-uppercase font-weight-bold">Users</div>
                    <span className="text-white">Registered users</span>
                  </div>
                  <div className="icon-wrapper">
                    <em className="icon-user fa-2x"></em>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-xl-3 col-lg-6 col-md-12 mb-4">
          <Link to="/payment-history" style={{ textDecoration: "none" }}>
            <div
              className="dashboard-card bg-warning-light h-100"
              style={{ minHeight: "160px" }}
            >
              <div className="card-body h-100 d-flex flex-column justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="h2 mb-0">₹ {dashboard?.totalFund || 0}</div>
                    <div className="text-uppercase font-weight-bold">
                      Total Fund
                    </div>
                    <span className="text-white">Total Fund</span>
                  </div>
                  <div className="icon-wrapper">
                    <em className="fas fa-donate fa-2x"></em>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-xl-3 col-lg-6 col-md-12 mb-4">
          <Link to="/event" style={{ textDecoration: "none" }}>
            <div
              className="dashboard-card bg-pink-light h-100"
              style={{ minHeight: "160px" }}
            >
              <div className="card-body h-100 d-flex flex-column justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="h2 mb-0">{dashboard?.event || 0}</div>
                    <div className="text-uppercase font-weight-bold">Event</div>
                    <span className="text-white">Event</span>
                  </div>
                  <div className="icon-wrapper">
                    <em className="fas fa-calendar-alt fa-2x"></em>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-xl-3 col-lg-6 col-md-12 mb-4">
          <Link to="/post" style={{ textDecoration: "none" }}>
            <div
              className="dashboard-card bg-info-light h-100"
              style={{ minHeight: "160px" }}
            >
              <div className="card-body h-100 d-flex flex-column justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="h2 mb-0">{dashboard?.post || 0}</div>
                    <div className="text-uppercase font-weight-bold">Post</div>
                    <span className="text-white">Post</span>
                  </div>
                  <div className="icon-wrapper">
                    <em className="fas fa-edit fa-2x"></em>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-xl-3 col-lg-6 col-md-12 mb-4">
          <Link to="/post" style={{ textDecoration: "none" }}>
            <div
              className="dashboard-card bg-danger-light h-100"
              style={{ minHeight: "160px" }}
            >
              <div className="card-body h-100 d-flex flex-column justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="h2 mb-0">
                      {dashboard?.postapprovalCountNumber || 0}
                    </div>
                    <div className="text-uppercase font-weight-bold">
                      Post Approval
                    </div>
                    <span className="text-white">Post Approval</span>
                  </div>
                  <div className="icon-wrapper">
                    <em className="fas fa-check-circle fa-2x"></em>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
