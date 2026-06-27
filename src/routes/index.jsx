import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthRoutes } from "./AuthRoutes";
import { DashboardRoutes } from "./DashboardRoutes";
import { DoctorRoutes } from "./DoctorRoutes";
import { ReceptionRoutes } from "./ReceptionRoutes";
import { IpdRoutes } from "./IpdRoutes";
import ProtectedRoute from "./ProtectedRoute";
import ErrorPage from "../pages/Utility/Errorpage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      {AuthRoutes}

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {DashboardRoutes}
        {ReceptionRoutes}
        {DoctorRoutes}
        {IpdRoutes}
        <Route path="*" element={<ErrorPage />} />
      </Route>
    </Routes>
  );
}
