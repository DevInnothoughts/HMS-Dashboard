/* index.js */
import React from "react";
import { Routes } from "react-router-dom";
import { AuthRoutes } from "./AuthRoutes";
import { DashboardRoutes } from "./DashboardRoutes";
import { DoctorRoutes } from "./DoctorRoutes";
import { PatientRoutes } from "./PatientRoutes";
import { ReceptionistRoutes } from "./ReceptionistRoutes";
import { ReportRoutes } from "./ReportsRoutes";
import { SettingsRoutes } from "./SettingsRoutes";
import { UtilityRoutes } from "./UtilityRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      {AuthRoutes}
      {DashboardRoutes}
      {DoctorRoutes}
      {PatientRoutes}
      {ReceptionistRoutes}
      {ReportRoutes}
      {SettingsRoutes}
      {UtilityRoutes}
    </Routes>
  );
}
