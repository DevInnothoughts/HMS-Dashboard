import React from "react";
import { Route } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/Forgot_password";
import VerifyEmail from "../pages/Auth/Verify_email";
import VerifyPin from "../pages/Auth/Verify_pin";
import NewPassword from "../pages/Auth/New_password";

export const AuthRoutes = (
  <>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/verify-email" element={<VerifyEmail />} />
    <Route path="/verify-pin" element={<VerifyPin />} />
    <Route path="/new-password" element={<NewPassword />} />
  </>
);
