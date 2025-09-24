import { Fragment, useContext, useEffect } from "react";
import { SocketContext } from "../../context/socket";
import { Link } from "react-router-dom";
import { appGetAllDashboard } from "../../store/dashboard";
import { useDispatch, useSelector } from "react-redux";
import dashboardCards from "../../common/dashboardCards"; // ✅ correct import

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
          dashboardCards.map((card, idx) => (
            <div key={idx} className="col-xl-3 col-lg-6 col-md-12 mb-4">
              <Link to={card.path} style={{ textDecoration: "none" }}>
                <div
                  className={`dashboard-card ${card.bgClass} h-100`}
                  style={{ minHeight: "160px" }}
                >
                  <div className="card-body h-100 d-flex flex-column justify-content-between">
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1">
                        <div className="h2 mb-0">
                          {card.prefix || ""}
                          {dashboard?.[card.valueKey] || 0}
                        </div>
                        <div className="text-uppercase font-weight-bold">
                          {card.name}
                        </div>
                        <span className="text-white">{card.description}</span>
                      </div>
                      <div className="icon-wrapper">
                        <em className={`${card.icon} fa-2x`}></em>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
      </div>
    </>
  );
}

export default Dashboard;
