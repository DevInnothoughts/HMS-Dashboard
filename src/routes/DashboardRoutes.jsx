import React from "react";
import { Route } from "react-router-dom";
import ReceptionDashboard from "../pages/Reception/ReceptionDashboard";
import IpdDashboard from "../pages/Ipd/IpdDashboard";
import DoctorDashboard from "../pages/Doctor/DoctorDashboard";
import SuperAdminDashboard from "../pages/Superadmin/SuperAdminDashboard";
import SuperAdminHC from "../pages/Superadmin/SuperAdminHC";

const DashboardHome = () => {
  const accountType = localStorage.getItem("accountType");
  const department = localStorage.getItem("department");
  if (
    accountType?.toLowerCase() === "superadmin" ||
    accountType?.toLowerCase() === "super admin"
  ) {
    return <SuperAdminDashboard />;
  }
  if (accountType?.toLowerCase() === "doctor") {
    return <DoctorDashboard />;
  }
  if (department === "IPD") {
    return <IpdDashboard />;
  }
  return <ReceptionDashboard />;
};

export const DashboardRoutes = (
  <>
    <Route path="/" element={<DashboardHome />} />
    <Route path="/superadmin-dashboard" element={<SuperAdminDashboard />} />
    <Route path="/superadmin-hc" element={<SuperAdminHC />} />
    <Route path="/superadmin-hospital-certificates" element={<SuperAdminHC />} />
    <Route path="/ipd-dashboard" element={<IpdDashboard />} />
    <Route path="/reception-dashboard" element={<ReceptionDashboard />} />
    <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
  </>
);
