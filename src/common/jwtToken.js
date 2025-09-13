import jwt_decode from "jwt-decode";

export const IsTokenExpired = (token) => {
  // const navigate = useNavigate();
  const jwt_token = jwt_decode(token);
  const expiry_token = new Date(jwt_token.exp * 1000);
  let currentDate = new Date();
  var result = "";
  // JWT exp is in seconds
  if (expiry_token < currentDate.getTime()) {
    console.log("token is expired");
    return (result = true);
  } else {
    console.log("token is valid");
    return (result = false);
  }
};
