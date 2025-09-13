import { Navigate, Outlet } from "react-router-dom";

function PrivateRoute({ children, ...rest }) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
  // const permissions = localStorage.getItem("permissions")?.split(",") || [];
  const isAdmin = user?.isAdmin;
console.log("PrivateRoute")
  return localStorage.getItem("token") && isAdmin === true ? (
    <Navigate to="/dashboard" />
  ) : (
    <Outlet />
  );
}

export default PrivateRoute;

// import { Navigate, Outlet } from "react-router-dom";

// function PrivateRoute() {
//   const token = localStorage.getItem("token");
//   const user = JSON.parse(localStorage.getItem("user") || "{}");
//   const permissions = localStorage.getItem("permissions")?.split(",") || [];

//   const isAdmin = user?.isAdmin;
// console.log(isAdmin)
// console.log(permissions)
//   const isAuthorized = token && (isAdmin || permissions.length > 0);

//   return isAuthorized ? <Navigate to="/dashboard" /> : <Outlet />;
// }

// export default PrivateRoute;
