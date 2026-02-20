import { Navigate, Outlet, useLocation } from "react-router-dom";
// import { IsTokenExpired } from "../common/jwtToken";
import Layout from "../layout";

const ProtectedRoute = ({ children, ...rest }) => {
  const location = useLocation();
  const userPermissions = localStorage.getItem("permissions")?.split(',') || [];
  // console.log(userPermissions)
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  // console.log(userData)
  const token = localStorage.getItem("token");
  const isAdmin = userData?.isAdmin === true;
  // console.log(isAdmin)
  const hasPermissions = userPermissions.length > 0;
  const hasAnyAccess = !!userData?.adminOfHubs || !!userData?.adminOfSanstha?.length || !!userData?.hub;
  // console.log(hasAnyAccess)
  //  console.log("ProtectedRoute")

   
  if (!token && !isAdmin) {
    return <Navigate to="/" />;
  }
  const currentPath = location.pathname.substring(1); 
  // console.log(currentPath)

 // User is NOT admin, has NO permissions, and NO access hubs
 if (!isAdmin && !hasPermissions && !hasAnyAccess) {
  return <Navigate to="/" />;
}

  // If user is admin, allow access to all routes
  if (isAdmin) {
    return (
      <Layout>
        <Outlet />
      </Layout>
    );
  }
  if (userPermissions && userPermissions.length > 0 && currentPath) {
    // if (currentPath === "dashboard") {
    //   return (
    //     <Layout>
    //       <Outlet />
    //     </Layout>
    //   );
    // }
    // Check if the current path starts with any of the user's permissions
    if (userPermissions.some(permission => currentPath.startsWith(permission))) {
      return (
        <Layout>
          <Outlet />
        </Layout>
      );
    }
    return <Navigate to={`/${userPermissions[0]}`} />;
  }
  // Default case: redirect to login
  return <Navigate to="/" />;
};

export default ProtectedRoute;

// import { Navigate, Outlet, useLocation } from "react-router-dom";
// import Layout from "../layout";

// const ProtectedRoute = () => {
//   const location = useLocation();
//   const token = localStorage.getItem("token");
//   const user = JSON.parse(localStorage.getItem("user") || "{}");
//   const permissions = localStorage.getItem("permissions")?.split(",") || [];

//   const isAdmin = user?.isAdmin === true;
//   const hasAccess =
//     isAdmin ||
//     (permissions.length > 0) ||
//     user?.adminOfHubs ||
//     user?.adminOfSanstha ||
//     user?.hub;
//     console.log("ProtectedRoute")
//    console.log(hasAccess, "hasAccess")

//   if (!token || !hasAccess || !isAdmin) {
//     return <Navigate to="/" />;
//   }

//   const currentPath = location.pathname.substring(1);

//   if (isAdmin) {
//     return (
//       <Layout>
//         <Outlet />
//       </Layout>
//     );
//   }

//   if (permissions.length > 0 && permissions.some(p => currentPath.startsWith(p))) {
//     return (
//       <Layout>
//         <Outlet />
//       </Layout>
//     );
//   }

//   // If path doesn't match permissions, redirect to first allowed route
//   return <Navigate to={`/${permissions[0]}`} />;
// };

// export default ProtectedRoute;
