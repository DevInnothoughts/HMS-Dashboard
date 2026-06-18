import React from "react";
import { Route } from "react-router-dom";
// import Dashboard2 from "../pages/Dashboard/Dashboard2";
// import Dashboard3 from "../pages/Dashboard/Dashboard3";
import ReceptionistDashboard from "../pages/Dashboard/RecpDashboard";
import IpdDashboard from "../pages/Dashboard/IpdDashboard";
import DoctorDashboard from "../pages/doctor/DoctorDashboard";

const DashboardHome = () => {
  const accountType = localStorage.getItem("accountType");
  const department = localStorage.getItem("department");
  if (accountType?.toLowerCase() === "doctor") {
    return <DoctorDashboard />;
  }
  if (department === "IPD") {
    return <IpdDashboard />;
  }
  return <ReceptionistDashboard />;
};

export const DashboardRoutes = (
  <>
    <Route path="/" element={<DashboardHome />} />
    <Route path="/ipd-dashboard" element={<IpdDashboard />} />
    <Route path="/reception-dashboard" element={<ReceptionistDashboard />} />
  </>
);
