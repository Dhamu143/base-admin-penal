import jwt_decode from "jwt-decode";

export const IsTokenExpired = (token) => {
  if (!token) return true;

  const jwt_token = jwt_decode(token);
  const expiry_time = jwt_token.exp * 1000; // convert to milliseconds
  const current_time = Date.now();

  return expiry_time < current_time;
};
