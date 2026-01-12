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

  const renderCard = (
    title,
    count,
    icon,
    bgClass,
    path,
    subText,
    isInactive = false
  ) => (
    <div className="col-xl-3 col-lg-6 col-md-12 mb-4">
      <Link to={path} style={{ textDecoration: "none" }}>
        <div
          className={`dashboard-card ${bgClass} h-100 shadow-sm`}
          style={{
            borderRadius: "10px",
            overflow: "hidden",
            filter: isInactive ? "brightness(0.85) saturate(0.8)" : "none",
          }}
        >
          <div
            className="card-body d-flex flex-column justify-content-center"
            style={{ minHeight: "140px" }}
          >
            <div className="d-flex align-items-center">
              <div className="flex-grow-1">
                <div className="h2 mb-0 font-weight-bold text-white">
                  {count}
                </div>
                <div className="text-uppercase font-weight-bold text-white small">
                  {title} <br />
                  <span style={{ fontSize: "10px", opacity: 0.8 }}>
                    {subText}
                  </span>
                </div>
              </div>
              <div className="icon-wrapper text-white-50">
                <em className={`${icon} fa-2x`}></em>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );

  return (
    <>
      <div className="content-wrapper">
        <div className="content-heading">
          <div className="d-flex align-items-center">
            <div className="mr-auto">
              <div className="">Dashboard Management</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row m-3">
        {Array.isArray(dashboardCards) &&
          dashboardCards.map((card) => {
            const stats = dashboard?.[card.valueKey] || {
              total: 0,
              active: 0,
              inactive: 0,
            };

            if (card.valueKey === "users") {
              return (
                <Fragment key={card.valueKey}>
                  {renderCard(
                    card.name,
                    stats.total,
                    card.icon,
                    card.bgClass,
                    card.path,
                    "Total Users"
                  )}
                </Fragment>
              );
            }

            return (
              <Fragment key={card.valueKey}>
                {renderCard(
                  card.name,
                  stats.active,
                  card.icon,
                  card.bgClass,
                  card.path,
                  "Active Items"
                )}

                {stats.inactive > 0 &&
                  renderCard(
                    card.name,
                    stats.inactive,
                    card.icon,
                    card.bgClass,
                    card.path,
                    "Inactive Items",
                    true
                  )}
              </Fragment>
            );
          })}
      </div>
    </>
  );
}

export default Dashboard;
