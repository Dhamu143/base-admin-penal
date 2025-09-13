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
        <div className="col-xl-3 col-md-6 mb-4">
          <Link to="/caste" style={{ textDecoration: 'none' }}>
              <div className="dashboard-card bg-info-light h-100" style={{ minHeight: "160px" }}>
              <div className="card-body h-100 d-flex flex-column justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="h2 mb-0">{dashboard?.casteCount || 0}</div>
                    <div className="text-uppercase font-weight-bold">Caste</div>
                    <span className="text-white">Total castes registered</span>
                  </div>
                  <div className="icon-wrapper">
                    <em className="icon-people fa-2x"></em>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <Link to="/community-setup" style={{ textDecoration: 'none' }}>
                  <div className="dashboard-card bg-purple-light h-100" style={{ minHeight: "160px" }}>
                  <div className="card-body h-100 d-flex flex-column justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="h2 mb-0">{dashboard?.hubCount || 0}</div>
                    <div className="text-uppercase font-weight-bold">
                      Community
                    </div>
                    <span className="text-white">Community hubs</span>
                  </div>
                  <div className="icon-wrapper">
                    <img
                      src="https://img.icons8.com/?size=100&id=ewXbzbHh1PgY&format=png&color=000000"
                      alt="sanstha"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

{/* 
        <div className="col-xl-3 col-lg-6 col-md-12 mb-4">
          <Link to="/hub-requested" style={{ textDecoration: "none" }}>
            <div className="dashboard-card bg-green-light">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="h2 mb-0">{dashboard?.hubrequestedCount || 0}</div>
                    <div className="text-uppercase font-weight-bold">Requested Community</div>
                    <span className="text-white">Total request community</span>
                  </div>
                  <div className="icon-wrapper">
                    <em className="icon-people fa-2x"></em>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

       <div className="col-xl-3 col-lg-6 col-md-12 mb-4">
          <Link to="/hub-requested" style={{ textDecoration: 'none' }}>
            <div className="dashboard-card bg-pink-light">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="h2 mb-0">{dashboard.hubswitchCount || 0}</div>
                    <div className="text-uppercase font-weight-bold">Requested to switch Community</div>
                    <span className="text-white">Total request to switch community</span>
                  </div>
                  <div className="icon-wrapper">
                    <em className="fas fa-hand-holding-heart fa-fw"></em>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div> */}

<div className="col-xl-3 col-lg-6 col-md-12 mb-4">
  <Link to="/hub-requested" style={{ textDecoration: 'none' }}>
    <div className="dashboard-card bg-danger-light h-100" style={{ minHeight: "160px" }}>
      <div className="card-body h-100 d-flex flex-column justify-content-between">
        <div className="d-flex align-items-center">
          <div className="flex-grow-1">
            <div className="h2 mb-0">{dashboard?.hubrequestedCount || 0}</div>
            <div className="text-uppercase font-weight-bold">Requested Community</div>
            <span className="text-white">Total request community</span>
          </div>
          <div className="icon-wrapper">
            <em className="icon-people fa-2x"></em>
          </div>
        </div>
      </div>
    </div>
  </Link>
</div>

<div className="col-xl-3 col-lg-6 col-md-12 mb-4">
  <Link to="/hub-requested" style={{ textDecoration: 'none' }}>
    <div className="dashboard-card bg-danger-light h-100" style={{ minHeight: "160px" }}>
      <div className="card-body h-100 d-flex flex-column justify-content-between">
        <div className="d-flex align-items-center">
          <div className="flex-grow-1">
            <div className="h2 mb-0">{dashboard?.hubswitchCount || 0}</div>
            <div className="text-uppercase font-weight-bold">Requested to switch Community</div>
            <span className="text-white">Total request to switch community</span>
          </div>
          <div className="icon-wrapper">
          <em className="icon-people fa-2x"></em>
          </div>
        </div>
      </div>
    </div>
  </Link>
</div>


      </div>

      <div className="row m-3">
      <div className="col-xl-3 col-lg-6 col-md-12 mb-4">
          <Link to="/sanstha" style={{ textDecoration: 'none' }}>
              <div className="dashboard-card bg-warning-light h-100" style={{ minHeight: "160px" }}>
              <div className="card-body h-100 d-flex flex-column justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="h2 mb-0">{dashboard?.sansthaCount || 0}</div>
                    <div className="text-uppercase font-weight-bold">Sanstha</div>
                    <span className="text-white">Organizations</span>
                  </div>
                  <div className="icon-wrapper">
                    <em className="icon-organization fa-2x"></em>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

      <div className="col-xl-3 col-lg-6 col-md-12 mb-4">
          <Link to="/user" style={{ textDecoration: 'none' }}>
              <div className="dashboard-card bg-pink-light h-100" style={{ minHeight: "160px" }}>
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
        {/* <div className="col-xl-3 col-lg-6 col-md-12 mb-4">
          <Link to="/event" style={{ textDecoration: 'none' }}>
            <div className="dashboard-card bg-green-light">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="h2 mb-0">{dashboard.eventCount || 0}</div>
                    <div className="text-uppercase font-weight-bold">Event</div>
                    <span className="text-white">Total events</span>
                  </div>
                  <div className="icon-wrapper">
                    <em className="icon-calendar fa-2x"></em>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div> */}

        {/* <div className="col-xl-3 col-lg-6 col-md-12 mb-4">
          <Link to="/donation" style={{ textDecoration: 'none' }}>
            <div className="dashboard-card bg-pink-light">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="h2 mb-0">{dashboard.donationCount || 0}</div>
                    <div className="text-uppercase font-weight-bold">Donation</div>
                    <span className="text-white">Total donations</span>
                  </div>
                  <div className="icon-wrapper">
                    <em className="fas fa-hand-holding-heart fa-fw"></em>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div> */}

        <div className="col-xl-3 col-lg-6 col-md-12 mb-4">
          <Link to="/sponsor" style={{ textDecoration: 'none' }}>
              <div className="dashboard-card bg-inverse-light h-100" style={{ minHeight: "160px" }}>
              <div className="card-body h-100 d-flex flex-column justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="h2 mb-0">
                      {dashboard?.sponsorCount || 0}
                    </div>
                    <div className="text-uppercase font-weight-bold">
                      Sponsors
                    </div>
                    <span className="text-white">Supporting partners</span>
                  </div>
                  <div className="icon-wrapper">
                    <em className="icon-badge fa-2x"></em>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-xl-3 col-lg-6 col-md-12 mb-4">
          <Link to="/payment-history" style={{ textDecoration: 'none' }}>
              <div className="dashboard-card bg-warning-light h-100" style={{ minHeight: "160px" }}>
              <div className="card-body h-100 d-flex flex-column justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="h2 mb-0">
                     ₹ {dashboard?.totalFund || 0} 
                    </div>
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

      </div>

      <div className="row m-3">
      <div className="col-xl-3 col-lg-6 col-md-12 mb-4">
          <Link to="/contribution" style={{ textDecoration: 'none' }}>
              <div className="dashboard-card bg-green-light h-100" style={{ minHeight: "160px" }}>
              <div className="card-body h-100 d-flex flex-column justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="h2 mb-0">{dashboard?.contribution || 0}</div>
                    <div className="text-uppercase font-weight-bold">Contribution</div>
                    <span className="text-white">Contribution</span>
                  </div>
                  <div className="icon-wrapper">
                    <em className="fas fa-hand-holding-usd fa-2x"></em>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

      <div className="col-xl-3 col-lg-6 col-md-12 mb-4">
          <Link to="/facility-booking" style={{ textDecoration: 'none' }}>
              <div className="dashboard-card bg-danger-light h-100" style={{ minHeight: "160px" }}>
              <div className="card-body h-100 d-flex flex-column justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="h2 mb-0">{dashboard?.facilityBooking || 0}</div>
                    <div className="text-uppercase font-weight-bold">Facility Booking</div>
                    <span className="text-white">Facility Booking</span>
                  </div>
                  <div className="icon-wrapper">
                    <em className="fas fa-building fa-2x"></em>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-xl-3 col-lg-6 col-md-12 mb-4">
          <Link to="/requsteduser" style={{ textDecoration: 'none' }}>
              <div className="dashboard-card bg-danger-light h-100" style={{ minHeight: "160px" }}>
              <div className="card-body h-100 d-flex flex-column justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="h2 mb-0">
                      {dashboard?.usersWaiting || 0}
                    </div>
                    <div className="text-uppercase font-weight-bold">
                  Members Waiting for Approval
                    </div>
                    <span className="text-white"> Members Waiting for Approval</span>
                  </div>
                  <div className="icon-wrapper">
                   <em className="fas fa-user-clock fa-2x"></em>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-xl-3 col-lg-6 col-md-12 mb-4">
          <Link to="/event" style={{ textDecoration: 'none' }}>
              <div className="dashboard-card bg-pink-light h-100" style={{ minHeight: "160px" }}>
              <div className="card-body h-100 d-flex flex-column justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="h2 mb-0">
                      {dashboard?.event || 0}
                    </div>
                    <div className="text-uppercase font-weight-bold">
                   Event
                    </div>
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
          <Link to="/boli-booking" style={{ textDecoration: 'none' }}>
              <div className="dashboard-card bg-danger-light h-100" style={{ minHeight: "160px" }}>
              <div className="card-body h-100 d-flex flex-column justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="h2 mb-0">
                      {dashboard?.boliBookingcount || 0}
                    </div>
                    <div className="text-uppercase font-weight-bold">
                   BoliBooking Count
                    </div>
                    <span className="text-white">BoliBooking Count</span>
                  </div>
                  <div className="icon-wrapper">
                    <em className="fas fa-receipt fa-2x"></em>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

          <div className="col-xl-3 col-lg-6 col-md-12 mb-4">
          <Link to="/post" style={{ textDecoration: 'none' }}>
              <div className="dashboard-card bg-info-light h-100" style={{ minHeight: "160px" }}>
              <div className="card-body h-100 d-flex flex-column justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="h2 mb-0">
                      {dashboard?.post || 0}
                    </div>
                    <div className="text-uppercase font-weight-bold">
                   Post
                    </div>
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
          <Link to="/post" style={{ textDecoration: 'none' }}>
              <div className="dashboard-card bg-danger-light h-100" style={{ minHeight: "160px" }}>
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


      <div className="col-xl-3 col-lg-6 col-md-12 mb-4">
          <Link to="/social-project" style={{ textDecoration: 'none' }}>
              <div className="dashboard-card bg-green-light h-100" style={{ minHeight: "160px" }}>
              <div className="card-body h-100 d-flex flex-column justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="h2 mb-0">
                      {dashboard?.socialproject || 0}
                    </div>
                    <div className="text-uppercase font-weight-bold">
                   Social Project 
                    </div>
                    <span className="text-white">Social Project</span>
                  </div>
                  <div className="icon-wrapper">
                   <em className="fas fa-project-diagram fa-2x"></em>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

  <div className="col-xl-3 col-lg-6 col-md-12 mb-4">
          <Link to="/socialproject-donation" style={{ textDecoration: 'none' }}>
              <div className="dashboard-card bg-danger-light h-100" style={{ minHeight: "160px" }}>
              <div className="card-body h-100 d-flex flex-column justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="h2 mb-0">
                      {dashboard?.socialprojectbooking || 0}
                    </div>
                    <div className="text-uppercase font-weight-bold">
                   Social Project Booking
                    </div>
                    <span className="text-white">Social Project Booking</span>
                  </div>
                  <div className="icon-wrapper">
                  <em className="fas fa-calendar-check fa-2x"></em>
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
