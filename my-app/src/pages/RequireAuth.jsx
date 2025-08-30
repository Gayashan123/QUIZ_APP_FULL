import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/Auth";

const RequireAuth = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/loginpage" />;
  return children;
};

export default RequireAuth;