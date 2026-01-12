import { Fragment, useContext, useEffect } from "react";
import { SocketContext } from "../../context/socket";
import { Link } from "react-router-dom";
import { appGetAllDashboard } from "../../store/dashboard";
import { useDispatch, useSelector } from "react-redux";
import dashboardCards from "../../common/dashboardCards";

function Dashboard() {
  const socket = useContext(SocketContext);
  const dispatch = useDispatch();
  const dashboard = useSelector((state) => state?.dashboardReducer.dashboard);

  useEffect(() => {
    socket.connect();
    dispatch(appGetAllDashboard());
  }, [dispatch, socket]);

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
        {Array.isArray(dashboardCards) &&
          dashboardCards.map((card, idx) => {
            // Safely access stats
            const stats = dashboard?.[card.valueKey] || {
              total: 0,
              active: 0,
              inactive: 0,
            };

            return (
              <div key={idx} className="col-xl-3 col-lg-6 col-md-12 mb-4">
                <Link to={card.path} style={{ textDecoration: "none" }}>
                  <div
                    className={`dashboard-card ${card.bgClass} h-100 shadow-sm`}
                    style={{ borderRadius: "10px", overflow: "hidden" }}
                  >
                    <div className="card-body d-flex flex-column">
                      {/* --- Top Section: Total & Main Info --- */}
                      <div className="d-flex align-items-center mb-3">
                        <div className="flex-grow-1">
                          <div className="h2 mb-0 font-weight-bold text-white">
                            {stats.total}
                          </div>
                          <div className="text-uppercase font-weight-bold text-white small">
                            {card.name}
                          </div>
                        </div>
                        <div className="icon-wrapper text-white-50">
                          <em className={`${card.icon} fa-2x`}></em>
                        </div>
                      </div>

                      {/* --- Bottom Section: The "New Cards" for Active/Inactive --- */}
                      <div className="d-flex justify-content-between mt-auto">
                        {/* Active Mini-Card */}
                        <div
                          className="w-45 p-2 rounded text-center text-white"
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.25)",
                            backdropFilter: "blur(5px)",
                          }}
                        >
                          <div
                            className="small font-weight-bold"
                            style={{ fontSize: "0.75rem", opacity: 0.9 }}
                          >
                            <i className="fa fa-check-circle mr-1"></i> ACTIVE
                          </div>
                          <div className="h5 mb-0 font-weight-bold">
                            {stats.active}
                          </div>
                        </div>

                        {/* Inactive Mini-Card */}
                        <div
                          className="w-45 p-2 rounded text-center text-white"
                          style={{
                            backgroundColor: "rgba(0, 0, 0, 0.15)",
                            backdropFilter: "blur(5px)",
                          }}
                        >
                          <div
                            className="small font-weight-bold"
                            style={{ fontSize: "0.75rem", opacity: 0.9 }}
                          >
                            <i className="fa fa-times-circle mr-1"></i> INACTIVE
                          </div>
                          <div className="h5 mb-0 font-weight-bold">
                            {stats.inactive}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
      </div>
    </>
  );
}

export default Dashboard;
