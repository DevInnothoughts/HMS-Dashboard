import React from "react";
import { Route } from "react-router-dom";
import Login from "../pages/Auth/Login";
// import Register from "../pages/Auth/Register";
// import Forgot_password from "../pages/Auth/Forgot_password";
// import Verify_email from "../pages/Auth/Verify_email";
// import Verify_pin from "../pages/Auth/Verify_pin";
// import New_password from "../pages/Auth/New_password";

export const AuthRoutes = (
  <>
    <Route path="/login" element={<Login />} />
    {/* <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<Forgot_password />} />
    <Route path="/verify-email" element={<Verify_email />} />
    <Route path="/verify-pin" element={<Verify_pin />} />
    <Route path="/new-password" element={<New_password />} /> */}
  </>
);
