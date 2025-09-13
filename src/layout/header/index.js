import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  function handleLogout() {
    // localStorage.removeItem("token");
    // localStorage.removeItem("user");
    // localStorage.removeItem("permissionOfHub");
    // localStorage.removeItem("permissions");
    localStorage.clear();
    navigate("/");
  }
  return (
    <header className="topnavbar-wrapper">
      <nav className="navbar topnavbar">
        {/* <div className="navbar-header"> */}
        <a className="navbar-brand" href="#/" />
        <div className="brand-logo" style={{ marginLeft: "3.25rem" }}>
          <img
            className="img-fluid"
            src="/img/logo1.png"
            alt="App Logo"
            style={{ width: "60px", height: "40px" }}
          />
        </div>
        {/* <div className="brand-logo-collapsed">
            <img
              className="img-fluid"
              src="/img/logo-single.png"
              alt="App Logo"
            />
          </div> */}
        <ul
          className="navbar-nav mr-auto flex-row"
          style={{ marginLeft: "3.25rem" }}
        >
          <li className="nav-item">
            {/* <Link
              className="nav-link d-none d-md-block d-lg-block d-xl-block"
              to={"#"}
            >
              <em className="fas fa-bars"></em>
            </Link>
            <Link className="nav-link sidebar-toggle d-md-none" to={"#"}>
              <em className="fas fa-bars"></em>
            </Link> */}
            <a
              className="nav-link d-none d-md-block d-lg-block d-xl-block p-0"
              href="#"
              data-trigger-resize=""
              data-toggle-state="aside-collapsed"
            >
              <em className="fas fa-bars"></em>
            </a>
            <a
              className="nav-link sidebar-toggle d-md-none"
              href="#"
              data-toggle-state="aside-toggled"
              data-no-persist="true"
            >
              <em className="fas fa-bars"></em>
            </a>
          </li>
          {/* <li className="nav-item d-none d-md-block">
            <a
              className="nav-link"
              id="user-block-toggle"
              href="#user-block"
              data-toggle="collapse"
            >
              <em className="icon-user"></em>
            </a>
          </li> */}
          {/* <li className="nav-item d-none d-md-block">
            <a className="nav-link" href="lock.html" title="Lock screen">
              <em className="icon-lock"></em>
            </a>
          </li> */}
        </ul>
        <ul className="navbar-nav flex-row">
          {/* <li className="nav-item">
            <a className="nav-link" href="#" data-search-open="">
              <em className="icon-magnifier"></em>
            </a>
          </li>
          <li className="nav-item d-none d-md-block">
            <a className="nav-link" href="#" data-toggle-fullscreen="">
              <em className="fas fa-expand"></em>
            </a>
          </li> */}
          {/* <li className="nav-item dropdown dropdown-list">
            <a
              className="nav-link dropdown-toggle dropdown-toggle-nocaret"
              href="#"
              data-toggle="dropdown"
            >
              <em className="icon-bell"></em>
              <span className="badge badge-danger">0</span>
            </a>
            <div className="dropdown-menu dropdown-menu-right animated flipInX">
              <div className="dropdown-item">
                <div className="list-group">
                  <div className="list-group-item list-group-item-action">
                    <div className="media">
                      <div className="align-self-start mr-2">
                        <em className="fab fa-twitter fa-2x text-info"></em>
                      </div>
                      <div className="media-body">
                        <p className="m-0">New followers</p>
                        <p className="m-0 text-muted text-sm">1 new follower</p>
                      </div>
                    </div>
                  </div>
                  <div className="list-group-item list-group-item-action">
                    <div className="media">
                      <div className="align-self-start mr-2">
                        <em className="fas fa-envelope fa-2x text-warning"></em>
                      </div>
                      <div className="media-body">
                        <p className="m-0">New e-mails</p>
                        <p className="m-0 text-muted text-sm">
                          You have 10 new emails
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="list-group-item list-group-item-action">
                    <div className="media">
                      <div className="align-self-start mr-2">
                        <em className="fas fa-tasks fa-2x text-success"></em>
                      </div>
                      <div className="media-body">
                        <p className="m-0">Pending Tasks</p>
                        <p className="m-0 text-muted text-sm">
                          11 pending task
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="list-group-item list-group-item-action">
                    <span className="d-flex align-items-center">
                      <span className="text-sm">More notifications</span>
                      <span className="badge badge-danger ml-auto">14</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </li> */}

          <li className="nav-item">
            <span
              className="nav-link"
              onClick={() => handleLogout()}
              style={{ cursor: "pointer" }}
            >
              Log Out
            </span>
          </li>
        </ul>

        <form className="navbar-form" role="search" action="search.html">
          <div className="form-group">
            <input
              className="form-control"
              type="text"
              placeholder="Type and hit enter ..."
            />
            <div
              className="fas fa-times navbar-form-close"
              data-search-dismiss=""
            ></div>
          </div>
          <button className="d-none" type="submit">
            Submit
          </button>
        </form>
        {/* </div> */}
      </nav>
    </header>
  );
}

export default Header;
