import React from "react";
import { Route } from "react-router-dom";
import Dashboard2 from "../pages/Dashboard/Dashboard2";
import Dashboard3 from "../pages/Dashboard/Dashboard3";
import ReceptionistDashboard from "../pages/Dashboard/RecpDashboard";

export const DashboardRoutes = (
  <>
    <Route path="/" element={<Dashboard2 />} />
    <Route path="/dashboard3" element={<Dashboard3 />} />
    <Route path="/reception-dashboard" element={<ReceptionistDashboard />} />
  </>
);
